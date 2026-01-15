const pauseBtn = document.getElementById('pauseBtn');
const speedSlider = document.getElementById('speedSlider');
const items = document.querySelectorAll('.border-item');

let isPaused = false;

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    items.forEach(item => item.classList.toggle('paused', isPaused));
    pauseBtn.textContent = isPaused ? '播放' : '暫停';
});

speedSlider.addEventListener('input', (e) => {
    const speed = 11 - parseInt(e.target.value);
    const duration = speed * 0.3 + 's';

    items.forEach(item => {
        item.style.setProperty('--duration', duration);
    });
});

// Initial
const initialDuration = (11 - 5) * 0.3 + 's';
items.forEach(item => {
    item.style.setProperty('--duration', initialDuration);
});
