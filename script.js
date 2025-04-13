document.addEventListener('DOMContentLoaded', function() {
    // 主题切换功能
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        document.body.classList.toggle('dark-mode');
        
        // 更新图标
        if (document.body.classList.contains('light-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        // 保存主题偏好到本地存储
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
    });
    
    // 从本地存储加载主题偏好
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const toolCards = document.querySelectorAll('.tool-card');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        let hasResults = false;
        
        // 移除之前可能存在的无结果提示
        const existingNoResult = document.getElementById('no-result-message');
        if (existingNoResult) {
            existingNoResult.remove();
        }
        
        // 恢复工具容器的原始网格布局
        const toolsContainer = document.querySelector('.tools-container');
        toolsContainer.style.display = 'grid';
        toolsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        toolsContainer.style.gap = '2rem';
        toolsContainer.style.maxWidth = '1200px';
        toolsContainer.style.margin = '0 auto';
        toolsContainer.style.justifyContent = '';
        toolsContainer.style.alignItems = '';
        toolsContainer.style.flexDirection = '';
        toolsContainer.style.minHeight = '';
        
        // 在大屏幕上应用3列布局
        if (window.innerWidth >= 992) {
            toolsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
        
        toolCards.forEach(card => {
            const toolName = card.querySelector('h3').textContent.toLowerCase();
            const toolDesc = card.querySelector('p').textContent.toLowerCase();
            
            if ((toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) && searchTerm !== '') {
                card.style.display = 'flex';
                hasResults = true;
            } else if (searchTerm === '') {
                card.style.display = 'flex';
                hasResults = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // 如果没有搜索结果，显示提示信息和返回按钮
        if (!hasResults && searchTerm !== '') {
            const toolsContainer = document.querySelector('.tools-container');
            const noResultDiv = document.createElement('div');
            noResultDiv.id = 'no-result-message';
            noResultDiv.style.textAlign = 'center';
            noResultDiv.style.width = '100%';
            noResultDiv.style.padding = '2rem';
            noResultDiv.style.marginTop = '2rem';
            
            // 添加居中显示的样式
            toolsContainer.style.display = 'flex';
            toolsContainer.style.flexDirection = 'column';
            toolsContainer.style.justifyContent = 'center';
            toolsContainer.style.alignItems = 'center';
            toolsContainer.style.minHeight = 'calc(100vh - 200px)';
            
            const message = document.createElement('p');
            message.textContent = '客官，这种服务我们暂时不提供哦';
            message.style.fontSize = '1.2rem';
            message.style.marginBottom = '1rem';
            
            const backButton = document.createElement('button');
            backButton.textContent = '返回';
            backButton.className = 'action-btn';
            backButton.addEventListener('click', function() {
                searchInput.value = '';
                performSearch();
            });
            
            noResultDiv.appendChild(message);
            noResultDiv.appendChild(backButton);
            toolsContainer.appendChild(noResultDiv);
        }
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // 工具卡片点击事件
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            showToolPage(toolId);
        });
    });
    
    // 返回按钮点击事件
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', hideToolPages);
    });
    
    // 显示工具页面
    function showToolPage(toolId) {
        const toolPages = document.getElementById('tool-pages');
        const toolPage = document.getElementById(toolId);
        
        toolPages.style.display = 'block';
        toolPages.classList.add('fade-in');
        
        document.querySelectorAll('.tool-page').forEach(page => {
            page.style.display = 'none';
        });
        
        toolPage.style.display = 'block';
    }
    
    // 隐藏工具页面
    function hideToolPages() {
        const toolPages = document.getElementById('tool-pages');
        toolPages.style.display = 'none';
        toolPages.classList.remove('fade-in');
    }
    
    // 进制转换器功能
    const convertBtn = document.getElementById('convert-btn');
    const inputNumber = document.getElementById('input-number');
    const inputBase = document.getElementById('input-base');
    const outputBase = document.getElementById('output-base');
    const conversionResult = document.getElementById('conversion-result');
    
    convertBtn.addEventListener('click', function() {
        try {
            const num = inputNumber.value.trim();
            const fromBase = parseInt(inputBase.value);
            const toBase = parseInt(outputBase.value);
            
            if (!num) {
                throw new Error('请输入一个数字');
            }
            
            // 将输入转换为十进制
            const decimalValue = parseInt(num, fromBase);
            
            if (isNaN(decimalValue)) {
                throw new Error('无效的输入数字或进制');
            }
            
            // 将十进制转换为目标进制
            let result = decimalValue.toString(toBase);
            
            // 对于十六进制，转换为大写
            if (toBase === 16) {
                result = result.toUpperCase();
            }
            
            conversionResult.value = result;
        } catch (error) {
            conversionResult.value = `错误: ${error.message}`;
        }
    });
    
    // 随机数生成器功能
    const generateBtn = document.getElementById('generate-btn');
    const minValue = document.getElementById('min-value');
    const maxValue = document.getElementById('max-value');
    const randomCount = document.getElementById('random-count');
    const randomResult = document.getElementById('random-result');
    
    generateBtn.addEventListener('click', function() {
        try {
            const min = parseInt(minValue.value);
            const max = parseInt(maxValue.value);
            const count = parseInt(randomCount.value);
            
            if (isNaN(min) || isNaN(max) || isNaN(count)) {
                throw new Error('请输入有效的数字');
            }
            
            if (min >= max) {
                throw new Error('最小值必须小于最大值');
            }
            
            if (count < 1 || count > 1000000) {
                throw new Error('生成数量必须在1到1,000,000之间');
            }
            
            const results = [];
            for (let i = 0; i < count; i++) {
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                results.push(randomNum);
            }
            
            randomResult.value = results.join(', ');
        } catch (error) {
            randomResult.value = `错误: ${error.message}`;
        }
    });
    
    // 去空格工具功能
    const removeWhitespaceBtn = document.getElementById('remove-whitespace-btn');
    const whitespaceInput = document.getElementById('whitespace-input');
    const whitespaceResult = document.getElementById('whitespace-result');
    const removeSpaces = document.getElementById('remove-spaces');
    const removeTabs = document.getElementById('remove-tabs');
    const removeNewlines = document.getElementById('remove-newlines');
    
    removeWhitespaceBtn.addEventListener('click', function() {
        try {
            let text = whitespaceInput.value;
            let result = text;
            
            if (!text) {
                throw new Error('请输入需要处理的文本');
            }
            
            if (removeSpaces.checked) {
                result = result.replace(/ /g, '');
            }
            
            if (removeTabs.checked) {
                result = result.replace(/\t/g, '');
            }
            
            if (removeNewlines.checked) {
                result = result.replace(/\r\n|\r|\n/g, '');
            }
            
            whitespaceResult.value = result;
        } catch (error) {
            whitespaceResult.value = `错误: ${error.message}`;
        }
    });
    
    // 文本对比功能
    const compareBtn = document.getElementById('compare-btn');
    const textCompareInput1 = document.getElementById('text-compare-input1');
    const textCompareInput2 = document.getElementById('text-compare-input2');
    const lineNumbers1 = document.getElementById('line-numbers1');
    const lineNumbers2 = document.getElementById('line-numbers2');
    
    // 计算文本框可显示的行数
    function calculateVisibleLines(textarea) {
        // 获取文本框的可用高度（减去上下内边距）
        const style = window.getComputedStyle(textarea);
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        const height = textarea.clientHeight;
        const availableHeight = height - paddingTop - paddingBottom;
        
        // 获取行高
        const lineHeight = parseFloat(style.lineHeight);
        
        // 计算可显示的行数
        return Math.floor(availableHeight / lineHeight);
    }
    
    // 初始化时计算行数阈值
    const BASE_HEIGHT = 150; // 基础高度(px)
    const LINE_HEIGHT = 1.5; // 每行的高度(em)
    // 计算初始可见行数作为阈值
    let LINE_THRESHOLD = 0;
    
    // 在DOM加载完成后计算阈值
    window.addEventListener('load', function() {
        // 确保文本框已经渲染完成
        setTimeout(() => {
            LINE_THRESHOLD = calculateVisibleLines(textCompareInput1);
            console.log(`文本框可显示行数阈值: ${LINE_THRESHOLD}`);
        }, 100);
    });
    
    // 自动调整文本框高度的函数 - 基于行数
    function autoResizeTextarea(textarea) {
        // 获取当前行数
        const lines = textarea.value.split('\n');
        const lineCount = lines.length;
        
        // 如果阈值尚未计算，先计算一次
        if (LINE_THRESHOLD === 0) {
            LINE_THRESHOLD = calculateVisibleLines(textarea);
        }
        
        // 计算新高度
        let newHeight;
        if (lineCount <= LINE_THRESHOLD) {
            // 如果行数小于等于阈值，使用基础高度
            newHeight = BASE_HEIGHT;
        } else {
            // 如果行数超过阈值，根据行数计算高度
            // 基础高度 + 额外行数 * 每行高度(em转px)
            const fontSize = parseFloat(getComputedStyle(textarea).fontSize);
            const extraLines = lineCount - LINE_THRESHOLD;
            newHeight = BASE_HEIGHT + (extraLines * LINE_HEIGHT * fontSize);
        }
        
        // 设置新高度
        textarea.style.height = `${newHeight}px`;
        
        // 同时更新行号容器的高度
        const lineNumbersDiv = textarea.id === 'text-compare-input1' ? lineNumbers1 : lineNumbers2;
        lineNumbersDiv.style.height = `${newHeight}px`;
    }
    
    // 初始化行号
    function updateLineNumbers(textArea, lineNumbersDiv) {
        const lines = textArea.value.split('\n');
        let lineNumbersHTML = '';
        for (let i = 1; i <= lines.length; i++) {
            lineNumbersHTML += `<div class="line-number">${i}</div>`;
        }
        lineNumbersDiv.innerHTML = lineNumbersHTML;
        
        // 调整文本框高度
        autoResizeTextarea(textArea);
    }
    
    // 监听文本框输入，更新行号和调整高度
    textCompareInput1.addEventListener('input', function() {
        updateLineNumbers(textCompareInput1, lineNumbers1);
    });
    
    textCompareInput2.addEventListener('input', function() {
        updateLineNumbers(textCompareInput2, lineNumbers2);
    });
    
    // 同步滚动
    textCompareInput1.addEventListener('scroll', function() {
        lineNumbers1.scrollTop = textCompareInput1.scrollTop;
    });
    
    textCompareInput2.addEventListener('scroll', function() {
        lineNumbers2.scrollTop = textCompareInput2.scrollTop;
    });
    
    // 初始化行号
    updateLineNumbers(textCompareInput1, lineNumbers1);
    updateLineNumbers(textCompareInput2, lineNumbers2);
    
    // 重写文本对比逻辑
    compareBtn.addEventListener('click', function() {
        try {
            const text1 = textCompareInput1.value;
            const text2 = textCompareInput2.value;
            
            if (!text1 && !text2) {
                throw new Error('请至少输入一段文本');
            }
            
            // 按行分割文本
            const lines1 = text1.split('\n');
            const lines2 = text2.split('\n');
            
            // 清除之前的高亮
            const containers = [
                textCompareInput1.parentElement,
                textCompareInput2.parentElement
            ];
            
            containers.forEach(container => {
                const existingHighlight = container.querySelector('.highlight-layer');
                if (existingHighlight) {
                    container.removeChild(existingHighlight);
                }
            });
            
            // 使用更可靠的差异比较算法
            const diffLines1 = [];
            const diffLines2 = [];
            
            // 初始化差异数组
            for (let i = 0; i < lines1.length; i++) {
                diffLines1.push(false);
            }
            
            for (let i = 0; i < lines2.length; i++) {
                diffLines2.push(false);
            }
            
            // 比较每一行
            const maxLines = Math.max(lines1.length, lines2.length);
            
            for (let i = 0; i < maxLines; i++) {
                const line1 = i < lines1.length ? lines1[i] : null;
                const line2 = i < lines2.length ? lines2[i] : null;
                
                // 如果一方没有该行或内容不同，则标记为差异
                if (line1 === null || line2 === null || line1 !== line2) {
                    if (i < lines1.length) diffLines1[i] = true;
                    if (i < lines2.length) diffLines2[i] = true;
                }
            }
            
            // 创建高亮覆盖层
            createHighlightLayer(textCompareInput1, diffLines1);
            createHighlightLayer(textCompareInput2, diffLines2);
            
        } catch (error) {
            alert(`错误: ${error.message}`);
        }
    });
    
    // 创建高亮层函数
    function createHighlightLayer(textArea, diffLines) {
        // 获取文本区域的父容器
        const container = textArea.parentElement;
        
        // 移除之前可能存在的高亮层
        const existingHighlight = container.querySelector('.highlight-layer');
        if (existingHighlight) {
            container.removeChild(existingHighlight);
        }
        
        // 创建高亮层
        const highlightLayer = document.createElement('div');
        highlightLayer.className = 'highlight-layer';
        highlightLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            white-space: pre;
            font-family: monospace;
            line-height: 1.5em;
            overflow: hidden;
            padding: 0.8rem;
            color: transparent;
            z-index: 1;
            font-size: 1rem;
        `;
        
        // 处理标记的文本
        const lines = textArea.value.split('\n');
        let highlightHTML = '';
        
        for (let i = 0; i < lines.length; i++) {
            if (diffLines[i]) {
                // 差异行 - 添加高亮背景
                highlightHTML += `<div class="diff-highlight">${lines[i] || ' '}</div>`;
            } else {
                // 相同行 - 保持透明
                highlightHTML += `<div style="height: 1.5em;">${lines[i] || ' '}</div>`;
            }
        }
        
        highlightLayer.innerHTML = highlightHTML;
        container.appendChild(highlightLayer);
        
        // 确保高亮层与文本区域同步滚动
        textArea.addEventListener('scroll', function() {
            highlightLayer.scrollTop = textArea.scrollTop;
            highlightLayer.scrollLeft = textArea.scrollLeft;
        });
    }
    
    // 正则表达式匹配功能
    const regexTestBtn = document.getElementById('regex-test-btn');
    const regexPattern = document.getElementById('regex-pattern');
    const regexInput = document.getElementById('regex-input');
    const regexResult = document.getElementById('regex-result');
    const regexGlobal = document.getElementById('regex-global');
    const regexCase = document.getElementById('regex-case');
    const regexMultiline = document.getElementById('regex-multiline');
    
    regexTestBtn.addEventListener('click', function() {
        try {
            const pattern = regexPattern.value;
            const text = regexInput.value;
            
            if (!pattern) {
                throw new Error('请输入正则表达式');
            }
            
            if (!text) {
                throw new Error('请输入需要测试的文本');
            }
            
            // 构建正则表达式标志
            let flags = '';
            if (regexGlobal.checked) flags += 'g';
            if (regexCase.checked) flags += 'i';
            if (regexMultiline.checked) flags += 'm';
            
            // 创建正则表达式对象
            const regex = new RegExp(pattern, flags);
            
            // 清空之前的结果
            regexResult.innerHTML = '';
            
            // 获取匹配结果
            let match;
            let matchCount = 0;
            let resultHtml = '';
            let lastIndex = 0;
            
            // 如果是全局匹配
            if (flags.includes('g')) {
                let highlightedText = '';
                let currentIndex = 0;
                
                while ((match = regex.exec(text)) !== null) {
                    matchCount++;
                    
                    // 添加匹配前的文本
                    highlightedText += text.substring(currentIndex, match.index);
                    
                    // 添加匹配的文本（高亮显示）
                    highlightedText += `<span class="match-highlight">${match[0]}</span>`;
                    
                    currentIndex = regex.lastIndex;
                }
                
                // 添加剩余的文本
                highlightedText += text.substring(currentIndex);
                
                resultHtml = `
                    <div class="match-count">找到 ${matchCount} 个匹配</div>
                    <div class="match-text">${highlightedText}</div>
                `;
            } else {
                // 非全局匹配，只匹配第一个
                match = regex.exec(text);
                
                if (match) {
                    matchCount = 1;
                    
                    // 高亮显示匹配的文本
                    const highlightedText = text.substring(0, match.index) + 
                        `<span class="match-highlight">${match[0]}</span>` + 
                        text.substring(match.index + match[0].length);
                    
                    resultHtml = `
                        <div class="match-count">找到 1 个匹配</div>
                        <div class="match-text">${highlightedText}</div>
                    `;
                } else {
                    resultHtml = '<div class="match-count">没有找到匹配</div>';
                }
            }
            
            regexResult.innerHTML = resultHtml;
        } catch (error) {
            regexResult.innerHTML = `<div class="error-message">错误: ${error.message}</div>`;
        }
    });
    
    // 文本反转功能
    const reverseBtn = document.getElementById('reverse-btn');
    const reverseInput = document.getElementById('reverse-input');
    const reverseResult = document.getElementById('reverse-result');
    const reverseChar = document.getElementById('reverse-char');
    const reverseWord = document.getElementById('reverse-word');
    
    reverseBtn.addEventListener('click', function() {
        try {
            const text = reverseInput.value;
            
            if (!text) {
                throw new Error('请输入需要反转的文本');
            }
            
            let result = '';
            
            if (reverseChar.checked) {
                // 按字符反转
                result = text.split('').reverse().join('');
            } else if (reverseWord.checked) {
                // 按单词反转（保留空格和标点符号的位置）
                result = text.split(/\b/).map(word => {
                    // 只反转单词，保留空格和标点符号
                    if (word.trim()) {
                        return word.split('').reverse().join('');
                    }
                    return word;
                }).join('');
            }
            
            reverseResult.value = result;
        } catch (error) {
            reverseResult.value = `错误: ${error.message}`;
        }
    });
});
