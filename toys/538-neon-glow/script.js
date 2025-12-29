const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const glowSlider = document.getElementById('glowSlider');
const colorSchemeSelect = document.getElementById('colorScheme');
const infoEl = document.getElementById('info');

let glowIntensity = 5;
let colorScheme = 'cyber';
let time = 0;

const colorSchemes = {
    cyber: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff'],
    retro: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'],
    nature: ['#00ff88', '#00ff00', '#88ff00', '#00ffaa']
};

// Neon shapes
const shapes = [
    { type: 'circle', x: 100, y: 80, radius: 30, colorIndex: 0, phase: 0 },
    { type: 'triangle', x: 260, y: 80, size: 50, colorIndex: 1, phase: 1 },
    { type: 'rect', x: 180, y: 150, width: 80, height: 40, colorIndex: 2, phase: 2 },
    { type: 'line', x1: 50, y1: 200, x2: 150, y2: 250, colorIndex: 3, phase: 0.5 },
    { type: 'text', x: 180, y: 250, text: 'GLOW', colorIndex: 0, phase: 1.5 }
];

function drawGlow(drawFunc, color, intensity) {
    // Multi-layer glow effect (bloom simulation)
    const layers = intensity;

    for (let i = layers; i >= 1; i--) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = i * 8;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 / i;
        ctx.lineWidth = 3 + i;
        drawFunc();
        ctx.restore();
    }

    // Core bright line
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#fff';
    ctx.fillStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    drawFunc();
    ctx.restore();
}

function drawNeonCircle(shape, color) {
    const pulse = 1 + 0.1 * Math.sin(time * 3 + shape.phase);

    drawGlow(() => {
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
    }, color, glowIntensity);
}

function drawNeonTriangle(shape, color) {
    const pulse = 1 + 0.1 * Math.sin(time * 3 + shape.phase);
    const size = shape.size * pulse;

    drawGlow(() => {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y - size * 0.6);
        ctx.lineTo(shape.x - size * 0.5, shape.y + size * 0.4);
        ctx.lineTo(shape.x + size * 0.5, shape.y + size * 0.4);
        ctx.closePath();
        ctx.stroke();
    }, color, glowIntensity);
}

function drawNeonRect(shape, color) {
    const pulse = 1 + 0.05 * Math.sin(time * 3 + shape.phase);
    const w = shape.width * pulse;
    const h = shape.height * pulse;

    drawGlow(() => {
        ctx.strokeRect(shape.x - w/2, shape.y - h/2, w, h);
    }, color, glowIntensity);
}

function drawNeonLine(shape, color) {
    const flicker = 0.8 + 0.2 * Math.sin(time * 10 + shape.phase);

    ctx.globalAlpha = flicker;
    drawGlow(() => {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
    }, color, glowIntensity);
    ctx.globalAlpha = 1;
}

function drawNeonText(shape, color) {
    const pulse = 1 + 0.1 * Math.sin(time * 2 + shape.phase);

    ctx.font = `bold ${30 * pulse}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Text glow
    for (let i = glowIntensity; i >= 1; i--) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = i * 10;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3 / i;
        ctx.fillText(shape.text, shape.x, shape.y);
        ctx.restore();
    }

    // Core text
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.95;
    ctx.fillText(shape.text, shape.x, shape.y);
    ctx.restore();
}

function draw() {
    time += 0.016;

    // Dark background with slight fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = colorSchemes[colorScheme];

    shapes.forEach(shape => {
        const color = colors[shape.colorIndex % colors.length];

        switch (shape.type) {
            case 'circle':
                drawNeonCircle(shape, color);
                break;
            case 'triangle':
                drawNeonTriangle(shape, color);
                break;
            case 'rect':
                drawNeonRect(shape, color);
                break;
            case 'line':
                drawNeonLine(shape, color);
                break;
            case 'text':
                drawNeonText(shape, color);
                break;
        }
    });

    // Floating particles
    for (let i = 0; i < 20; i++) {
        const px = (i * 97 + time * 50) % canvas.width;
        const py = (i * 43 + Math.sin(time + i) * 20) % canvas.height;
        const color = colors[i % colors.length];
        const size = 1 + Math.sin(time * 2 + i) * 0.5;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
}

glowSlider.addEventListener('input', (e) => {
    glowIntensity = parseInt(e.target.value);
    infoEl.textContent = `發光層數: ${glowIntensity}`;
});

colorSchemeSelect.addEventListener('change', (e) => {
    colorScheme = e.target.value;
    const names = { cyber: '賽博龐克', retro: '復古霓虹', nature: '自然色系' };
    infoEl.textContent = `色系: ${names[colorScheme]}`;
});

// Initial clear
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

draw();
