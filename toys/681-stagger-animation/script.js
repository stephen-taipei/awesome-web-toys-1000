const items = document.querySelectorAll('.stagger-item');
const playBtn = document.getElementById('playBtn');

playBtn.addEventListener('click', () => {
    items.forEach(item => {
        item.classList.remove('animate');
        item.style.opacity = '0';
        item.style.transform = 'scale(0.5) rotate(-10deg)';
    });

    void items[0].offsetWidth;

    items.forEach(item => {
        item.classList.add('animate');
    });
});

// Initial animation
setTimeout(() => {
    items.forEach(item => item.classList.add('animate'));
}, 300);
