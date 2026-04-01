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

const titleTargets = document.querySelectorAll('.title-reveal');

const titleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        titleObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.25,
    rootMargin: '0px 0px -30px 0px'
  }
);

titleTargets.forEach((title) => {
  titleObserver.observe(title);
});

const radioPulse = document.getElementById('radioPulse');

if (radioPulse) {
  const targetCount = 6;
  const containerSize = 340;
  const centerSize = 24;
  const minDistance = 40;
  const maxDistance = containerSize / 2 - 20;

  function createRadarTarget() {
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    const target = document.createElement('div');
    target.className = 'radar-target';
    target.style.left = `calc(50% + ${x}px)`;
    target.style.top = `calc(50% + ${y}px)`;
    target.style.transform = 'translate(-50%, -50%)';
    target.style.animationDelay = `${Math.random() * 1.5}s`;
    
    radioPulse.appendChild(target);
  }

  for (let i = 0; i < targetCount; i++) {
    createRadarTarget();
  }
}
