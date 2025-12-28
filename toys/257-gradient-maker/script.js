const preview = document.getElementById('preview');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const angleInput = document.getElementById('angle');
const angleValue = document.getElementById('angleValue');
const typeBtn = document.getElementById('typeBtn');
const randomBtn = document.getElementById('randomBtn');
const cssOutput = document.getElementById('cssOutput');

let gradientType = 'linear';

function init() {
    color1Input.addEventListener('input', updateGradient);
    color2Input.addEventListener('input', updateGradient);
    angleInput.addEventListener('input', updateGradient);
    typeBtn.addEventListener('click', toggleType);
    randomBtn.addEventListener('click', randomColors);

    updateGradient();
}

function updateGradient() {
    const c1 = color1Input.value;
    const c2 = color2Input.value;
    const angle = angleInput.value;

    angleValue.textContent = angle;

    let gradient;
    let cssText;

    if (gradientType === 'linear') {
        gradient = 'linear-gradient(' + angle + 'deg, ' + c1 + ', ' + c2 + ')';
        cssText = 'background: linear-gradient(' + angle + 'deg, ' + c1 + ', ' + c2 + ');';
    } else if (gradientType === 'radial') {
        gradient = 'radial-gradient(circle, ' + c1 + ', ' + c2 + ')';
        cssText = 'background: radial-gradient(circle, ' + c1 + ', ' + c2 + ');';
    } else {
        gradient = 'conic-gradient(from ' + angle + 'deg, ' + c1 + ', ' + c2 + ', ' + c1 + ')';
        cssText = 'background: conic-gradient(from ' + angle + 'deg, ' + c1 + ', ' + c2 + ', ' + c1 + ');';
    }

    preview.style.background = gradient;
    cssOutput.textContent = cssText;
}

function toggleType() {
    const types = ['linear', 'radial', 'conic'];
    const names = ['線性', '放射', '圓錐'];
    const currentIndex = types.indexOf(gradientType);
    const nextIndex = (currentIndex + 1) % types.length;

    gradientType = types[nextIndex];
    typeBtn.textContent = '類型: ' + names[nextIndex];

    updateGradient();
}

function randomColors() {
    color1Input.value = randomColor();
    color2Input.value = randomColor();
    angleInput.value = Math.floor(Math.random() * 360);

    updateGradient();
}

function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    const sat = 60 + Math.floor(Math.random() * 40);
    const light = 50 + Math.floor(Math.random() * 20);

    return hslToHex(hue, sat, light);
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return '#' + r + g + b;
}

document.addEventListener('DOMContentLoaded', init);
