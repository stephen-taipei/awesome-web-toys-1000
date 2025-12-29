let canvas, ctx;
let particles = [];
let heatIntensity = 50;
let numParticles = 300;
let showTemp = true;

function init() {
    canvas = document.getElementById('convectionCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    resetSimulation();
    animate();
}

function resizeCanvas() {
    const width = Math.min(700, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.7;
}

function setupControls() {
    document.getElementById('heatSlider').addEventListener('input', (e) => {
        heatIntensity = parseInt(e.target.value);
        document.getElementById('heatValue').textContent = heatIntensity + '%';
    });
    document.getElementById('particleSlider').addEventListener('input', (e) => {
        numParticles = parseInt(e.target.value);
        document.getElementById('particleValue').textContent = numParticles;
        resetSimulation();
    });
    document.getElementById('showTemp').addEventListener('change', (e) => {
        showTemp = e.target.checked;
    });
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
}

function resetSimulation() {
    particles = [];
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            temp: 20 + Math.random() * 10,
            radius: 3
        });
    }
}

function update() {
    const w = canvas.width;
    const h = canvas.height;
    const heatZoneWidth = 150;
    const heatZoneX = (w - heatZoneWidth) / 2;

    particles.forEach(p => {
        // Heat source at bottom center
        if (p.y > h - 50 && p.x > heatZoneX && p.x < heatZoneX + heatZoneWidth) {
            p.temp += heatIntensity * 0.02;
            p.temp = Math.min(100, p.temp);
        }

        // Cooling at top and sides
        if (p.y < 50) {
            p.temp -= 0.3;
        }
        if (p.x < 30 || p.x > w - 30) {
            p.temp -= 0.2;
        }
        p.temp = Math.max(10, p.temp);

        // Buoyancy - hot rises, cold sinks
        const buoyancy = (p.temp - 30) * 0.005;
        p.vy -= buoyancy;

        // Add some randomness
        p.vx += (Math.random() - 0.5) * 0.1;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries with circulation
        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > w) { p.x = w; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > h) { p.y = h; p.vy *= -0.5; }

        // Side circulation (hot at top moves to sides, cold at sides moves down)
        if (p.y < h * 0.3 && p.temp > 50) {
            if (p.x < w / 2) p.vx -= 0.02;
            else p.vx += 0.02;
        }
        if ((p.x < w * 0.2 || p.x > w * 0.8) && p.y < h * 0.7) {
            p.vy += 0.02;
        }
    });
}

function tempToColor(temp) {
    const t = (temp - 10) / 90; // Normalize 10-100 to 0-1
    let r, g, b;

    if (t < 0.5) {
        // Blue to cyan
        r = 0;
        g = Math.floor(t * 2 * 200);
        b = 255 - Math.floor(t * 2 * 100);
    } else {
        // Cyan to orange/red
        const tt = (t - 0.5) * 2;
        r = Math.floor(tt * 255);
        g = Math.floor(200 - tt * 100);
        b = Math.floor(155 - tt * 155);
    }

    return `rgb(${r},${g},${b})`;
}

function draw() {
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#001133');
    gradient.addColorStop(1, '#002244');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw heat source glow
    const heatGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height, 0,
        canvas.width / 2, canvas.height, 100
    );
    heatGrad.addColorStop(0, `rgba(255, 69, 0, ${heatIntensity / 200})`);
    heatGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Draw particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (showTemp) {
            ctx.fillStyle = tempToColor(p.temp);
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        }
        ctx.fill();

        // Draw velocity trail
        if (Math.abs(p.vx) > 0.3 || Math.abs(p.vy) > 0.3) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
            ctx.strokeStyle = showTemp ? tempToColor(p.temp) : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
