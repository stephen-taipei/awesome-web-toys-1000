const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let effect = 0;
const effects = ['流沙', '水滴', '漣漪', '切割'];
let time = 0;
let particles = [];
let ripples = [];
let slices = [];

class SandParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -5;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 2 + 1;
        this.hue = Math.random() * 30 + 30;
    }

    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y * 0.02) * 0.5;
        if (this.y > canvas.height) this.reset();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${this.hue}, 60%, 60%)`;
        ctx.fill();
    }
}

class WaterDrop {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100;
        this.size = Math.random() * 5 + 3;
        this.speed = 0;
        this.stretch = 1;
    }

    update() {
        this.speed += 0.2;
        this.y += this.speed;
        this.stretch = Math.min(this.speed / 3, 2);

        if (this.y > canvas.height - 20) {
            ripples.push({ x: this.x, y: canvas.height - 20, size: 0, alpha: 1 });
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * this.stretch, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
        ctx.fill();
    }
}

class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.alpha = 1;
    }

    update() {
        this.size += 2;
        this.alpha -= 0.02;
    }

    draw() {
        if (this.alpha <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function initEffect() {
    particles = [];
    ripples = [];
    slices = [];

    switch (effect) {
        case 0:
            for (let i = 0; i < 200; i++) {
                const p = new SandParticle();
                p.y = Math.random() * canvas.height;
                particles.push(p);
            }
            break;
        case 1:
            for (let i = 0; i < 10; i++) {
                particles.push(new WaterDrop());
            }
            break;
        case 2:
            break;
        case 3:
            for (let i = 0; i < 8; i++) {
                slices.push({
                    x: (i + 0.5) * (canvas.width / 8),
                    y: canvas.height / 2,
                    targetY: canvas.height / 2,
                    hue: i * 45
                });
            }
            break;
    }
}

function drawSand() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    const pileHeight = 40;
    const gradient = ctx.createLinearGradient(0, canvas.height - pileHeight, 0, canvas.height);
    gradient.addColorStop(0, 'hsl(40, 60%, 50%)');
    gradient.addColorStop(1, 'hsl(30, 60%, 40%)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height - pileHeight + Math.sin(x * 0.05 + time * 0.02) * 5;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.fill();
}

function drawWaterDrops() {
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ripples = ripples.filter(r => r.alpha > 0);
    ripples.forEach(r => {
        r.update();
        r.draw();
    });

    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

function drawRipples() {
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 10; i++) {
        const size = ((time * 2 + i * 30) % 200);
        const alpha = 1 - size / 200;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(224, 64, 251, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function drawSlices() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sliceWidth = canvas.width / slices.length;

    slices.forEach((slice, i) => {
        slice.targetY = canvas.height / 2 + Math.sin(time * 0.03 + i * 0.5) * 80;
        slice.y += (slice.targetY - slice.y) * 0.1;

        const gradient = ctx.createLinearGradient(slice.x - sliceWidth / 2, 0, slice.x - sliceWidth / 2, canvas.height);
        gradient.addColorStop(0, `hsl(${slice.hue}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${slice.hue + 30}, 70%, 40%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(slice.x - sliceWidth / 2 + 2, 0, sliceWidth - 4, slice.y);

        ctx.fillStyle = `hsl(${slice.hue}, 70%, 30%)`;
        ctx.fillRect(slice.x - sliceWidth / 2 + 2, slice.y, sliceWidth - 4, canvas.height - slice.y);
    });
}

function draw() {
    switch (effect) {
        case 0: drawSand(); break;
        case 1: drawWaterDrops(); break;
        case 2: drawRipples(); break;
        case 3: drawSlices(); break;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(effects[effect], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('effectBtn').addEventListener('click', () => {
    effect = (effect + 1) % effects.length;
    initEffect();
});

initEffect();
animate();
