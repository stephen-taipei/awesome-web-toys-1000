const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let centerX = -0.5;
let centerY = 0;
let zoom = 1;
const maxIterations = 100;

function reset() {
    centerX = -0.5;
    centerY = 0;
    zoom = 1;
    render();
}

function mandelbrot(cx, cy) {
    let x = 0, y = 0;
    let iteration = 0;

    while (x * x + y * y <= 4 && iteration < maxIterations) {
        const xTemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xTemp;
        iteration++;
    }

    return iteration;
}

function render() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const scale = 3 / zoom;

    for (let py = 0; py < canvas.height; py++) {
        for (let px = 0; px < canvas.width; px++) {
            const x = centerX + (px - canvas.width / 2) * scale / canvas.width;
            const y = centerY + (py - canvas.height / 2) * scale / canvas.height;

            const iteration = mandelbrot(x, y);
            const i = (py * canvas.width + px) * 4;

            if (iteration === maxIterations) {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            } else {
                const t = iteration / maxIterations;
                const hue = 360 * t;
                const rgb = hslToRgb(hue / 360, 0.8, 0.5);
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
            }
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    drawInfo();
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

    ctx.fillStyle = '#FF6B6B';
    ctx.font = '11px Arial';
    ctx.fillText(`縮放: ${zoom.toFixed(1)}x`, 20, 28);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);

    const scale = 3 / zoom;
    centerX += (px - canvas.width / 2) * scale / canvas.width;
    centerY += (py - canvas.height / 2) * scale / canvas.height;
    zoom *= 2;

    render();
});

document.getElementById('zoomBtn').addEventListener('click', reset);

render();
