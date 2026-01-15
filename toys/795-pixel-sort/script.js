const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 250;

let originalData = null;
let direction = 'horizontal';

function generateImage() {
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const r = Math.floor(Math.sin(x * 0.02 + y * 0.01) * 100 + 128);
            const g = Math.floor(Math.cos(y * 0.03) * 80 + 128);
            const b = Math.floor(Math.sin((x + y) * 0.015) * 100 + 128);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
        }
    }

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(100, 125, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3498db';
    ctx.fillRect(180, 85, 80, 80);

    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.moveTo(320, 60);
    ctx.lineTo(360, 180);
    ctx.lineTo(280, 180);
    ctx.closePath();
    ctx.fill();

    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function getBrightness(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sortPixels() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (direction === 'horizontal') {
        for (let y = 0; y < canvas.height; y++) {
            const row = [];
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                row.push({ r: data[idx], g: data[idx+1], b: data[idx+2], a: data[idx+3] });
            }
            row.sort((a, b) => getBrightness(a.r, a.g, a.b) - getBrightness(b.r, b.g, b.b));
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                data[idx] = row[x].r;
                data[idx+1] = row[x].g;
                data[idx+2] = row[x].b;
            }
        }
    } else if (direction === 'vertical') {
        for (let x = 0; x < canvas.width; x++) {
            const col = [];
            for (let y = 0; y < canvas.height; y++) {
                const idx = (y * canvas.width + x) * 4;
                col.push({ r: data[idx], g: data[idx+1], b: data[idx+2], a: data[idx+3] });
            }
            col.sort((a, b) => getBrightness(a.r, a.g, a.b) - getBrightness(b.r, b.g, b.b));
            for (let y = 0; y < canvas.height; y++) {
                const idx = (y * canvas.width + x) * 4;
                data[idx] = col[y].r;
                data[idx+1] = col[y].g;
                data[idx+2] = col[y].b;
            }
        }
    } else {
        for (let d = 0; d < canvas.width + canvas.height; d++) {
            const diag = [];
            const coords = [];
            for (let y = 0; y < canvas.height; y++) {
                const x = d - y;
                if (x >= 0 && x < canvas.width) {
                    const idx = (y * canvas.width + x) * 4;
                    diag.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
                    coords.push({ x, y });
                }
            }
            diag.sort((a, b) => getBrightness(a.r, a.g, a.b) - getBrightness(b.r, b.g, b.b));
            for (let i = 0; i < coords.length; i++) {
                const idx = (coords[i].y * canvas.width + coords[i].x) * 4;
                data[idx] = diag[i].r;
                data[idx+1] = diag[i].g;
                data[idx+2] = diag[i].b;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

document.querySelectorAll('.controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.controls button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        direction = btn.id;
    });
});

document.getElementById('sortBtn').addEventListener('click', sortPixels);
document.getElementById('resetBtn').addEventListener('click', () => {
    if (originalData) ctx.putImageData(originalData, 0, 0);
});

generateImage();
