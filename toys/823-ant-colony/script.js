const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const nest = { x: canvas.width / 2, y: canvas.height / 2 };
const ants = [];
const pheromones = [];
const foodSources = [];

class Ant {
    constructor() {
        this.x = nest.x;
        this.y = nest.y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1 + Math.random() * 0.5;
        this.hasFood = false;
        this.wanderStrength = 0.3;
    }

    update() {
        if (this.hasFood) {
            const angleToNest = Math.atan2(nest.y - this.y, nest.x - this.x);
            this.angle += (angleToNest - this.angle) * 0.1;

            pheromones.push({
                x: this.x,
                y: this.y,
                type: 'food',
                strength: 1
            });

            const distToNest = Math.sqrt(Math.pow(this.x - nest.x, 2) + Math.pow(this.y - nest.y, 2));
            if (distToNest < 10) {
                this.hasFood = false;
            }
        } else {
            let foundPheromone = false;
            pheromones.forEach(p => {
                if (p.type === 'food') {
                    const dist = Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
                    if (dist < 20 && p.strength > 0.3) {
                        const angleToP = Math.atan2(p.y - this.y, p.x - this.x);
                        this.angle += (angleToP - this.angle) * 0.05 * p.strength;
                        foundPheromone = true;
                    }
                }
            });

            if (!foundPheromone) {
                this.angle += (Math.random() - 0.5) * this.wanderStrength;
            }

            foodSources.forEach((food, i) => {
                const dist = Math.sqrt(Math.pow(this.x - food.x, 2) + Math.pow(this.y - food.y, 2));
                if (dist < 15) {
                    this.hasFood = true;
                    food.amount--;
                    if (food.amount <= 0) {
                        foodSources.splice(i, 1);
                    }
                }
            });
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > canvas.width) this.angle = Math.PI - this.angle;
        if (this.y < 0 || this.y > canvas.height) this.angle = -this.angle;

        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.hasFood ? '#228B22' : '#2F1810';
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(4, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function init() {
    ants.length = 0;
    for (let i = 0; i < 30; i++) {
        ants.push(new Ant());
    }
}

function updatePheromones() {
    for (let i = pheromones.length - 1; i >= 0; i--) {
        pheromones[i].strength -= 0.005;
        if (pheromones[i].strength <= 0) {
            pheromones.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#C4A484';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(139, 119, 101, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawNest() {
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    ctx.arc(nest.x, nest.y, 8, 0, Math.PI * 2);
    ctx.fill();
}

function drawPheromones() {
    pheromones.forEach(p => {
        if (p.type === 'food') {
            ctx.fillStyle = `rgba(0, 255, 0, ${p.strength * 0.3})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawFood() {
    foodSources.forEach(food => {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(food.x, food.y, 8 + food.amount * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(food.x - 2, food.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function addFood(x, y) {
    foodSources.push({ x, y, amount: 20 });
}

function animate() {
    drawBackground();
    drawPheromones();
    drawNest();
    drawFood();
    updatePheromones();
    ants.forEach(ant => {
        ant.update();
        ant.draw();
    });
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    addFood(x, y);
});

document.getElementById('foodBtn').addEventListener('click', () => {
    addFood(Math.random() * canvas.width, Math.random() * canvas.height);
});

init();
animate();
