// Dots animations are CSS-only
document.querySelectorAll('.dots-box').forEach(box => {
    box.addEventListener('click', () => {
        box.style.transform = 'scale(1.05)';
        setTimeout(() => box.style.transform = 'scale(1)', 200);
    });
});
