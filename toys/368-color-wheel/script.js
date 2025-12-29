const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const selectedColor = document.getElementById('selectedColor');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const hslValue = document.getElementById('hslValue');
const message = document.getElementById('message');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2;

function drawColorWheel() {
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.5, `hsl(${angle}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${angle}, 100%, 25%)`);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function getColorAt(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return null;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    const saturation = 100;
    const lightness = 50 - (dist / radius) * 25;
    return { h: Math.round(angle), s: saturation, l: Math.round(lightness) };
}

function updateColor(hsl) {
    const [r, g, b] = hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
    selectedColor.style.backgroundColor = hex;
    hexValue.textContent = hex;
    rgbValue.textContent = `${r}, ${g}, ${b}`;
    hslValue.textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hsl = getColorAt(x, y);
    if (hsl) updateColor(hsl);
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        message.textContent = '✅ 已複製!';
        setTimeout(() => message.textContent = '', 2000);
    } catch (err) {
        message.textContent = '❌ 複製失敗';
    }
}

canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousemove', (e) => { if (e.buttons === 1) handleClick(e); });
document.querySelectorAll('.info-row').forEach(row => {
    row.addEventListener('click', () => copyToClipboard(row.lastElementChild.textContent));
});

drawColorWheel();
updateColor({ h: 0, s: 100, l: 50 });
