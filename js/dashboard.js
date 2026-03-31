// 数字动画函数
function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = Math.floor(parseFloat(target) * easeOutQuart);
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = parseFloat(target).toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

// 进度条动画函数
function initProgressBar() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
        const progressValue = parseFloat(bar.getAttribute('data-progress'));
        const progressFill = bar.querySelector('.progress-fill');
        const progressGlow = bar.querySelector('.progress-glow');
        const progressPercentage = bar.closest('.metric-card').querySelector('.progress-percentage');
        
        // 延迟启动动画
        setTimeout(() => {
            if (progressFill) {
                progressFill.style.width = progressValue + '%';
            }
            if (progressGlow) {
                progressGlow.style.width = progressValue + '%';
            }
            
            // 动画百分比数字
            if (progressPercentage) {
                animatePercentage(progressPercentage, progressValue);
            }
        }, 500);
    });
}

// 百分比动画函数
function animatePercentage(element, target, duration = 2000) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const currentValue = (target * easeOutQuart).toFixed(1);
        element.textContent = currentValue + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toFixed(1) + '%';
        }
    }
    
    requestAnimationFrame(update);
}

// 观察器配置
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

// 数字动画观察器
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const targetValue = entry.target.getAttribute('data-target');
            animateNumber(entry.target, targetValue);
        }
    });
}, observerOptions);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化数字动画
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(value => {
        const originalText = value.textContent;
        value.setAttribute('data-target', originalText);
        value.textContent = '0';
        observer.observe(value);
    });
    
    // 初始化进度条动画
    initProgressBar();
    
    // 复制日志内容以实现无限循环滚动
    const logsContent = document.getElementById('logsContent');
    if (logsContent) {
        const originalContent = logsContent.innerHTML;
        // 复制多次内容确保无缝循环
        logsContent.innerHTML = originalContent + originalContent + originalContent;
    }
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// 下载资源函数
function downloadResource(filename) {
    // 显示提示
    showNotification(`正在准备下载：${filename}`);
    
    // 实际项目中这里应该是真实的下载逻辑
    setTimeout(() => {
        showNotification(`${filename} 下载完成！`, 'success');
    }, 1500);
}

// 播放视频函数
function playVideo(videoId) {
    // 显示提示
    showNotification(`正在加载视频：${videoId}`);
    
    // 实际项目中这里应该打开视频播放器
    setTimeout(() => {
        showNotification('视频加载完成，即将播放...', 'success');
    }, 1000);
}

// 通知提示函数
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        border: 2px solid rgba(96, 165, 250, 0.6);
        box-shadow: 0 8px 32px rgba(96, 165, 250, 0.4);
        z-index: 10001;
        font-size: 14px;
        font-weight: 500;
        backdrop-filter: blur(20px);
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    // 成功类型使用绿色
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(74, 222, 128, 0.95) 100%)';
        notification.style.borderColor = 'rgba(74, 222, 128, 0.6)';
    }
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 导航栏滚动效果
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = .pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 26, 40, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 26, 40, 0.7)';
    }
    
    lastScroll = currentScroll;
});

// 监控日志悬停暂停
const logsScrollContent = document.querySelector('.logs-scroll-content');
if (logsScrollContent) {
    logsScrollContent.addEventListener('mouseenter', () => {
        logsScrollContent.style.animationPlayState = 'paused';
    });
    
    logsScrollContent.addEventListener('mouseleave', () => {
        logsScrollContent.style.animationPlayState = 'running';
    });
}

// 性能优化：减少重绘
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // 滚动相关的操作
            ticking = false;
        });
        ticking = true;
    }
});

console.log('Dashboard initialized successfully! 🚀');
