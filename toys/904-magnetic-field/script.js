const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let polarity = 1;
let particles = [];
let time = 0;

function init() {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0
        });
    }
}

function togglePolarity() {
    polarity *= -1;
}

function updateParticles() {
    particles.forEach(p => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const force = (50 / (dist * dist)) * polarity;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
        }

        p.vx *= 0.95;
        p.vy *= 0.95;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
    });
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFieldLines() {
    const gridSize = 25;
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.lineWidth = 1;

    for (let x = gridSize / 2; x < canvas.width; x += gridSize) {
        for (let y = gridSize / 2; y < canvas.height; y += gridSize) {
            const dx = mouseX - x;
            const dy = mouseY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 20) {
                const angle = Math.atan2(dy, dx) * polarity;
                const length = Math.min(15, 500 / dist);

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(
                    x + Math.cos(angle) * length,
                    y + Math.sin(angle) * length
                );
                ctx.lineTo(
                    x + Math.cos(angle) * length - Math.cos(angle - 0.5) * 4,
                    y + Math.sin(angle) * length - Math.sin(angle - 0.5) * 4
                );
                ctx.lineTo(
                    x + Math.cos(angle) * length - Math.cos(angle + 0.5) * 4,
                    y + Math.sin(angle) * length - Math.sin(angle + 0.5) * 4
                );
                ctx.fill();
            }
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = Math.min(1, 0.3 + speed * 0.3);

        ctx.fillStyle = polarity > 0
            ? `rgba(231, 76, 60, ${alpha})`
            : `rgba(52, 152, 219, ${alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + speed, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawMagnet() {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 30);

    if (polarity > 0) {
        gradient.addColorStop(0, '#E74C3C');
        gradient.addColorStop(0.5, '#C0392B');
        gradient.addColorStop(1, 'transparent');
    } else {
        gradient.addColorStop(0, '#3498DB');
        gradient.addColorStop(0.5, '#2980B9');
        gradient.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(polarity > 0 ? 'N' : 'S', mouseX, mouseY);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(polarity > 0 ? '極性: N極' : '極性: S極', 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawFieldLines();
    updateParticles();
    drawParticles();
    drawMagnet();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

document.getElementById('polarBtn').addEventListener('click', togglePolarity);

init();
animate();
