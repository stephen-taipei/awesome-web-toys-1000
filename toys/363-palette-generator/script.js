const palette = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const message = document.getElementById('message');

function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

function generatePalette() {
    palette.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const color = randomColor();
        const bar = document.createElement('div');
        bar.className = 'color-bar';
        bar.style.backgroundColor = color;
        bar.style.color = getContrastColor(color);
        bar.textContent = color.toUpperCase();
        bar.addEventListener('click', () => copyColor(color.toUpperCase()));
        palette.appendChild(bar);
    }
}

async function copyColor(color) {
    try {
        await navigator.clipboard.writeText(color);
        message.textContent = `✅ 已複製 ${color}`;
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

generateBtn.addEventListener('click', generatePalette);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        generatePalette();
    }
});

generatePalette();
