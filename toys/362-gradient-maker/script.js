const color1 = document.getElementById('color1');
const color2 = document.getElementById('color2');
const direction = document.getElementById('direction');
const gradientDisplay = document.getElementById('gradientDisplay');
const cssCode = document.getElementById('cssCode');
const copyBtn = document.getElementById('copyBtn');
const message = document.getElementById('message');

function updateGradient() {
    const gradient = `linear-gradient(${direction.value}, ${color1.value}, ${color2.value})`;
    gradientDisplay.style.background = gradient;
    cssCode.textContent = `background: ${gradient};`;
}

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(cssCode.textContent);
        message.textContent = '✅ 已複製到剪貼簿!';
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

color1.addEventListener('input', updateGradient);
color2.addEventListener('input', updateGradient);
direction.addEventListener('change', updateGradient);
copyBtn.addEventListener('click', copyToClipboard);

updateGradient();
