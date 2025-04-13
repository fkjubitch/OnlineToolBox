// 用户功能相关的JavaScript代码

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // 检查用户是否已登录
    checkLoginStatus();
    
    // 打开登录模态框
    loginButton.addEventListener('click', function() {
        loginModal.style.display = 'block';
        document.getElementById('login-username').focus();
    });
    
    // 打开注册模态框
    registerButton.addEventListener('click', function() {
        registerModal.style.display = 'block';
        document.getElementById('register-username').focus();
    });
    
    // 关闭模态框
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            // 清空表单和错误信息
            loginForm.reset();
            registerForm.reset();
            loginError.style.display = 'none';
            registerError.style.display = 'none';
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
            loginForm.reset();
            loginError.style.display = 'none';
        } else if (event.target === registerModal) {
            registerModal.style.display = 'none';
            registerForm.reset();
            registerError.style.display = 'none';
        }
    });
    
    // 切换到注册
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
        document.getElementById('register-username').focus();
    });
    
    // 切换到登录
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
        document.getElementById('login-username').focus();
    });
    
    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!username || !password) {
            showError(loginError, '用户名和密码不能为空');
            return;
        }
        
        // 发送登录请求
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 登录成功
                localStorage.setItem('currentUser', JSON.stringify({
                    username: data.user.username,
                    createdAt: data.user.createdAt
                }));
                
                // 更新UI
                updateUserUI(data.user.username);
                
                // 关闭模态框
                loginModal.style.display = 'none';
                loginForm.reset();
            } else {
                // 登录失败
                showError(loginError, data.message || '登录失败');
            }
        })
        .catch(error => {
            console.error('登录请求错误:', error);
            showError(loginError, '网络错误，请稍后再试');
        });
    });
    
    // 注册表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();
        
        if (!username || !password || !confirmPassword) {
            showError(registerError, '所有字段都必须填写');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(registerError, '两次输入的密码不一致');
            return;
        }
        
        // 发送注册请求
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 注册成功，自动登录
                localStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    createdAt: new Date().toISOString()
                }));
                
                // 更新UI
                updateUserUI(username);
                
                // 关闭模态框
                registerModal.style.display = 'none';
                registerForm.reset();
            } else {
                // 注册失败
                showError(registerError, data.message || '注册失败');
            }
        })
        .catch(error => {
            console.error('注册请求错误:', error);
            showError(registerError, '网络错误，请稍后再试');
        });
    });
    
    // 退出登录
    logoutButton.addEventListener('click', function() {
        // 清除本地存储
        localStorage.removeItem('currentUser');
        
        // 更新UI
        loginButton.style.display = 'inline-block';
        registerButton.style.display = 'inline-block';
        userProfile.style.display = 'none';
    });
    
    // 显示错误信息
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // 检查登录状态
    function checkLoginStatus() {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
            try {
                const userData = JSON.parse(currentUser);
                updateUserUI(userData.username);
                
                // 验证用户信息是否有效
                fetch(`/api/user/${userData.username}`)
                    .then(response => {
                        if (!response.ok) {
                            // 用户不存在，清除本地存储
                            localStorage.removeItem('currentUser');
                            updateUserUI(null);
                        }
                    })
                    .catch(error => {
                        console.error('验证用户信息错误:', error);
                    });
            } catch (error) {
                console.error('解析用户数据错误:', error);
                localStorage.removeItem('currentUser');
            }
        }
    }
    
    // 更新用户界面
    function updateUserUI(username) {
        if (username) {
            // 已登录状态
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';
            userProfile.style.display = 'flex';
            usernameDisplay.textContent = username;
        } else {
            // 未登录状态
            loginButton.style.display = 'inline-block';
            registerButton.style.display = 'inline-block';
            userProfile.style.display = 'none';
        }
        
        // 触发自定义事件，通知其他组件用户登录状态已更改
        document.dispatchEvent(new CustomEvent('userLoginStatusChanged', {
            detail: { username: username }
        }));
    }
});