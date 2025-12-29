let canvas, ctx;
let flowSpeed = 5;
let neckRatio = 0.4;
let displayMode = 'velocity';
let particles = [];
const numParticles = 200;
const rho = 1000; // fluid density
const p0 = 101325; // atmospheric pressure

function init() {
    canvas = document.getElementById('bernoulliCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    createParticles();
    animate();
}

function resizeCanvas() {
    const width = Math.min(800, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.5;
}

function setupControls() {
    document.getElementById('flowSlider').addEventListener('input', (e) => {
        flowSpeed = parseInt(e.target.value);
        document.getElementById('flowValue').textContent = flowSpeed;
    });
    document.getElementById('neckSlider').addEventListener('input', (e) => {
        neckRatio = parseFloat(e.target.value);
        document.getElementById('neckValue').textContent = neckRatio.toFixed(1);
    });
    document.getElementById('displayMode').addEventListener('change', (e) => {
        displayMode = e.target.value;
    });
}

function createParticles() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push(createParticle());
    }
}

function createParticle() {
    const y = Math.random() * canvas.height;
    return {
        x: Math.random() * canvas.width,
        y: y,
        baseY: y
    };
}

function getTubeHeight(x) {
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const neckWidth = w * 0.3;

    // Distance from center
    const distFromCenter = Math.abs(x - centerX);
    const neckStart = neckWidth / 2;

    if (distFromCenter < neckStart) {
        // In the neck region
        const t = distFromCenter / neckStart;
        const smoothT = t * t * (3 - 2 * t); // Smooth step
        return h * neckRatio + (h * (1 - neckRatio)) * smoothT;
    }
    return h;
}

function getVelocity(x) {
    const h = canvas.height;
    const tubeHeight = getTubeHeight(x);
    // Continuity equation: A1 * v1 = A2 * v2
    return flowSpeed * (h / tubeHeight);
}

function getPressure(x) {
    const v = getVelocity(x);
    // Bernoulli: P + 0.5 * rho * v^2 = constant
    return p0 - 0.5 * rho * v * v * 10;
}

function update() {
    particles.forEach(p => {
        const v = getVelocity(p.x);
        p.x += v * 0.5;

        // Confine to tube
        const tubeHeight = getTubeHeight(p.x);
        const margin = (canvas.height - tubeHeight) / 2;

        // Adjust y position based on tube shape
        const relativeY = (p.baseY - canvas.height / 2) / (canvas.height / 2);
        p.y = canvas.height / 2 + relativeY * (tubeHeight / 2 - 10);

        // Reset when reaching right side
        if (p.x > canvas.width + 10) {
            p.x = -10;
            p.baseY = Math.random() * canvas.height;
        }
    });

    updateDisplay();
}

function updateDisplay() {
    const v1 = flowSpeed;
    const v2 = flowSpeed / neckRatio;
    const p1 = p0 - 0.5 * rho * v1 * v1 * 10;
    const p2 = p0 - 0.5 * rho * v2 * v2 * 10;

    document.getElementById('v1').textContent = v1.toFixed(1) + ' m/s';
    document.getElementById('v2').textContent = v2.toFixed(1) + ' m/s';
    document.getElementById('p1').textContent = (p1 / 1000).toFixed(1) + ' kPa';
    document.getElementById('p2').textContent = (p2 / 1000).toFixed(1) + ' kPa';
}

function velocityToColor(v) {
    const minV = flowSpeed;
    const maxV = flowSpeed / neckRatio;
    const t = (v - minV) / (maxV - minV);
    const r = Math.floor(t * 255);
    const g = Math.floor((1 - Math.abs(t - 0.5) * 2) * 255);
    const b = Math.floor((1 - t) * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function pressureToColor(p) {
    const minP = p0 - 0.5 * rho * Math.pow(flowSpeed / neckRatio, 2) * 10;
    const maxP = p0 - 0.5 * rho * Math.pow(flowSpeed, 2) * 10;
    const t = (p - minP) / (maxP - minP);
    const r = Math.floor((1 - t) * 255);
    const g = Math.floor(t * 100);
    const b = Math.floor(t * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw tube background with color based on mode
    if (displayMode === 'velocity' || displayMode === 'both') {
        for (let x = 0; x < w; x += 5) {
            const tubeHeight = getTubeHeight(x);
            const margin = (h - tubeHeight) / 2;
            const v = getVelocity(x);
            ctx.fillStyle = velocityToColor(v);
            ctx.globalAlpha = displayMode === 'both' ? 0.5 : 0.3;
            ctx.fillRect(x, margin, 5, tubeHeight);
        }
    }

    if (displayMode === 'pressure' || displayMode === 'both') {
        for (let x = 0; x < w; x += 5) {
            const tubeHeight = getTubeHeight(x);
            const margin = (h - tubeHeight) / 2;
            const p = getPressure(x);
            ctx.fillStyle = pressureToColor(p);
            ctx.globalAlpha = displayMode === 'both' ? 0.5 : 0.3;
            ctx.fillRect(x, margin, 5, tubeHeight);
        }
    }
    ctx.globalAlpha = 1;

    // Draw tube walls
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= w; x += 5) {
        const tubeHeight = getTubeHeight(x);
        const margin = (h - tubeHeight) / 2;
        ctx.lineTo(x, margin);
    }
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 5) {
        const tubeHeight = getTubeHeight(x);
        const margin = (h - tubeHeight) / 2;
        ctx.lineTo(x, h - margin);
    }
    ctx.stroke();

    // Draw particles
    particles.forEach(p => {
        const tubeHeight = getTubeHeight(p.x);
        const margin = (h - tubeHeight) / 2;

        if (p.y > margin + 5 && p.y < h - margin - 5) {
            const v = getVelocity(p.x);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = velocityToColor(v);
            ctx.fill();

            // Draw velocity arrow
            const arrowLen = v * 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + arrowLen, p.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });

    // Draw pressure indicators
    drawPressureArrows();

    // Draw legend
    drawLegend();
}

function drawPressureArrows() {
    const positions = [
        { x: canvas.width * 0.15, label: '入口' },
        { x: canvas.width * 0.5, label: '頸部' },
        { x: canvas.width * 0.85, label: '出口' }
    ];

    positions.forEach(pos => {
        const tubeHeight = getTubeHeight(pos.x);
        const margin = (canvas.height - tubeHeight) / 2;
        const p = getPressure(pos.x);
        const pNorm = (p - 90000) / 15000;
        const arrowLen = pNorm * 30;

        // Draw pressure arrows pointing inward
        ctx.strokeStyle = pressureToColor(p);
        ctx.lineWidth = 3;

        // Top arrow
        ctx.beginPath();
        ctx.moveTo(pos.x, margin - 10);
        ctx.lineTo(pos.x, margin + arrowLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x - 5, margin + arrowLen - 5);
        ctx.lineTo(pos.x, margin + arrowLen);
        ctx.lineTo(pos.x + 5, margin + arrowLen - 5);
        ctx.stroke();

        // Label
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText(pos.label, pos.x, margin - 20);
    });
}

function drawLegend() {
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';

    if (displayMode === 'velocity' || displayMode === 'both') {
        ctx.fillStyle = '#00f';
        ctx.fillRect(10, 10, 15, 15);
        ctx.fillStyle = '#f00';
        ctx.fillRect(10, 30, 15, 15);
        ctx.fillStyle = '#fff';
        ctx.fillText('低速', 30, 22);
        ctx.fillText('高速', 30, 42);
    }

    if (displayMode === 'pressure') {
        ctx.fillStyle = '#00f';
        ctx.fillRect(10, 10, 15, 15);
        ctx.fillStyle = '#f00';
        ctx.fillRect(10, 30, 15, 15);
        ctx.fillStyle = '#fff';
        ctx.fillText('高壓', 30, 22);
        ctx.fillText('低壓', 30, 42);
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
