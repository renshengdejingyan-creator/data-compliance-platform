// 垂直翻页功能
class VerticalSlider {
    constructor(options = {}) {
        this.container = document.querySelector(options.container || '.demo-grid');
        this.items = document.querySelectorAll(options.items || '.demo-card');
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = options.autoplayDelay || 5000;
        this.enableAutoplay = options.enableAutoplay !== false;
        
        this.init();
    }
    
    init() {
        if (!this.container || this.items.length === 0) return;
        
        // 创建翻页容器结构
        this.createSliderStructure();
        
        // 绑定事件
        this.bindEvents();
        
        // 显示第一张
        this.showSlide(0, true);
        
        // 启动自动播放
        if (this.enableAutoplay) {
            this.startAutoplay();
        }
    }
    
    createSliderStructure() {
        // 包装原有的 grid 容器
        const wrapper = document.createElement('div');
        wrapper.className = 'vertical-slider-wrapper';
        this.container.parentNode.insertBefore(wrapper, this.container);
        wrapper.appendChild(this.container);
        
        // 移除原有的 grid 样式
        this.container.style.display = 'block';
        this.container.style.position = 'relative';
        this.container.style.overflow = 'hidden';
        this.container.style.border = '2px solid rgba(96, 165, 250, 0.5)';
        this.container.style.borderRadius = '18px';
        this.container.style.background = 'linear-gradient(135deg, rgba(10, 26, 40, 0.8), rgba(20, 40, 60, 0.7))';
        this.container.style.backdropFilter = 'blur(20px)';
        this.container.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
        
        // 获取第一张图片来设置容器尺寸
        const firstImage = this.items[0]?.querySelector('img');
        if (firstImage) {
            // 等待图片加载完成后设置尺寸
            if (firstImage.complete) {
                this.setContainerSize(firstImage);
            } else {
                firstImage.addEventListener('load', () => {
                    this.setContainerSize(firstImage);
                });
            }
        }
        
        // 隐藏所有卡片，设置为绝对定位并居中
        this.items.forEach((item, index) => {
            item.style.position = 'absolute';
            item.style.top = '0';
            item.style.left = '0';
            item.style.width = '100%';
            item.style.height = '100%';
            item.style.transform = 'translateY(100%)';
            item.style.opacity = '0';
            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.border = 'none';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'center';
            item.style.background = 'transparent';
            
            // 确保图片容器填充整个卡片
            const imgContainer = item.querySelector('.demo-image-container');
            if (imgContainer) {
                imgContainer.style.width = '100%';
                imgContainer.style.height = '100%';
                imgContainer.style.display = 'flex';
                imgContainer.style.alignItems = 'center';
                imgContainer.style.justifyContent = 'center';
                imgContainer.style.background = 'transparent';
            }
            
            // 确保图片填充容器
            const img = item.querySelector('img');
            if (img) {
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
            }
        });
    }
    
    setContainerSize(img) {
        const height = img.naturalHeight || img.height;
        const width = img.naturalWidth || img.width;
        
        if (height && width) {
            // 计算容器最大宽度
            const containerMaxWidth = Math.min(1400, window.innerWidth - 40);
            
            // 如果图片宽度超过最大宽度，按比例缩放
            let finalWidth = width;
            let finalHeight = height;
            
            if (width > containerMaxWidth) {
                const scale = containerMaxWidth / width;
                finalWidth = containerMaxWidth;
                finalHeight = height * scale;
            }
            
            // 设置容器尺寸
            this.container.style.width = finalWidth + 'px';
            this.container.style.height = finalHeight + 'px';
            this.container.style.margin = '0 auto';
            
            // wrapper 设置高度
            this.container.parentNode.style.width = finalWidth + 'px';
            this.container.parentNode.style.height = finalHeight + 'px';
            this.container.parentNode.style.margin = '0 auto';
            this.container.parentNode.style.position = 'relative';
        }
    }
    
    bindEvents() {
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.next();
            }
        });
        
        // 触摸滑动
        let touchStartY = 0;
        let touchEndY = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
        
        // 鼠标滚轮
        let wheelTimeout;
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 0) {
                    this.next();
                } else if (e.deltaY < 0) {
                    this.prev();
                }
            }, 50);
        }, { passive: false });
        
        // 鼠标悬停时暂停自动播放
        this.container.addEventListener('mouseenter', () => {
            this.stopAutoplay();
        });
        
        this.container.addEventListener('mouseleave', () => {
            if (this.enableAutoplay) {
                this.startAutoplay();
            }
        });
    }
    
    showSlide(index, skipAnimation = false) {
        if (this.isAnimating && !skipAnimation) return;
        
        const prevIndex = this.currentIndex;
        this.currentIndex = index;
        
        if (!skipAnimation) {
            this.isAnimating = true;
        }
        
        this.items.forEach((item, i) => {
            if (skipAnimation) {
                item.style.transition = 'none';
            }
            
            if (i === index) {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                item.style.zIndex = '2';
            } else if (i < index) {
                item.style.opacity = '0';
                item.style.transform = 'translateY(-100%)';
                item.style.zIndex = '1';
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(100%)';
                item.style.zIndex = '1';
            }
            
            if (skipAnimation) {
                setTimeout(() => {
                    item.style.transition = '';
                }, 50);
            }
        });
        
        // 更新按钮状态（已移除按钮，保留代码结构）
        
        if (!skipAnimation) {
            setTimeout(() => {
                this.isAnimating = false;
            }, 600);
        }
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.showSlide(this.currentIndex - 1);
            this.resetAutoplay();
        }
    }
    
    next() {
        const newIndex = (this.currentIndex + 1) % this.items.length;
        this.showSlide(newIndex);
        this.resetAutoplay();
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.items.length && index !== this.currentIndex) {
            this.showSlide(index);
            this.resetAutoplay();
        }
    }
    
    startAutoplay() {
        if (this.autoplayInterval) return;
        this.autoplayInterval = setInterval(() => {
            this.next();
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        if (this.enableAutoplay) {
            this.startAutoplay();
        }
    }
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    new VerticalSlider({
        container: '.demo-grid',
        items: '.demo-card',
        autoplayDelay: 3000,
        enableAutoplay: true
    });
});
