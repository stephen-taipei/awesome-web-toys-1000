const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const soundButtons = document.getElementById('soundButtons');

canvas.width = 370;
canvas.height = 200;

const sounds = [
    { name: '雨聲', icon: '🌧️', particles: 'rain', color: '#5C6BC0' },
    { name: '森林', icon: '🌲', particles: 'forest', color: '#4CAF50' },
    { name: '海浪', icon: '🌊', particles: 'ocean', color: '#00BCD4' },
    { name: '篝火', icon: '🔥', particles: 'fire', color: '#FF5722' },
    { name: '風聲', icon: '💨', particles: 'wind', color: '#90A4AE' },
    { name: '鳥鳴', icon: '🐦', particles: 'birds', color: '#FFEB3B' }
];

let activeSound = null;
let particles = [];
let time = 0;

class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }

    reset() {
        switch (this.type) {
            case 'rain':
                this.x = Math.random() * canvas.width;
                this.y = -10;
                this.speed = Math.random() * 5 + 8;
                this.size = Math.random() * 2 + 1;
                break;
            case 'forest':
                this.x = Math.random() * canvas.width;
                this.y = canvas.height;
                this.speed = Math.random() * 0.5 + 0.2;
                this.size = Math.random() * 3 + 2;
                this.sway = Math.random() * Math.PI * 2;
                break;
            case 'ocean':
                this.x = -20;
                this.y = canvas.height * 0.6 + Math.random() * 50;
                this.speed = Math.random() * 2 + 1;
                this.size = Math.random() * 10 + 5;
                break;
            case 'fire':
                this.x = canvas.width / 2 + (Math.random() - 0.5) * 60;
                this.y = canvas.height;
                this.speed = Math.random() * 3 + 2;
                this.size = Math.random() * 8 + 4;
                this.life = 1;
                break;
            case 'wind':
                this.x = -10;
                this.y = Math.random() * canvas.height;
                this.speed = Math.random() * 4 + 2;
                this.size = Math.random() * 30 + 10;
                break;
            case 'birds':
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height * 0.5;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 0.5 - 0.25;
                this.size = Math.random() * 3 + 2;
                break;
        }
    }

    update() {
        switch (this.type) {
            case 'rain':
                this.y += this.speed;
                this.x += 1;
                if (this.y > canvas.height) this.reset();
                break;
            case 'forest':
                this.y -= this.speed;
                this.x += Math.sin(time * 0.02 + this.sway) * 0.5;
                if (this.y < -10) this.reset();
                break;
            case 'ocean':
                this.x += this.speed;
                this.y += Math.sin(time * 0.05 + this.x * 0.02) * 0.5;
                if (this.x > canvas.width + 20) this.reset();
                break;
            case 'fire':
                this.y -= this.speed;
                this.x += Math.sin(time * 0.1 + this.x) * 1;
                this.life -= 0.02;
                this.size *= 0.98;
                if (this.life <= 0) this.reset();
                break;
            case 'wind':
                this.x += this.speed;
                this.y += Math.sin(time * 0.03) * 0.5;
                if (this.x > canvas.width + 50) this.reset();
                break;
            case 'birds':
                this.x += this.speedX;
                this.y += this.speedY + Math.sin(time * 0.1) * 0.3;
                if (this.x < -10 || this.x > canvas.width + 10) this.speedX *= -1;
                if (this.y < -10 || this.y > canvas.height * 0.6) this.speedY *= -1;
                break;
        }
    }

    draw() {
        const sound = sounds.find(s => s.particles === this.type);
        const color = sound ? sound.color : '#fff';

        switch (this.type) {
            case 'rain':
                ctx.strokeStyle = color + '80';
                ctx.lineWidth = this.size;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - 5, this.y + 15);
                ctx.stroke();
                break;
            case 'forest':
            case 'birds':
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = color + '80';
                ctx.fill();
                break;
            case 'ocean':
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, this.size * 2, this.size, 0, 0, Math.PI * 2);
                ctx.fillStyle = color + '40';
                ctx.fill();
                break;
            case 'fire':
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, `rgba(255, 200, 0, ${this.life})`);
                gradient.addColorStop(0.5, `rgba(255, 100, 0, ${this.life * 0.5})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'wind':
                ctx.strokeStyle = color + '30';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.bezierCurveTo(
                    this.x + this.size / 3, this.y - 5,
                    this.x + this.size * 2 / 3, this.y + 5,
                    this.x + this.size, this.y
                );
                ctx.stroke();
                break;
        }
    }
}

function init() {
    soundButtons.innerHTML = '';
    sounds.forEach((sound, i) => {
        const btn = document.createElement('button');
        btn.innerHTML = `${sound.icon}<br>${sound.name}`;
        btn.addEventListener('click', () => toggleSound(i, btn));
        soundButtons.appendChild(btn);
    });
}

function toggleSound(index, btn) {
    document.querySelectorAll('#soundButtons button').forEach(b => b.classList.remove('active'));

    if (activeSound === index) {
        activeSound = null;
        particles = [];
    } else {
        activeSound = index;
        btn.classList.add('active');
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(sounds[index].particles));
        }
    }
}

function draw() {
    ctx.fillStyle = '#0a150a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeSound !== null) {
        particles.forEach(p => {
            p.update();
            p.draw();
        });
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('選擇一種環境音效', canvas.width / 2, canvas.height / 2);
    }

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

init();
animate();
