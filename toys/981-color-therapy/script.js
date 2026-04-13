const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInfo = document.getElementById('colorInfo');

canvas.width = 370;
canvas.height = 250;

const therapyColors = [
    { name: '寧靜藍', color: '#4FC3F7', meaning: '平靜、放鬆、減少壓力', gradient: ['#0288D1', '#4FC3F7', '#B3E5FC'] },
    { name: '治癒綠', color: '#81C784', meaning: '平衡、和諧、新生', gradient: ['#2E7D32', '#81C784', '#C8E6C9'] },
    { name: '溫暖橙', color: '#FFB74D', meaning: '活力、創造、樂觀', gradient: ['#E65100', '#FFB74D', '#FFE0B2'] },
    { name: '柔和紫', color: '#BA68C8', meaning: '靈感、智慧、內省', gradient: ['#6A1B9A', '#BA68C8', '#E1BEE7'] },
    { name: '純淨白', color: '#F5F5F5', meaning: '清新、純潔、開放', gradient: ['#BDBDBD', '#E0E0E0', '#F5F5F5'] },
    { name: '溫柔粉', color: '#F48FB1', meaning: '愛、溫柔、關懷', gradient: ['#C2185B', '#F48FB1', '#FCE4EC'] },
    { name: '大地棕', color: '#A1887F', meaning: '穩定、安全、根基', gradient: ['#4E342E', '#A1887F', '#D7CCC8'] }
];

let currentColor = therapyColors[0];
let time = 0;
let particles = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 30 + 10;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.alpha = Math.random() * 0.3 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < -50) this.x = canvas.width + 50;
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        if (this.y > canvas.height + 50) this.y = -50;
    }

    draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, currentColor.color + Math.floor(this.alpha * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle());
    }
    updateColorInfo();
}

function updateColorInfo() {
    colorInfo.innerHTML = `
        <strong style="color: ${currentColor.color}">${currentColor.name}</strong><br>
        <span style="font-size: 12px; opacity: 0.8">${currentColor.meaning}</span>
    `;
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, currentColor.gradient[0]);
    gradient.addColorStop(0.5, currentColor.gradient[1]);
    gradient.addColorStop(1, currentColor.gradient[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulseSize = Math.sin(time * 0.02) * 20 + 80;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
    pulseGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    pulseGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    pulseGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = pulseGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    time++;
}

function changeColor() {
    const currentIndex = therapyColors.indexOf(currentColor);
    currentColor = therapyColors[(currentIndex + 1) % therapyColors.length];
    updateColorInfo();
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('changeBtn').addEventListener('click', changeColor);

init();
animate();
