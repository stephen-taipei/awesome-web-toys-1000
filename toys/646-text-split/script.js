const splitText = document.getElementById('splitText');
const buttons = document.querySelectorAll('.controls button[data-effect]');
const resetBtn = document.getElementById('resetBtn');
const text = 'SPLIT';

function splitChars() {
    splitText.innerHTML = text.split('').map(c => `<span>${c}</span>`).join('');
}

splitChars();

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const effect = btn.dataset.effect;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        splitText.className = 'split-text';
        void splitText.offsetWidth;
        splitText.classList.add(effect);
    });
});

resetBtn.addEventListener('click', () => {
    splitText.className = 'split-text';
    buttons.forEach(b => b.classList.remove('active'));
});
