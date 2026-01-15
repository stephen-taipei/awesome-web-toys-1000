const rippleZone = document.getElementById('rippleZone');
const playBtn = document.getElementById('playBtn');

function createRipples(x, y) {
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = `${x - 150}px`;
            ripple.style.top = `${y - 150}px`;
            rippleZone.appendChild(ripple);
            setTimeout(() => ripple.remove(), 1000);
        }, i * 200);
    }
}

rippleZone.addEventListener('click', (e) => {
    const rect = rippleZone.getBoundingClientRect();
    createRipples(e.clientX - rect.left, e.clientY - rect.top);
});

playBtn.addEventListener('click', () => {
    createRipples(rippleZone.offsetWidth / 2, rippleZone.offsetHeight / 2);
});
