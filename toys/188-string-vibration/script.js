// String Vibration - Web Toy #188
let canvas, ctx;
let points = [];
const numPoints = 100;
let tension = 1;
let damping = 0.01;

function init() {
    canvas = document.getElementById('stringCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    initString();
    setupControls();
    animate();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = container.clientWidth * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = container.clientWidth + 'px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);
    initString();
}

function initString() {
    points = [];
    const width = canvas.width / (window.devicePixelRatio || 1);
    for (let i = 0; i < numPoints; i++) {
        points.push({ x: (i / (numPoints - 1)) * width, y: 0, vy: 0 });
    }
}

function setupControls() {
    document.getElementById('tension').addEventListener('input', (e) => {
        tension = parseFloat(e.target.value);
        document.getElementById('tensionValue').textContent = tension.toFixed(1);
    });
    document.getElementById('damping').addEventListener('input', (e) => {
        damping = parseFloat(e.target.value);
        document.getElementById('dampingValue').textContent = damping.toFixed(3);
    });
    document.getElementById('pluckBtn').addEventListener('click', () => pluck(0.5, 50));
    document.getElementById('resetBtn').addEventListener('click', initString);
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        pluck(x, 60);
    });
}

function pluck(position, amplitude) {
    const pluckIndex = Math.floor(position * numPoints);
    for (let i = 0; i < numPoints; i++) {
        const dist = Math.abs(i - pluckIndex);
        points[i].y = amplitude * Math.max(0, 1 - dist / 20);
    }
}

function update() {
    const c2 = tension * 0.5;
    for (let i = 1; i < numPoints - 1; i++) {
        const force = c2 * (points[i-1].y - 2 * points[i].y + points[i+1].y);
        points[i].vy += force;
        points[i].vy *= (1 - damping);
    }
    for (let i = 1; i < numPoints - 1; i++) {
        points[i].y += points[i].vy;
    }
}

function draw() {
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = 300;
    const centerY = height / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    // Draw string
    ctx.beginPath();
    ctx.moveTo(points[0].x, centerY + points[0].y);
    for (let i = 1; i < numPoints; i++) {
        ctx.lineTo(points[i].x, centerY + points[i].y);
    }
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(0.5, '#ff8c00');
    gradient.addColorStop(1, '#ffd700');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    // Fixed ends
    ctx.fillStyle = '#888';
    ctx.fillRect(0, centerY - 30, 10, 60);
    ctx.fillRect(width - 10, centerY - 30, 10, 60);
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
