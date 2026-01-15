const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let flashAlpha = 0;
let lightnings = [];

function createLightning(startX, startY, endX, endY, depth = 0) {
    const segments = [];
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 10 || depth > 5) {
        return [{ x1: startX, y1: startY, x2: endX, y2: endY, width: Math.max(1, 4 - depth) }];
    }

    const midX = (startX + endX) / 2 + (Math.random() - 0.5) * length * 0.3;
    const midY = (startY + endY) / 2 + (Math.random() - 0.5) * length * 0.3;

    segments.push(...createLightning(startX, startY, midX, midY, depth + 1));
    segments.push(...createLightning(midX, midY, endX, endY, depth + 1));

    if (depth < 3 && Math.random() > 0.6) {
        const branchAngle = (Math.random() - 0.5) * Math.PI * 0.5;
        const branchLength = length * 0.4 * Math.random();
        const branchEndX = midX + Math.cos(Math.atan2(dy, dx) + branchAngle) * branchLength;
        const branchEndY = midY + Math.sin(Math.atan2(dy, dx) + branchAngle) * branchLength;
        segments.push(...createLightning(midX, midY, branchEndX, branchEndY, depth + 2));
    }

    return segments;
}

function triggerLightning() {
    const startX = 50 + Math.random() * (canvas.width - 100);
    const endX = startX + (Math.random() - 0.5) * 100;

    lightnings = createLightning(startX, 0, endX, canvas.height);
    flashAlpha = 1;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2c3e50');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    for (let x = 0; x <= canvas.width; x += 20) {
        ctx.lineTo(x, canvas.height * 0.7 + Math.sin(x * 0.05) * 10);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();
}

function animate() {
    drawBackground();

    if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashAlpha -= 0.05;
    }

    if (lightnings.length > 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#fff';

        lightnings.forEach(seg => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha + 0.3})`;
            ctx.lineWidth = seg.width;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        });

        ctx.shadowBlur = 0;

        if (flashAlpha <= 0) {
            lightnings = [];
        }
    }

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', triggerLightning);
document.getElementById('strikeBtn').addEventListener('click', triggerLightning);

animate();
