const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let observed = false;
let particles = [];
let waveFunction = [];

class QuantumParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.possibilities = [];

        for (let i = 0; i < 20; i++) {
            this.possibilities.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                probability: Math.random()
            });
        }

        const total = this.possibilities.reduce((a, p) => a + p.probability, 0);
        this.possibilities.forEach(p => p.probability /= total);

        this.collapsed = false;
        this.finalX = 0;
        this.finalY = 0;
    }

    collapse() {
        if (this.collapsed) return;

        let r = Math.random();
        for (const p of this.possibilities) {
            r -= p.probability;
            if (r <= 0) {
                this.finalX = p.x;
                this.finalY = p.y;
                break;
            }
        }
        this.collapsed = true;
    }

    uncollapse() {
        this.collapsed = false;
    }

    draw() {
        if (observed && !this.collapsed) {
            this.collapse();
        } else if (!observed && this.collapsed) {
            this.uncollapse();
        }

        if (this.collapsed) {
            const glow = ctx.createRadialGradient(this.finalX, this.finalY, 0, this.finalX, this.finalY, 20);
            glow.addColorStop(0, 'rgba(234, 128, 252, 1)');
            glow.addColorStop(0.5, 'rgba(234, 128, 252, 0.5)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(this.finalX, this.finalY, 20, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.finalX, this.finalY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        } else {
            this.possibilities.forEach((p, i) => {
                const alpha = p.probability * (0.5 + Math.sin(time * 0.1 + i) * 0.3);
                const size = 5 + p.probability * 20;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${280 + i * 5}, 80%, 70%, ${alpha})`;
                ctx.fill();
            });

            for (let i = 0; i < this.possibilities.length - 1; i++) {
                const p1 = this.possibilities[i];
                const p2 = this.possibilities[i + 1];
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = 'rgba(234, 128, 252, 0.1)';
                ctx.stroke();
            }
        }
    }
}

function initWaveFunction() {
    waveFunction = [];
    for (let x = 0; x < canvas.width; x += 5) {
        waveFunction.push({
            x,
            amplitude: Math.random() * 30 + 10,
            frequency: Math.random() * 0.05 + 0.02,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function drawWaveFunction() {
    if (observed) return;

    ctx.beginPath();
    waveFunction.forEach((w, i) => {
        const y = canvas.height / 2 + Math.sin(time * w.frequency + w.phase) * w.amplitude;
        if (i === 0) ctx.moveTo(w.x, y);
        else ctx.lineTo(w.x, y);
    });
    ctx.strokeStyle = 'rgba(234, 128, 252, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function init() {
    particles = [];
    for (let i = 0; i < 5; i++) {
        particles.push(new QuantumParticle());
    }
    initWaveFunction();
}

function draw() {
    ctx.fillStyle = observed ? 'rgba(5, 0, 10, 0.3)' : 'rgba(5, 0, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawWaveFunction();

    particles.forEach(p => p.draw());

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(observed ? '已觀測 - 波函數塌縮' : '未觀測 - 量子疊加態', canvas.width / 2, 20);

    const uncertainty = observed ? '確定' : '不確定';
    ctx.fillText(`狀態：${uncertainty}`, canvas.width / 2, canvas.height - 10);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('quantumBtn').addEventListener('click', () => {
    observed = !observed;
    if (!observed) {
        particles.forEach(p => p.reset());
    }
});

init();
animate();
