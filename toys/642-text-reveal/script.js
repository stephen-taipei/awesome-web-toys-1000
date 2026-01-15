const items = document.querySelectorAll('.reveal-item');
const playBtn = document.getElementById('playBtn');
const resetBtn = document.getElementById('resetBtn');

function play() {
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('active');
        }, index * 300);
    });
}

function reset() {
    items.forEach(item => item.classList.remove('active'));
}

playBtn.addEventListener('click', () => { reset(); setTimeout(play, 100); });
resetBtn.addEventListener('click', reset);

setTimeout(play, 500);
