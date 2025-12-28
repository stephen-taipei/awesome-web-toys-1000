const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let points = [];

function addRandomPoints(count = 20) {
    for (let i = 0; i < count; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            intensity: Math.random() * 0.5 + 0.5
        });
    }
}

function drawMap() {
    // Simple map background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Landmass
    ctx.fillStyle = '#2d2d44';
    ctx.beginPath();
    ctx.moveTo(20, 60);
    ctx.lineTo(340, 40);
    ctx.lineTo(350, 200);
    ctx.lineTo(200, 280);
    ctx.lineTo(50, 250);
    ctx.lineTo(10, 150);
    ctx.closePath();
    ctx.fill();
}

function drawHeatmap() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let heat = 0;

            points.forEach(point => {
                const dx = x - point.x;
                const dy = y - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const radius = 50;
                if (dist < radius) {
                    heat += (1 - dist / radius) * point.intensity;
                }
            });

            if (heat > 0) {
                const i = (y * canvas.width + x) * 4;
                heat = Math.min(1, heat);

                // Color gradient: blue -> green -> yellow -> red
                let r, g, b;
                if (heat < 0.25) {
                    r = 0;
                    g = heat * 4 * 255;
                    b = 255;
                } else if (heat < 0.5) {
                    r = 0;
                    g = 255;
                    b = (1 - (heat - 0.25) * 4) * 255;
                } else if (heat < 0.75) {
                    r = (heat - 0.5) * 4 * 255;
                    g = 255;
                    b = 0;
                } else {
                    r = 255;
                    g = (1 - (heat - 0.75) * 4) * 255;
                    b = 0;
                }

                const alpha = heat * 0.8;
                data[i] = data[i] * (1 - alpha) + r * alpha;
                data[i + 1] = data[i + 1] * (1 - alpha) + g * alpha;
                data[i + 2] = data[i + 2] * (1 - alpha) + b * alpha;
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function draw() {
    drawMap();
    drawHeatmap();
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    points.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        intensity: Math.random() * 0.5 + 0.5
    });
    draw();
});

document.getElementById('addPoints').addEventListener('click', () => {
    addRandomPoints(15);
    draw();
});

document.getElementById('clear').addEventListener('click', () => {
    points = [];
    draw();
});

addRandomPoints(30);
draw();
