// 文件格式转换工具的JavaScript代码

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const fileDropArea = document.getElementById('file-drop-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileType = document.getElementById('file-type');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const conversionOptions = document.getElementById('conversion-options');
    const targetFormat = document.getElementById('target-format');
    const convertFileBtn = document.getElementById('convert-file-btn');
    const conversionResult = document.getElementById('conversion-result-2');
    const conversionProgress = document.getElementById('conversion-progress');
    const progressFill = conversionProgress.querySelector('.progress-fill');
    const conversionStatus = document.getElementById('conversion-status');
    const downloadSection = document.getElementById('download-section');
    const downloadBtn = document.getElementById('download-btn');
    const fileStorageInfo = document.getElementById('file-storage-info');
    
    // 创建文件管理按钮和容器
    const toolContent = document.querySelector('#file-converter .tool-content');
    const fileManagerContainer = document.createElement('div');
    fileManagerContainer.className = 'file-manager-container';
    fileManagerContainer.style.display = 'none';
    fileManagerContainer.innerHTML = `
        <h3>我的文件</h3>
        <div class="file-list-container">
            <div class="file-list-header">
                <span class="file-name-header">文件名</span>
                <span class="file-date-header">转换日期</span>
                <span class="file-size-header">文件大小</span>
                <span class="file-actions-header">操作</span>
            </div>
            <div id="user-file-list" class="user-file-list">
                <div class="loading-files">加载中...</div>
            </div>
        </div>
    `;
    
    // 创建管理文件按钮
    const manageFilesBtn = document.createElement('button');
    manageFilesBtn.id = 'manage-files-btn';
    manageFilesBtn.className = 'action-btn';
    manageFilesBtn.innerHTML = '<i class="fas fa-folder-open"></i> 管理我的文件';
    manageFilesBtn.style.display = 'none';
    
    // 将按钮和容器添加到工具内容区域
    toolContent.appendChild(manageFilesBtn);
    toolContent.appendChild(fileManagerContainer);
    
    // 当前上传的文件信息
    let currentFile = null;
    let uploadedFileInfo = null;
    
    // 拖放文件功能
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        fileDropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        fileDropArea.classList.remove('drag-over');
    }
    
    fileDropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files[0]);
        }
    }
    
    // 点击选择文件
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files[0]);
        }
    });
    
    // 处理选择的文件
    function handleFiles(file) {
        currentFile = file;
        
        // 显示文件信息
        fileName.textContent = `文件名: ${file.name}`;
        fileSize.textContent = `大小: ${formatFileSize(file.size)}`;
        fileType.textContent = `类型: ${file.type || '未知'}`;
        
        // 更新文件预览图标
        updateFileIcon(file);
        
        // 显示文件信息区域
        fileInfo.style.display = 'flex';
        
        // 上传文件到服务器
        uploadFile(file);
    }
    
    // 更新文件图标
    function updateFileIcon(file) {
        // 清空预览区域
        filePreview.innerHTML = '';
        
        // 根据文件类型设置不同的图标
        if (file.type.startsWith('image/')) {
            // 如果是图片，显示缩略图
            const img = document.createElement('img');
            img.file = file;
            filePreview.appendChild(img);
            
            const reader = new FileReader();
            reader.onload = (function(aImg) { 
                return function(e) { 
                    aImg.src = e.target.result; 
                }; 
            })(img);
            reader.readAsDataURL(file);
        } else {
            // 其他类型文件显示对应图标
            const icon = document.createElement('i');
            icon.className = getFileIconClass(file);
            filePreview.appendChild(icon);
        }
    }
    
    // 根据文件类型获取对应的Font Awesome图标类
    function getFileIconClass(file) {
        const fileType = file.type;
        const fileName = file.name;
        const extension = fileName.split('.').pop().toLowerCase();
        
        if (fileType.startsWith('image/')) {
            return 'fas fa-file-image';
        } else if (fileType.startsWith('video/')) {
            return 'fas fa-file-video';
        } else if (fileType.startsWith('audio/')) {
            return 'fas fa-file-audio';
        } else if (fileType.startsWith('text/')) {
            return 'fas fa-file-alt';
        } else if (fileType.includes('pdf')) {
            return 'fas fa-file-pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            return 'fas fa-file-word';
        } else if (['xls', 'xlsx'].includes(extension)) {
            return 'fas fa-file-excel';
        } else if (['ppt', 'pptx'].includes(extension)) {
            return 'fas fa-file-powerpoint';
        } else if (['zip', 'rar', '7z'].includes(extension)) {
            return 'fas fa-file-archive';
        } else {
            return 'fas fa-file';
        }
    }
    
    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 上传文件到服务器
    function uploadFile(file) {
        // 创建FormData对象
        const formData = new FormData();
        formData.append('file', file);
        
        // 显示上传状态
        conversionStatus.textContent = '正在上传文件...';
        progressFill.style.width = '0%';
        conversionResult.style.display = 'block';
        downloadSection.style.display = 'none';
        
        // 发送上传请求
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                uploadedFileInfo = data.fileInfo;
                progressFill.style.width = '50%';
                conversionStatus.textContent = '文件上传成功，请选择转换格式';
                
                // 根据文件类型显示可用的转换格式
                updateConversionOptions(file);
                conversionOptions.style.display = 'block';
            } else {
                throw new Error(data.message || '文件上传失败');
            }
        })
        .catch(error => {
            conversionStatus.textContent = `错误: ${error.message}`;
            progressFill.style.width = '0%';
        });
    }
    
    // 根据文件类型更新可用的转换格式
    function updateConversionOptions(file) {
        // 清空现有选项
        targetFormat.innerHTML = '';
        
        // 根据文件类型添加可用的转换格式
        const fileType = file.type;
        const fileName = file.name;
        const extension = fileName.split('.').pop().toLowerCase();
        
        let formats = [];
        
        if (fileType.startsWith('image/')) {
            // 图片格式
            formats = ['jpg', 'png', 'gif', 'webp', 'pdf'];
        } else if (['doc', 'docx'].includes(extension)) {
            // Word文档
            formats = ['pdf', 'txt', 'html', 'markdown', 'odt'];
        } else if (['xls', 'xlsx'].includes(extension)) {
            // Excel文档
            formats = ['csv', 'pdf', 'html'];
        } else if (fileType.includes('pdf')) {
            // PDF文档
            formats = ['txt', 'jpg', 'html', 'docx'];
        } else if (fileType.startsWith('text/')) {
            // 文本文件
            formats = ['pdf', 'docx', 'html', 'markdown', 'odt'];
        } else if (['md', 'markdown'].includes(extension)) {
            // Markdown文件
            formats = ['pdf', 'docx', 'html', 'odt', 'txt'];
        } else if (['html', 'htm'].includes(extension)) {
            // HTML文件
            formats = ['pdf', 'docx', 'txt', 'markdown'];
        } else {
            // 默认格式
            formats = ['zip', 'pdf', 'txt'];
        }
        
        // 移除当前文件的格式
        formats = formats.filter(format => format !== extension);
        
        // 添加选项
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format.toUpperCase();
            targetFormat.appendChild(option);
        });
    }
    
    // 移除文件按钮点击事件
    removeFileBtn.addEventListener('click', function() {
        resetFileUpload();
    });
    
    // 重置文件上传状态
    function resetFileUpload() {
        currentFile = null;
        uploadedFileInfo = null;
        fileInfo.style.display = 'none';
        conversionOptions.style.display = 'none';
        conversionResult.style.display = 'none';
        fileInput.value = '';
    }
    
    // 转换文件按钮点击事件
    convertFileBtn.addEventListener('click', function() {
        if (!uploadedFileInfo) {
            alert('请先上传文件');
            return;
        }
        
        const format = targetFormat.value;
        
        if (!format) {
            alert('请选择转换格式');
            return;
        }
        
        convertFile(uploadedFileInfo.filename, format);
    });
    
    // 转换文件
    function convertFile(filename, targetFormat) {
        // 显示转换状态
        conversionStatus.textContent = '正在转换文件...';
        progressFill.style.width = '75%';
        downloadSection.style.display = 'none';
        conversionResult.style.display = 'block';
        
        // 获取当前登录用户信息
        let username = null;
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            try {
                const userData = JSON.parse(currentUser);
                username = userData.username;
            } catch (error) {
                console.error('解析用户数据错误:', error);
            }
        }
        
        // 发送转换请求
        fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename,
                targetFormat: targetFormat,
                username: username
            })
        })
        .then(response => {
            console.log('转换响应状态:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('转换响应数据:', data);
            if (data.success) {
                progressFill.style.width = '100%';
                conversionStatus.textContent = '文件转换成功！';
                
                // 保存转换后的文件信息
                const convertedFile = data.convertedFile;
                console.log('转换后的文件信息:', convertedFile);
                
                // 显示下载区域
                downloadSection.style.display = 'block';
                console.log('下载区域显示状态:', downloadSection.style.display);
                
                // 设置下载按钮事件
                downloadBtn.onclick = function() {
                    console.log('下载按钮被点击');
                    downloadConvertedFile(convertedFile.filename, username);
                };
                
                // 确保下载按钮可见并可点击
                downloadBtn.style.display = 'inline-block';
                console.log('下载按钮设置完成:', downloadBtn);
                
                // 显示存储信息
                if (convertedFile.isTemporary) {
                    fileStorageInfo.textContent = '注意：您当前未登录，转换后的文件将在您关闭页面后被删除。';
                } else {
                    fileStorageInfo.textContent = '文件已永久保存在您的账户中，可随时下载。';
                }
            } else {
                throw new Error(data.message || '文件转换失败');
            }
        })
        .catch(error => {
            console.error('转换错误:', error);
            conversionStatus.textContent = `错误: ${error.message}`;
            progressFill.style.width = '50%';
        });
    }
    
    // 下载转换后的文件
    function downloadConvertedFile(filename, username) {
        // 如果没有传入用户名，尝试从localStorage获取
        if (!username) {
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                try {
                    const userData = JSON.parse(currentUser);
                    username = userData.username;
                } catch (error) {
                    console.error('解析用户数据错误:', error);
                }
            }
        }
        
        let downloadUrl = `/api/download/${filename}`;
        
        if (username) {
            downloadUrl += `?username=${username}`;
        }
        
        // 显示下载状态
        conversionStatus.textContent = '正在准备下载...';
        console.log('准备下载文件:', filename, '下载URL:', downloadUrl);
        
        // 使用fetch API获取文件并触发下载
        fetch(downloadUrl)
            .then(response => {
                console.log('下载响应状态:', response.status, response.ok);
                if (!response.ok) {
                    throw new Error('下载失败，请重试');
                }
                // 保存文件名信息
                const contentDisposition = response.headers.get('content-disposition');
                console.log('Content-Disposition头:', contentDisposition);
                const fileName = contentDisposition ? 
                    contentDisposition.split('filename=')[1].replace(/"/g, '') : 
                    filename;
                    
                return response.blob().then(blob => ({ blob, fileName }));
            })
            .then(({ blob, fileName }) => {
                console.log('获取到文件blob:', blob.type, blob.size, '文件名:', fileName);
                // 创建一个临时链接并点击它来下载文件
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                console.log('创建下载链接:', link);
                link.click();
                console.log('触发下载点击');
                
                // 清理
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
                conversionStatus.textContent = '文件下载完成！';
            })
            .catch(error => {
                console.error('下载错误详情:', error);
                conversionStatus.textContent = `下载错误: ${error.message}`;
            });
    }
    
    // 管理文件按钮点击事件
    manageFilesBtn.addEventListener('click', function() {
        if (fileManagerContainer.style.display === 'none') {
            loadUserFiles();
            fileManagerContainer.style.display = 'block';
            manageFilesBtn.innerHTML = '<i class="fas fa-times"></i> 关闭文件管理';
        } else {
            fileManagerContainer.style.display = 'none';
            manageFilesBtn.innerHTML = '<i class="fas fa-folder-open"></i> 管理我的文件';
        }
    });
    
    // 加载用户文件列表
    function loadUserFiles() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            return;
        }
        
        try {
            const userData = JSON.parse(currentUser);
            const username = userData.username;
            const fileListContainer = document.getElementById('user-file-list');
            
            // 显示加载中
            fileListContainer.innerHTML = '<div class="loading-files">加载中...</div>';
            
            // 获取用户文件列表
            fetch(`/api/user-files/${username}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        if (data.files.length === 0) {
                            fileListContainer.innerHTML = '<div class="no-files">暂无文件</div>';
                            return;
                        }
                        
                        // 清空容器
                        fileListContainer.innerHTML = '';
                        
                        // 添加文件列表
                        data.files.forEach(file => {
                            const fileItem = document.createElement('div');
                            fileItem.className = 'file-item';
                            fileItem.innerHTML = `
                                <span class="file-name">${file.displayName}</span>
                                <span class="file-date">${new Date(file.modifiedAt).toLocaleString()}</span>
                                <span class="file-size">${formatFileSize(file.size)}</span>
                                <div class="file-actions">
                                    <button class="download-file-btn" data-filename="${file.filename}"><i class="fas fa-download"></i></button>
                                    <button class="delete-file-btn" data-filename="${file.filename}"><i class="fas fa-trash"></i></button>
                                </div>
                            `;
                            fileListContainer.appendChild(fileItem);
                            
                            // 下载按钮点击事件
                            const downloadBtn = fileItem.querySelector('.download-file-btn');
                            downloadBtn.addEventListener('click', function() {
                                const filename = this.getAttribute('data-filename');
                                downloadConvertedFile(filename, username);
                            });
                            
                            // 删除按钮点击事件
                            const deleteBtn = fileItem.querySelector('.delete-file-btn');
                            deleteBtn.addEventListener('click', function() {
                                const filename = this.getAttribute('data-filename');
                                if (confirm('确定要删除此文件吗？')) {
                                    deleteUserFile(filename, username, fileItem);
                                }
                            });
                        });
                    } else {
                        fileListContainer.innerHTML = `<div class="error-message">加载失败: ${data.message}</div>`;
                    }
                })
                .catch(error => {
                    console.error('获取文件列表错误:', error);
                    fileListContainer.innerHTML = `<div class="error-message">加载失败: ${error.message}</div>`;
                });
        } catch (error) {
            console.error('解析用户数据错误:', error);
        }
    }
    
    // 删除用户文件
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
    
    // 检查登录状态并显示/隐藏管理文件按钮
    function checkLoginStatusForFileManager() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            manageFilesBtn.style.display = 'inline-block';
        } else {
            manageFilesBtn.style.display = 'none';
            fileManagerContainer.style.display = 'none';
        }
    }
    
    // 初始检查登录状态
    checkLoginStatusForFileManager();
    
    // 监听存储变化，更新UI
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            checkLoginStatusForFileManager();
        }
    });
    
    // 创建一个自定义事件监听器，用于用户登录/登出时更新UI
    document.addEventListener('userLoginStatusChanged', function() {
        checkLoginStatusForFileManager();
    });
    
    // 页面关闭前清理临时文件
    window.addEventListener('beforeunload', function() {
        // 发送清理请求
        navigator.sendBeacon('/api/cleanup');
    });
}
);