const canvas = document.getElementById('colorWheel');
const ctx = canvas.getContext('2d');
const display = document.getElementById('colorDisplay');
const hueSlider = document.getElementById('hueSlider');
const satSlider = document.getElementById('satSlider');
const lightSlider = document.getElementById('lightSlider');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');

let h = 0, s = 100, l = 50;

function drawColorWheel() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 5;

    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.fill();
    }

    // Center white circle
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
    };
    return `rgb(${f(0)}, ${f(8)}, ${f(4)})`;
}

function updateColor() {
    const hsl = `hsl(${h}, ${s}%, ${l}%)`;
    display.style.background = hsl;
    hexValue.textContent = hslToHex(h, s, l);
    rgbValue.textContent = hslToRgb(h, s, l);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    h = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    hueSlider.value = h;
    updateColor();
});

hueSlider.addEventListener('input', (e) => { h = e.target.value; updateColor(); });
satSlider.addEventListener('input', (e) => { s = e.target.value; updateColor(); });
lightSlider.addEventListener('input', (e) => { l = e.target.value; updateColor(); });

drawColorWheel();
updateColor();
