const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 250;
canvas.width = size; canvas.height = size;

const predictions = [
    '好運即將降臨你身上',
    '一個驚喜正在前方等待',
    '你的願望將會實現',
    '新的機會正在靠近',
    '愛情就在身邊',
    '財運亨通的一天',
    '小心意外的訪客',
    '重要的消息即將到來',
    '你的努力將得到回報',
    '保持耐心,時機未到',
    '一位朋友將帶來好消息',
    '改變即將發生'
];

let particles = [], hue = 260;

function init() {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: size/2 + (Math.random() - 0.5) * 100,
            y: size/2 + (Math.random() - 0.5) * 100,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1
        });
    }

    document.getElementById('predictBtn').addEventListener('click', predict);
    canvas.addEventListener('click', predict);
    animate();
}

function predict() {
    const prediction = predictions[Math.floor(Math.random() * predictions.length)];
    document.getElementById('prediction').textContent = '"' + prediction + '"';

    hue = Math.random() * 60 + 240;

    for (let i = 0; i < 20; i++) {
        particles.push({
            x: size/2,
            y: size/2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 4 + 2,
            life: 60
        });
    }
}

function animate() {
    ctx.fillStyle = 'rgba(10, 10, 42, 0.1)';
    ctx.fillRect(0, 0, size, size);

    const cx = size/2, cy = size/2, r = 100;

    const gradient = ctx.createRadialGradient(cx - 30, cy - 30, 0, cx, cy, r);
    gradient.addColorStop(0, `hsla(${hue}, 80%, 70%, 0.1)`);
    gradient.addColorStop(0.5, `hsla(${hue}, 60%, 40%, 0.2)`);
    gradient.addColorStop(1, `hsla(${hue}, 40%, 20%, 0.3)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `hsla(${hue}, 60%, 60%, 0.5)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    particles = particles.filter(p => {
        if (p.life !== undefined) {
            p.life--;
            if (p.life <= 0) return false;
        }

        p.x += p.vx;
        p.y += p.vy;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > r - 10) {
            const angle = Math.atan2(dy, dx);
            p.x = cx + Math.cos(angle) * (r - 15);
            p.y = cy + Math.sin(angle) * (r - 15);
            p.vx = (Math.random() - 0.5) * 0.5;
            p.vy = (Math.random() - 0.5) * 0.5;
        }

        const alpha = p.life !== undefined ? p.life / 60 : 0.8;
        ctx.fillStyle = `hsla(${hue + Math.random() * 30}, 80%, 70%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
    });

    hue += 0.1;

    requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
