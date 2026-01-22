const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const hive = { x: 50, y: 50 };
const bees = [];
const flowers = [];

class Bee {
    constructor() {
        this.x = hive.x;
        this.y = hive.y;
        this.vx = 0;
        this.vy = 0;
        this.hasNectar = false;
        this.targetFlower = null;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.state = 'searching';
    }

    update() {
        this.wingPhase += 0.5;

        if (this.state === 'searching') {
            if (flowers.length > 0 && !this.targetFlower) {
                const availableFlowers = flowers.filter(f => f.nectar > 0);
                if (availableFlowers.length > 0) {
                    this.targetFlower = availableFlowers[Math.floor(Math.random() * availableFlowers.length)];
                    this.state = 'toFlower';
                }
            }
            this.vx += (Math.random() - 0.5) * 0.5;
            this.vy += (Math.random() - 0.5) * 0.5;
        } else if (this.state === 'toFlower' && this.targetFlower) {
            const dx = this.targetFlower.x - this.x;
            const dy = this.targetFlower.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10) {
                if (this.targetFlower.nectar > 0) {
                    this.targetFlower.nectar--;
                    this.hasNectar = true;
                    this.state = 'toHive';
                } else {
                    this.targetFlower = null;
                    this.state = 'searching';
                }
            } else {
                this.vx += dx / dist * 0.3;
                this.vy += dy / dist * 0.3;
            }
        } else if (this.state === 'toHive') {
            const dx = hive.x - this.x;
            const dy = hive.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 15) {
                this.hasNectar = false;
                this.targetFlower = null;
                this.state = 'searching';
            } else {
                this.vx += dx / dist * 0.3;
                this.vy += dy / dist * 0.3;
            }
        }

        this.vx *= 0.95;
        this.vy *= 0.95;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
            this.vx = (this.vx / speed) * 3;
            this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        this.x = Math.max(10, Math.min(canvas.width - 10, this.x));
        this.y = Math.max(10, Math.min(canvas.height - 10, this.y));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const angle = Math.atan2(this.vy, this.vx);
        ctx.rotate(angle);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(-4 + i * 3, -4, 1.5, 8);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const wingY = Math.sin(this.wingPhase) * 3;
        ctx.beginPath();
        ctx.ellipse(-2, -5 + wingY, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-2, 5 - wingY, 4, 2, 0.3, 0, Math.PI * 2);
        ctx.fill();

        if (this.hasNectar) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(6, 0, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function init() {
    bees.length = 0;
    flowers.length = 0;

    for (let i = 0; i < 15; i++) {
        bees.push(new Bee());
    }

    for (let i = 0; i < 5; i++) {
        addFlower(100 + Math.random() * 250, 100 + Math.random() * 180);
    }
}

function addFlower(x, y) {
    flowers.push({
        x, y,
        nectar: 10,
        color: `hsl(${Math.random() * 60 + 300}, 70%, 60%)`,
        size: 10 + Math.random() * 5
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHive() {
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.moveTo(hive.x, hive.y - 25);
    ctx.lineTo(hive.x + 25, hive.y);
    ctx.lineTo(hive.x + 20, hive.y + 25);
    ctx.lineTo(hive.x - 20, hive.y + 25);
    ctx.lineTo(hive.x - 25, hive.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(hive.x, hive.y + 15, 8, 0, Math.PI);
    ctx.fill();
}

function drawFlowers() {
    flowers.forEach(flower => {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(flower.x - 2, flower.y, 4, 30);

        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.fillStyle = flower.color;
            ctx.beginPath();
            ctx.ellipse(
                flower.x + Math.cos(angle) * flower.size * 0.5,
                flower.y + Math.sin(angle) * flower.size * 0.5,
                flower.size * 0.4, flower.size * 0.25,
                angle, 0, Math.PI * 2
            );
            ctx.fill();
        }

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(flower.x, flower.y, flower.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        if (flower.nectar > 0) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(flower.x, flower.y, flower.nectar, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function animate() {
    drawBackground();
    drawFlowers();
    drawHive();
    bees.forEach(bee => {
        bee.update();
        bee.draw();
    });
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    addFlower(x, y);
});

document.getElementById('flowerBtn').addEventListener('click', () => {
    addFlower(100 + Math.random() * 250, 100 + Math.random() * 180);
});

init();
animate();
