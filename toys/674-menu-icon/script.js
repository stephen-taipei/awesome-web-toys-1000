document.querySelectorAll('.menu-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        icon.classList.toggle('active');
    });
});
