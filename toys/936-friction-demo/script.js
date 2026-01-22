const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const surfaces = [
    { name: '冰面', friction: 0.02, color: '#81D4FA', y: 60 },
    { name: '木板', friction: 0.1, color: '#A1887F', y: 130 },
    { name: '砂紙', friction: 0.3, color: '#FFE082', y: 200 }
];

let blocks = [];
let time = 0;

class Block {
    constructor(surface) {
        this.surface = surface;
        this.x = 40;
        this.y = surface.y;
        this.width = 40;
        this.height = 30;
        this.vx = 0;
    }

    push() {
        this.x = 40;
        this.vx = 10;
    }

    update() {
        if (this.vx > 0) {
            this.vx -= this.surface.friction;
            if (this.vx < 0) this.vx = 0;
        }

        this.x += this.vx;

        if (this.x + this.width > canvas.width - 20) {
            this.x = canvas.width - 20 - this.width;
            this.vx = 0;
        }
    }

    draw() {
        ctx.fillStyle = '#FF9800';
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);

        ctx.fillStyle = '#FFB74D';
        ctx.fillRect(this.x + 5, this.y - this.height + 5, this.width - 10, 10);

        ctx.strokeStyle = '#E65100';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y - this.height, this.width, this.height);

        if (this.vx > 0) {
            ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
            const trailLength = this.vx * 10;
            ctx.fillRect(this.x - trailLength, this.y - this.height, trailLength, this.height);
        }
    }
}

function init() {
    blocks = surfaces.map(s => new Block(s));
}

function push() {
    blocks.forEach(b => b.push());
}

function drawSurfaces() {
    surfaces.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.fillRect(20, s.y, canvas.width - 40, 20);

        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, s.y, canvas.width - 40, 20);

        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${s.name} (μ=${s.friction})`, canvas.width - 30, s.y + 14);
    });
}

function drawArrow() {
    const arrowX = 20;

    surfaces.forEach(s => {
        ctx.fillStyle = 'rgba(255, 152, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(arrowX, s.y - 15);
        ctx.lineTo(arrowX + 20, s.y - 15);
        ctx.lineTo(arrowX + 20, s.y - 20);
        ctx.lineTo(arrowX + 30, s.y - 12);
        ctx.lineTo(arrowX + 20, s.y - 4);
        ctx.lineTo(arrowX + 20, s.y - 9);
        ctx.lineTo(arrowX, s.y - 9);
        ctx.closePath();
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 30);

    ctx.fillStyle = '#FF9800';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('摩擦力演示', 20, 28);
}

function drawVelocityBars() {
    blocks.forEach((b, i) => {
        const barWidth = b.vx * 15;
        ctx.fillStyle = `rgba(255, 152, 0, ${0.3 + b.vx * 0.07})`;
        ctx.fillRect(b.x + b.width + 5, b.y - b.height / 2 - 3, barWidth, 6);

        if (b.vx > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = '9px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`v=${b.vx.toFixed(1)}`, b.x + b.width + barWidth + 8, b.y - b.height / 2 + 2);
        }
    });
}

function animate() {
    time++;
    ctx.fillStyle = '#1a0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSurfaces();
    drawArrow();

    blocks.forEach(b => {
        b.update();
        b.draw();
    });

    drawVelocityBars();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('pushBtn').addEventListener('click', push);

init();
animate();
