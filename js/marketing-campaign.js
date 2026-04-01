const optionButtons = document.querySelectorAll('.option-chip');

optionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    optionButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});
