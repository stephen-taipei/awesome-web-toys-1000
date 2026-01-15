const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedInput = document.getElementById('speed');

canvas.width = 370;
canvas.height = 300;

let time = 0;
const particles = [];
const numParticles = 300;

function noise(x, y, t) {
    return Math.sin(x * 0.02 + t) * Math.cos(y * 0.02 + t * 0.5) +
           Math.sin(x * 0.01 - t * 0.3) * Math.cos(y * 0.015 + t * 0.7);
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.hue = 160 + Math.random() * 40;
        this.life = 100 + Math.random() * 100;
    }

    update(speed) {
        this.prevX = this.x;
        this.prevY = this.y;

        const angle = noise(this.x, this.y, time) * Math.PI * 2;
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;

        this.life--;

        if (this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height ||
            this.life <= 0) {
            this.reset();
        }
    }

    draw() {
        const alpha = Math.min(1, this.life / 50);
        ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.fillStyle = 'rgba(10, 22, 40, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const speed = parseInt(speedInput.value) * 0.5;
    time += 0.01;

    particles.forEach(p => {
        p.update(speed);
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();
