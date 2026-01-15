// Spinners are CSS-only, this file is for potential future interactivity
document.querySelectorAll('.spinner-box').forEach(box => {
    box.addEventListener('click', () => {
        box.style.transform = 'scale(1.1)';
        setTimeout(() => box.style.transform = 'scale(1)', 200);
    });
});
