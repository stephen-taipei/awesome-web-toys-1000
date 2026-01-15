const strokeText = document.querySelector('.stroke-text');
const playBtn = document.getElementById('playBtn');
const fillBtn = document.getElementById('fillBtn');
const resetBtn = document.getElementById('resetBtn');

playBtn.addEventListener('click', () => {
    strokeText.classList.remove('animate', 'filled');
    void strokeText.offsetWidth;
    strokeText.classList.add('animate');
});

fillBtn.addEventListener('click', () => {
    strokeText.classList.add('animate', 'filled');
});

resetBtn.addEventListener('click', () => {
    strokeText.classList.remove('animate', 'filled');
});

setTimeout(() => strokeText.classList.add('animate'), 500);
