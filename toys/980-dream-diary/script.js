const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const dreamText = document.getElementById('dreamText');

canvas.width = 370;
canvas.height = 200;

const dreamElements = [
    '飛翔在雲端之上',
    '漫步在星光小徑',
    '與神秘生物對話',
    '探索水下城堡',
    '穿越彩虹之門',
    '在月光下跳舞',
    '尋找失落的記憶',
    '與過去的自己相遇',
    '解開古老的謎題',
    '創造新的世界'
];

const dreamColors = [
    ['#1a237e', '#4a148c', '#311b92'],
    ['#0d47a1', '#1565c0', '#42a5f5'],
    ['#4a148c', '#7b1fa2', '#ab47bc'],
    ['#006064', '#00838f', '#00acc1'],
    ['#1b5e20', '#2e7d32', '#43a047']
];

let particles = [];
let stars = [];
let currentDream = '';
let currentColors = dreamColors[0];
let time = 0;

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 10;
        this.size = Math.random() * 4 + 2;
        this.speedY = -Math.random() * 1 - 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.alpha = Math.random() * 0.5 + 0.5;
        this.color = currentColors[Math.floor(Math.random() * currentColors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(time * 0.02 + this.x * 0.01) * 0.3;
        this.alpha -= 0.005;

        if (this.y < -10 || this.alpha <= 0) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.7;
        this.size = Math.random() * 2 + 0.5;
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw() {
        const alpha = 0.3 + Math.sin(time * this.twinkleSpeed + this.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
    }
}

function init() {
    particles = [];
    stars = [];

    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }

    for (let i = 0; i < 100; i++) {
        stars.push(new Star());
    }

    generateDream();
}

function generateDream() {
    currentDream = dreamElements[Math.floor(Math.random() * dreamElements.length)];
    currentColors = dreamColors[Math.floor(Math.random() * dreamColors.length)];

    dreamText.style.opacity = 0;
    setTimeout(() => {
        dreamText.textContent = `「${currentDream}」`;
        dreamText.style.opacity = 1;
    }, 500);

    particles.forEach(p => p.color = currentColors[Math.floor(Math.random() * currentColors.length)]);
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, currentColors[0]);
    gradient.addColorStop(0.5, currentColors[1]);
    gradient.addColorStop(1, currentColors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => star.draw());

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    const moonX = canvas.width - 50;
    const moonY = 40;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
    moonGlow.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    moonGlow.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(moonX - 50, moonY - 50, 100, 100);

    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#fffde7';
    ctx.fill();

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

dreamText.style.transition = 'opacity 0.5s';

document.getElementById('dreamBtn').addEventListener('click', generateDream);

init();
animate();
