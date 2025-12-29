const colorPicker = document.getElementById('colorPicker');
const colorDisplay = document.getElementById('colorDisplay');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');
const copyBtn = document.getElementById('copyBtn');
const message = document.getElementById('message');

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function updateColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    colorDisplay.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    hslValue.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    copyBtn.style.backgroundColor = hex;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        message.textContent = '✅ 已複製到剪貼簿!';
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

colorPicker.addEventListener('input', (e) => updateColor(e.target.value));
copyBtn.addEventListener('click', () => copyToClipboard(hexValue.textContent));

document.querySelectorAll('.value').forEach(el => {
    el.addEventListener('click', () => copyToClipboard(el.textContent));
});

updateColor(colorPicker.value);
