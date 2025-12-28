const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const attractBtn = document.getElementById('attractBtn');
const repelBtn = document.getElementById('repelBtn');
const forceSlider = document.getElementById('forceSlider');
const infoEl = document.getElementById('info');

let mode = 'attract';
let forceMagnitude = 5;
let particles = [];
let attractors = [];
let time = 0;
const particleCount = 800;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = (Math.random() - 0.5) * 200;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.hue = Math.random() * 60 + 180; // Cyan to blue
    }

    update() {
        // Apply forces from attractors
        attractors.forEach(a => {
            const dx = a.x - this.x;
            const dy = a.y - this.y;
            const dz = a.z - this.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 10;

            const force = (a.strength * forceMagnitude) / (dist * dist) * 50;

            this.vx += (dx / dist) * force;
            this.vy += (dy / dist) * force;
            this.vz += (dz / dist) * force;
        });

        // Apply velocity with damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vz *= 0.98;

        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
        if (this.z < -100) this.z = 100;
        if (this.z > 100) this.z = -100;

        // Color based on speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        this.hue = 180 + speed * 20;
    }
}

function init() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function project(x, y, z) {
    const scale = 300 / (300 + z);
    return {
        x: canvas.width / 2 + (x - canvas.width / 2) * scale,
        y: canvas.height / 2 + (y - canvas.height / 2) * scale,
        scale
    };
}

function draw() {
    time += 0.016;

    // Fade effect
    ctx.fillStyle = 'rgba(10, 10, 21, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decay attractors
    attractors = attractors.filter(a => {
        a.life -= 0.005;
        return a.life > 0;
    });

    // Update and draw particles
    particles.forEach(p => {
        p.update();

        const proj = project(p.x, p.y, p.z);
        const size = 1.5 * proj.scale;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = 0.5 + speed * 0.2;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${Math.min(1, alpha)})`;
        ctx.fill();
    });

    // Draw attractors
    attractors.forEach(a => {
        const proj = project(a.x, a.y, a.z);
        const radius = 20 * a.life * proj.scale;

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = a.strength > 0 ?
            `rgba(100, 200, 255, ${a.life})` :
            `rgba(255, 100, 100, ${a.life})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = a.strength > 0 ?
            `rgba(100, 200, 255, ${a.life})` :
            `rgba(255, 100, 100, ${a.life})`;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    attractors.push({
        x,
        y,
        z: 0,
        strength: mode === 'attract' ? 1 : -1,
        life: 1
    });

    infoEl.textContent = mode === 'attract' ? '創建吸引點' : '創建排斥點';
});

attractBtn.addEventListener('click', () => {
    mode = 'attract';
    attractBtn.classList.add('active');
    repelBtn.classList.remove('active');
    infoEl.textContent = '吸引模式';
});

repelBtn.addEventListener('click', () => {
    mode = 'repel';
    repelBtn.classList.add('active');
    attractBtn.classList.remove('active');
    infoEl.textContent = '排斥模式';
});

forceSlider.addEventListener('input', (e) => {
    forceMagnitude = parseInt(e.target.value);
    infoEl.textContent = `力量: ${forceMagnitude}`;
});

init();
draw();
