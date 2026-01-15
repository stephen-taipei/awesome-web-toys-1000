const pauseBtn = document.getElementById('pauseBtn');
const speedSlider = document.getElementById('speedSlider');
const demoArea = document.querySelector('.demo-area');
const items = document.querySelectorAll('.spin-item');

let isPaused = false;

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    demoArea.classList.toggle('paused', isPaused);
    pauseBtn.textContent = isPaused ? '播放' : '暫停';
});

speedSlider.addEventListener('input', (e) => {
    const speed = 11 - parseInt(e.target.value); // Invert so higher = faster
    const duration = speed * 0.4 + 's';

    items.forEach(item => {
        item.querySelector('.shape').style.setProperty('--duration', duration);
    });
});

// Initial speed
const initialDuration = (11 - 5) * 0.4 + 's';
items.forEach(item => {
    item.querySelector('.shape').style.setProperty('--duration', initialDuration);
});
