const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let celebrating = false;
let fireworks = [];
let particles = [];
let confetti = [];
let stars = [];

class Firework {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = Math.random() * canvas.height * 0.5 + 30;
        this.speed = Math.random() * 3 + 4;
        this.hue = Math.random() * 360;
        this.exploded = false;
        this.trail = [];
    }

    update() {
        if (!this.exploded) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();

            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
            }
        }
    }

    explode() {
        this.exploded = true;
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                hue: this.hue + Math.random() * 30 - 15,
                life: 1,
                size: Math.random() * 3 + 1
            });
        }
    }

    draw() {
        if (!this.exploded) {
            this.trail.forEach((pos, i) => {
                const alpha = i / this.trail.length;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${alpha})`;
                ctx.fill();
            });

            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 80%, 80%)`;
            ctx.fill();
        }
    }
}

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.1;
        this.hue = Math.random() * 360;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(time * 0.05 + this.x * 0.01) * 0.5;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 10) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        ctx.restore();
    }
}

function init() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            twinkle: Math.random() * 0.05 + 0.02
        });
    }

    confetti = [];
    for (let i = 0; i < 50; i++) {
        const c = new Confetti();
        c.y = Math.random() * canvas.height;
        confetti.push(c);
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;
        return p.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.life})`;
        ctx.fill();
    });
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
        const alpha = 0.3 + Math.sin(time * s.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
        ctx.fill();
    });

    if (celebrating) {
        if (Math.random() < 0.1) {
            fireworks.push(new Firework());
        }

        fireworks = fireworks.filter(f => !f.exploded || particles.some(p => p.life > 0));
        fireworks.forEach(f => {
            f.update();
            f.draw();
        });

        updateParticles();
        drawParticles();

        confetti.forEach(c => {
            c.update();
            c.draw();
        });
    }

    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    const gradient = ctx.createLinearGradient(canvas.width / 2 - 80, 0, canvas.width / 2 + 80, 0);
    gradient.addColorStop(0, `hsl(${time % 360}, 80%, 60%)`);
    gradient.addColorStop(0.5, `hsl(${(time + 120) % 360}, 80%, 60%)`);
    gradient.addColorStop(1, `hsl(${(time + 240) % 360}, 80%, 60%)`);
    ctx.fillStyle = gradient;
    ctx.fillText('🎉 Web Toy #1000 🎉', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('感謝你的探索！', canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = '12px Arial';
    ctx.fillStyle = `hsla(${time % 360}, 70%, 70%, 0.8)`;
    ctx.fillText('1000 個創意的終極慶典', canvas.width / 2, canvas.height / 2 + 35);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('celebrateBtn').addEventListener('click', () => {
    celebrating = !celebrating;
    if (celebrating) {
        fireworks = [];
        particles = [];
    }
});

init();
animate();
