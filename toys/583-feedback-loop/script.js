const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomSlider = document.getElementById('zoomSlider');
const rotateSlider = document.getElementById('rotateSlider');
const infoEl = document.getElementById('info');

let zoom = 0.96;
let rotation = 0.02;
let time = 0;

// Create offscreen canvas for feedback
const buffer = document.createElement('canvas');
buffer.width = canvas.width;
buffer.height = canvas.height;
const bufferCtx = buffer.getContext('2d');

function draw() {
    time += 0.016;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Draw previous frame with zoom and rotation
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);
    ctx.drawImage(buffer, 0, 0);
    ctx.restore();

    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add new content
    const numShapes = 3;
    for (let i = 0; i < numShapes; i++) {
        const angle = time * 0.5 + (i / numShapes) * Math.PI * 2;
        const radius = 80 + Math.sin(time * 2 + i) * 30;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        const hue = (time * 50 + i * 120) % 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;

        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.sin(time * 3 + i) * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Center element
    const centerHue = (time * 30) % 360;
    ctx.strokeStyle = `hsla(${centerHue}, 70%, 50%, 0.5)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 30 + Math.sin(time) * 10, 0, Math.PI * 2);
    ctx.stroke();

    // Copy to buffer for next frame
    bufferCtx.drawImage(canvas, 0, 0);

    requestAnimationFrame(draw);
}

zoomSlider.addEventListener('input', (e) => {
    zoom = parseInt(e.target.value) / 100;
    infoEl.textContent = `縮放: ${Math.round(zoom * 100)}%`;
});

rotateSlider.addEventListener('input', (e) => {
    rotation = parseInt(e.target.value) / 100;
    infoEl.textContent = `旋轉: ${(rotation * 180 / Math.PI).toFixed(1)}°`;
});

// Initialize with black
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
bufferCtx.fillStyle = '#000';
bufferCtx.fillRect(0, 0, buffer.width, buffer.height);

draw();
