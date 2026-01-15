const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cellsInput = document.getElementById('cells');

canvas.width = 370;
canvas.height = 280;

function generateGlass() {
    const numCells = parseInt(cellsInput.value);

    const points = [];
    for (let i = 0; i < numCells; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            color: `hsla(${Math.random() * 360}, ${60 + Math.random() * 30}%, ${50 + Math.random() * 20}%, 0.8)`
        });
    }

    const imageData = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let minDist = Infinity;
            let secondDist = Infinity;
            let closest = null;

            for (const p of points) {
                const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2);
                if (dist < minDist) {
                    secondDist = minDist;
                    minDist = dist;
                    closest = p;
                } else if (dist < secondDist) {
                    secondDist = dist;
                }
            }

            const idx = (y * canvas.width + x) * 4;
            const edgeDist = secondDist - minDist;

            if (edgeDist < 3) {
                imageData.data[idx] = 30;
                imageData.data[idx + 1] = 30;
                imageData.data[idx + 2] = 30;
            } else {
                const color = closest.color;
                const match = color.match(/hsla\((\d+\.?\d*),\s*(\d+\.?\d*)%,\s*(\d+\.?\d*)%/);
                if (match) {
                    const h = parseFloat(match[1]);
                    const s = parseFloat(match[2]);
                    const l = parseFloat(match[3]);
                    const rgb = hslToRgb(h/360, s/100, l/100);
                    imageData.data[idx] = rgb[0];
                    imageData.data[idx + 1] = rgb[1];
                    imageData.data[idx + 2] = rgb[2];
                }
            }
            imageData.data[idx + 3] = 255;
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

document.getElementById('generateBtn').addEventListener('click', generateGlass);
cellsInput.addEventListener('input', generateGlass);

generateGlass();
