const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensityInput = document.getElementById('intensity');

canvas.width = 370;
canvas.height = 300;

class FireParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 60;
        this.y = canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -2 - Math.random() * 4;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.size = 5 + Math.random() * 15;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy -= 0.05;
        this.life -= this.decay;
        this.size *= 0.98;

        if (this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );

        if (this.life > 0.7) {
            gradient.addColorStop(0, `rgba(255, 255, 200, ${this.life})`);
            gradient.addColorStop(0.4, `rgba(255, 200, 50, ${this.life * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
        } else if (this.life > 0.4) {
            gradient.addColorStop(0, `rgba(255, 150, 50, ${this.life})`);
            gradient.addColorStop(0.5, `rgba(255, 80, 0, ${this.life * 0.7})`);
            gradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
        } else {
            gradient.addColorStop(0, `rgba(200, 50, 0, ${this.life})`);
            gradient.addColorStop(0.5, `rgba(100, 30, 0, ${this.life * 0.5})`);
            gradient.addColorStop(1, `rgba(50, 20, 0, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

let particles = [];

function initParticles() {
    const intensity = parseInt(intensityInput.value);
    particles = [];
    for (let i = 0; i < intensity; i++) {
        const p = new FireParticle();
        p.y = canvas.height - Math.random() * 150;
        p.life = Math.random();
        particles.push(p);
    }
}

function animate() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(canvas.width / 2 - 40, canvas.height - 20, 80, 20);

    requestAnimationFrame(animate);
}

intensityInput.addEventListener('input', initParticles);

initParticles();
animate();
