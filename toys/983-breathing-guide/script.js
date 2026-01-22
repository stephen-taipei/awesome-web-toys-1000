const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const instruction = document.getElementById('instruction');

canvas.width = 370;
canvas.height = 220;

let isRunning = false;
let phase = 0;
let phaseTime = 0;
let breathSize = 50;
let targetSize = 50;

const phases = [
    { name: '吸氣', duration: 4000, targetSize: 100 },
    { name: '屏住', duration: 4000, targetSize: 100 },
    { name: '呼氣', duration: 6000, targetSize: 50 },
    { name: '屏住', duration: 2000, targetSize: 50 }
];

let lastTime = 0;
let particles = [];

class Particle {
    constructor(inward) {
        this.inward = inward;
        this.reset();
    }

    reset() {
        const angle = Math.random() * Math.PI * 2;
        if (this.inward) {
            const dist = 150;
            this.x = canvas.width / 2 + Math.cos(angle) * dist;
            this.y = canvas.height / 2 + Math.sin(angle) * dist;
        } else {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
        }
        this.angle = angle;
        this.speed = Math.random() * 1 + 0.5;
        this.size = Math.random() * 3 + 1;
        this.alpha = 1;
    }

    update() {
        if (this.inward) {
            this.x -= Math.cos(this.angle) * this.speed;
            this.y -= Math.sin(this.angle) * this.speed;
            const dx = this.x - canvas.width / 2;
            const dy = this.y - canvas.height / 2;
            if (Math.sqrt(dx * dx + dy * dy) < breathSize) {
                this.reset();
            }
        } else {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            const dx = this.x - canvas.width / 2;
            const dy = this.y - canvas.height / 2;
            if (Math.sqrt(dx * dx + dy * dy) > 150) {
                this.reset();
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 182, 172, ${this.alpha * 0.5})`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(true));
    }
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(false));
    }
}

function update(deltaTime) {
    if (!isRunning) return;

    phaseTime += deltaTime;
    const currentPhase = phases[phase];

    if (phaseTime >= currentPhase.duration) {
        phaseTime = 0;
        phase = (phase + 1) % phases.length;
    }

    targetSize = phases[phase].targetSize;
    breathSize += (targetSize - breathSize) * 0.02;

    instruction.textContent = phases[phase].name;

    particles.forEach(p => {
        p.inward = phase === 0;
        if (phase === 0 || phase === 2) {
            p.update();
        }
    });
}

function draw() {
    ctx.fillStyle = '#0a1515';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 3; i >= 0; i--) {
        const size = breathSize + i * 15;
        const alpha = 0.1 - i * 0.02;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77, 182, 172, ${alpha})`;
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, breathSize, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, breathSize);
    gradient.addColorStop(0, 'rgba(77, 182, 172, 0.8)');
    gradient.addColorStop(0.7, 'rgba(77, 182, 172, 0.3)');
    gradient.addColorStop(1, 'rgba(77, 182, 172, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    if (isRunning && (phase === 0 || phase === 2)) {
        particles.forEach(p => p.draw());
    }
}

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    update(deltaTime);
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('startBtn').addEventListener('click', () => {
    isRunning = !isRunning;
    document.getElementById('startBtn').textContent = isRunning ? '暫停' : '開始練習';
    if (!isRunning) {
        instruction.textContent = '準備好了嗎？';
    }
});

instruction.textContent = '準備好了嗎？';
init();
requestAnimationFrame(animate);
