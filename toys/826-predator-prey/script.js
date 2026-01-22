const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let predators = [];
let prey = [];

class Creature {
    constructor(x, y, isPredator) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.isPredator = isPredator;
        this.size = isPredator ? 12 : 8;
        this.maxSpeed = isPredator ? 2.5 : 3;
        this.energy = 100;
    }

    update() {
        if (this.isPredator) {
            let nearestPrey = null;
            let minDist = 150;

            prey.forEach(p => {
                const d = Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
                if (d < minDist) {
                    minDist = d;
                    nearestPrey = p;
                }
            });

            if (nearestPrey) {
                this.vx += (nearestPrey.x - this.x) * 0.01;
                this.vy += (nearestPrey.y - this.y) * 0.01;
            } else {
                this.vx += (Math.random() - 0.5) * 0.2;
                this.vy += (Math.random() - 0.5) * 0.2;
            }

            this.energy -= 0.1;
        } else {
            let nearestPredator = null;
            let minDist = 100;

            predators.forEach(p => {
                const d = Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
                if (d < minDist) {
                    minDist = d;
                    nearestPredator = p;
                }
            });

            if (nearestPredator) {
                this.vx -= (nearestPredator.x - this.x) * 0.02;
                this.vy -= (nearestPredator.y - this.y) * 0.02;
            } else {
                this.vx += (Math.random() - 0.5) * 0.1;
                this.vy += (Math.random() - 0.5) * 0.1;
            }

            prey.forEach(other => {
                if (other === this) return;
                const d = Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
                if (d < 30) {
                    this.vx += (this.x - other.x) * 0.01;
                    this.vy += (this.y - other.y) * 0.01;
                }
            });
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 10) { this.x = 10; this.vx *= -0.5; }
        if (this.x > canvas.width - 10) { this.x = canvas.width - 10; this.vx *= -0.5; }
        if (this.y < 10) { this.y = 10; this.vy *= -0.5; }
        if (this.y > canvas.height - 10) { this.y = canvas.height - 10; this.vy *= -0.5; }
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        if (this.isPredator) {
            ctx.fillStyle = '#DC143C';
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            ctx.lineTo(-this.size, -this.size * 0.6);
            ctx.lineTo(-this.size * 0.5, 0);
            ctx.lineTo(-this.size, this.size * 0.6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(this.size * 0.3, -2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#90EE90';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(this.size * 0.4, -1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function init() {
    predators = [];
    prey = [];

    for (let i = 0; i < 3; i++) {
        predators.push(new Creature(Math.random() * canvas.width, Math.random() * canvas.height, true));
    }

    for (let i = 0; i < 20; i++) {
        prey.push(new Creature(Math.random() * canvas.width, Math.random() * canvas.height, false));
    }
}

function checkCollisions() {
    predators.forEach(predator => {
        for (let i = prey.length - 1; i >= 0; i--) {
            const p = prey[i];
            const d = Math.sqrt(Math.pow(predator.x - p.x, 2) + Math.pow(predator.y - p.y, 2));
            if (d < predator.size) {
                prey.splice(i, 1);
                predator.energy = Math.min(150, predator.energy + 50);
            }
        }
    });

    if (prey.length < 5 && Math.random() < 0.02) {
        prey.push(new Creature(
            Math.random() * canvas.width,
            Math.random() < 0.5 ? 10 : canvas.height - 10,
            false
        ));
    }

    for (let i = predators.length - 1; i >= 0; i--) {
        if (predators[i].energy <= 0) {
            predators.splice(i, 1);
        }
    }

    if (predators.length < 2 && prey.length > 10) {
        predators.push(new Creature(Math.random() * canvas.width, Math.random() * canvas.height, true));
    }
}

function drawBackground() {
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(34, 139, 34, ${0.2 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 2 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 100, 40);

    ctx.fillStyle = '#DC143C';
    ctx.font = '12px Arial';
    ctx.fillText(`掠食者: ${predators.length}`, 10, 20);

    ctx.fillStyle = '#90EE90';
    ctx.fillText(`獵物: ${prey.length}`, 10, 38);
}

function animate() {
    drawBackground();

    predators.forEach(p => {
        p.update();
        p.draw();
    });

    prey.forEach(p => {
        p.update();
        p.draw();
    });

    checkCollisions();
    drawStats();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
