const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let flowers = [];
let time = 0;

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.stemHeight = 0;
        this.maxStemHeight = 60 + Math.random() * 40;
        this.petalSize = 0;
        this.maxPetalSize = 15 + Math.random() * 10;
        this.petals = 5 + Math.floor(Math.random() * 4);
        this.hue = Math.random() * 360;
        this.phase = 0;
        this.rotation = Math.random() * 0.2 - 0.1;
    }

    update() {
        if (this.phase === 0) {
            this.stemHeight += 1.5;
            if (this.stemHeight >= this.maxStemHeight) {
                this.phase = 1;
            }
        } else if (this.phase === 1) {
            this.petalSize += 0.3;
            if (this.petalSize >= this.maxPetalSize) {
                this.phase = 2;
            }
        }
    }

    draw() {
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.quadraticCurveTo(
            this.x + Math.sin(this.rotation) * 20,
            this.y - this.stemHeight / 2,
            this.x + Math.sin(this.rotation) * 10,
            this.y - this.stemHeight
        );
        ctx.stroke();

        if (this.stemHeight > 20) {
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            const leafY = this.y - this.stemHeight * 0.4;
            ctx.ellipse(this.x - 8, leafY, 12, 5, -0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.phase >= 1) {
            const flowerX = this.x + Math.sin(this.rotation) * 10;
            const flowerY = this.y - this.stemHeight;

            for (let i = 0; i < this.petals; i++) {
                const angle = (i / this.petals) * Math.PI * 2;
                const petalX = flowerX + Math.cos(angle) * this.petalSize * 0.5;
                const petalY = flowerY + Math.sin(angle) * this.petalSize * 0.5;

                ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, 0.9)`;
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, this.petalSize, this.petalSize * 0.6, angle, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `hsla(${this.hue + 20}, 80%, 80%, 0.5)`;
                ctx.beginPath();
                ctx.ellipse(petalX, petalY, this.petalSize * 0.5, this.petalSize * 0.3, angle, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, this.petalSize * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(flowerX - 2, flowerY - 2, this.petalSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#e8f5e9');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initFlowers() {
    flowers = [];
    for (let i = 0; i < 7; i++) {
        flowers.push(new Flower(
            50 + i * 50 + Math.random() * 20,
            canvas.height - 20
        ));
    }
}

function animate() {
    drawBackground();

    flowers.forEach(flower => {
        flower.update();
        flower.draw();
    });

    time += 0.02;
    requestAnimationFrame(animate);
}

document.getElementById('bloomBtn').addEventListener('click', initFlowers);

initFlowers();
animate();
