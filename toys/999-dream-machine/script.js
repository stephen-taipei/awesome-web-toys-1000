const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let dreamState = 0;
const states = ['清醒', '淺夢', '深夢', '夢中夢'];
let dreamElements = [];
let morphTargets = [];

class DreamElement {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 30 + 10;
        this.type = Math.floor(Math.random() * 5);
        this.hue = Math.random() * 360;
        this.morphProgress = 0;
        this.morphSpeed = Math.random() * 0.02 + 0.01;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.5 + 0.3;
    }

    update() {
        this.floatPhase += 0.02;
        this.x += Math.sin(this.floatPhase) * 0.5;
        this.y += Math.cos(this.floatPhase * 0.7) * 0.3;

        this.morphProgress += this.morphSpeed;
        if (this.morphProgress > 1) {
            this.morphProgress = 0;
            this.type = (this.type + 1) % 5;
        }

        this.alpha += (this.targetAlpha - this.alpha) * 0.05;

        if (Math.random() < 0.005) {
            this.targetAlpha = this.targetAlpha > 0.3 ? 0 : Math.random() * 0.5 + 0.3;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = this.alpha;

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `hsla(${this.hue + time}, 60%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${this.hue + time + 30}, 60%, 50%, 0.5)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;

        const t = this.morphProgress;
        const currentType = this.type;
        const nextType = (this.type + 1) % 5;

        ctx.beginPath();
        this.drawMorphedShape(currentType, nextType, t);
        ctx.fill();

        ctx.restore();
    }

    drawMorphedShape(from, to, t) {
        const size = this.size;
        const points = 36;

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const r1 = this.getShapeRadius(from, angle, size);
            const r2 = this.getShapeRadius(to, angle, size);
            const r = r1 * (1 - t) + r2 * t;

            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    getShapeRadius(type, angle, size) {
        switch (type) {
            case 0: return size;
            case 1: return size * (0.8 + Math.cos(angle * 4) * 0.2);
            case 2: return size * (0.7 + Math.cos(angle * 3) * 0.3);
            case 3: return size * (0.6 + Math.abs(Math.sin(angle * 2.5)) * 0.4);
            case 4: return size * (0.5 + Math.cos(angle * 6) * 0.5);
            default: return size;
        }
    }
}

function init() {
    dreamElements = [];
    for (let i = 0; i < 30; i++) {
        dreamElements.push(new DreamElement());
    }
}

function draw() {
    const bgAlpha = 0.05 + dreamState * 0.02;
    ctx.fillStyle = `rgba(5, 5, 21, ${bgAlpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (dreamState >= 2) {
        const rippleCount = dreamState === 3 ? 3 : 1;
        for (let r = 0; r < rippleCount; r++) {
            for (let i = 0; i < 5; i++) {
                const size = ((time * (1 + r * 0.5) + i * 40) % 200);
                const alpha = (1 - size / 200) * 0.2;
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(${260 + r * 30}, 60%, 60%, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    dreamElements.forEach(e => {
        e.update();
        e.draw();
    });

    if (dreamState >= 1) {
        ctx.fillStyle = `hsla(${time % 360}, 50%, 80%, 0.02)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (dreamState === 3) {
        const glitch = Math.random() < 0.05;
        if (glitch) {
            const sliceY = Math.random() * canvas.height;
            const sliceHeight = Math.random() * 20 + 10;
            const shift = Math.random() * 20 - 10;

            const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceHeight);
            ctx.putImageData(imageData, shift, sliceY);
        }
    }

    ctx.fillStyle = 'rgba(179, 136, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(states[dreamState], canvas.width / 2, 20);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('dreamBtn').addEventListener('click', () => {
    dreamState = (dreamState + 1) % states.length;
});

init();
animate();
