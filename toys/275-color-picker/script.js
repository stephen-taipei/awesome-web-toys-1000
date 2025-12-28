const preview = document.getElementById('colorPreview');
const hSlider = document.getElementById('hSlider');
const sSlider = document.getElementById('sSlider');
const lSlider = document.getElementById('lSlider');
const hValue = document.getElementById('hValue');
const sValue = document.getElementById('sValue');
const lValue = document.getElementById('lValue');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');

function init() {
    hSlider.addEventListener('input', updateColor);
    sSlider.addEventListener('input', updateColor);
    lSlider.addEventListener('input', updateColor);
    document.getElementById('randomBtn').addEventListener('click', randomColor);

    updateColor();
}

function updateColor() {
    const h = parseInt(hSlider.value);
    const s = parseInt(sSlider.value);
    const l = parseInt(lSlider.value);

    hValue.textContent = h;
    sValue.textContent = s;
    lValue.textContent = l;

    const hsl = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
    preview.style.background = hsl;

    const rgb = hslToRgb(h / 360, s / 100, l / 100);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    hexValue.textContent = hex;
    rgbValue.textContent = rgb.r + ', ' + rgb.g + ', ' + rgb.b;

    sSlider.style.background = 'linear-gradient(90deg, hsl(' + h + ', 0%, ' + l + '%), hsl(' + h + ', 100%, ' + l + '%))';
    lSlider.style.background = 'linear-gradient(90deg, #000, hsl(' + h + ', ' + s + '%, 50%), #fff)';
}

function randomColor() {
    hSlider.value = Math.floor(Math.random() * 360);
    sSlider.value = 50 + Math.floor(Math.random() * 50);
    lSlider.value = 40 + Math.floor(Math.random() * 30);
    updateColor();
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHex(r, g, b) {
    return '#' +
        r.toString(16).padStart(2, '0').toUpperCase() +
        g.toString(16).padStart(2, '0').toUpperCase() +
        b.toString(16).padStart(2, '0').toUpperCase();
}

document.addEventListener('DOMContentLoaded', init);
