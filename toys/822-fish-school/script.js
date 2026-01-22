const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const fish = [];
const food = [];
let target = null;

class Fish {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = 8 + Math.random() * 6;
        this.color = `hsl(${180 + Math.random() * 40}, 70%, 50%)`;
        this.tailPhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.tailPhase += 0.3;

        let nearestFood = null;
        let minDist = 100;
        food.forEach(f => {
            const d = Math.sqrt(Math.pow(this.x - f.x, 2) + Math.pow(this.y - f.y, 2));
            if (d < minDist) {
                minDist = d;
                nearestFood = f;
            }
        });

        if (nearestFood) {
            this.vx += (nearestFood.x - this.x) * 0.01;
            this.vy += (nearestFood.y - this.y) * 0.01;
        } else if (target) {
            this.vx += (target.x - this.x) * 0.002;
            this.vy += (target.y - this.y) * 0.002;
        }

        fish.forEach(other => {
            if (other === this) return;
            const d = Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
            if (d < 20) {
                this.vx += (this.x - other.x) * 0.02;
                this.vy += (this.y - other.y) * 0.02;
            } else if (d < 60) {
                this.vx += other.vx * 0.05;
                this.vy += other.vy * 0.05;
            }
        });

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
            this.vx = (this.vx / speed) * 3;
            this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -1; }
        if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -1; }
        if (this.y < 0) { this.y = 0; this.vy *= -1; }
        if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -1; }
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const tailWag = Math.sin(this.tailPhase) * 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.lineTo(-this.size * 1.5, -this.size * 0.4 + tailWag * this.size);
        ctx.lineTo(-this.size * 1.5, this.size * 0.4 + tailWag * this.size);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.size * 0.4, -this.size * 0.1, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.size * 0.45, -this.size * 0.1, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function init() {
    fish.length = 0;
    for (let i = 0; i < 20; i++) {
        fish.push(new Fish());
    }
}

function addFood(x, y) {
    for (let i = 0; i < 5; i++) {
        food.push({
            x: x + (Math.random() - 0.5) * 30,
            y: y + (Math.random() - 0.5) * 30,
            life: 200
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(1, '#004d6d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
        ctx.beginPath();
        ctx.arc(
            Math.sin(Date.now() * 0.001 + i) * 20 + (i * 20),
            (Date.now() * 0.02 + i * 50) % (canvas.height + 20) - 10,
            2 + Math.random() * 2,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawFood() {
    food.forEach((f, i) => {
        f.y += 0.3;
        f.life--;

        ctx.fillStyle = `rgba(139, 69, 19, ${f.life / 200})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    for (let i = food.length - 1; i >= 0; i--) {
        if (food[i].life <= 0) food.splice(i, 1);
        fish.forEach(f => {
            const d = Math.sqrt(Math.pow(f.x - food[i]?.x, 2) + Math.pow(f.y - food[i]?.y, 2));
            if (d < 15 && food[i]) {
                food.splice(i, 1);
            }
        });
    }
}

function animate() {
    drawBackground();
    drawFood();
    fish.forEach(f => {
        f.update();
        f.draw();
    });
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    target = {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
    setTimeout(() => target = null, 2000);
});

document.getElementById('feedBtn').addEventListener('click', () => {
    addFood(canvas.width / 2, 50);
});

init();
animate();
