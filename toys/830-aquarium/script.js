const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const fish = [];
const bubbles = [];
const plants = [];

class Fish {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 50 + Math.random() * 200;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 10 + Math.random() * 15;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.finColor = `hsl(${Math.random() * 360}, 60%, 40%)`;
        this.tailPhase = Math.random() * Math.PI * 2;
        this.direction = this.vx > 0 ? 1 : -1;
    }

    update() {
        this.tailPhase += 0.2;

        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.05;

        this.vx = Math.max(-2, Math.min(2, this.vx));
        this.vy = Math.max(-0.5, Math.min(0.5, this.vy));

        if (Math.abs(this.vx) > 0.1) {
            this.direction = this.vx > 0 ? 1 : -1;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 20) { this.x = 20; this.vx *= -1; }
        if (this.x > canvas.width - 20) { this.x = canvas.width - 20; this.vx *= -1; }
        if (this.y < 30) { this.y = 30; this.vy *= -1; }
        if (this.y > canvas.height - 50) { this.y = canvas.height - 50; this.vy *= -1; }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);

        const tailWag = Math.sin(this.tailPhase) * 0.3;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.finColor;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0);
        ctx.quadraticCurveTo(-this.size * 1.2, -this.size * 0.4 + tailWag * this.size, -this.size * 1.5, tailWag * this.size);
        ctx.quadraticCurveTo(-this.size * 1.2, this.size * 0.4 + tailWag * this.size, -this.size * 0.8, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.2, -this.size * 0.7);
        ctx.lineTo(this.size * 0.2, -this.size * 0.3);
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

class Bubble {
    constructor(x) {
        this.x = x;
        this.y = canvas.height - 30;
        this.size = 2 + Math.random() * 4;
        this.speed = 0.5 + Math.random() * 1;
        this.wobble = Math.random() * Math.PI * 2;
    }

    update() {
        this.wobble += 0.1;
        this.y -= this.speed;
        this.x += Math.sin(this.wobble) * 0.5;

        return this.y > 0;
    }

    draw() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initPlants() {
    plants.length = 0;
    for (let i = 0; i < 8; i++) {
        plants.push({
            x: 20 + i * 45 + Math.random() * 20,
            height: 40 + Math.random() * 40,
            width: 15 + Math.random() * 10,
            color: `hsl(${100 + Math.random() * 40}, 50%, ${25 + Math.random() * 15}%)`,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function init() {
    fish.length = 0;
    for (let i = 0; i < 6; i++) {
        fish.push(new Fish());
    }
    initPlants();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#006994');
    gradient.addColorStop(1, '#004466');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
        const y = 20 + i * 15;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.03 - i * 0.005})`;
        ctx.fillRect(0, y, canvas.width, 10);
    }

    ctx.fillStyle = '#c2b280';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(139, 119, 101, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(
            Math.random() * canvas.width,
            canvas.height - 15 + Math.random() * 10,
            3 + Math.random() * 5,
            2 + Math.random() * 3,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawPlants(time) {
    plants.forEach(plant => {
        const sway = Math.sin(time * 0.002 + plant.phase) * 5;

        ctx.fillStyle = plant.color;
        ctx.beginPath();
        ctx.moveTo(plant.x - plant.width / 2, canvas.height - 30);
        ctx.quadraticCurveTo(
            plant.x + sway,
            canvas.height - 30 - plant.height / 2,
            plant.x + sway * 1.5,
            canvas.height - 30 - plant.height
        );
        ctx.quadraticCurveTo(
            plant.x + sway,
            canvas.height - 30 - plant.height / 2,
            plant.x + plant.width / 2,
            canvas.height - 30
        );
        ctx.fill();
    });
}

function animate(time) {
    drawBackground();
    drawPlants(time);

    if (Math.random() < 0.02) {
        bubbles.push(new Bubble(Math.random() * canvas.width));
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
        if (!bubbles[i].update()) {
            bubbles.splice(i, 1);
        } else {
            bubbles[i].draw();
        }
    }

    fish.forEach(f => {
        f.update();
        f.draw();
    });

    requestAnimationFrame(animate);
}

document.getElementById('addFishBtn').addEventListener('click', () => {
    if (fish.length < 15) {
        fish.push(new Fish());
    }
});

init();
animate(0);
