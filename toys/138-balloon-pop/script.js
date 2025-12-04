const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let balloons = [];
let particles = [];
let confetti = [];
let popCount = 0;

let elasticity = 0.95;
let pressure = 1.0;

const balloonColors = [
    { main: '#ef4444', highlight: '#fca5a5', shadow: '#b91c1c' },
    { main: '#f97316', highlight: '#fdba74', shadow: '#c2410c' },
    { main: '#eab308', highlight: '#fde047', shadow: '#a16207' },
    { main: '#22c55e', highlight: '#86efac', shadow: '#15803d' },
    { main: '#3b82f6', highlight: '#93c5fd', shadow: '#1d4ed8' },
    { main: '#8b5cf6', highlight: '#c4b5fd', shadow: '#6d28d9' },
    { main: '#ec4899', highlight: '#f9a8d4', shadow: '#be185d' }
];

class Balloon {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 2 - 1;
        this.baseRadius = 40 + Math.random() * 20;
        this.radius = this.baseRadius;
        this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02;
        this.stringLength = 80 + Math.random() * 40;
        this.squash = { x: 1, y: 1 };
        this.popped = false;
        this.inflation = 0;
        this.maxInflation = 1 + Math.random() * 0.3;
    }

    update() {
        if (this.popped) return;

        // Inflation animation
        if (this.inflation < this.maxInflation) {
            this.inflation += 0.02;
            this.radius = this.baseRadius * Math.min(this.inflation, this.maxInflation);
        }

        // Buoyancy
        this.vy -= 0.03 * pressure;

        // Air resistance
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Wobble
        this.wobble += this.wobbleSpeed;
        this.vx += Math.sin(this.wobble) * 0.05;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Recover squash
        this.squash.x += (1 - this.squash.x) * 0.1;
        this.squash.y += (1 - this.squash.y) * 0.1;

        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx) * elasticity;
            this.squash.x = 0.8;
            this.squash.y = 1.2;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx = -Math.abs(this.vx) * elasticity;
            this.squash.x = 0.8;
            this.squash.y = 1.2;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy) * elasticity;
            this.squash.x = 1.2;
            this.squash.y = 0.8;
        }
        if (this.y + this.radius + this.stringLength > height) {
            this.y = height - this.radius - this.stringLength;
            this.vy = -Math.abs(this.vy) * elasticity;
            this.squash.x = 1.2;
            this.squash.y = 0.8;
        }
    }

    draw() {
        if (this.popped) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // String
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.radius * this.squash.y);

        // Wavy string
        const stringWave = Math.sin(this.wobble * 2) * 10;
        ctx.quadraticCurveTo(
            stringWave, this.radius * this.squash.y + this.stringLength / 2,
            0, this.radius * this.squash.y + this.stringLength
        );
        ctx.stroke();

        // Balloon shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(5, 5, this.radius * this.squash.x, this.radius * this.squash.y * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon body
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius * 1.2
        );
        gradient.addColorStop(0, this.color.highlight);
        gradient.addColorStop(0.5, this.color.main);
        gradient.addColorStop(1, this.color.shadow);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * this.squash.x, this.radius * this.squash.y * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon knot
        ctx.fillStyle = this.color.shadow;
        ctx.beginPath();
        ctx.moveTo(-6, this.radius * this.squash.y);
        ctx.lineTo(0, this.radius * this.squash.y + 12);
        ctx.lineTo(6, this.radius * this.squash.y);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
            -this.radius * 0.3 * this.squash.x,
            -this.radius * 0.3 * this.squash.y,
            this.radius * 0.25 * this.squash.x,
            this.radius * 0.35 * this.squash.y,
            -0.5, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }

    contains(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return (dx * dx) / (this.radius * this.radius) + (dy * dy) / ((this.radius * 1.1) * (this.radius * 1.1)) < 1;
    }

    pop() {
        if (this.popped) return;
        this.popped = true;
        popCount++;
        createPopEffect(this.x, this.y, this.color, this.radius);
        updateStats();
    }
}

function createPopEffect(x, y, color, radius) {
    // Rubber pieces
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 5,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 5,
            size: 3 + Math.random() * 8,
            color: color.main,
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        });
    }

    // Confetti
    for (let i = 0; i < 30; i++) {
        confetti.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15 - 5,
            size: 5 + Math.random() * 8,
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)].main,
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            type: Math.random() > 0.5 ? 'rect' : 'circle'
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life -= 0.02;
        p.vx *= 0.98;

        if (p.life <= 0 || p.y > height + 50) {
            particles.splice(i, 1);
        }
    }
}

function updateConfetti() {
    for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.vy += 0.15;
        c.vx += Math.sin(c.rotation) * 0.1;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        c.life -= 0.005;
        c.vx *= 0.99;

        if (c.life <= 0 || c.y > height + 50) {
            confetti.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        // Irregular rubber piece shape
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size * 0.5);
        ctx.quadraticCurveTo(0, -p.size, p.size, -p.size * 0.3);
        ctx.quadraticCurveTo(p.size * 0.5, p.size * 0.5, 0, p.size);
        ctx.quadraticCurveTo(-p.size * 0.5, p.size * 0.3, -p.size, -p.size * 0.5);
        ctx.fill();

        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function drawConfetti() {
    for (const c of confetti) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.globalAlpha = c.life;
        ctx.fillStyle = c.color;

        if (c.type === 'rect') {
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function checkBalloonCollision(b1, b2) {
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = b1.radius + b2.radius;

    if (dist < minDist && dist > 0) {
        // Collision response
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;

        // Separate balloons
        const separateX = Math.cos(angle) * overlap * 0.5;
        const separateY = Math.sin(angle) * overlap * 0.5;

        b1.x -= separateX;
        b1.y -= separateY;
        b2.x += separateX;
        b2.y += separateY;

        // Exchange velocities (elastic collision)
        const v1 = { x: b1.vx, y: b1.vy };
        const v2 = { x: b2.vx, y: b2.vy };

        b1.vx = v2.x * elasticity;
        b1.vy = v2.y * elasticity;
        b2.vx = v1.x * elasticity;
        b2.vy = v1.y * elasticity;

        // Squash effect
        b1.squash = { x: 0.85, y: 1.15 };
        b2.squash = { x: 0.85, y: 1.15 };
    }
}

function drawBackground() {
    // Gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(0.5, '#e0f0ff');
    gradient.addColorStop(1, '#fef3c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(width * 0.15, 100, 1);
    drawCloud(width * 0.5, 150, 1.5);
    drawCloud(width * 0.8, 80, 0.8);

    // Sun
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(width - 80, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.beginPath();
    ctx.arc(width - 80, 80, 70, 0, Math.PI * 2);
    ctx.fill();
}

function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.arc(30, -10, 25, 0, Math.PI * 2);
    ctx.arc(55, 0, 30, 0, Math.PI * 2);
    ctx.arc(25, 15, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function addBalloon(x, y) {
    if (balloons.length < 50) {
        balloons.push(new Balloon(
            x || Math.random() * (width - 200) + 100,
            y || height - 100
        ));
        updateStats();
    }
}

function updateStats() {
    const activeBalloons = balloons.filter(b => !b.popped).length;
    document.getElementById('popCount').textContent = popCount;
    document.getElementById('balloonCount').textContent = activeBalloons;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function animate() {
    drawBackground();

    // Update and draw particles
    updateParticles();
    updateConfetti();
    drawConfetti();
    drawParticles();

    // Update balloons
    for (const balloon of balloons) {
        balloon.update();
    }

    // Check balloon-balloon collisions
    for (let i = 0; i < balloons.length; i++) {
        for (let j = i + 1; j < balloons.length; j++) {
            if (!balloons[i].popped && !balloons[j].popped) {
                checkBalloonCollision(balloons[i], balloons[j]);
            }
        }
    }

    // Draw balloons
    for (const balloon of balloons) {
        balloon.draw();
    }

    // Remove popped balloons after animation
    balloons = balloons.filter(b => !b.popped || particles.length > 0);

    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let popped = false;
    for (const balloon of balloons) {
        if (balloon.contains(x, y)) {
            balloon.pop();
            popped = true;
            break;
        }
    }

    // If didn't pop a balloon, add a new one
    if (!popped) {
        addBalloon(x, y);
    }
});

document.getElementById('addBtn').addEventListener('click', () => {
    addBalloon();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    balloons = [];
    particles = [];
    confetti = [];
    popCount = 0;
    updateStats();

    // Add initial balloons
    for (let i = 0; i < 10; i++) {
        setTimeout(() => addBalloon(), i * 200);
    }
});

document.getElementById('elasticitySlider').addEventListener('input', (e) => {
    elasticity = parseFloat(e.target.value);
    document.getElementById('elasticityValue').textContent = elasticity.toFixed(2);
});

document.getElementById('pressureSlider').addEventListener('input', (e) => {
    pressure = parseFloat(e.target.value);
    document.getElementById('pressureValue').textContent = pressure.toFixed(1);
});

window.addEventListener('resize', resize);

// Initialize
resize();
for (let i = 0; i < 10; i++) {
    setTimeout(() => addBalloon(), i * 200);
}
animate();
