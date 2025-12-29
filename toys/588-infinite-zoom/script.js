const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inBtn = document.getElementById('inBtn');
const outBtn = document.getElementById('outBtn');
const speedSlider = document.getElementById('speedSlider');
const infoEl = document.getElementById('info');

let zoomDirection = 1;
let speed = 5;
let zoom = 1;
let time = 0;

function drawFractalLayer(cx, cy, size, depth, hueOffset) {
    if (size < 2 || depth > 8) return;

    const alpha = Math.min(1, size / 50);
    const hue = (hueOffset + depth * 40) % 360;

    ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
    ctx.lineWidth = Math.max(0.5, size / 30);

    // Draw shape
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + time * 0.2 * (depth % 2 ? 1 : -1);
        const x = cx + Math.cos(angle) * size;
        const y = cy + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Recursively draw smaller shapes at vertices
    if (size > 10) {
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + time * 0.1;
            const newCx = cx + Math.cos(angle) * size * 0.6;
            const newCy = cy + Math.sin(angle) * size * 0.6;
            drawFractalLayer(newCx, newCy, size * 0.35, depth + 1, hueOffset + 20);
        }
    }
}

function draw() {
    time += 0.016;

    // Update zoom
    const zoomSpeed = speed * 0.002 * zoomDirection;
    zoom *= (1 + zoomSpeed);

    // Reset zoom when it gets too extreme
    if (zoom > 10) zoom = 1;
    if (zoom < 0.1) zoom = 1;

    // Clear with fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Draw multiple layers at different zoom levels
    const baseSize = 100 * zoom;
    const hueOffset = time * 20;

    // Draw layers
    for (let layer = 0; layer < 5; layer++) {
        const layerZoom = zoom * Math.pow(0.5, layer);
        const layerSize = baseSize * Math.pow(0.5, layer);

        if (layerSize > 5 && layerSize < 500) {
            drawFractalLayer(cx, cy, layerSize, 0, hueOffset + layer * 60);
        }
    }

    // Center dot
    ctx.fillStyle = `hsl(${(time * 50) % 360}, 80%, 70%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Zoom indicator
    infoEl.textContent = `縮放: ${zoom.toFixed(2)}x`;

    requestAnimationFrame(draw);
}

inBtn.addEventListener('click', () => {
    zoomDirection = 1;
    inBtn.classList.add('active');
    outBtn.classList.remove('active');
});

outBtn.addEventListener('click', () => {
    zoomDirection = -1;
    outBtn.classList.add('active');
    inBtn.classList.remove('active');
});

speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
});

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
draw();
