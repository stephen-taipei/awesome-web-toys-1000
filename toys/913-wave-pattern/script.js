const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let mode = 0;
let time = 0;

const modes = ['horizontal', 'vertical', 'radial', 'interference'];

function changeMode() {
    mode = (mode + 1) % modes.length;
}

function drawBackground() {
    ctx.fillStyle = '#0a0a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHorizontalWaves() {
    const numWaves = 20;

    for (let i = 0; i < numWaves; i++) {
        const y = (i / numWaves) * canvas.height;
        const hue = (i * 18 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 5) {
            const wave = Math.sin(x * 0.03 + time * 0.05 + i * 0.5) * 15;
            const yPos = y + wave;

            if (x === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        }

        ctx.stroke();
    }
}

function drawVerticalWaves() {
    const numWaves = 25;

    for (let i = 0; i < numWaves; i++) {
        const x = (i / numWaves) * canvas.width;
        const hue = (i * 14 + time * 2) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.lineWidth = 3;
        ctx.beginPath();

        for (let y = 0; y <= canvas.height; y += 5) {
            const wave = Math.sin(y * 0.03 + time * 0.05 + i * 0.5) * 10;
            const xPos = x + wave;

            if (y === 0) ctx.moveTo(xPos, y);
            else ctx.lineTo(xPos, y);
        }

        ctx.stroke();
    }
}

function drawRadialWaves() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const numRings = 15;

    for (let i = 0; i < numRings; i++) {
        const baseRadius = 20 + i * 15;
        const hue = (i * 24 + time * 3) % 360;

        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
            const wave = Math.sin(angle * 8 + time * 0.05 + i * 0.3) * 5;
            const radius = baseRadius + wave;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();
    }
}

function drawInterference() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const wave1 = Math.sin(x * 0.05 + time * 0.05);
            const wave2 = Math.sin(y * 0.05 + time * 0.03);
            const wave3 = Math.sin((x + y) * 0.03 + time * 0.04);

            const value = (wave1 + wave2 + wave3) / 3;
            const hue = ((value + 1) * 180 + time * 2) % 360;

            const rgb = hslToRgb(hue / 360, 0.7, 0.5);

            const i = (y * canvas.width + x) * 4;
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
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

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`模式: ${modes[mode]}`, 20, 28);
}

function animate() {
    time++;

    if (modes[mode] !== 'interference') {
        drawBackground();
    }

    switch (modes[mode]) {
        case 'horizontal': drawHorizontalWaves(); break;
        case 'vertical': drawVerticalWaves(); break;
        case 'radial': drawRadialWaves(); break;
        case 'interference': drawInterference(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('modeBtn').addEventListener('click', changeMode);

animate();
