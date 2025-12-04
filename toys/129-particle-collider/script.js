const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height, centerX, centerY;
let particles = [];
let debris = [];
let beamParticles = [];
let collisionCount = 0;
let totalParticlesCreated = 0;
let energy = 50;
let orbitRadius = 200;
let isColliding = false;

// Particle types
const particleTypes = [
    { name: 'electron', color: '#00d4ff', mass: 1, symbol: 'e⁻' },
    { name: 'positron', color: '#ff00d4', mass: 1, symbol: 'e⁺' },
    { name: 'proton', color: '#ff6b6b', mass: 1836, symbol: 'p⁺' },
    { name: 'neutron', color: '#feca57', mass: 1839, symbol: 'n⁰' },
    { name: 'muon', color: '#48dbfb', mass: 207, symbol: 'μ' },
    { name: 'pion', color: '#ff9ff3', mass: 273, symbol: 'π' },
    { name: 'kaon', color: '#54a0ff', mass: 966, symbol: 'K' },
    { name: 'photon', color: '#ffffff', mass: 0, symbol: 'γ' }
];

class BeamParticle {
    constructor(angle, direction) {
        this.angle = angle;
        this.direction = direction; // 1 or -1
        this.speed = 0.05;
        this.type = direction === 1 ? particleTypes[0] : particleTypes[1];
        this.trail = [];
        this.active = true;
    }

    update() {
        this.angle += this.speed * this.direction;

        const x = centerX + Math.cos(this.angle) * orbitRadius;
        const y = centerY + Math.sin(this.angle) * orbitRadius;

        this.trail.push({ x, y, alpha: 1 });
        if (this.trail.length > 30) this.trail.shift();

        // Decay trail
        for (const point of this.trail) {
            point.alpha *= 0.95;
        }

        this.x = x;
        this.y = y;
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length - 1; i++) {
            const point = this.trail[i];
            ctx.strokeStyle = this.type.color.replace(')', `, ${point.alpha})`).replace('rgb', 'rgba').replace('#', '');

            // Convert hex to rgba
            const hex = this.type.color;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${point.alpha})`;

            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.stroke();
        }

        // Draw particle
        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 15);
        glow.addColorStop(0, this.type.color);
        glow.addColorStop(0.5, this.type.color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.type.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Debris {
    constructor(x, y, type, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.life = 1;
        this.trail = [];
        this.radius = 3 + Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Slow down
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.life -= 0.01;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 20) this.trail.shift();
    }

    draw() {
        if (this.life <= 0) return;

        // Draw trail
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i / this.trail.length) * this.life * 0.5;
            const hex = this.type.color;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.trail[i].x, this.trail[i].y);
            ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            ctx.stroke();
        }

        // Draw particle
        const hex = this.type.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.symbol, this.x, this.y - 15);
    }
}

class CollisionEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 100 + energy;
        this.life = 1;
        this.rings = [];

        for (let i = 0; i < 5; i++) {
            this.rings.push({
                radius: 0,
                maxRadius: 50 + i * 30,
                speed: 2 + i * 0.5
            });
        }
    }

    update() {
        this.radius += 5;
        this.life -= 0.02;

        for (const ring of this.rings) {
            ring.radius += ring.speed;
        }
    }

    draw() {
        if (this.life <= 0) return;

        // Flash
        const flash = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        flash.addColorStop(0, `rgba(255, 255, 255, ${this.life * 0.8})`);
        flash.addColorStop(0.3, `rgba(0, 212, 255, ${this.life * 0.5})`);
        flash.addColorStop(1, 'transparent');

        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        for (const ring of this.rings) {
            const alpha = Math.max(0, this.life - ring.radius / ring.maxRadius * 0.5);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

let collisionEffects = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    centerX = width / 2;
    centerY = height / 2;
}

function drawCollider() {
    // Outer ring
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner details
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius - 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius + 15, 0, Math.PI * 2);
    ctx.stroke();

    // Segments
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
    for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * (orbitRadius - 25),
            centerY + Math.sin(angle) * (orbitRadius - 25)
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * (orbitRadius + 25),
            centerY + Math.sin(angle) * (orbitRadius + 25)
        );
        ctx.stroke();
    }

    // Detector regions
    const detectorAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    for (const angle of detectorAngles) {
        ctx.fillStyle = 'rgba(123, 47, 247, 0.3)';
        ctx.beginPath();
        ctx.arc(
            centerX + Math.cos(angle) * orbitRadius,
            centerY + Math.sin(angle) * orbitRadius,
            30, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = 'rgba(123, 47, 247, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function startCollision() {
    if (isColliding) return;

    isColliding = true;
    beamParticles = [
        new BeamParticle(0, 1),
        new BeamParticle(Math.PI, -1)
    ];
}

function createCollisionDebris(x, y) {
    const numParticles = Math.floor(energy / 10) + 5;

    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * (energy / 20);
        const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];

        debris.push(new Debris(
            x, y, type,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        ));
    }

    totalParticlesCreated += numParticles;
    collisionCount++;

    collisionEffects.push(new CollisionEffect(x, y));

    updateStats();
}

function checkCollision() {
    if (beamParticles.length !== 2) return;

    const p1 = beamParticles[0];
    const p2 = beamParticles[1];

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20) {
        createCollisionDebris((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        beamParticles = [];
        isColliding = false;
    }
}

function updateStats() {
    document.getElementById('collisionCount').textContent = collisionCount;
    document.getElementById('particleCount').textContent = totalParticlesCreated;
    document.getElementById('totalEnergy').textContent = (energy * collisionCount).toFixed(0) + ' GeV';
}

function animate() {
    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 10, 0.2)';
    ctx.fillRect(0, 0, width, height);

    drawCollider();

    // Update and draw beam particles
    for (const particle of beamParticles) {
        particle.update();
        particle.draw();
    }

    // Check collision
    checkCollision();

    // Update and draw debris
    debris = debris.filter(d => d.life > 0);
    for (const d of debris) {
        d.update();
        d.draw();
    }

    // Update and draw collision effects
    collisionEffects = collisionEffects.filter(e => e.life > 0);
    for (const effect of collisionEffects) {
        effect.update();
        effect.draw();
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('energySlider').addEventListener('input', (e) => {
    energy = parseInt(e.target.value);
    document.getElementById('energyValue').textContent = energy;
});

document.getElementById('radiusSlider').addEventListener('input', (e) => {
    orbitRadius = parseInt(e.target.value);
    document.getElementById('radiusValue').textContent = orbitRadius;
});

document.getElementById('collideBtn').addEventListener('click', startCollision);

document.getElementById('resetBtn').addEventListener('click', () => {
    beamParticles = [];
    debris = [];
    collisionEffects = [];
    collisionCount = 0;
    totalParticlesCreated = 0;
    isColliding = false;
    updateStats();
});

canvas.addEventListener('click', startCollision);

window.addEventListener('resize', resize);

// Initialize
resize();
updateStats();
animate();
