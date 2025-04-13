const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

// 中间件
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// 确保必要的目录存在
const usersDir = path.join(__dirname, 'Users');
const tempDir = path.join(__dirname, 'temp');
const convertFilesDir = path.join(__dirname, 'data', 'ConvertFiles');
const pandocDir = path.join(__dirname, 'pandoc');

if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir);
}

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(convertFilesDir)) {
    fs.mkdirSync(convertFilesDir);
}

if (!fs.existsSync(pandocDir)) {
    fs.mkdirSync(pandocDir);
}

// 检查并安装pandoc
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkAndInstallPandoc() {
    try {
        // 检查pandoc是否已安装
        await execPromise('pandoc --version');
        console.log('Pandoc已安装');
        return true;
    } catch (error) {
        console.log('Pandoc未安装，检查是否有本地安装文件...');
        
        // 检查是否有本地安装的pandoc
        const localPandocPath = path.join(pandocDir, 'pandoc.exe');
        if (fs.existsSync(localPandocPath)) {
            console.log('找到本地pandoc安装');
            return true;
        }
        
        // 检查是否有下载的安装程序
        const installerPath = path.join(__dirname, 'pandoc-installer.msi');
        if (fs.existsSync(installerPath)) {
            console.log('找到pandoc安装程序，正在解压...');
            try {
                // 解压安装程序到pandoc目录
                await execPromise(`msiexec /a "${installerPath}" /qn TARGETDIR="${pandocDir}"`); 
                console.log('Pandoc安装完成');
                return true;
            } catch (installError) {
                console.error('Pandoc安装失败:', installError);
                return false;
            }
        } else {
            console.log('未找到pandoc安装程序，将使用备用转换方法');
            return false;
        }
    }
}

// 启动时检查pandoc
checkAndInstallPandoc().then(installed => {
    if (installed) {
        console.log('Pandoc准备就绪');
    } else {
        console.log('将使用备用转换方法');
    }
});

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueFilename = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ storage: storage });

// 用户注册
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    // 检查用户名是否已存在
    if (fs.existsSync(userFilePath)) {
        return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 创建用户文件
    const userData = {
        username,
        password, // 注意：实际应用中应该对密码进行加密
        createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    
    res.status(201).json({ success: true, message: '注册成功' });
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    // 检查用户是否存在
    if (!fs.existsSync(userFilePath)) {
        return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 读取用户数据
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    
    // 验证密码
    if (userData.password !== password) {
        return res.status(400).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 登录成功
    res.status(200).json({ 
        success: true, 
        message: '登录成功',
        user: {
            username: userData.username,
            createdAt: userData.createdAt
        }
    });
});

// 获取当前用户信息
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    
    res.status(200).json({
        success: true,
        user: {
            username: userData.username,
            createdAt: userData.createdAt
        }
    });
});

// 文件上传路由
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
    };
    
    res.status(200).json({ success: true, fileInfo });
});

// 获取文件类型
app.get('/api/file-info/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(tempDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    const stats = fs.statSync(filePath);
    const fileInfo = {
        filename,
        size: stats.size,
        mimetype: getMimeType(filename)
    };
    
    res.status(200).json({ success: true, fileInfo });
});

// 转换文件
app.post('/api/convert', async (req, res) => {
    const { filename, targetFormat, username } = req.body;
    
    if (!filename || !targetFormat) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    const sourcePath = path.join(tempDir, filename);
    
    if (!fs.existsSync(sourcePath)) {
        return res.status(404).json({ success: false, message: '源文件不存在' });
    }
    
    try {
        // 确定目标路径
        let targetDir;
        let isTemporary = true;
        
        if (username) {
            // 已登录用户，使用永久存储
            targetDir = path.join(convertFilesDir, username);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            isTemporary = false;
        } else {
            // 游客，使用临时存储
            targetDir = tempDir;
        }
        
        // 生成目标文件名
        const originalName = path.parse(filename).name.split('-').slice(1).join('-'); // 移除UUID前缀
        const targetFilename = `${uuidv4()}-${originalName}.${targetFormat}`;
        const targetPath = path.join(targetDir, targetFilename);
        
        // 执行转换（使用pandoc进行文件格式转换）
        const sourceExt = path.extname(sourcePath).toLowerCase().substring(1);
        
        // 检查pandoc是否已安装
        const checkPandoc = async () => {
            try {
                await execPromise('pandoc --version');
                return true;
            } catch (error) {
                console.log('Pandoc未安装或不在PATH中，尝试使用本地安装的pandoc');
                // 检查是否有本地安装的pandoc
                const localPandocPath = path.join(__dirname, 'pandoc', 'pandoc.exe');
                if (fs.existsSync(localPandocPath)) {
                    return localPandocPath;
                }
                return false;
            }
        };
        
        // 使用pandoc进行转换
        const convertWithPandoc = async () => {
            const pandocInstalled = await checkPandoc();
            let pandocCmd = 'pandoc';
            
            if (!pandocInstalled) {
                console.log('Pandoc未安装，将使用备用转换方法');
                return false;
            } else if (typeof pandocInstalled === 'string') {
                // 使用本地安装的pandoc路径
                pandocCmd = pandocInstalled;
            }
            
            // 构建pandoc命令
            let command = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}"`;
            
            // 根据不同的格式添加特定参数
            if (targetFormat === 'pdf') {
                // 默认使用xelatex引擎并添加中文字体支持，并禁用soul包以避免中文文档中的错误
                command = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" --pdf-engine=xelatex -V mainfont="SimSun" -V CJKmainfont="SimSun" -V header-includes="\\DisableSoul" -V documentclass=ctexart`;
                
                // 如果源文件是Markdown或文本，添加适当的格式标记
                if (['txt', 'md', 'markdown'].includes(sourceExt)) {
                    command = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" -f markdown --pdf-engine=xelatex -V mainfont="SimSun" -V CJKmainfont="SimSun" -V header-includes="\\DisableSoul" -V documentclass=ctexart`;
                }
            } else if (targetFormat === 'docx' && sourceExt === 'txt') {
                command = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" -f markdown -t docx`;
            } else if (targetFormat === 'txt' && ['docx', 'doc'].includes(sourceExt)) {
                command = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" --extract-media=.`;
            }
            
            try {
                console.log('执行pandoc命令:', command);
                await execPromise(command);
                return true;
            } catch (error) {
                console.error('Pandoc转换错误:', error);
                
                // 如果是PDF转换且出现引擎错误，尝试其他PDF引擎
                if (targetFormat === 'pdf') {
                    // 检查错误信息是否与PDF引擎相关
                    const engineError = error.stderr && (error.stderr.includes('pdf-engine') || 
                                                        error.stderr.includes('not found'));
                    
                    if (engineError) {
                        console.log('尝试使用其他PDF引擎...');
                        
                        // 尝试使用xelatex引擎并添加中文字体支持，禁用soul包
                        try {
                            const xelatexCmd = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" --pdf-engine=xelatex -V mainfont="SimSun" -V CJKmainfont="SimSun" -V header-includes="\\DisableSoul" -V documentclass=ctexart`;
                            console.log('尝试使用xelatex引擎(带中文支持):', xelatexCmd);
                            await execPromise(xelatexCmd);
                            return true;
                        } catch (xelatexError) {
                            console.error('xelatex引擎失败:', xelatexError);
                            
                            // 尝试使用pdflatex引擎并添加中文支持
                            try {
                                const pdflatexCmd = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" --pdf-engine=pdflatex -V CJKmainfont="SimSun" -V documentclass=ctexart -V header-includes="\\DisableSoul"`;
                                console.log('尝试使用pdflatex引擎(带中文支持):', pdflatexCmd);
                                await execPromise(pdflatexCmd);
                                return true;
                            } catch (pdflatexError) {
                                console.error('pdflatex引擎失败:', pdflatexError);
                                
                                // 尝试使用wkhtmltopdf引擎
                                try {
                                    const wkhtmltopdfCmd = `"${pandocCmd}" "${sourcePath}" -o "${targetPath}" --pdf-engine=wkhtmltopdf`;
                                    console.log('尝试使用wkhtmltopdf引擎:', wkhtmltopdfCmd);
                                    await execPromise(wkhtmltopdfCmd);
                                    return true;
                                } catch (wkhtmltopdfError) {
                                    console.error('所有PDF引擎尝试失败，将使用备用方法');
                                }
                            }
                        }
                    }
                }
                
                return false;
            }
        };
        
        // 处理从PDF转换到其他格式的特殊情况
        if (sourceExt === 'pdf') {
            console.log('源文件是PDF，Pandoc不支持从PDF转换，使用替代方法');
            
            // 如果目标格式是文本，可以尝试使用pdf-parse提取文本
            if (targetFormat === 'txt') {
                try {
                    // 使用fs读取PDF文件
                    const pdfBuffer = fs.readFileSync(sourcePath);
                    
                    // 使用简单的文本提取方法
                    const extractText = (buffer) => {
                        // 简单的文本提取，实际项目中应使用pdf-parse等库
                        let text = buffer.toString();
                        // 提取可能的文本内容
                        text = text.replace(/[^\x20-\x7E\u4e00-\u9fa5]/g, ' ');
                        return text;
                    };
                    
                    const extractedText = extractText(pdfBuffer);
                    fs.writeFileSync(targetPath, extractedText);
                    
                    return res.status(200).json({
                        success: true,
                        convertedFile: {
                            filename: targetFilename,
                            path: targetPath,
                            isTemporary
                        }
                    });
                } catch (error) {
                    console.error('PDF文本提取错误:', error);
                    // 失败时继续使用复制方法
                }
            }
            
            // 对于其他格式，目前只能复制文件并更改扩展名
            fs.copyFileSync(sourcePath, targetPath);
            console.log('PDF转换为其他格式暂不支持，已复制文件并更改扩展名');
            
            return res.status(200).json({
                success: true,
                convertedFile: {
                    filename: targetFilename,
                    path: targetPath,
                    isTemporary
                }
            });
        }
        
        // 尝试使用pandoc转换
        const pandocSuccess = await convertWithPandoc();
        
        // 如果pandoc转换失败，使用备用方法
        if (!pandocSuccess) {
            console.log('使用备用转换方法');
            
            // 处理PDF转换
            if (targetFormat === 'pdf') {
                // 根据源文件类型选择不同的转换方法
                if (['doc', 'docx'].includes(sourceExt)) {
                    // 使用docx-pdf库转换Word到PDF
                    const docxToPdf = require('docx-pdf');
                    docxToPdf(sourcePath, targetPath, (err, result) => {
                        if (err) {
                            console.error('PDF转换错误:', err);
                            return res.status(500).json({ success: false, message: 'PDF转换失败', error: err.message });
                        }
                        
                        return res.status(200).json({
                            success: true,
                            convertedFile: {
                                filename: targetFilename,
                                path: targetPath,
                                isTemporary
                            }
                        });
                    });
                    return; // 提前返回，避免执行后面的代码
                } else if (sourceExt === 'txt') {
                    // 使用pdf-lib将文本转换为PDF
                    const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
                    
                    (async () => {
                        try {
                            // 读取文本文件
                            const text = fs.readFileSync(sourcePath, 'utf8');
                            
                            // 创建PDF文档
                            const pdfDoc = await PDFDocument.create();
                            const page = pdfDoc.addPage();
                            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                            
                            // 添加文本
                            page.drawText(text, {
                                x: 50,
                                y: page.getHeight() - 50,
                                size: 12,
                                font,
                                color: rgb(0, 0, 0),
                            });
                            
                            // 保存PDF
                            const pdfBytes = await pdfDoc.save();
                            fs.writeFileSync(targetPath, pdfBytes);
                            
                            return res.status(200).json({
                                success: true,
                                convertedFile: {
                                    filename: targetFilename,
                                    path: targetPath,
                                    isTemporary
                                }
                            });
                        } catch (error) {
                            console.error('PDF转换错误:', error);
                            return res.status(500).json({ success: false, message: 'PDF转换失败', error: error.message });
                        }
                    })();
                    return; // 提前返回，避免执行后面的代码
                }
            } else {
                // 对于其他格式或未实现的转换，使用复制方法
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
        
        // 如果pandoc成功或使用了复制方法，返回成功响应
        res.status(200).json({
            success: true,
            convertedFile: {
                filename: targetFilename,
                path: targetPath,
                isTemporary
            }
        });
    } catch (error) {
        console.error('文件转换错误:', error);
        res.status(500).json({ success: false, message: '文件转换失败', error: error.message });
    }
});

// 获取用户的文件列表
app.get('/api/user-files/:username', (req, res) => {
    const { username } = req.params;
    
    if (!username) {
        return res.status(400).json({ success: false, message: '用户名不能为空' });
    }
    
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    // 检查用户是否存在
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const userFilesDir = path.join(convertFilesDir, username);
    
    // 如果用户文件目录不存在，创建它
    if (!fs.existsSync(userFilesDir)) {
        fs.mkdirSync(userFilesDir, { recursive: true });
        return res.status(200).json({ success: true, files: [] });
    }
    
    try {
        const files = fs.readdirSync(userFilesDir);
        const fileList = files.map(filename => {
            const filePath = path.join(userFilesDir, filename);
            const stats = fs.statSync(filePath);
            
            // 提取原始文件名（去除UUID前缀）
            const originalName = path.parse(filename).name.split('-').slice(1).join('-');
            const fileExtension = path.extname(filename);
            const displayName = `${originalName}${fileExtension}`;
            
            return {
                filename: filename,
                displayName: displayName,
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                type: getMimeType(filename)
            };
        });
        
        // 按修改时间排序，最新的在前面
        fileList.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
        
        res.status(200).json({ success: true, files: fileList });
    } catch (error) {
        console.error('获取用户文件列表错误:', error);
        res.status(500).json({ success: false, message: '获取文件列表失败', error: error.message });
    }
});

// 删除用户的文件
app.delete('/api/user-files/:username/:filename', (req, res) => {
    const { username, filename } = req.params;
    
    if (!username || !filename) {
        return res.status(400).json({ success: false, message: '用户名和文件名不能为空' });
    }
    
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    // 检查用户是否存在
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const filePath = path.join(convertFilesDir, username, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    try {
        // 删除文件
        fs.unlinkSync(filePath);
        res.status(200).json({ success: true, message: '文件删除成功' });
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ success: false, message: '删除文件失败', error: error.message });
    }
});

// 下载转换后的文件
app.get('/api/download/:filename', (req, res) => {
    const { filename } = req.params;
    const { username } = req.query;
    
    let filePath;
    
    if (username) {
        // 已登录用户，从永久目录获取
        filePath = path.join(convertFilesDir, username, filename);
    } else {
        // 游客，从临时目录获取
        filePath = path.join(tempDir, filename);
    }
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    // 提取原始文件名（去除UUID前缀）
    const originalName = path.parse(filename).name.split('-').slice(1).join('-');
    const fileExtension = path.extname(filename);
    const downloadName = `${originalName}${fileExtension}`;
    
    res.download(filePath, downloadName);
});

// 清理临时文件（可以通过定时任务或在用户会话结束时调用）
app.post('/api/cleanup', (req, res) => {
    try {
        const files = fs.readdirSync(tempDir);
        
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            
            // 删除超过1小时的临时文件
            const fileAge = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
            if (fileAge > 1) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(200).json({ success: true, message: '临时文件清理完成' });
    } catch (error) {
        console.error('清理临时文件错误:', error);
        res.status(500).json({ success: false, message: '清理临时文件失败', error: error.message });
    }
});

// 获取文件MIME类型的辅助函数
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.txt': 'text/plain',
        '.zip': 'application/zip',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
}

// 清理临时文件的函数
function cleanupTempFiles() {
    try {
        console.log('正在清理临时文件...');
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            
            for (const file of files) {
                const filePath = path.join(tempDir, file);
                fs.unlinkSync(filePath);
                console.log(`已删除: ${filePath}`);
            }
            
            console.log('临时文件清理完成');
        }
    } catch (error) {
        console.error('清理临时文件时出错:', error);
    }
}

// 监听进程退出事件，清理临时文件
process.on('SIGINT', () => {
    console.log('服务器正在关闭...');
    cleanupTempFiles();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('服务器正在关闭...');
    cleanupTempFiles();
    process.exit(0);
});

// 处理未捕获的异常，确保在崩溃时也能清理文件
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    cleanupTempFiles();
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});