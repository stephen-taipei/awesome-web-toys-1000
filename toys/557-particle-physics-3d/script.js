const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const addBtn = document.getElementById('addBtn');
const bounceSlider = document.getElementById('bounceSlider');
const infoEl = document.getElementById('info');

let bounce = 0.8;
let particles = [];
let time = 0;
const gravity = 0.2;
const boxSize = 80;

class PhysicsParticle {
    constructor(x, y, z) {
        this.x = x || (Math.random() - 0.5) * boxSize;
        this.y = y || -boxSize / 2;
        this.z = z || (Math.random() - 0.5) * boxSize;

        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 2;
        this.vz = (Math.random() - 0.5) * 4;

        this.radius = 8 + Math.random() * 8;
        this.mass = this.radius * this.radius;
        this.hue = Math.random() * 60 + 20; // Orange to yellow
    }

    update() {
        // Gravity
        this.vy += gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Box collision
        const halfBox = boxSize / 2;

        if (this.x - this.radius < -halfBox) {
            this.x = -halfBox + this.radius;
            this.vx *= -bounce;
        }
        if (this.x + this.radius > halfBox) {
            this.x = halfBox - this.radius;
            this.vx *= -bounce;
        }
        if (this.y + this.radius > halfBox) {
            this.y = halfBox - this.radius;
            this.vy *= -bounce;
        }
        if (this.y - this.radius < -halfBox) {
            this.y = -halfBox + this.radius;
            this.vy *= -bounce;
        }
        if (this.z - this.radius < -halfBox) {
            this.z = -halfBox + this.radius;
            this.vz *= -bounce;
        }
        if (this.z + this.radius > halfBox) {
            this.z = halfBox - this.radius;
            this.vz *= -bounce;
        }

        // Friction
        this.vx *= 0.995;
        this.vy *= 0.995;
        this.vz *= 0.995;
    }

    collideWith(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dz = other.z - this.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDist = this.radius + other.radius;

        if (dist < minDist && dist > 0) {
            // Normalize
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            // Relative velocity
            const dvx = this.vx - other.vx;
            const dvy = this.vy - other.vy;
            const dvz = this.vz - other.vz;

            // Relative velocity along normal
            const dvn = dvx * nx + dvy * ny + dvz * nz;

            // Don't resolve if moving apart
            if (dvn > 0) return;

            // Impulse
            const impulse = (2 * dvn) / (this.mass + other.mass) * bounce;

            this.vx -= impulse * other.mass * nx;
            this.vy -= impulse * other.mass * ny;
            this.vz -= impulse * other.mass * nz;

            other.vx += impulse * this.mass * nx;
            other.vy += impulse * this.mass * ny;
            other.vz += impulse * this.mass * nz;

            // Separate particles
            const overlap = (minDist - dist) / 2;
            this.x -= overlap * nx;
            this.y -= overlap * ny;
            this.z -= overlap * nz;
            other.x += overlap * nx;
            other.y += overlap * ny;
            other.z += overlap * nz;
        }
    }
}

function addParticle() {
    if (particles.length < 30) {
        particles.push(new PhysicsParticle());
        infoEl.textContent = `粒子數: ${particles.length}`;
    }
}

function project(x, y, z, rotY) {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 250 / (250 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale,
        scale,
        z: z1
    };
}

function drawBox(rotY) {
    const halfBox = boxSize / 2;
    const corners = [
        [-halfBox, -halfBox, -halfBox],
        [halfBox, -halfBox, -halfBox],
        [halfBox, halfBox, -halfBox],
        [-halfBox, halfBox, -halfBox],
        [-halfBox, -halfBox, halfBox],
        [halfBox, -halfBox, halfBox],
        [halfBox, halfBox, halfBox],
        [-halfBox, halfBox, halfBox]
    ];

    const projected = corners.map(c => project(c[0], c[1], c[2], rotY));

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    ctx.strokeStyle = 'rgba(100, 100, 120, 0.5)';
    ctx.lineWidth = 1;
    edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projected[a].x, projected[a].y);
        ctx.lineTo(projected[b].x, projected[b].y);
        ctx.stroke();
    });
}

function draw() {
    time += 0.016;

    ctx.fillStyle = 'rgba(10, 10, 21, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotY = time * 0.3;

    // Update physics
    particles.forEach(p => p.update());

    // Check collisions
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            particles[i].collideWith(particles[j]);
        }
    }

    // Draw box
    drawBox(rotY);

    // Project and sort particles
    const projected = particles.map(p => ({
        ...p,
        ...project(p.x, p.y, p.z, rotY)
    }));
    projected.sort((a, b) => b.z - a.z);

    // Draw particles
    projected.forEach(p => {
        const radius = p.radius * p.scale;

        // Shadow
        ctx.beginPath();
        ctx.ellipse(p.x, canvas.height / 2 + boxSize / 2 * p.scale,
                   radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Gradient sphere
        const gradient = ctx.createRadialGradient(
            p.x - radius * 0.3, p.y - radius * 0.3, 0,
            p.x, p.y, radius
        );
        gradient.addColorStop(0, `hsl(${p.hue}, 80%, 70%)`);
        gradient.addColorStop(1, `hsl(${p.hue}, 80%, 40%)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

addBtn.addEventListener('click', addParticle);

bounceSlider.addEventListener('input', (e) => {
    bounce = parseInt(e.target.value) / 10;
    infoEl.textContent = `彈性: ${(bounce * 100).toFixed(0)}%`;
});

// Start with some particles
for (let i = 0; i < 10; i++) {
    addParticle();
}

draw();
