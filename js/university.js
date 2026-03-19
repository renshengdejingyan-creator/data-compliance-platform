// 高校合作专区页面交互脚本

// 打开联系弹窗的全局函数
function openContactModal() {
    const modal = document.getElementById('contactModal');
    const modalContent = modal ? modal.querySelector('.modal-content') : null;
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }
}

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
    
    // 表单字段
    const universityNameInput = document.getElementById('universityName');
    const departmentInput = document.getElementById('department');
    const cooperationTypeInput = document.getElementById('cooperationType');
    const cooperationDescInput = document.getElementById('cooperationDesc');
    const contactPhoneInput = document.getElementById('contactPhone');
    const descCount = document.getElementById('descCount');
    
    //素
    const universityNameError = document.getElementById('universityNameError');
    const departmentError = document.getElementById('departmentError');
    const cooperationTypeError = document.getElementById('cooperationTypeError');
    const contactPhoneError = document.getElementById('contactPhoneError');
    
    // 关闭弹窗
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        contactForm.reset();
        clearErrors();
        if (descCount) descCount.textContent = '0';
    }
    
    // 清除错误提示
    function clearErrors() {
        if (universityNameError) universityNameError.textContent = '';
        if (departmentError) departmentError.textContent = '';
        if (cooperationTypeError) cooperationTypeError.textContent = '';
        if (contactPhoneError) contactPhoneError.textContent = '';
    }
    
    // 验证手机号
    function validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    // 关闭按钮事件
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    // 字符计数
    if (cooperationDescInput && descCount) {
        cooperationDescInput.addEventListener('input', () => {
            descCount.textContent = cooperationDescInput.value.length;
        });
    }
    
    // 实时验证
    if (universityNameInput) {
        universityNameInput.addEventListener('blur', () => {
            if (!universityNameInput.value.trim()) {
                universityNameError.textContent = '请输入高校名称';
            } else {
                universityNameError.textContent = '';
            }
        });
    }
    
    if (departmentInput) {
        departmentInput.addEventListener('blur', () => {
            if (!departmentInput.value.trim()) {
                departmentError.textContent = '请输入院系或部门名称';
            } else {
                departmentError.textContent = '';
            }
        });
    }
    
    if (cooperationTypeInput) {
        cooperationTypeInput.addEventListener('blur', () => {
            if (!cooperationTypeInput.value) {
                cooperationTypeError.textContent = '请选择合作方式';
            } else {
                cooperationTypeError.textContent = '';
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
            
            // 验证高校名称
            if (!universityNameInput.value.trim()) {
                universityNameError.textContent = '请输入高校名称';
                universityNameInput.focus();
                return;
            }
            
            // 验证院系/部门
            if (!departmentInput.value.trim()) {
                departmentError.textContent = '请输入院系或部门名称';
                departmentInput.focus();
                return;
            }
            
            // 验证合作方式
            if (!cooperationTypeInput.value) {
                cooperationTypeError.textContent = '请选择合作方式';
                cooperationTypeInput.focus();
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
            
            // 验证合作需求（非必填）
            if (cooperationDescInput.value.length > 200) {
                showToast('合作需求不能超过200个字', 'error');
                return;
            }
            
            // 准备提交数据
            const formData = {
                universityName: universityNameInput.value.trim(),
                department: departmentInput.value.trim(),
                cooperationType: cooperationTypeInput.value,
                cooperationDesc: cooperationDescInput.value.trim(),
                contactPhone: contactPhoneInput.value.trim(),
                timestamp: new Date().toISOString()
            };
            
            // 显示加载状态
            const submitBtn = contactForm.querySelector('.btn-submit-form');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                // 发送数据到后台 API
                const response = await fetch('/api/university-apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showToast('提交成功！我们会尽快与您联系', 'success');
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
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });
});
