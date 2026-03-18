/**
 * Section滚轮翻页功能
 * 实现页面section之间的平滑滚动切换
 * 支持section内部滚动和footer访问
 */

class SectionScroller {
    constructor() {
        this.sections = document.querySelectorAll('section');
        this.footer = document.querySelector('footer');
        this.currentIndex = 0;
        this.isScrolling = false;
        this.scrollDelay = 800; // 滚动延迟，防止连续触发
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isAtFooter = false;
        
        this.init();
    }
    
    init() {
        // 监听鼠标滚轮事件
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        // 监听触摸事件（移动端支持）
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // 监听键盘事件
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // 更新当前section索引（基于滚动位置）
        window.addEventListener('scroll', this.updateCurrentIndex.bind(this));
        
        // 初始化当前索引
        this.updateCurrentIndex();
    }
    
    // 检查当前section是否可以继续滚动
    canScrollInSection(direction) {
        const currentSection = this.sections[this.currentIndex];
        if (!currentSection) return false;
        
        const sectionTop = currentSection.offsetTop;
        const sectionHeight = currentSection.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        if (direction === 'down') {
            // 向下滚动：检查section底部是否还未完全显示
            return scrollTop + viewportHeight < sectionBottom - 10;
        } else {
            // 向上滚动：检查section顶部是否还未完全显示
            return scrollTop > sectionTop + 10;
        }
    }
    
    // 检查是否在footer区域
    isInFooter() {
        if (!this.footer) return false;
        const footerTop = this.footer.offsetTop;
        const scrollTop = window.pageYOffset;
        // 只有当页面滚动位置超过footer顶部时才认为在footer区域
        return scrollTop >= footerTop - 50;
    }
    
    handleWheel(e) {
        if (this.isScrolling) return;
        
        const delta = e.deltaY;
        const direction = delta > 0 ? 'down' : 'up';
        
        // 检查是否在footer
        if (this.isInFooter()) {
            // 在footer区域
            if (direction === 'up') {
                // 向上滚动，检查是否需要返回最后一个section
                const footerTop = this.footer.offsetTop;
                const currentScrollTop = window.pageYOffset;
                
                // 如果当前滚动位置接近footer顶部，返回最后一个section
                if (currentScrollTop <= footerTop + 50) {
                    e.preventDefault();
                    this.isAtFooter = false;
                    this.isScrolling = true;
                    this.currentIndex = this.sections.length - 1;
                    
                    const lastSection = this.sections[this.sections.length - 1];
                    const targetScroll = lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight;
                    
                    window.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                    
                    this.updateNavigation();
                    
                    setTimeout(() => {
                        this.isScrolling = false;
                    }, this.scrollDelay);
                    return;
                }
                // 否则允许在footer内自由滚动
            }
            // 在footer区域允许自由滚动
            return;
        }
        
        // 检查当前section是否还能继续滚动
        if (this.canScrollInSection(direction)) {
            // 允许在section内部自由滚动
            return;
        }
        
        // section已经滚动到边界，执行翻页
        e.preventDefault();
        
        if (delta > 0) {
            // 向下滚动到下一个section或footer
            if (this.currentIndex === this.sections.length - 1 && this.footer) {
                // 最后一个section，滚动到footer
                this.isScrolling = true;
                this.isAtFooter = true;
                this.footer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                setTimeout(() => {
                    this.isScrolling = false;
                }, this.scrollDelay);
            } else {
                this.scrollToSection(this.currentIndex + 1);
            }
        } else {
            // 向上滚动到上一个section
            this.scrollToSection(this.currentIndex - 1);
        }
    }
    
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
        this.touchStartScrollTop = window.pageYOffset;
    }
    
    handleTouchEnd(e) {
        if (this.isScrolling) return;
        
        this.touchEndY = e.changedTouches[0].clientY;
        const deltaY = this.touchStartY - this.touchEndY;
        const direction = deltaY > 0 ? 'down' : 'up';
        
        // 检查是否在footer
        if (this.isInFooter()) {
            if (direction === 'up') {
                const footerTop = this.footer.offsetTop;
                const currentScrollTop = window.pageYOffset;
                
                if (currentScrollTop <= footerTop + 50) {
                    this.isAtFooter = false;
                    this.isScrolling = true;
                    this.currentIndex = this.sections.length - 1;
                    
                    const lastSection = this.sections[this.sections.length - 1];
                    const targetScroll = lastSection.offsetTop + lastSection.offsetHeight - window.innerHeight;
                    
                    window.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                    
                    this.updateNavigation();
                    
                    setTimeout(() => {
                        this.isScrolling = false;
                    }, this.scrollDelay);
                    return;
                }
            }
            return;
        }
        
        // 检查当前section是否还能继续滚动
        if (this.canScrollInSection(direction)) {
            return;
        }
        
        // 滑动距离超过50px才触发
        if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
                // 向上滑动，显示下一个section或footer
                if (this.currentIndex === this.sections.length - 1 && this.footer) {
                    this.isScrolling = true;
                    this.isAtFooter = true;
                    this.footer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    setTimeout(() => {
                        this.isScrolling = false;
                    }, this.scrollDelay);
                } else {
                    this.scrollToSection(this.currentIndex + 1);
                }
            } else {
                // 向下滑动，显示上一个section
                this.scrollToSection(this.currentIndex - 1);
            }
        }
    }
    
    handleKeydown(e) {
        if (this.isScrolling) return;
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                this.scrollToSection(this.currentIndex + 1);
                break;
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.scrollToSection(this.currentIndex - 1);
                break;
            case 'Home':
                e.preventDefault();
                this.scrollToSection(0);
                break;
            case 'End':
                e.preventDefault();
                this.scrollToSection(this.sections.length - 1);
                break;
        }
    }
    
    scrollToSection(index) {
        // 边界检查
        if (index < 0 || index >= this.sections.length) return;
        if (index === this.currentIndex) return;
        
        this.isScrolling = true;
        this.currentIndex = index;
        
        const targetSection = this.sections[index];
        
        // 平滑滚动到目标section
        targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // 更新导航栏激活状态
        this.updateNavigation();
        
        // 延迟后允许下次滚动
        setTimeout(() => {
            this.isScrolling = false;
        }, this.scrollDelay);
    }
    
    updateCurrentIndex() {
        if (this.isScrolling) return;
        
        // 检查是否在footer
        if (this.isInFooter()) {
            this.isAtFooter = true;
            return;
        }
        
        this.isAtFooter = false;
        const scrollPosition = window.pageYOffset + window.innerHeight / 2;
        
        this.sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                this.currentIndex = index;
            }
        });
    }
    
    updateNavigation() {
        const currentSection = this.sections[this.currentIndex];
        const sectionId = currentSection.getAttribute('id');
        
        if (sectionId) {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // 销毁实例，移除事件监听
    destroy() {
        window.removeEventListener('wheel', this.handleWheel.bind(this));
        window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        window.removeEventListener('keydown', this.handleKeydown.bind(this));
        window.removeEventListener('scroll', this.updateCurrentIndex.bind(this));
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建滚动实例
    window.sectionScroller = new SectionScroller();
});
