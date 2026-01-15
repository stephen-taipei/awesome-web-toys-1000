const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const items = document.querySelectorAll('.gradient-item');

const themes = {
    rainbow: { c1: '#ff6b6b', c2: '#feca57', c3: '#48dbfb' },
    ocean: { c1: '#0077b6', c2: '#00b4d8', c3: '#90e0ef' },
    sunset: { c1: '#ff7b00', c2: '#ff0055', c3: '#7b2cbf' }
};

function setTheme(themeName, btn) {
    const theme = themes[themeName];

    items.forEach(item => {
        item.style.setProperty('--c1', theme.c1);
        item.style.setProperty('--c2', theme.c2);
        item.style.setProperty('--c3', theme.c3);
    });

    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

mode1Btn.addEventListener('click', () => setTheme('rainbow', mode1Btn));
mode2Btn.addEventListener('click', () => setTheme('ocean', mode2Btn));
mode3Btn.addEventListener('click', () => setTheme('sunset', mode3Btn));
