const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const butterflies = [];

class Butterfly {
    constructor(x, y) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.wingSpeed = 0.15 + Math.random() * 0.1;
        this.size = 15 + Math.random() * 10;
        this.color1 = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.color2 = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.restTimer = 0;
        this.isResting = false;
    }

    update() {
        this.wingPhase += this.wingSpeed;

        if (this.isResting) {
            this.restTimer--;
            if (this.restTimer <= 0) {
                this.isResting = false;
            }
            return;
        }

        if (Math.random() < 0.005) {
            this.isResting = true;
            this.restTimer = 100 + Math.random() * 100;
            return;
        }

        this.wanderAngle += (Math.random() - 0.5) * 0.3;
        this.vx += Math.cos(this.wanderAngle) * 0.1;
        this.vy += Math.sin(this.wanderAngle) * 0.1;

        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy += (Math.random() - 0.5) * 0.2;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2) {
            this.vx = (this.vx / speed) * 2;
            this.vy = (this.vy / speed) * 2;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 20) this.vx += 0.5;
        if (this.x > canvas.width - 20) this.vx -= 0.5;
        if (this.y < 20) this.vy += 0.5;
        if (this.y > canvas.height - 20) this.vy -= 0.5;
    }

    draw() {
        const wingAngle = this.isResting ? 0.1 : Math.sin(this.wingPhase) * 0.8;
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(wingAngle);
        ctx.fillStyle = this.color1;
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.2, -this.size * 0.4, this.size * 0.5, this.size * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.color2;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.1, -this.size * 0.25, this.size * 0.35, this.size * 0.25, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.rotate(-wingAngle);
        ctx.fillStyle = this.color1;
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.2, this.size * 0.4, this.size * 0.5, this.size * 0.35, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.color2;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.1, this.size * 0.25, this.size * 0.35, this.size * 0.25, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size * 0.3, 0);
        ctx.quadraticCurveTo(this.size * 0.5, -this.size * 0.2, this.size * 0.4, -this.size * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.size * 0.3, 0);
        ctx.quadraticCurveTo(this.size * 0.5, this.size * 0.2, this.size * 0.4, this.size * 0.3);
        ctx.stroke();

        ctx.restore();
    }
}

function init() {
    butterflies.length = 0;
    for (let i = 0; i < 8; i++) {
        butterflies.push(new Butterfly());
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
        const x = 50 + i * 80;
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x - 2, canvas.height - 60, 4, 60);

        ctx.fillStyle = ['#FF69B4', '#FFD700', '#FF6347', '#9370DB', '#00CED1'][i];
        for (let j = 0; j < 5; j++) {
            const angle = (j / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle) * 8, canvas.height - 70 + Math.sin(angle) * 8, 6, 4, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x, canvas.height - 70, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    drawBackground();
    butterflies.forEach(b => {
        b.update();
        b.draw();
    });
    requestAnimationFrame(animate);
}

document.getElementById('addBtn').addEventListener('click', () => {
    butterflies.push(new Butterfly(canvas.width / 2, canvas.height / 2));
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    butterflies.push(new Butterfly(x, y));
});

init();
animate();
