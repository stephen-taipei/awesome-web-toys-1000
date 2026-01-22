const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

const center = { x: canvas.width / 2, y: canvas.height / 2 };
let radialLines = [];
let spiralPoints = [];
let spider = { x: center.x, y: center.y, targetIndex: 0 };
let phase = 'radial';
let radialCount = 0;
let spiralIndex = 0;
let animationSpeed = 2;

function init() {
    radialLines = [];
    spiralPoints = [];
    spider = { x: center.x, y: center.y, targetIndex: 0 };
    phase = 'radial';
    radialCount = 0;
    spiralIndex = 0;

    const numRadials = 16;
    for (let i = 0; i < numRadials; i++) {
        const angle = (i / numRadials) * Math.PI * 2;
        const length = 100 + Math.random() * 30;
        radialLines.push({
            angle,
            length,
            progress: 0,
            endX: center.x + Math.cos(angle) * length,
            endY: center.y + Math.sin(angle) * length
        });
    }

    for (let r = 20; r <= 100; r += 12) {
        for (let i = 0; i < radialLines.length; i++) {
            const angle = radialLines[i].angle;
            const actualR = Math.min(r, radialLines[i].length);
            spiralPoints.push({
                x: center.x + Math.cos(angle) * actualR,
                y: center.y + Math.sin(angle) * actualR,
                drawn: false
            });
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2d2d44');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 15, canvas.height);
    ctx.fillRect(canvas.width - 15, 0, 15, canvas.height);
    ctx.fillRect(0, 0, canvas.width, 15);
}

function drawWeb() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;

    radialLines.forEach((line, i) => {
        if (i < radialCount || (i === radialCount && line.progress > 0)) {
            const progress = i < radialCount ? 1 : line.progress;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(
                center.x + Math.cos(line.angle) * line.length * progress,
                center.y + Math.sin(line.angle) * line.length * progress
            );
            ctx.stroke();
        }
    });

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < spiralIndex && i < spiralPoints.length - 1; i++) {
        const current = spiralPoints[i];
        const next = spiralPoints[i + 1];

        if (Math.floor(i / radialLines.length) === Math.floor((i + 1) / radialLines.length) ||
            (i + 1) % radialLines.length !== 0) {
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
        } else if (i > 0) {
            const ringStart = Math.floor(i / radialLines.length) * radialLines.length;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(spiralPoints[ringStart].x, spiralPoints[ringStart].y);
            ctx.stroke();
        }
    }
}

function drawSpider() {
    ctx.save();
    ctx.translate(spider.x, spider.y);

    ctx.fillStyle = '#2F2F2F';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -10, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#2F2F2F';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
        const angle = (i * 0.4) - 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -2 + i * 3);
        ctx.quadraticCurveTo(-10, -5 + i * 4, -15, -8 + i * 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -2 + i * 3);
        ctx.quadraticCurveTo(10, -5 + i * 4, 15, -8 + i * 6);
        ctx.stroke();
    }

    ctx.restore();
}

function update() {
    if (phase === 'radial') {
        if (radialCount < radialLines.length) {
            const line = radialLines[radialCount];
            line.progress += 0.05 * animationSpeed;

            spider.x = center.x + Math.cos(line.angle) * line.length * line.progress;
            spider.y = center.y + Math.sin(line.angle) * line.length * line.progress;

            if (line.progress >= 1) {
                line.progress = 1;
                radialCount++;
                spider.x = center.x;
                spider.y = center.y;
            }
        } else {
            phase = 'spiral';
        }
    } else if (phase === 'spiral') {
        if (spiralIndex < spiralPoints.length) {
            const target = spiralPoints[spiralIndex];
            const dx = target.x - spider.x;
            const dy = target.y - spider.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 3) {
                spiralIndex++;
            } else {
                spider.x += (dx / dist) * 3 * animationSpeed;
                spider.y += (dy / dist) * 3 * animationSpeed;
            }
        }
    }
}

function animate() {
    drawBackground();
    drawWeb();
    update();
    drawSpider();
    requestAnimationFrame(animate);
}

document.getElementById('resetBtn').addEventListener('click', init);

init();
animate();
