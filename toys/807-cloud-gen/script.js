const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let clouds = [];
let time = 0;

class Cloud {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.2 + Math.random() * 0.3;
        this.puffs = [];
        this.generatePuffs();
    }

    generatePuffs() {
        const numPuffs = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < numPuffs; i++) {
            this.puffs.push({
                offsetX: (Math.random() - 0.5) * 80,
                offsetY: (Math.random() - 0.5) * 30,
                radius: 20 + Math.random() * 30
            });
        }
    }

    update() {
        this.x += this.speed;
        if (this.x > canvas.width + 100) {
            this.x = -100;
            this.y = 30 + Math.random() * 120;
        }
    }

    draw() {
        this.puffs.forEach(puff => {
            const gradient = ctx.createRadialGradient(
                this.x + puff.offsetX, this.y + puff.offsetY, 0,
                this.x + puff.offsetX, this.y + puff.offsetY, puff.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + puff.offsetX, this.y + puff.offsetY, puff.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e90ff');
    gradient.addColorStop(0.5, '#87ceeb');
    gradient.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(50, 50, 25, 0, Math.PI * 2);
    ctx.fill();

    const sunGlow = ctx.createRadialGradient(50, 50, 20, 50, 50, 60);
    sunGlow.addColorStop(0, 'rgba(241, 196, 15, 0.3)');
    sunGlow.addColorStop(1, 'rgba(241, 196, 15, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(50, 50, 60, 0, Math.PI * 2);
    ctx.fill();
}

function generateClouds() {
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud(
            Math.random() * canvas.width,
            30 + Math.random() * 120
        ));
    }
}

function animate() {
    drawSky();

    clouds.forEach(cloud => {
        cloud.update();
        cloud.draw();
    });

    time += 0.01;
    requestAnimationFrame(animate);
}

document.getElementById('generateBtn').addEventListener('click', generateClouds);

generateClouds();
animate();
