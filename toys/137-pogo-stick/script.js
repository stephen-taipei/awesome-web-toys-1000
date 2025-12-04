const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let groundY;

// Physics parameters
let springStrength = 0.15;
let damping = 0.85;
let gravity = 0.5;

// Stats
let maxHeight = 0;
let comboCount = 0;
let totalBounces = 0;
let lastBounceTime = 0;

// Pogo stick state
let pogo = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVel: 0,
    springLength: 60,
    restLength: 60,
    minLength: 30,
    maxLength: 90,
    isCompressed: false,
    jumpPower: 0
};

// Person on pogo
let person = {
    bounce: 0,
    armAngle: 0
};

// Platforms
let platforms = [];

// Particles for effects
let particles = [];

function createPlatforms() {
    platforms = [
        { x: 0, y: groundY, width: width, height: 100 }
    ];

    // Add some elevated platforms
    const platformCount = 5;
    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: 150 + i * (width - 200) / platformCount,
            y: groundY - 80 - i * 60,
            width: 120,
            height: 20
        });
    }
}

function init() {
    pogo.x = width / 4;
    pogo.y = groundY - pogo.restLength - 30;
    pogo.vx = 0;
    pogo.vy = 0;
    pogo.angle = 0;
    pogo.angularVel = 0;
    pogo.springLength = pogo.restLength;
    pogo.isCompressed = false;
    pogo.jumpPower = 0;

    maxHeight = 0;
    comboCount = 0;
    totalBounces = 0;
    particles = [];

    updateStats();
}

function checkPlatformCollision() {
    // Calculate pogo tip position
    const tipX = pogo.x + Math.sin(pogo.angle) * pogo.springLength;
    const tipY = pogo.y + Math.cos(pogo.angle) * pogo.springLength;

    for (const platform of platforms) {
        // Check if tip is within platform bounds
        if (tipX >= platform.x && tipX <= platform.x + platform.width) {
            if (tipY >= platform.y && tipY <= platform.y + 20) {
                return { platform, tipX, tipY };
            }
        }
    }

    return null;
}

function update() {
    // Apply gravity
    pogo.vy += gravity;

    // Apply horizontal control
    if (keys.left) {
        pogo.angularVel -= 0.003;
        pogo.vx -= 0.1;
    }
    if (keys.right) {
        pogo.angularVel += 0.003;
        pogo.vx += 0.1;
    }

    // Update position
    pogo.x += pogo.vx;
    pogo.y += pogo.vy;

    // Update angle
    pogo.angle += pogo.angularVel;
    pogo.angularVel *= 0.95; // Angular damping

    // Limit angle
    pogo.angle = Math.max(-0.4, Math.min(0.4, pogo.angle));

    // Check collision
    const collision = checkPlatformCollision();

    if (collision) {
        const { platform, tipX, tipY } = collision;

        // Compress spring based on penetration
        const penetration = tipY - platform.y;

        if (penetration > 0) {
            // Spring compression
            pogo.springLength = Math.max(pogo.minLength, pogo.restLength - penetration * 0.5);
            pogo.isCompressed = true;

            // Accumulate jump power while compressed
            if (keys.space || keys.jump) {
                pogo.jumpPower = Math.min(pogo.jumpPower + 0.5, 15);
            }

            // Spring force
            const compression = pogo.restLength - pogo.springLength;
            const springForce = compression * springStrength;

            // Apply spring force in the direction opposite to the stick
            pogo.vy -= springForce * Math.cos(pogo.angle);
            pogo.vx -= springForce * Math.sin(pogo.angle) * 0.3;

            // Friction
            pogo.vx *= 0.9;

            // Keep on platform
            const correctY = platform.y - Math.cos(pogo.angle) * pogo.springLength - 30;
            if (pogo.y > correctY) {
                pogo.y = correctY;
                if (pogo.vy > 0) {
                    pogo.vy *= -damping;

                    // Count bounce
                    const now = Date.now();
                    if (now - lastBounceTime < 1000) {
                        comboCount++;
                    } else {
                        comboCount = 1;
                    }
                    lastBounceTime = now;
                    totalBounces++;

                    // Create particles
                    createBounceParticles(tipX, platform.y);

                    updateStats();
                }
            }
        }
    } else {
        // Spring extending back
        pogo.springLength += (pogo.restLength - pogo.springLength) * 0.1;

        // Release jump power
        if (pogo.isCompressed && pogo.jumpPower > 0) {
            pogo.vy -= pogo.jumpPower;
            pogo.jumpPower = 0;
            createBounceParticles(pogo.x, pogo.y + pogo.springLength);
        }
        pogo.isCompressed = false;
    }

    // Track max height
    const currentHeight = groundY - pogo.y;
    if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
        updateStats();
    }

    // Boundary checks
    if (pogo.x < 30) {
        pogo.x = 30;
        pogo.vx *= -0.5;
    }
    if (pogo.x > width - 30) {
        pogo.x = width - 30;
        pogo.vx *= -0.5;
    }

    // Reset if fallen too far
    if (pogo.y > height + 100) {
        init();
    }

    // Update particles
    updateParticles();

    // Person bounce animation
    person.bounce = pogo.isCompressed ? 0.8 : 1;
    person.armAngle = Math.sin(Date.now() * 0.01) * 0.3;
}

function createBounceParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 5 - 2,
            life: 1,
            color: Math.random() > 0.5 ? '#22c55e' : '#86efac'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawBackground() {
    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGradient.addColorStop(0, '#87ceeb');
    skyGradient.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, groundY);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100, 80, 1);
    drawCloud(width * 0.5, 120, 1.3);
    drawCloud(width * 0.8, 60, 0.8);

    // Sun
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(width - 100, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(width - 100 + Math.cos(angle) * 50, 80 + Math.sin(angle) * 50);
        ctx.lineTo(width - 100 + Math.cos(angle) * 65, 80 + Math.sin(angle) * 65);
        ctx.stroke();
    }
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.arc(25, -5, 20, 0, Math.PI * 2);
    ctx.arc(45, 0, 25, 0, Math.PI * 2);
    ctx.arc(20, 10, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawPlatforms() {
    for (const platform of platforms) {
        if (platform.y === groundY) {
            // Ground
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Grass
            ctx.fillStyle = '#16a34a';
            for (let x = 0; x < width; x += 15) {
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x + 5, groundY - 10);
                ctx.lineTo(x + 10, groundY);
                ctx.fill();
            }
        } else {
            // Elevated platform
            const gradient = ctx.createLinearGradient(
                platform.x, platform.y,
                platform.x, platform.y + platform.height
            );
            gradient.addColorStop(0, '#8b4513');
            gradient.addColorStop(1, '#5d3a1a');

            ctx.fillStyle = gradient;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

            // Platform top highlight
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(platform.x, platform.y, platform.width, 5);

            // Platform shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(platform.x + 5, platform.y + platform.height, platform.width, 5);
        }
    }
}

function drawPogoStick() {
    ctx.save();
    ctx.translate(pogo.x, pogo.y);
    ctx.rotate(pogo.angle);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(5, pogo.springLength + 5, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main pole
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(0, pogo.springLength - 20);
    ctx.stroke();

    // Spring visualization
    const springStart = pogo.springLength - 20;
    const springEnd = pogo.springLength;
    const coils = 8;
    const coilWidth = 12;

    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, springStart);

    for (let i = 0; i <= coils; i++) {
        const t = i / coils;
        const y = springStart + (springEnd - springStart) * t;
        const x = (i % 2 === 0 ? 1 : -1) * coilWidth * (1 - Math.abs(t - 0.5) * 0.5);
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Foot pad
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.ellipse(0, pogo.springLength, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Handle bars
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-20, -25);
    ctx.lineTo(20, -25);
    ctx.stroke();

    // Handle grips
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(-20, -25, 6, 0, Math.PI * 2);
    ctx.arc(20, -25, 6, 0, Math.PI * 2);
    ctx.fill();

    // Foot pegs
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(-18, 10, 12, 6);
    ctx.fillRect(6, 10, 12, 6);

    // Draw person
    drawPerson();

    ctx.restore();
}

function drawPerson() {
    ctx.save();
    ctx.scale(1, person.bounce);

    // Body
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.ellipse(0, -45, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, -70, 12, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -72, 14, Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-4, -70, 2, 0, Math.PI * 2);
    ctx.arc(4, -70, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -68, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Arms holding handles
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Left arm
    ctx.beginPath();
    ctx.moveTo(-10, -50);
    ctx.quadraticCurveTo(-15 + Math.sin(person.armAngle) * 5, -35, -18, -25);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(10, -50);
    ctx.quadraticCurveTo(15 + Math.sin(person.armAngle) * 5, -35, 18, -25);
    ctx.stroke();

    // Legs on pegs
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 6;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-5, -30);
    ctx.lineTo(-12, 10);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(5, -30);
    ctx.lineTo(12, 10);
    ctx.stroke();

    ctx.restore();
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawPowerMeter() {
    if (pogo.jumpPower > 0) {
        const meterWidth = 100;
        const meterHeight = 15;
        const x = pogo.x - meterWidth / 2;
        const y = pogo.y - 120;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, meterWidth, meterHeight);

        // Power bar
        const powerRatio = pogo.jumpPower / 15;
        const gradient = ctx.createLinearGradient(x, y, x + meterWidth, y);
        gradient.addColorStop(0, '#22c55e');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(1, '#ef4444');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, y + 2, (meterWidth - 4) * powerRatio, meterHeight - 4);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, meterWidth, meterHeight);
    }
}

function drawHeightIndicator() {
    const currentHeight = Math.max(0, Math.round(groundY - pogo.y));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(width - 70, 20, 60, 30);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentHeight + 'm', width - 40, 40);
}

function updateStats() {
    document.getElementById('maxHeight').textContent = Math.round(maxHeight) + ' m';
    document.getElementById('comboCount').textContent = comboCount;
    document.getElementById('totalBounces').textContent = totalBounces;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    groundY = height * 0.8;
    createPlatforms();
    init();
}

function animate() {
    update();

    drawBackground();
    drawPlatforms();
    drawParticles();
    drawPogoStick();
    drawPowerMeter();
    drawHeightIndicator();

    requestAnimationFrame(animate);
}

// Input handling
const keys = {
    left: false,
    right: false,
    space: false,
    jump: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space') {
        e.preventDefault();
        keys.space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space') keys.space = false;
});

// UI controls
document.getElementById('jumpBtn').addEventListener('mousedown', () => {
    keys.jump = true;
});

document.getElementById('jumpBtn').addEventListener('mouseup', () => {
    keys.jump = false;
});

document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.jump = true;
});

document.getElementById('jumpBtn').addEventListener('touchend', () => {
    keys.jump = false;
});

document.getElementById('resetBtn').addEventListener('click', init);

document.getElementById('springSlider').addEventListener('input', (e) => {
    springStrength = parseFloat(e.target.value);
    document.getElementById('springValue').textContent = springStrength.toFixed(2);
});

document.getElementById('dampingSlider').addEventListener('input', (e) => {
    damping = parseFloat(e.target.value);
    document.getElementById('dampingValue').textContent = damping.toFixed(2);
});

document.getElementById('gravitySlider').addEventListener('input', (e) => {
    gravity = parseFloat(e.target.value);
    document.getElementById('gravityValue').textContent = gravity.toFixed(2);
});

window.addEventListener('resize', resize);

// Initialize
resize();
animate();
