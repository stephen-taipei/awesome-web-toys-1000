const pauseBtn = document.getElementById('pauseBtn');
const speedSlider = document.getElementById('speedSlider');
const demoArea = document.querySelector('.demo-area');
const items = document.querySelectorAll('.pulse-item');

let isPaused = false;

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    demoArea.classList.toggle('paused', isPaused);
    pauseBtn.textContent = isPaused ? '播放' : '暫停';
});

speedSlider.addEventListener('input', (e) => {
    const speed = 11 - parseInt(e.target.value);
    const duration = speed * 0.3 + 's';

    items.forEach(item => {
        item.querySelector('.shape').style.setProperty('--duration', duration);
    });
});

const initialDuration = (11 - 5) * 0.3 + 's';
items.forEach(item => {
    item.querySelector('.shape').style.setProperty('--duration', initialDuration);
});
