const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hueInput = document.getElementById('hue');
const hueVal = document.getElementById('hueVal');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Rainbow gradient
    for (let i = 0; i < canvas.width; i++) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        const hue = (i / canvas.width) * 360;
        gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
        gradient.addColorStop(0.5, `hsl(${hue}, 100%, 70%)`);
        gradient.addColorStop(1, `hsl(${hue}, 100%, 30%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(i, 0, 1, canvas.height);
    }

    // Add some shapes
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(100, 125, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(160, 85, 80, 80);

    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.moveTo(310, 85);
    ctx.lineTo(270, 165);
    ctx.lineTo(350, 165);
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyHueRotate();
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
    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
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
    return [r * 255, g * 255, b * 255];
}

function applyHueRotate() {
    if (!originalData) return;

    const hueShift = parseInt(hueInput.value);
    hueVal.textContent = hueShift + '°';

    const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        canvas.width,
        canvas.height
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
        const [h, s, l] = rgbToHsl(imageData.data[i], imageData.data[i+1], imageData.data[i+2]);
        const [r, g, b] = hslToRgb((h + hueShift) % 360, s, l);
        imageData.data[i] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);
}

hueInput.addEventListener('input', applyHueRotate);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
