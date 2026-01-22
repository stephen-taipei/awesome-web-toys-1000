const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let direction = 1;
let time = 0;
let particles = [];
let bubbles = [];

function init() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 100;
        particles.push({
            angle,
            distance,
            speed: 0.02 + Math.random() * 0.02,
            size: 1 + Math.random() * 3,
            depth: Math.random()
        });
    }

    bubbles = [];
    for (let i = 0; i < 20; i++) {
        bubbles.push({
            angle: Math.random() * Math.PI * 2,
            distance: 20 + Math.random() * 80,
            y: Math.random() * 20,
            speed: 0.5 + Math.random() * 1,
            size: 2 + Math.random() * 4
        });
    }
}

function changeDirection() {
    direction *= -1;
}

function drawBackground() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 200
    );
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(0.5, '#004466');
    gradient.addColorStop(1, '#006699');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWhirlpool() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let ring = 0; ring < 8; ring++) {
        const radius = 20 + ring * 15;
        const alpha = 0.3 - ring * 0.03;
        const rotation = time * 0.02 * direction * (1 - ring * 0.1);

        ctx.strokeStyle = `rgba(100, 180, 220, ${alpha})`;
        ctx.lineWidth = 3 - ring * 0.2;
        ctx.beginPath();

        for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI / 180) + rotation;
            const wobble = Math.sin(angle * 3 + time * 0.05) * 5;
            const r = radius + wobble;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r * 0.6;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.stroke();
    }

    const centerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    centerGradient.addColorStop(0, '#001122');
    centerGradient.addColorStop(1, 'rgba(0, 50, 80, 0)');
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
}

function updateParticles() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    particles.forEach(p => {
        p.angle += p.speed * direction;
        p.distance -= 0.2;

        if (p.distance < 10) {
            p.distance = 30 + Math.random() * 100;
            p.angle = Math.random() * Math.PI * 2;
        }
    });
}

function drawParticles() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    particles.forEach(p => {
        const x = cx + Math.cos(p.angle) * p.distance;
        const y = cy + Math.sin(p.angle) * p.distance * 0.6;
        const alpha = 0.3 + p.depth * 0.5;

        ctx.fillStyle = `rgba(150, 200, 230, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateBubbles() {
    bubbles.forEach(b => {
        b.angle += 0.03 * direction;
        b.y += b.speed;
        b.distance -= 0.1;

        if (b.y > 30 || b.distance < 5) {
            b.y = 0;
            b.distance = 20 + Math.random() * 80;
            b.angle = Math.random() * Math.PI * 2;
        }
    });
}

function drawBubbles() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    bubbles.forEach(b => {
        const x = cx + Math.cos(b.angle) * b.distance;
        const y = cy + Math.sin(b.angle) * b.distance * 0.6 - b.y;

        ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, b.size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - b.size * 0.3, y - b.size * 0.3, b.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`方向: ${direction > 0 ? '順時針' : '逆時針'}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawWhirlpool();
    updateParticles();
    drawParticles();
    updateBubbles();
    drawBubbles();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('directionBtn').addEventListener('click', changeDirection);

init();
animate();
