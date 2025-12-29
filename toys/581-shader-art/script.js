const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const pattern1Btn = document.getElementById('pattern1Btn');
const pattern2Btn = document.getElementById('pattern2Btn');
const pattern3Btn = document.getElementById('pattern3Btn');
const pattern4Btn = document.getElementById('pattern4Btn');
const infoEl = document.getElementById('info');

let currentPattern = 'ripple';
let time = 0;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

function rippleShader(x, y, t) {
    const cx = x - 0.5;
    const cy = y - 0.5;
    const dist = Math.sqrt(cx * cx + cy * cy);

    const wave = Math.sin(dist * 30 - t * 3) * 0.5 + 0.5;
    const ring = Math.sin(dist * 50 - t * 2) * 0.5 + 0.5;

    const r = wave * 0.3 + ring * 0.7;
    const g = wave * 0.5 + Math.sin(t + dist * 10) * 0.3;
    const b = ring * 0.8 + wave * 0.2;

    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}

function nebulaShader(x, y, t) {
    let value = 0;
    let amplitude = 1;
    let frequency = 3;

    for (let i = 0; i < 5; i++) {
        const nx = x * frequency + t * 0.1;
        const ny = y * frequency + t * 0.15;
        value += Math.sin(nx + Math.sin(ny * 2)) * amplitude;
        value += Math.cos(ny + Math.cos(nx * 1.5)) * amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    value = value * 0.5 + 0.5;
    const r = Math.sin(value * 3 + t) * 0.5 + 0.5;
    const g = Math.sin(value * 3 + t + 2) * 0.3 + 0.2;
    const b = Math.sin(value * 3 + t + 4) * 0.5 + 0.5;

    return {
        r: Math.floor(r * 255),
        g: Math.floor(g * 255),
        b: Math.floor(b * 255)
    };
}

function kaleidoscopeShader(x, y, t) {
    const cx = x - 0.5;
    const cy = y - 0.5;
    let angle = Math.atan2(cy, cx) + t * 0.2;
    const dist = Math.sqrt(cx * cx + cy * cy);

    // Mirror effect
    const segments = 8;
    angle = Math.abs(((angle / Math.PI + 1) * segments) % 2 - 1) * Math.PI;

    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;

    const pattern = Math.sin(px * 20 + t) * Math.cos(py * 20 - t);
    const pattern2 = Math.sin(dist * 30 - t * 2);

    const r = (pattern * 0.5 + 0.5) * 0.8 + pattern2 * 0.2;
    const g = (Math.sin(pattern * 3 + t) * 0.5 + 0.5) * 0.6;
    const b = (pattern2 * 0.5 + 0.5) * 0.9;

    return {
        r: Math.floor(Math.max(0, Math.min(1, r)) * 255),
        g: Math.floor(Math.max(0, Math.min(1, g)) * 255),
        b: Math.floor(Math.max(0, Math.min(1, b)) * 255)
    };
}

function auroraShader(x, y, t) {
    const wave1 = Math.sin(x * 5 + t) * 0.1;
    const wave2 = Math.sin(x * 8 - t * 1.3) * 0.08;
    const wave3 = Math.sin(x * 12 + t * 0.7) * 0.05;

    const centerY = 0.5 + wave1 + wave2 + wave3;
    const distY = Math.abs(y - centerY);

    const intensity = Math.exp(-distY * 8) * (Math.sin(x * 10 + t * 2) * 0.3 + 0.7);

    const r = intensity * 0.2;
    const g = intensity * (0.8 + Math.sin(t + x * 5) * 0.2);
    const b = intensity * 0.4;

    // Add stars
    const starHash = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    const star = (starHash - Math.floor(starHash)) > 0.998 ? 1 : 0;

    return {
        r: Math.floor(Math.min(1, r + star) * 255),
        g: Math.floor(Math.min(1, g + star) * 255),
        b: Math.floor(Math.min(1, b + star * 0.8) * 255)
    };
}

function render() {
    time += 0.016;

    const w = canvas.width;
    const h = canvas.height;

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const x = px / w;
            const y = py / h;

            let color;
            switch (currentPattern) {
                case 'ripple':
                    color = rippleShader(x, y, time);
                    break;
                case 'nebula':
                    color = nebulaShader(x, y, time);
                    break;
                case 'kaleidoscope':
                    color = kaleidoscopeShader(x, y, time);
                    break;
                case 'aurora':
                    color = auroraShader(x, y, time);
                    break;
                default:
                    color = { r: 0, g: 0, b: 0 };
            }

            const i = (py * w + px) * 4;
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(render);
}

function setPattern(pattern, btn) {
    currentPattern = pattern;
    [pattern1Btn, pattern2Btn, pattern3Btn, pattern4Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const names = {
        ripple: '波紋',
        nebula: '星雲',
        kaleidoscope: '萬花筒',
        aurora: '極光'
    };
    infoEl.textContent = `當前效果: ${names[pattern]}`;
}

pattern1Btn.addEventListener('click', () => setPattern('ripple', pattern1Btn));
pattern2Btn.addEventListener('click', () => setPattern('nebula', pattern2Btn));
pattern3Btn.addEventListener('click', () => setPattern('kaleidoscope', pattern3Btn));
pattern4Btn.addEventListener('click', () => setPattern('aurora', pattern4Btn));

render();
