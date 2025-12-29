const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');
const brushSizeSelect = document.getElementById('brushSize');

let lightColor = '#ff6b6b';
let brushSize = 6;
let isDrawing = false;
let lastX = 0, lastY = 0;

// Light trails storage
const trails = [];
const maxTrailAge = 300; // frames

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

function addTrailPoint(x, y, color, size) {
    trails.push({
        x, y,
        color: hexToRgb(color),
        size,
        age: 0,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
    });
}

function drawGlow(x, y, color, size, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.fill();
}

function update() {
    // Update trail points
    trails.forEach(t => {
        t.age++;
        t.x += t.vx;
        t.y += t.vy;
        t.vy += 0.01; // Slight gravity
    });

    // Remove old trails
    while (trails.length > 0 && trails[0].age > maxTrailAge) {
        trails.shift();
    }
}

function draw() {
    update();

    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw trails
    trails.forEach(t => {
        const alpha = Math.max(0, 1 - t.age / maxTrailAge);
        const size = t.size * (1 - t.age / maxTrailAge * 0.5);
        drawGlow(t.x, t.y, t.color, size, alpha);
    });

    // Current brush position glow
    if (isDrawing) {
        const rgb = hexToRgb(lightColor);
        drawGlow(lastX, lastY, rgb, brushSize * 1.5, 1);
    }

    requestAnimationFrame(draw);
}

function startDrawing(x, y) {
    isDrawing = true;
    lastX = x;
    lastY = y;
}

function drawTo(x, y) {
    if (!isDrawing) return;

    // Interpolate points for smooth lines
    const dist = Math.hypot(x - lastX, y - lastY);
    const steps = Math.max(1, Math.floor(dist / 3));

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = lastX + (x - lastX) * t;
        const py = lastY + (y - lastY) * t;
        addTrailPoint(px, py, lightColor, brushSize);
    }

    lastX = x;
    lastY = y;
}

function stopDrawing() {
    isDrawing = false;
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    drawTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    drawTo(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });

canvas.addEventListener('touchend', stopDrawing);

// Controls
colorPicker.addEventListener('input', (e) => {
    lightColor = e.target.value;
});

clearBtn.addEventListener('click', () => {
    trails.length = 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});

brushSizeSelect.addEventListener('change', (e) => {
    brushSize = parseInt(e.target.value);
});

// Initial clear
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

draw();
