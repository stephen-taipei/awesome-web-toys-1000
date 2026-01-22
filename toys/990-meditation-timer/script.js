const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timerDisplay');

canvas.width = 370;
canvas.height = 200;

let isRunning = false;
let elapsedTime = 0;
let lastTime = 0;
let particles = [];
let breathPhase = 0;
let breathTime = 0;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 50 + 50;
        this.x = canvas.width / 2 + Math.cos(angle) * dist;
        this.y = canvas.height / 2 + Math.sin(angle) * dist;
        this.targetX = canvas.width / 2;
        this.targetY = canvas.height / 2;
        this.size = Math.random() * 3 + 1;
        this.alpha = Math.random() * 0.5 + 0.3;
        this.speed = Math.random() * 0.02 + 0.01;
        this.angle = angle;
        this.orbitRadius = dist;
        this.orbitSpeed = Math.random() * 0.01 + 0.005;
    }

    update() {
        this.angle += this.orbitSpeed;

        const breathScale = 1 + Math.sin(breathPhase) * 0.3;
        const currentRadius = this.orbitRadius * breathScale;

        this.x = canvas.width / 2 + Math.cos(this.angle) * currentRadius;
        this.y = canvas.height / 2 + Math.sin(this.angle) * currentRadius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(149, 117, 205, ${this.alpha})`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function draw() {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const breathScale = 1 + Math.sin(breathPhase) * 0.3;
    const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 80 * breathScale
    );
    centerGlow.addColorStop(0, 'rgba(149, 117, 205, 0.3)');
    centerGlow.addColorStop(0.5, 'rgba(149, 117, 205, 0.1)');
    centerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80 * breathScale, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 1; i <= 3; i++) {
        const ringSize = 30 * i * breathScale;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, ringSize, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(149, 117, 205, ${0.3 - i * 0.08})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 20 * breathScale, 0, Math.PI * 2);
    const coreGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 20 * breathScale
    );
    coreGradient.addColorStop(0, 'rgba(200, 180, 255, 0.8)');
    coreGradient.addColorStop(1, 'rgba(149, 117, 205, 0.5)');
    ctx.fillStyle = coreGradient;
    ctx.fill();

    if (isRunning) {
        breathPhase += 0.02;
    }
}

function animate(currentTime) {
    if (isRunning) {
        const delta = currentTime - lastTime;
        elapsedTime += delta;
        timerDisplay.textContent = formatTime(elapsedTime);
    }
    lastTime = currentTime;

    draw();
    requestAnimationFrame(animate);
}

document.getElementById('startBtn').addEventListener('click', () => {
    isRunning = !isRunning;
    document.getElementById('startBtn').textContent = isRunning ? '暫停' : '開始';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    isRunning = false;
    elapsedTime = 0;
    breathPhase = 0;
    timerDisplay.textContent = '00:00';
    document.getElementById('startBtn').textContent = '開始';
});

timerDisplay.textContent = '00:00';
init();
requestAnimationFrame(animate);
