const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let type = 0;
let time = 0;

const types = ['linear', 'radial', 'conic', 'mesh'];

function changeType() {
    type = (type + 1) % types.length;
}

function drawLinearGradient() {
    const angle = time * 0.01;
    const x1 = canvas.width / 2 + Math.cos(angle) * canvas.width;
    const y1 = canvas.height / 2 + Math.sin(angle) * canvas.height;
    const x2 = canvas.width / 2 - Math.cos(angle) * canvas.width;
    const y2 = canvas.height / 2 - Math.sin(angle) * canvas.height;

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    const hue1 = (time * 2) % 360;
    const hue2 = (time * 2 + 120) % 360;
    const hue3 = (time * 2 + 240) % 360;

    gradient.addColorStop(0, `hsl(${hue1}, 70%, 60%)`);
    gradient.addColorStop(0.5, `hsl(${hue2}, 70%, 60%)`);
    gradient.addColorStop(1, `hsl(${hue3}, 70%, 60%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawRadialGradient() {
    const cx = canvas.width / 2 + Math.sin(time * 0.02) * 50;
    const cy = canvas.height / 2 + Math.cos(time * 0.02) * 30;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);

    const hue1 = (time * 2) % 360;
    const hue2 = (time * 2 + 90) % 360;
    const hue3 = (time * 2 + 180) % 360;
    const hue4 = (time * 2 + 270) % 360;

    gradient.addColorStop(0, `hsl(${hue1}, 80%, 70%)`);
    gradient.addColorStop(0.33, `hsl(${hue2}, 70%, 60%)`);
    gradient.addColorStop(0.66, `hsl(${hue3}, 70%, 50%)`);
    gradient.addColorStop(1, `hsl(${hue4}, 60%, 40%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawConicGradient() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const startAngle = time * 0.02;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const dx = x - cx;
            const dy = y - cy;
            let angle = Math.atan2(dy, dx) + startAngle;

            if (angle < 0) angle += Math.PI * 2;

            const hue = (angle / (Math.PI * 2)) * 360;
            const rgb = hslToRgb(hue / 360, 0.7, 0.6);

            const i = (y * canvas.width + x) * 4;
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawMeshGradient() {
    const gridSize = 50;

    for (let y = 0; y < canvas.height; y += gridSize) {
        for (let x = 0; x < canvas.width; x += gridSize) {
            const hue = (x + y + time * 3) % 360;
            const gradient = ctx.createRadialGradient(
                x + gridSize / 2, y + gridSize / 2, 0,
                x + gridSize / 2, y + gridSize / 2, gridSize
            );

            gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 1)`);
            gradient.addColorStop(1, `hsla(${(hue + 60) % 360}, 70%, 50%, 0.5)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, gridSize, gridSize);
        }
    }
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
    ctx.fillText(`類型: ${types[type]}`, 20, 28);
}

function animate() {
    time++;

    switch (types[type]) {
        case 'linear': drawLinearGradient(); break;
        case 'radial': drawRadialGradient(); break;
        case 'conic': drawConicGradient(); break;
        case 'mesh': drawMeshGradient(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('typeBtn').addEventListener('click', changeType);

animate();
