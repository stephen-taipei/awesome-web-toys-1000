const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let style = 0;
let time = 0;

const styles = ['classic', 'stained', 'voronoi', 'checker'];

function changeStyle() {
    style = (style + 1) % styles.length;
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClassicMosaic() {
    const tileSize = 20;

    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            const hue = (x + y + time * 3) % 360;
            const lightness = 40 + Math.sin((x + y) * 0.05 + time * 0.02) * 20;

            ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        }
    }
}

function drawStainedGlass() {
    const tileSize = 30;

    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            const hue = (x * 2 + y * 2 + time * 2) % 360;

            const gradient = ctx.createRadialGradient(
                x + tileSize / 2, y + tileSize / 2, 0,
                x + tileSize / 2, y + tileSize / 2, tileSize / 2
            );
            gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.9)`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.7)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

            ctx.strokeStyle = '#2a2a3a';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, tileSize, tileSize);
        }
    }
}

function drawVoronoi() {
    const numPoints = 30;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: (Math.sin(i * 1.5 + time * 0.01) + 1) / 2 * canvas.width,
            y: (Math.cos(i * 1.7 + time * 0.01) + 1) / 2 * canvas.height,
            hue: (i * 12 + time * 2) % 360
        });
    }

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let minDist = Infinity;
            let closestHue = 0;

            for (const point of points) {
                const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestHue = point.hue;
                }
            }

            const rgb = hslToRgb(closestHue / 360, 0.7, 0.5);
            const i = (y * canvas.width + x) * 4;
            data[i] = rgb[0];
            data[i + 1] = rgb[1];
            data[i + 2] = rgb[2];
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function drawChecker() {
    const tileSize = 25;

    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            const col = Math.floor(x / tileSize);
            const row = Math.floor(y / tileSize);
            const isEven = (col + row) % 2 === 0;

            const hue = isEven
                ? (time * 2) % 360
                : (time * 2 + 180) % 360;

            const pulse = Math.sin((col + row) * 0.3 + time * 0.05) * 0.2;
            const size = tileSize * (0.8 + pulse);
            const offset = (tileSize - size) / 2;

            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            ctx.fillRect(x + offset, y + offset, size, size);
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
    ctx.fillText(`樣式: ${styles[style]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();

    switch (styles[style]) {
        case 'classic': drawClassicMosaic(); break;
        case 'stained': drawStainedGlass(); break;
        case 'voronoi': drawVoronoi(); break;
        case 'checker': drawChecker(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('styleBtn').addEventListener('click', changeStyle);

animate();
