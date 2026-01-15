const shakeBox = document.querySelector('.touch-box.shake');

shakeBox.addEventListener('click', () => {
    shakeBox.classList.add('shaking');
    setTimeout(() => shakeBox.classList.remove('shaking'), 300);
});
