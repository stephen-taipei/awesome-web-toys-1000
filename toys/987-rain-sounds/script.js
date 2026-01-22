const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensityEl = document.getElementById('intensity');

canvas.width = 370;
canvas.height = 250;

let raindrops = [];
let splashes = [];
let intensity = 1;
const intensities = ['細雨', '小雨', '中雨', '大雨', '暴雨'];
let time = 0;

class Raindrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100;
        this.length = Math.random() * 15 + 10 + intensity * 5;
        this.speed = Math.random() * 5 + 10 + intensity * 3;
        this.opacity = Math.random() * 0.3 + 0.3;
    }

    update() {
        this.y += this.speed;
        this.x += 2;

        if (this.y > canvas.height - 30) {
            splashes.push(new Splash(this.x, canvas.height - 30));
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 4, this.y + this.length);
        ctx.strokeStyle = `rgba(150, 180, 220, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class Splash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1,
                size: Math.random() * 2 + 1,
                alpha: 1
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.alpha -= 0.05;
        });
        this.particles = this.particles.filter(p => p.alpha > 0);
    }

    draw() {
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 180, 220, ${p.alpha})`;
            ctx.fill();
        });
    }

    isDead() {
        return this.particles.length === 0;
    }
}

function init() {
    raindrops = [];
    const count = 50 + intensity * 50;
    for (let i = 0; i < count; i++) {
        const drop = new Raindrop();
        drop.y = Math.random() * canvas.height;
        raindrops.push(drop);
    }
    updateIntensityDisplay();
}

function updateIntensityDisplay() {
    intensityEl.textContent = `雨量：${intensities[intensity]}`;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(1, '#2a3a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 5; i++) {
        const cloudX = (i * 100 + time * 0.2) % (canvas.width + 100) - 50;
        const cloudY = 20 + Math.sin(i) * 10;

        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, cloudY - 10, 25, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    ctx.fillStyle = '#1a2530';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    ctx.fillStyle = 'rgba(100, 150, 200, 0.1)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 5);

    for (let i = 0; i < 10; i++) {
        const x = (i * 50 + time) % canvas.width;
        const size = 3 + Math.sin(time * 0.05 + i) * 2;
        ctx.beginPath();
        ctx.ellipse(x, canvas.height - 25, size * 3, size, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 150, 200, 0.2)';
        ctx.fill();
    }
}

function draw() {
    drawBackground();

    raindrops.forEach(drop => {
        drop.update();
        drop.draw();
    });

    splashes = splashes.filter(s => !s.isDead());
    splashes.forEach(splash => {
        splash.update();
        splash.draw();
    });

    drawGround();

    if (intensity >= 3) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * (intensity - 2)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('rainBtn').addEventListener('click', () => {
    intensity = (intensity + 1) % intensities.length;
    init();
});

init();
animate();
