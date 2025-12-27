let canvas, ctx;
let rocket = {
    x: 0, y: 0, vy: 0, ay: 0,
    fuel: 100, mass: 1000, altitude: 0
};
let thrustPower = 50;
let isThrusting = false;
let exhaustParticles = [];
let stars = [];

function init() {
    canvas = document.getElementById('rocketCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupControls();
    createStars();
    resetRocket();
    animate();
}

function resizeCanvas() {
    const width = Math.min(700, window.innerWidth - 40);
    canvas.width = width;
    canvas.height = width * 0.8;
}

function setupControls() {
    const thrustBtn = document.getElementById('thrustBtn');

    thrustBtn.addEventListener('mousedown', () => startThrust());
    thrustBtn.addEventListener('mouseup', () => stopThrust());
    thrustBtn.addEventListener('mouseleave', () => stopThrust());
    thrustBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startThrust(); });
    thrustBtn.addEventListener('touchend', () => stopThrust());

    document.getElementById('thrustSlider').addEventListener('input', (e) => {
        thrustPower = parseInt(e.target.value);
        document.getElementById('thrustValue').textContent = thrustPower + '%';
    });
}

function startThrust() {
    if (rocket.fuel > 0) {
        isThrusting = true;
        document.getElementById('thrustBtn').classList.add('active');
    }
}

function stopThrust() {
    isThrusting = false;
    document.getElementById('thrustBtn').classList.remove('active');
}

function resetRocket() {
    rocket = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        vy: 0,
        ay: 0,
        fuel: 100,
        mass: 1000,
        altitude: 0
    };
    exhaustParticles = [];
}

function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.7,
            size: Math.random() * 2,
            brightness: Math.random()
        });
    }
}

function createExhaustParticle() {
    const spread = 15;
    exhaustParticles.push({
        x: rocket.x + (Math.random() - 0.5) * spread,
        y: rocket.y + 35,
        vx: (Math.random() - 0.5) * 3,
        vy: 5 + Math.random() * 5,
        life: 1,
        size: 5 + Math.random() * 10
    });
}

function update() {
    const gravity = 9.8;
    const thrustForce = thrustPower * 200;

    if (isThrusting && rocket.fuel > 0) {
        // Create exhaust particles
        for (let i = 0; i < 3; i++) {
            createExhaustParticle();
        }

        // Calculate thrust acceleration
        const fuelBurn = thrustPower * 0.05;
        rocket.fuel = Math.max(0, rocket.fuel - fuelBurn);
        rocket.mass = 500 + (rocket.fuel / 100) * 500;

        rocket.ay = -thrustForce / rocket.mass;
    } else {
        rocket.ay = 0;
    }

    // Apply gravity
    rocket.ay += gravity;

    // Update velocity and position
    rocket.vy += rocket.ay * 0.016;
    rocket.y += rocket.vy * 0.5;

    // Update altitude
    const groundY = canvas.height - 100;
    rocket.altitude = Math.max(0, (groundY - rocket.y) * 10);

    // Ground collision
    if (rocket.y > groundY) {
        rocket.y = groundY;
        rocket.vy = 0;
        rocket.altitude = 0;
    }

    // Ceiling
    if (rocket.y < 50) {
        rocket.y = 50;
        rocket.vy = Math.abs(rocket.vy) * 0.5;
    }

    // Update exhaust particles
    exhaustParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        p.size *= 0.95;
    });
    exhaustParticles = exhaustParticles.filter(p => p.life > 0);

    // Check fuel
    if (rocket.fuel <= 0) {
        stopThrust();
    }

    updateDisplay();
}

function updateDisplay() {
    document.getElementById('altitude').textContent = Math.round(rocket.altitude) + ' m';
    document.getElementById('velocity').textContent = (-rocket.vy * 10).toFixed(1) + ' m/s';
    document.getElementById('acceleration').textContent = (-rocket.ay).toFixed(1) + ' m/s²';
    document.getElementById('mass').textContent = Math.round(rocket.mass) + ' kg';
    document.getElementById('fuelValue').textContent = Math.round(rocket.fuel) + '%';
    document.getElementById('fuelFill').style.width = rocket.fuel + '%';
}

function draw() {
    // Sky gradient based on altitude
    const altFactor = Math.min(1, rocket.altitude / 5000);
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `rgb(${altFactor * 5}, ${altFactor * 5}, ${17 + altFactor * 20})`);
    gradient.addColorStop(0.5, `rgb(0, ${17 - altFactor * 10}, ${51 - altFactor * 20})`);
    gradient.addColorStop(1, `rgb(0, ${51 - altFactor * 30}, ${102 - altFactor * 50})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars (more visible at higher altitude)
    stars.forEach(star => {
        const opacity = 0.3 + altFactor * 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * star.brightness})`;
        ctx.fill();
    });

    // Draw ground
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

    // Draw launch pad
    ctx.fillStyle = '#444';
    ctx.fillRect(canvas.width / 2 - 40, canvas.height - 55, 80, 10);

    // Draw exhaust particles
    exhaustParticles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 200, 50, ${p.life})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${p.life * 0.5})`);
        gradient.addColorStop(1, `rgba(100, 50, 0, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });

    // Draw rocket
    drawRocket(rocket.x, rocket.y);

    // Draw altitude indicator
    ctx.font = '14px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`高度: ${Math.round(rocket.altitude)}m`, canvas.width - 20, 30);
}

function drawRocket(x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Rocket body
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-15, 30);
    ctx.lineTo(15, 30);
    ctx.lineTo(15, 0);
    ctx.closePath();
    const bodyGrad = ctx.createLinearGradient(-15, 0, 15, 0);
    bodyGrad.addColorStop(0, '#ccc');
    bodyGrad.addColorStop(0.5, '#fff');
    bodyGrad.addColorStop(1, '#aaa');
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nose cone
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.closePath();
    ctx.fillStyle = '#ff4500';
    ctx.fill();

    // Fins
    ctx.fillStyle = '#ff6b35';
    ctx.beginPath();
    ctx.moveTo(-15, 20);
    ctx.lineTo(-30, 35);
    ctx.lineTo(-15, 35);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, 20);
    ctx.lineTo(30, 35);
    ctx.lineTo(15, 35);
    ctx.closePath();
    ctx.fill();

    // Window
    ctx.beginPath();
    ctx.arc(0, -15, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#00bfff';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flame when thrusting
    if (isThrusting && rocket.fuel > 0) {
        const flameLength = 20 + Math.random() * 20;
        const gradient = ctx.createLinearGradient(0, 35, 0, 35 + flameLength);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, '#ffff00');
        gradient.addColorStop(0.6, '#ff6600');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.beginPath();
        ctx.moveTo(-10, 35);
        ctx.lineTo(0, 35 + flameLength);
        ctx.lineTo(10, 35);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    ctx.restore();
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
