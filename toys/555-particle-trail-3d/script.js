const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const trailSlider = document.getElementById('trailSlider');
const countSlider = document.getElementById('countSlider');
const infoEl = document.getElementById('info');

let trailLength = 50;
let particleCount = 8;
let particles = [];
let time = 0;

class TrailParticle {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.trail = [];
        this.hue = (index / total) * 360;
        this.phase = (index / total) * Math.PI * 2;
        this.orbitRadius = 60 + Math.random() * 40;
        this.orbitSpeed = 0.5 + Math.random() * 0.5;
        this.ySpeed = 0.3 + Math.random() * 0.3;
        this.yAmplitude = 40 + Math.random() * 30;
    }

    update(t) {
        // Lissajous-like 3D motion
        const angle = t * this.orbitSpeed + this.phase;
        const x = Math.cos(angle) * this.orbitRadius;
        const y = Math.sin(t * this.ySpeed + this.phase) * this.yAmplitude;
        const z = Math.sin(angle * 1.5) * this.orbitRadius * 0.8;

        // Add current position to trail
        this.trail.push({ x, y, z });

        // Limit trail length
        while (this.trail.length > trailLength) {
            this.trail.shift();
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new TrailParticle(i, particleCount));
    }
}

function project(x, y, z, rotY) {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const x1 = x * cosR - z * sinR;
    const z1 = x * sinR + z * cosR;

    const scale = 300 / (300 + z1);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + y * scale,
        scale,
        z: z1
    };
}

function draw() {
    time += 0.03;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rotY = time * 0.2;

    // Update particles
    particles.forEach(p => p.update(time));

    // Draw trails
    particles.forEach(particle => {
        if (particle.trail.length < 2) return;

        // Draw trail segments
        for (let i = 1; i < particle.trail.length; i++) {
            const prev = particle.trail[i - 1];
            const curr = particle.trail[i];

            const projPrev = project(prev.x, prev.y, prev.z, rotY);
            const projCurr = project(curr.x, curr.y, curr.z, rotY);

            const progress = i / particle.trail.length;
            const alpha = progress * 0.8;
            const width = progress * 3 * projCurr.scale;

            ctx.beginPath();
            ctx.moveTo(projPrev.x, projPrev.y);
            ctx.lineTo(projCurr.x, projCurr.y);
            ctx.strokeStyle = `hsla(${particle.hue + progress * 30}, 80%, 60%, ${alpha})`;
            ctx.lineWidth = Math.max(0.5, width);
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw head particle
        const head = particle.trail[particle.trail.length - 1];
        const projHead = project(head.x, head.y, head.z, rotY);

        // Glow
        const gradient = ctx.createRadialGradient(
            projHead.x, projHead.y, 0,
            projHead.x, projHead.y, 15 * projHead.scale
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 70%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 80%, 60%, 0.3)`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(projHead.x, projHead.y, 15 * projHead.scale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(projHead.x, projHead.y, 4 * projHead.scale, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${particle.hue}, 80%, 80%)`;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

trailSlider.addEventListener('input', (e) => {
    trailLength = parseInt(e.target.value);
    infoEl.textContent = `軌跡長度: ${trailLength}`;
});

countSlider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    init();
    infoEl.textContent = `粒子數: ${particleCount}`;
});

init();
draw();
