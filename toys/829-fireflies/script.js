const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const fireflies = [];
let syncMode = false;

class Firefly {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.phase = Math.random() * Math.PI * 2;
        this.frequency = 0.03 + Math.random() * 0.02;
        this.brightness = 0;
        this.size = 2 + Math.random() * 2;
    }

    update() {
        this.phase += this.frequency;

        if (syncMode) {
            fireflies.forEach(other => {
                if (other !== this) {
                    const phaseDiff = other.phase - this.phase;
                    this.phase += Math.sin(phaseDiff) * 0.01;
                }
            });
        }

        this.brightness = (Math.sin(this.phase) + 1) / 2;

        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;

        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 20) this.vx += 0.1;
        if (this.x > canvas.width - 20) this.vx -= 0.1;
        if (this.y < 20) this.vy += 0.1;
        if (this.y > canvas.height - 50) this.vy -= 0.1;
    }

    draw() {
        if (this.brightness > 0.3) {
            const glowSize = this.size * 4 * this.brightness;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
            gradient.addColorStop(0, `rgba(173, 255, 47, ${this.brightness * 0.8})`);
            gradient.addColorStop(0.5, `rgba(173, 255, 47, ${this.brightness * 0.3})`);
            gradient.addColorStop(1, 'rgba(173, 255, 47, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = `rgba(50, 50, 50, 0.8)`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(173, 255, 47, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.size * 0.3, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    fireflies.length = 0;
    for (let i = 0; i < 30; i++) {
        fireflies.push(new Firefly());
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(
            (Math.sin(i * 7) + 1) * canvas.width / 2,
            (Math.cos(i * 11) + 1) * canvas.height / 3,
            0.5 + Math.random(),
            0, Math.PI * 2
        );
        ctx.fill();
    }

    ctx.fillStyle = '#1a3320';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
        ctx.lineTo(x, canvas.height - 30 - Math.sin(x * 0.05) * 15 - Math.random() * 10);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
        const x = 30 + i * 45;
        ctx.strokeStyle = '#0d1f12';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 25);
        ctx.lineTo(x, canvas.height - 60 - Math.random() * 30);
        ctx.stroke();

        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 35 - j * 15);
            ctx.lineTo(x + 10 - Math.random() * 20, canvas.height - 45 - j * 15);
            ctx.stroke();
        }
    }
}

function animate() {
    drawBackground();

    fireflies.forEach(f => {
        f.update();
        f.draw();
    });

    requestAnimationFrame(animate);
}

document.getElementById('syncBtn').addEventListener('click', () => {
    syncMode = !syncMode;
    document.getElementById('syncBtn').textContent = syncMode ? '取消同步' : '同步閃爍';
    document.getElementById('syncBtn').style.background = syncMode ? '#FF6347' : '#ADFF2F';
});

init();
animate();
