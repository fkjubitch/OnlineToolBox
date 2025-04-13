# 在线工具箱项目文档

## 项目概述

在线工具箱是一个基于Web的多功能工具集合平台，提供文本对比、正则表达式匹配、文件格式转换等实用功能，支持用户注册登录和文件管理。本文档详细记录了项目的开发过程和功能实现方式。



## 一、使用AI及个人实操的完整过程

### 1. 项目构思与规划

#### 初始构思
- 通过AI辅助，确定了开发一个在线工具箱的想法，集成多种常用工具功能
- 确定了第一个核心功能：文件格式转换工具
- 规划了用户系统，支持游客使用和注册用户的文件永久保存

#### 技术选型
- 前端：HTML5、CSS3、JavaScript（原生）
- 后端：Node.js + Express
- 文件处理：Multer（文件上传）、Pandoc（格式转换）
- 数据存储：文件系统（JSON文件存储用户信息，文件目录存储用户文件）

### 2. 开发过程

#### 前端开发
1. **界面设计**
   - 使用AI生成初始界面设计思路
   - 个人实现响应式布局，支持移动端和桌面端
   - 实现了深色/浅色主题切换功能

2. **交互实现**
   - 实现了拖放上传文件功能
   - 开发了文件预览和格式选择界面
   - 实现了转换进度显示和结果反馈
   - 开发了用户文件管理界面

#### 后端开发
1. **服务器搭建**
   - 使用Express框架搭建基础服务器
   - 配置静态文件服务和路由系统

2. **文件处理系统**
   - 实现文件上传功能（使用Multer）
   - 集成Pandoc进行文件格式转换
   - 开发备用转换方法，处理Pandoc不支持的格式

3. **用户系统**
   - 实现用户注册、登录功能
   - 开发基于文件系统的简易用户数据存储

### 3. 测试与优化

#### 功能测试
- 测试各种文件格式的转换效果
- 验证用户系统的稳定性
- 检查文件上传和下载功能

#### 性能优化
- 优化文件处理逻辑，提高转换速度
- 实现文件清理机制，避免临时文件堆积
- 优化前端交互体验，增加加载提示

### 4. 部署与维护

- 本地部署测试，确保系统稳定运行
- 实现错误日志记录，便于问题排查
- 设计了临时文件自动清理机制



## 二、服务器本地部署

打开项目根目录，执行

```shell
npm start
```



## 三、功能展示

- 主界面

<img src="/imgs/1.png">

- 进制转换器

<img src="/imgs/2.png">

- 随机数生成器

<img src="/imgs/3.png">

- 去空格工具

<img src="/imgs/4.png">

- 文本对比

<img src="/imgs/5.png">

- 正则表达式匹配

<img src="/imgs/6.png">

- 文本反转

<img src="/imgs/7.png">

- 文件格式转换

<img src="/imgs/8.png">

- 用户注册

<img src="/imgs/9.png">

- 用户登录

<img src="/imgs/10.png">

- 登录后的文件格式转换

<img src="/imgs/11.png">

- 登陆后查看历史转换文件

<img src="/imgs/12.png">





## 四、增删改查功能实现方式

### 1. 用户管理（增删改查）

#### 增（Create）：用户注册
```javascript
// 服务器端实现（server.js）
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    
    // 验证输入
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
        password, // 实际应用中应该加密
        createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    
    res.status(201).json({ success: true, message: '注册成功' });
});
```

#### 查（Read）：用户登录和信息获取
```javascript
// 用户登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // 验证输入
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

// 获取用户信息
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
```

#### 改（Update）：用户信息更新
在当前版本中未实现用户信息更新功能，但可以通过以下方式实现：

```javascript
// 更新用户信息（示例代码）
app.put('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const { newPassword } = req.body;
    
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 读取现有用户数据
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    
    // 更新数据
    if (newPassword) {
        userData.password = newPassword;
    }
    
    // 保存更新后的数据
    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));
    
    res.status(200).json({ success: true, message: '用户信息更新成功' });
});
```

#### 删（Delete）：用户删除
在当前版本中未实现用户删除功能，但可以通过以下方式实现：

```javascript
// 删除用户（示例代码）
app.delete('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const userFilePath = path.join(usersDir, `${username}.json`);
    
    if (!fs.existsSync(userFilePath)) {
        return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 删除用户文件
    fs.unlinkSync(userFilePath);
    
    // 删除用户的所有转换文件
    const userFilesDir = path.join(convertFilesDir, username);
    if (fs.existsSync(userFilesDir)) {
        fs.rmdirSync(userFilesDir, { recursive: true });
    }
    
    res.status(200).json({ success: true, message: '用户删除成功' });
});
```

### 2. 文件转换管理（增删改查）

#### 增（Create）：文件上传和转换
```javascript
// 文件上传
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

// 文件转换
app.post('/api/convert', async (req, res) => {
    const { filename, targetFormat, username } = req.body;
    
    // 验证输入
    if (!filename || !targetFormat) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    const sourcePath = path.join(tempDir, filename);
    
    // 检查源文件是否存在
    if (!fs.existsSync(sourcePath)) {
        return res.status(404).json({ success: false, message: '源文件不存在' });
    }
    
    try {
        // 确定目标路径（根据用户是否登录）
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
        const originalName = path.parse(filename).name.split('-').slice(1).join('-');
        const targetFilename = `${uuidv4()}-${originalName}.${targetFormat}`;
        const targetPath = path.join(targetDir, targetFilename);
        
        // 执行转换（使用Pandoc或其他方法）
        // ...
        
        // 返回转换结果
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
```

#### 查（Read）：获取文件列表和下载文件
```javascript
// 获取用户文件列表
app.get('/api/user-files/:username', (req, res) => {
    const { username } = req.params;
    
    if (!username) {
        return res.status(400).json({ success: false, message: '用户名不能为空' });
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
            
            // 提取原始文件名
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
        
        // 按修改时间排序
        fileList.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
        
        res.status(200).json({ success: true, files: fileList });
    } catch (error) {
        console.error('获取用户文件列表错误:', error);
        res.status(500).json({ success: false, message: '获取文件列表失败', error: error.message });
    }
});

// 下载文件
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
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    // 设置文件名（去除UUID前缀）
    const originalName = path.parse(filename).name.split('-').slice(1).join('-');
    const fileExtension = path.extname(filename);
    const displayName = `${originalName}${fileExtension}`;
    
    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${displayName}"`);
    res.setHeader('Content-Type', getMimeType(filename));
    
    // 发送文件
    res.sendFile(filePath);
});
```

#### 删（Delete）：删除文件
```javascript
// 删除用户文件
app.delete('/api/user-files/:username/:filename', (req, res) => {
    const { username, filename } = req.params;
    
    if (!username || !filename) {
        return res.status(400).json({ success: false, message: '用户名和文件名不能为空' });
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

// 前端实现（file-converter.js）
function deleteUserFile(filename, username, fileItemElement) {
    fetch(`/api/user-files/${username}/${filename}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 从DOM中移除文件项
            fileItemElement.remove();
            
            // 检查是否还有文件
            const fileListContainer = document.getElementById('user-file-list');
            if (fileListContainer.children.length === 0) {
                fileListContainer.innerHTML = '<div class="no-files">暂无文件</div>';
            }
        } else {
            alert(`删除失败: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('删除文件错误:', error);
        alert(`删除失败: ${error.message}`);
    });
}
```

#### 改（Update）：更新文件信息
在当前版本中未直接实现文件信息更新功能，但可以通过以下方式实现：

```javascript
// 更新文件信息（示例代码）
app.put('/api/user-files/:username/:filename', (req, res) => {
    const { username, filename } = req.params;
    const { newFilename } = req.body;
    
    if (!username || !filename) {
        return res.status(400).json({ success: false, message: '用户名和文件名不能为空' });
    }
    
    const oldFilePath = path.join(convertFilesDir, username, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(oldFilePath)) {
        return res.status(404).json({ success: false, message: '文件不存在' });
    }
    
    try {
        // 如果提供了新文件名，则重命名文件
        if (newFilename) {
            const newFilePath = path.join(convertFilesDir, username, newFilename);
            fs.renameSync(oldFilePath, newFilePath);
        }
        
        res.status(200).json({ success: true, message: '文件信息更新成功' });
    } catch (error) {
        console.error('更新文件信息错误:', error);
        res.status(500).json({ success: false, message: '更新文件信息失败', error: error.message });
    }
});
```

### 3. 临时文件管理

```javascript
// 清理临时文件
app.post('/api/cleanup', (req, res) => {
    try {
        // 获取临时目录中的所有文件
        const files = fs.readdirSync(tempDir);
        
        // 获取当前时间
        const now = new Date();
        
        // 遍历文件，删除超过24小时的临时文件
        files.forEach(filename => {
            const filePath = path.join(tempDir, filename);
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtime;
            
            // 如果文件超过24小时（86400000毫秒）
            if (fileAge > 86400000) {
                fs.unlinkSync(filePath);
                console.log(`已删除临时文件: ${filename}`);
            }
        });
        
        res.status(200).json({ success: true, message: '临时文件清理完成' });
    } catch (error) {
        console.error('清理临时文件错误:', error);
        res.status(500).json({ success: false, message: '清理临时文件失败', error: error.message });
    }
});

// 前端实现（file-converter.js）
window.addEventListener('beforeunload', function() {
    // 发送清理请求
    navigator.sendBeacon('/api/cleanup');
});
```



## 总结

本项目通过结合AI辅助和个人实操，成功实现了一个功能完整的在线工具箱应用。项目采用了前后端分离的架构，实现了用户系统和文件转换功能，并提供了完整的增删改查操作。通过这个项目，展示了如何使用现代Web技术构建实用的在线工具，以及如何处理文件上传、转换和管理等复杂功能。

未来可以考虑添加更多工具功能，如图片编辑、文本处理、PDF工具等，进一步丰富平台的功能。同时，可以优化用户体验，增加更多的文件格式支持，提高转换质量和速度。