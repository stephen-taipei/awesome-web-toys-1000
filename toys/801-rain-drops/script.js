const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const intensityInput = document.getElementById('intensity');

canvas.width = 370;
canvas.height = 300;

class RainDrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100;
        this.length = 10 + Math.random() * 20;
        this.speed = 8 + Math.random() * 8;
        this.opacity = 0.3 + Math.random() * 0.5;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.strokeStyle = `rgba(174, 214, 241, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
    }
}

class Splash {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = 15 + Math.random() * 10;
        this.opacity = 0.8;
    }

    update() {
        this.radius += 1;
        this.opacity -= 0.05;
    }

    draw() {
        if (this.opacity <= 0) return;
        ctx.strokeStyle = `rgba(174, 214, 241, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

let drops = [];
let splashes = [];

function initDrops() {
    const intensity = parseInt(intensityInput.value);
    drops = [];
    for (let i = 0; i < intensity; i++) {
        drops.push(new RainDrop());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(44, 62, 80, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(44, 62, 80, 0.1)');
    gradient.addColorStop(1, 'rgba(52, 73, 94, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drops.forEach(drop => {
        if (drop.y > canvas.height - 10 && Math.random() > 0.7) {
            splashes.push(new Splash(drop.x, canvas.height - 5));
        }
        drop.update();
        drop.draw();
    });

    splashes = splashes.filter(splash => !splash.isDead());
    splashes.forEach(splash => {
        splash.update();
        splash.draw();
    });

    requestAnimationFrame(animate);
}

intensityInput.addEventListener('input', initDrops);

initDrops();
animate();
