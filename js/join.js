// 加入联盟页面交互脚本

document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AOS 动画
    AOS.init({
        duration: 1200,
        once: true,
        offset: 120,
        easing: 'ease-out-cubic'
    });

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

    // 导航栏激活状态
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function setActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);
    window.addEventListener('load', setActiveNav);

    // 自定义提示框函数
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        if (type === 'success') {
            toastIcon.textContent = '✓';
            toast.className = 'toast success';
        } else if (type === 'error') {
            toastIcon.textContent = '✕';
            toast.className = 'toast error';
        }
        
        toastMessage.textContent = message;
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            
            setTimeout(() => {
                toast.classList.remove('hide');
            }, 400);
        }, 3000);
    }

    // 弹窗交互逻辑
    const modal = document.getElementById('contactModal');
    const contactForm = document.getElementById('contactForm');
    const modalClose = document.querySelector('.modal-close');
    const btnCancel = document.querySelector('.btn-cancel');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // 获取所有触发按钮
    const applyButtons = document.querySelectorAll('.btn-apply, .btn-apply-now');
    
    // 表单字段
    const orgNameInput = document.getElementById('orgName');
    const orgTypeInput = document.getElementById('orgType');
    const orgDescInput = document.getElementById('orgDesc');
    const contactPhoneInput = document.getElementById('contactPhone');
    const descCount = document.getElementById('descCount');
    
    // 错误提示元素
    const orgNameError = document.getElementById('orgNameError');
    const orgTypeError = document.getElementById('orgTypeError');
    const contactPhoneError = document.getElementById('contactPhoneError');
    
    // 打开弹窗
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // 关闭弹窗
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        contactForm.reset();
        clearErrors();
        descCount.textContent = '0';
    }
    
    // 清除错误提示
    function clearErrors() {
        orgNameError.textContent = '';
        orgTypeError.textContent = '';
        contactPhoneError.textContent = '';
    }
    
    // 验证手机号
    function validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    // 为所有触发按钮绑定点击事件
    applyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });
    
    // 关闭按钮事件
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    // 字符计数
    if (orgDescInput) {
        orgDescInput.addEventListener('input', () => {
            descCount.textContent = orgDescInput.value.length;
        });
    }
    
    // 实时验证
    if (orgNameInput) {
        orgNameInput.addEventListener('blur', () => {
            if (!orgNameInput.value.trim()) {
                orgNameError.textContent = '请输入机构名称';
            } else {
                orgNameError.textContent = '';
            }
        });
    }
    
    if (orgTypeInput) {
        orgTypeInput.addEventListener('blur', () => {
            if (!orgTypeInput.value) {
                orgTypeError.textContent = '请选择机构类型';
            } else {
                orgTypeError.textContent = '';
            }
        });
    }
    
    if (contactPhoneInput) {
        contactPhoneInput.addEventListener('blur', () => {
            if (!contactPhoneInput.value.trim()) {
                contactPhoneError.textContent = '请输入联系方式';
            } else if (!validatePhone(contactPhoneInput.value)) {
                contactPhoneError.textContent = '请输入正确的手机号码格式';
            } else {
                contactPhoneError.textContent = '';
            }
        });
    }
    
    // 表单提交
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            
            // 验证机构名称
            if (!orgNameInput.value.trim()) {
                orgNameError.textContent = '请输入机构名称';
                orgNameInput.focus();
                return;
            }
            
            // 验证机构类型
            if (!orgTypeInput.value) {
                orgTypeError.textContent = '请选择机构类型';
                orgTypeInput.focus();
                return;
            }
            
            // 验证联系方式
            if (!contactPhoneInput.value.trim()) {
                contactPhoneError.textContent = '请输入联系方式';
                contactPhoneInput.focus();
                return;
            }
            
            if (!validatePhone(contactPhoneInput.value)) {
                contactPhoneError.textContent = '请输入正确的手机号码格式';
                contactPhoneInput.focus();
                return;
            }
            
            // 验证机构介绍（非必填）
            if (orgDescInput.value.length > 200) {
                showToast('机构介绍不能超过200个字', 'error');
                return;
            }
            
            // 准备提交数据
            const formData = {
                orgName: orgNameInput.value.trim(),
                orgType: orgTypeInput.value,
                orgDesc: orgDescInput.value.trim(),
                contactPhone: contactPhoneInput.value.trim(),
                timestamp: new Date().toISOString()
            };
            
            // 显示加载状态
            const submitBtn = contactForm.querySelector('.btn-submit-form');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                // 发送数据到后台 API
                const response = await fetch('/api/forward', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showToast('申请提交成功！我们会在1-3个工作日内完成审核', 'success');
                    closeModal();
                } else {
                    console.error('提交失败:', result);
                    showToast(result.msg || '提交失败，请稍后重试', 'error');
                }
                
            } catch (error) {
                console.error('提交错误:', error);
                showToast('网络错误，请检查网络连接后重试', 'error');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
