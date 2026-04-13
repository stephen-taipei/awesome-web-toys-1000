const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let creatures = [];
let food = [];
let generation = 1;

class Creature {
    constructor(x, y, genes = null) {
        this.x = x;
        this.y = y;
        this.genes = genes || {
            speed: 0.5 + Math.random() * 2,
            size: 5 + Math.random() * 10,
            senseRange: 30 + Math.random() * 70,
            hue: Math.random() * 360
        };
        this.vx = (Math.random() - 0.5) * this.genes.speed;
        this.vy = (Math.random() - 0.5) * this.genes.speed;
        this.energy = 100;
        this.age = 0;
    }

    mutate() {
        return {
            speed: Math.max(0.3, this.genes.speed + (Math.random() - 0.5) * 0.3),
            size: Math.max(3, Math.min(15, this.genes.size + (Math.random() - 0.5) * 2)),
            senseRange: Math.max(20, Math.min(100, this.genes.senseRange + (Math.random() - 0.5) * 10)),
            hue: (this.genes.hue + (Math.random() - 0.5) * 20 + 360) % 360
        };
    }

    update() {
        this.age++;

        let nearestFood = null;
        let minDist = this.genes.senseRange;

        food.forEach(f => {
            const d = Math.sqrt(Math.pow(this.x - f.x, 2) + Math.pow(this.y - f.y, 2));
            if (d < minDist) {
                minDist = d;
                nearestFood = f;
            }
        });

        if (nearestFood) {
            const dx = nearestFood.x - this.x;
            const dy = nearestFood.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.vx += (dx / dist) * 0.1;
            this.vy += (dy / dist) * 0.1;
        } else {
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vy += (Math.random() - 0.5) * 0.1;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.genes.speed) {
            this.vx = (this.vx / speed) * this.genes.speed;
            this.vy = (this.vy / speed) * this.genes.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < this.genes.size) { this.x = this.genes.size; this.vx *= -1; }
        if (this.x > canvas.width - this.genes.size) { this.x = canvas.width - this.genes.size; this.vx *= -1; }
        if (this.y < this.genes.size) { this.y = this.genes.size; this.vy *= -1; }
        if (this.y > canvas.height - this.genes.size) { this.y = canvas.height - this.genes.size; this.vy *= -1; }

        this.energy -= 0.1 + this.genes.speed * 0.05 + this.genes.size * 0.02;

        for (let i = food.length - 1; i >= 0; i--) {
            const f = food[i];
            const d = Math.sqrt(Math.pow(this.x - f.x, 2) + Math.pow(this.y - f.y, 2));
            if (d < this.genes.size + 5) {
                this.energy += 40;
                food.splice(i, 1);
            }
        }
    }

    draw() {
        ctx.fillStyle = `hsl(${this.genes.hue}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.genes.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsla(${this.genes.hue}, 70%, 50%, 0.2)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.genes.senseRange, 0, Math.PI * 2);
        ctx.stroke();

        const healthWidth = (this.genes.size * 2) * (this.energy / 150);
        ctx.fillStyle = this.energy > 50 ? '#4CAF50' : '#f44336';
        ctx.fillRect(this.x - this.genes.size, this.y - this.genes.size - 5, healthWidth, 3);
    }
}

function init() {
    creatures = [];
    food = [];
    generation = 1;

    for (let i = 0; i < 15; i++) {
        creatures.push(new Creature(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    for (let i = 0; i < 30; i++) {
        spawnFood();
    }
}

function spawnFood() {
    food.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    });
}

function reproduce() {
    const newCreatures = [];

    creatures.forEach(c => {
        if (c.energy > 120) {
            c.energy -= 50;
            newCreatures.push(new Creature(
                c.x + (Math.random() - 0.5) * 20,
                c.y + (Math.random() - 0.5) * 20,
                c.mutate()
            ));
        }
    });

    creatures.push(...newCreatures);
}

function cull() {
    for (let i = creatures.length - 1; i >= 0; i--) {
        if (creatures[i].energy <= 0 || creatures[i].age > 2000) {
            creatures.splice(i, 1);
        }
    }

    if (creatures.length === 0) {
        generation++;
        for (let i = 0; i < 10; i++) {
            creatures.push(new Creature(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            ));
        }
    }
}

function drawFood() {
    ctx.fillStyle = '#90EE90';
    food.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 100, 50);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`世代: ${generation}`, 10, 20);
    ctx.fillText(`生物: ${creatures.length}`, 10, 35);
    ctx.fillText(`食物: ${food.length}`, 10, 50);
}

function animate() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.05) spawnFood();
    if (food.length > 50) food.shift();

    drawFood();

    creatures.forEach(c => {
        c.update();
        c.draw();
    });

    reproduce();
    cull();
    drawStats();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
