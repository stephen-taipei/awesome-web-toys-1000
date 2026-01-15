const ball = document.getElementById('ball');
const bounceBtn = document.getElementById('bounceBtn');
const swingBtn = document.getElementById('swingBtn');
const springBtn = document.getElementById('springBtn');

function playAnimation(type) {
    ball.classList.remove('bounce', 'swing', 'spring');
    void ball.offsetWidth;
    ball.classList.add(type);
}

bounceBtn.addEventListener('click', () => playAnimation('bounce'));
swingBtn.addEventListener('click', () => playAnimation('swing'));
springBtn.addEventListener('click', () => playAnimation('spring'));
