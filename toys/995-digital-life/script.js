const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let generation = 1;
let cells = [];
let connections = [];

class DigitalCell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.size = Math.random() * 5 + 3;
        this.energy = Math.random() * 100 + 50;
        this.hue = Math.random() * 60 + 100;
        this.pulse = Math.random() * Math.PI * 2;
        this.age = 0;
    }

    update() {
        this.x += (this.targetX - this.x) * 0.05;
        this.y += (this.targetY - this.y) * 0.05;

        if (Math.random() < 0.02) {
            this.targetX = Math.random() * (canvas.width - 40) + 20;
            this.targetY = Math.random() * (canvas.height - 40) + 20;
        }

        this.energy -= 0.1;
        this.age++;
        this.pulse += 0.1;

        if (this.energy < 0) {
            return false;
        }
        return true;
    }

    draw() {
        const pulseSize = this.size + Math.sin(this.pulse) * 2;

        const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, pulseSize * 3);
        glow.addColorStop(0, `hsla(${this.hue}, 80%, 60%, 0.5)`);
        glow.addColorStop(0.5, `hsla(${this.hue}, 80%, 40%, 0.2)`);
        glow.addColorStop(1, 'transparent');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 80%, 60%)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y - pulseSize * 0.3, pulseSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }
}

function init() {
    cells = [];
    for (let i = 0; i < 20; i++) {
        cells.push(new DigitalCell(
            Math.random() * (canvas.width - 40) + 20,
            Math.random() * (canvas.height - 40) + 20
        ));
    }
    generation = 1;
}

function evolve() {
    generation++;

    cells.forEach(cell => {
        cell.hue = (cell.hue + 20) % 360;
        cell.energy = Math.min(150, cell.energy + 30);
        cell.size = Math.min(12, cell.size * 1.1);
    });

    if (cells.length < 30) {
        for (let i = 0; i < 5; i++) {
            const parent = cells[Math.floor(Math.random() * cells.length)];
            if (parent) {
                cells.push(new DigitalCell(
                    parent.x + (Math.random() - 0.5) * 50,
                    parent.y + (Math.random() - 0.5) * 50
                ));
            }
        }
    }
}

function findConnections() {
    connections = [];
    for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
            const dx = cells[i].x - cells[j].x;
            const dy = cells[i].y - cells[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 80) {
                connections.push({
                    a: cells[i],
                    b: cells[j],
                    strength: 1 - dist / 80
                });
            }
        }
    }
}

function draw() {
    ctx.fillStyle = '#001000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.width; i += 20) {
        ctx.strokeStyle = 'rgba(0, 230, 118, 0.05)';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    findConnections();

    connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.a.x, conn.a.y);
        ctx.lineTo(conn.b.x, conn.b.y);
        ctx.strokeStyle = `rgba(0, 230, 118, ${conn.strength * 0.5})`;
        ctx.lineWidth = conn.strength * 2;
        ctx.stroke();

        const pulse = Math.sin(time * 0.1) * 0.5 + 0.5;
        const px = conn.a.x + (conn.b.x - conn.a.x) * pulse;
        const py = conn.a.y + (conn.b.y - conn.a.y) * pulse;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00E676';
        ctx.fill();
    });

    cells = cells.filter(cell => cell.update());
    cells.forEach(cell => cell.draw());

    ctx.fillStyle = 'rgba(0, 230, 118, 0.8)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`世代: ${generation}`, 10, 20);
    ctx.fillText(`生命體: ${cells.length}`, 10, 35);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('evolveBtn').addEventListener('click', evolve);

init();
animate();
