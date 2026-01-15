const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const demoArea = document.querySelector('.demo-area');

function setMode(mode, btn) {
    demoArea.classList.remove('gentle', 'lively', 'dreamy');
    demoArea.classList.add(mode);

    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

mode1Btn.addEventListener('click', () => setMode('gentle', mode1Btn));
mode2Btn.addEventListener('click', () => setMode('lively', mode2Btn));
mode3Btn.addEventListener('click', () => setMode('dreamy', mode3Btn));
