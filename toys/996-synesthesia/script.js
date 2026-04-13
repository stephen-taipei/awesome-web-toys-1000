const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let senseMode = 0;
const modes = ['色彩之聲', '觸感之色', '味覺之形', '情緒之波'];
let waves = [];
let shapes = [];

class SynesthesiaWave {
    constructor() {
        this.reset();
    }

    reset() {
        this.y = canvas.height / 2;
        this.amplitude = Math.random() * 30 + 20;
        this.frequency = Math.random() * 0.05 + 0.02;
        this.phase = Math.random() * Math.PI * 2;
        this.hue = Math.random() * 360;
        this.speed = Math.random() * 0.02 + 0.01;
    }

    draw() {
        ctx.beginPath();

        for (let x = 0; x < canvas.width; x += 2) {
            const y = this.y +
                Math.sin(x * this.frequency + time * this.speed + this.phase) * this.amplitude +
                Math.sin(x * this.frequency * 2 + time * this.speed * 1.5) * this.amplitude * 0.3;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `hsla(${this.hue + time}, 70%, 60%, 0.5)`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

class SenseShape {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 30 + 10;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.type = Math.floor(Math.random() * 4);
        this.hue = Math.random() * 360;
        this.pulse = Math.random() * Math.PI * 2;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulse += 0.05;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        const pulseSize = this.size + Math.sin(this.pulse) * 5;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
        gradient.addColorStop(0, `hsla(${this.hue + time * 2}, 80%, 70%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${this.hue + time * 2 + 30}, 80%, 50%, 0.4)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;

        ctx.beginPath();
        switch (this.type) {
            case 0:
                ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
                break;
            case 1:
                ctx.rect(-pulseSize / 2, -pulseSize / 2, pulseSize, pulseSize);
                break;
            case 2:
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * pulseSize;
                    const y = Math.sin(angle) * pulseSize;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            case 3:
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const x = Math.cos(angle) * pulseSize;
                    const y = Math.sin(angle) * pulseSize;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
        }
        ctx.fill();

        ctx.restore();
    }
}

function init() {
    waves = [];
    for (let i = 0; i < 5; i++) {
        const w = new SynesthesiaWave();
        w.y = (i + 1) * (canvas.height / 6);
        waves.push(w);
    }

    shapes = [];
    for (let i = 0; i < 15; i++) {
        shapes.push(new SenseShape());
    }
}

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 21, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (senseMode) {
        case 0:
            waves.forEach(w => w.draw());
            break;
        case 1:
            shapes.forEach(s => {
                s.update();
                s.draw();
            });
            break;
        case 2:
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time * 0.02;
                const dist = 50 + Math.sin(time * 0.05 + i) * 30;
                const x = cx + Math.cos(angle) * dist;
                const y = cy + Math.sin(angle) * dist;
                const size = 20 + Math.sin(time * 0.1 + i * 0.5) * 10;

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, `hsla(${i * 45 + time}, 80%, 60%, 0.8)`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 3:
            for (let i = 0; i < 10; i++) {
                const size = ((time * 2 + i * 30) % 200);
                const alpha = 1 - size / 200;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${time + i * 36}, 70%, 60%, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            break;
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(modes[senseMode], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('senseBtn').addEventListener('click', () => {
    senseMode = (senseMode + 1) % modes.length;
});

init();
animate();
