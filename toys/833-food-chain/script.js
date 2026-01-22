const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let grass = [];
let rabbits = [];
let foxes = [];

class Grass {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5 + Math.random() * 10;
        this.growth = Math.random();
    }

    update() {
        if (this.growth < 1) {
            this.growth += 0.005;
        }
    }

    draw() {
        ctx.fillStyle = `hsl(100, 50%, ${30 + this.growth * 20}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.growth, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Rabbit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.energy = 100;
        this.size = 8;
    }

    update() {
        let nearestGrass = null;
        let minDist = 80;

        grass.forEach(g => {
            if (g.growth > 0.5) {
                const d = Math.sqrt(Math.pow(this.x - g.x, 2) + Math.pow(this.y - g.y, 2));
                if (d < minDist) {
                    minDist = d;
                    nearestGrass = g;
                }
            }
        });

        let nearestFox = null;
        let foxDist = 60;
        foxes.forEach(f => {
            const d = Math.sqrt(Math.pow(this.x - f.x, 2) + Math.pow(this.y - f.y, 2));
            if (d < foxDist) {
                foxDist = d;
                nearestFox = f;
            }
        });

        if (nearestFox) {
            this.vx -= (nearestFox.x - this.x) * 0.05;
            this.vy -= (nearestFox.y - this.y) * 0.05;
        } else if (nearestGrass) {
            this.vx += (nearestGrass.x - this.x) * 0.01;
            this.vy += (nearestGrass.y - this.y) * 0.01;
        } else {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
            this.vx = (this.vx / speed) * 3;
            this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 10) this.x = 10;
        if (this.x > canvas.width - 10) this.x = canvas.width - 10;
        if (this.y < 10) this.y = 10;
        if (this.y > canvas.height - 10) this.y = canvas.height - 10;

        this.energy -= 0.2;

        grass.forEach((g, i) => {
            if (g.growth > 0.5) {
                const d = Math.sqrt(Math.pow(this.x - g.x, 2) + Math.pow(this.y - g.y, 2));
                if (d < this.size + g.size) {
                    this.energy += 30;
                    g.growth = 0;
                }
            }
        });
    }

    draw() {
        ctx.fillStyle = '#DDD';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.x - 3, this.y - 8, 3, 6, -0.3, 0, Math.PI * 2);
        ctx.ellipse(this.x + 3, this.y - 8, 3, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Fox {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.energy = 100;
        this.size = 12;
    }

    update() {
        let nearestRabbit = null;
        let minDist = 100;

        rabbits.forEach(r => {
            const d = Math.sqrt(Math.pow(this.x - r.x, 2) + Math.pow(this.y - r.y, 2));
            if (d < minDist) {
                minDist = d;
                nearestRabbit = r;
            }
        });

        if (nearestRabbit) {
            this.vx += (nearestRabbit.x - this.x) * 0.02;
            this.vy += (nearestRabbit.y - this.y) * 0.02;
        } else {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2.5) {
            this.vx = (this.vx / speed) * 2.5;
            this.vy = (this.vy / speed) * 2.5;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 10) this.x = 10;
        if (this.x > canvas.width - 10) this.x = canvas.width - 10;
        if (this.y < 10) this.y = 10;
        if (this.y > canvas.height - 10) this.y = canvas.height - 10;

        this.energy -= 0.15;

        for (let i = rabbits.length - 1; i >= 0; i--) {
            const r = rabbits[i];
            const d = Math.sqrt(Math.pow(this.x - r.x, 2) + Math.pow(this.y - r.y, 2));
            if (d < this.size) {
                this.energy += 50;
                rabbits.splice(i, 1);
            }
        }
    }

    draw() {
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y - 6);
        ctx.lineTo(this.x - 8, this.y - 12);
        ctx.lineTo(this.x - 2, this.y - 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y - 6);
        ctx.lineTo(this.x + 8, this.y - 12);
        ctx.lineTo(this.x + 2, this.y - 6);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(this.x + this.size, this.y, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    grass = [];
    rabbits = [];
    foxes = [];

    for (let i = 0; i < 40; i++) {
        grass.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    for (let i = 0; i < 10; i++) {
        rabbits.push(new Rabbit(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    for (let i = 0; i < 2; i++) {
        foxes.push(new Fox(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function spawnEntities() {
    if (grass.length < 50 && Math.random() < 0.05) {
        grass.push(new Grass(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    if (rabbits.length > 3 && rabbits.length < 20 && Math.random() < 0.01) {
        const parent = rabbits[Math.floor(Math.random() * rabbits.length)];
        if (parent.energy > 80) {
            rabbits.push(new Rabbit(parent.x + (Math.random() - 0.5) * 20, parent.y + (Math.random() - 0.5) * 20));
            parent.energy -= 30;
        }
    }

    if (foxes.length > 0 && foxes.length < 5 && Math.random() < 0.005) {
        const parent = foxes[Math.floor(Math.random() * foxes.length)];
        if (parent.energy > 100) {
            foxes.push(new Fox(parent.x + (Math.random() - 0.5) * 20, parent.y + (Math.random() - 0.5) * 20));
            parent.energy -= 40;
        }
    }

    for (let i = rabbits.length - 1; i >= 0; i--) {
        if (rabbits[i].energy <= 0) rabbits.splice(i, 1);
    }
    for (let i = foxes.length - 1; i >= 0; i--) {
        if (foxes[i].energy <= 0) foxes.splice(i, 1);
    }
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 80, 50);

    ctx.font = '11px Arial';
    ctx.fillStyle = '#90EE90';
    ctx.fillText(`草: ${grass.length}`, 10, 18);
    ctx.fillStyle = '#DDD';
    ctx.fillText(`兔: ${rabbits.length}`, 10, 33);
    ctx.fillStyle = '#D2691E';
    ctx.fillText(`狐: ${foxes.length}`, 10, 48);
}

function animate() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    grass.forEach(g => { g.update(); g.draw(); });
    rabbits.forEach(r => { r.update(); r.draw(); });
    foxes.forEach(f => { f.update(); f.draw(); });

    spawnEntities();
    drawStats();

    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
