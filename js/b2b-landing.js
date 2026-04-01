const isLoggedIn = false;

const modal = document.getElementById('authModal');
const downloadButtons = document.querySelectorAll('.download-btn');
const closeTriggers = document.querySelectorAll('[data-close="true"]');

function openModal() {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
}

downloadButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const resourceName = button.dataset.resource || '资源文件';

    if (!isLoggedIn) {
      openModal();
      return;
    }

    window.alert(`开始下载: ${resourceName}`);
  });
});

closeTriggers.forEach((trigger) => {
  trigger.addEventListener('click', closeModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});

const revealTargets = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealTargets.forEach((target) => {
  observer.observe(target);
});
