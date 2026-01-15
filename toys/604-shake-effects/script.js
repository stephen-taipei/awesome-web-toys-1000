const items = document.querySelectorAll('.shake-item');
const shakeAllBtn = document.getElementById('shakeAll');
const stopAllBtn = document.getElementById('stopAll');

function triggerShake(item) {
    const shakeType = item.dataset.shake;
    item.classList.remove('shake-horizontal', 'shake-vertical', 'shake-rotate', 'shake-crazy', 'shake-slow', 'shake-hard');
    void item.offsetWidth;
    item.classList.add(`shake-${shakeType}`);
}

items.forEach(item => {
    item.addEventListener('click', () => triggerShake(item));

    item.addEventListener('animationend', () => {
        item.classList.remove('shake-horizontal', 'shake-vertical', 'shake-rotate', 'shake-crazy', 'shake-slow', 'shake-hard');
    });
});

shakeAllBtn.addEventListener('click', () => {
    items.forEach((item, index) => {
        setTimeout(() => triggerShake(item), index * 100);
    });
});

stopAllBtn.addEventListener('click', () => {
    items.forEach(item => {
        item.classList.remove('shake-horizontal', 'shake-vertical', 'shake-rotate', 'shake-crazy', 'shake-slow', 'shake-hard');
    });
});
