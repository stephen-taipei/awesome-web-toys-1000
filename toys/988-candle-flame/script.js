const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timerEl = document.getElementById('timer');

canvas.width = 370;
canvas.height = 250;

let particles = [];
let time = 0;
let meditationTime = 0;
let isMeditating = false;
let lastTime = 0;

class FlameParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2 + (Math.random() - 0.5) * 10;
        this.y = canvas.height - 60;
        this.size = Math.random() * 10 + 5;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(time * 0.1 + this.x * 0.1) * 0.5;
        this.life -= this.decay;
        this.size *= 0.98;

        if (this.life <= 0) this.reset();
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);

        if (this.life > 0.7) {
            gradient.addColorStop(0, `rgba(255, 255, 200, ${this.life})`);
            gradient.addColorStop(0.3, `rgba(255, 200, 50, ${this.life * 0.8})`);
            gradient.addColorStop(0.6, `rgba(255, 100, 0, ${this.life * 0.5})`);
            gradient.addColorStop(1, 'transparent');
        } else {
            gradient.addColorStop(0, `rgba(255, 150, 0, ${this.life})`);
            gradient.addColorStop(0.5, `rgba(255, 50, 0, ${this.life * 0.5})`);
            gradient.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 50; i++) {
        const p = new FlameParticle();
        p.y = canvas.height - 60 - Math.random() * 50;
        p.life = Math.random();
        particles.push(p);
    }
}

function drawCandle() {
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(canvas.width / 2 - 15, canvas.height - 50, 30, 50);

    const waxGradient = ctx.createLinearGradient(canvas.width / 2 - 15, canvas.height - 50, canvas.width / 2 + 15, canvas.height - 50);
    waxGradient.addColorStop(0, 'rgba(0,0,0,0.1)');
    waxGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    waxGradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = waxGradient;
    ctx.fillRect(canvas.width / 2 - 15, canvas.height - 50, 30, 50);

    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width / 2 - 1, canvas.height - 60, 2, 15);

    const glowSize = 80 + Math.sin(time * 0.05) * 10;
    const glow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height - 70, 0,
        canvas.width / 2, canvas.height - 70, glowSize
    );
    glow.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
    glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
    glow.addColorStop(1, 'transparent');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCandle();

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    time++;
}

function animate(currentTime) {
    if (isMeditating) {
        const delta = (currentTime - lastTime) / 1000;
        meditationTime += delta;
        timerEl.textContent = formatTime(meditationTime);
    }
    lastTime = currentTime;

    draw();
    requestAnimationFrame(animate);
}

document.getElementById('meditateBtn').addEventListener('click', () => {
    isMeditating = !isMeditating;
    document.getElementById('meditateBtn').textContent = isMeditating ? '結束冥想' : '開始冥想';

    if (!isMeditating) {
        meditationTime = 0;
        timerEl.textContent = '00:00';
    }
});

timerEl.textContent = '00:00';
init();
requestAnimationFrame(animate);
