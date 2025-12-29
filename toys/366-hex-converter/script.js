const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');
const hslInput = document.getElementById('hslInput');
const cmykInput = document.getElementById('cmykInput');
const colorPreview = document.getElementById('colorPreview');
const message = document.getElementById('message');

let updating = false;

function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1/6) return p + (q - p) * 6 * t; if (t < 1/2) return q; if (t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) return [0, 0, 0, 100];
    const c = 1 - r / 255, m = 1 - g / 255, y = 1 - b / 255;
    const k = Math.min(c, m, y);
    return [Math.round((c - k) / (1 - k) * 100), Math.round((m - k) / (1 - k) * 100), Math.round((y - k) / (1 - k) * 100), Math.round(k * 100)];
}

function cmykToRgb(c, m, y, k) {
    c /= 100; m /= 100; y /= 100; k /= 100;
    return [Math.round(255 * (1 - c) * (1 - k)), Math.round(255 * (1 - m) * (1 - k)), Math.round(255 * (1 - y) * (1 - k))];
}

function updateFromRgb(r, g, b) {
    updating = true;
    colorPreview.style.backgroundColor = rgbToHex(r, g, b);
    hexInput.value = rgbToHex(r, g, b);
    rgbInput.value = `${r}, ${g}, ${b}`;
    const [h, s, l] = rgbToHsl(r, g, b);
    hslInput.value = `${h}, ${s}%, ${l}%`;
    const [c, m, y, k] = rgbToCmyk(r, g, b);
    cmykInput.value = `${c}%, ${m}%, ${y}%, ${k}%`;
    message.textContent = '';
    updating = false;
}

hexInput.addEventListener('input', () => {
    if (updating) return;
    const rgb = hexToRgb(hexInput.value);
    if (rgb) updateFromRgb(...rgb);
    else message.textContent = '無效的 HEX 格式';
});

rgbInput.addEventListener('input', () => {
    if (updating) return;
    const match = rgbInput.value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) updateFromRgb(+match[1], +match[2], +match[3]);
    else message.textContent = '無效的 RGB 格式';
});

hslInput.addEventListener('input', () => {
    if (updating) return;
    const match = hslInput.value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (match) updateFromRgb(...hslToRgb(+match[1], +match[2], +match[3]));
    else message.textContent = '無效的 HSL 格式';
});

cmykInput.addEventListener('input', () => {
    if (updating) return;
    const match = cmykInput.value.match(/(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (match) updateFromRgb(...cmykToRgb(+match[1], +match[2], +match[3], +match[4]));
    else message.textContent = '無效的 CMYK 格式';
});

updateFromRgb(108, 92, 231);
