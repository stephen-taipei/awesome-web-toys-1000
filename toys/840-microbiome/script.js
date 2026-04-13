const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let bacteria = [];
let nutrients = [];

class Bacterium {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type || Math.floor(Math.random() * 4);
        this.size = 4 + Math.random() * 4;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.energy = 50 + Math.random() * 50;
        this.flagellaPhase = Math.random() * Math.PI * 2;

        const colors = ['#00CED1', '#FF69B4', '#98FB98', '#DDA0DD'];
        this.color = colors[this.type];
    }

    update() {
        this.flagellaPhase += 0.3;

        let nearestNutrient = null;
        let minDist = 60;

        nutrients.forEach(n => {
            const d = Math.sqrt(Math.pow(this.x - n.x, 2) + Math.pow(this.y - n.y, 2));
            if (d < minDist) {
                minDist = d;
                nearestNutrient = n;
            }
        });

        if (nearestNutrient) {
            this.vx += (nearestNutrient.x - this.x) * 0.01;
            this.vy += (nearestNutrient.y - this.y) * 0.01;
        } else {
            this.vx += (Math.random() - 0.5) * 0.2;
            this.vy += (Math.random() - 0.5) * 0.2;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 2;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < this.size) { this.x = this.size; this.vx *= -1; }
        if (this.x > canvas.width - this.size) { this.x = canvas.width - this.size; this.vx *= -1; }
        if (this.y < this.size) { this.y = this.size; this.vy *= -1; }
        if (this.y > canvas.height - this.size) { this.y = canvas.height - this.size; this.vy *= -1; }

        this.energy -= 0.1;

        for (let i = nutrients.length - 1; i >= 0; i--) {
            const n = nutrients[i];
            const d = Math.sqrt(Math.pow(this.x - n.x, 2) + Math.pow(this.y - n.y, 2));
            if (d < this.size + n.size) {
                this.energy += 30;
                nutrients.splice(i, 1);
            }
        }
    }

    draw() {
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        if (this.type === 0) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 1.5, this.size, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            const flagellaWave = Math.sin(this.flagellaPhase) * 3;
            ctx.beginPath();
            ctx.moveTo(-this.size * 1.5, 0);
            ctx.quadraticCurveTo(-this.size * 2, flagellaWave, -this.size * 3, flagellaWave * 2);
            ctx.stroke();
        } else if (this.type === 1) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + this.flagellaPhase * 0.5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * this.size, Math.sin(a) * this.size);
                ctx.lineTo(Math.cos(a) * this.size * 2, Math.sin(a) * this.size * 2);
                ctx.stroke();
            }
        } else if (this.type === 2) {
            ctx.fillStyle = this.color;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(i * this.size * 0.8 - this.size * 0.8, 0, this.size * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = this.color;
            const wobble = Math.sin(this.flagellaPhase) * 0.2;
            ctx.beginPath();
            ctx.moveTo(this.size, 0);
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const r = this.size * (0.8 + Math.sin(a * 3 + this.flagellaPhase) * 0.2);
                ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

function init() {
    bacteria = [];
    nutrients = [];

    for (let i = 0; i < 20; i++) {
        bacteria.push(new Bacterium(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }

    for (let i = 0; i < 15; i++) {
        addNutrient();
    }
}

function addNutrient() {
    nutrients.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 3 + Math.random() * 3
    });
}

function reproduce() {
    const newBacteria = [];

    bacteria.forEach(b => {
        if (b.energy > 100 && bacteria.length + newBacteria.length < 50) {
            b.energy -= 40;
            newBacteria.push(new Bacterium(
                b.x + (Math.random() - 0.5) * 20,
                b.y + (Math.random() - 0.5) * 20,
                b.type
            ));
        }
    });

    bacteria.push(...newBacteria);

    for (let i = bacteria.length - 1; i >= 0; i--) {
        if (bacteria[i].energy <= 0) {
            bacteria.splice(i, 1);
        }
    }
}

function drawBackground() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(0, 100, 100, ${0.05 + Math.random() * 0.05})`;
        ctx.lineWidth = 50;
        ctx.beginPath();
        ctx.arc(
            canvas.width / 2 + (Math.random() - 0.5) * 100,
            canvas.height / 2 + (Math.random() - 0.5) * 100,
            50 + i * 40,
            0, Math.PI * 2
        );
        ctx.stroke();
    }
}

function drawNutrients() {
    nutrients.forEach(n => {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawStats() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(5, 5, 80, 35);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`細菌: ${bacteria.length}`, 10, 18);
    ctx.fillText(`養分: ${nutrients.length}`, 10, 33);
}

function animate() {
    drawBackground();
    drawNutrients();

    bacteria.forEach(b => {
        b.update();
        b.draw();
    });

    if (Math.random() < 0.02) addNutrient();
    if (Math.random() < 0.05) reproduce();

    drawStats();
    requestAnimationFrame(animate);
}

document.getElementById('feedBtn').addEventListener('click', () => {
    for (let i = 0; i < 10; i++) {
        addNutrient();
    }
});

init();
animate();
