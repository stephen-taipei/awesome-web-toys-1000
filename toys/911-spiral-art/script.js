const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let style = 0;
let time = 0;

const styles = ['classic', 'dots', 'squares', 'lines'];

function changeStyle() {
    style = (style + 1) % styles.length;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpiral() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

    const currentStyle = styles[style];

    for (let i = 0; i < 500; i++) {
        const angle = i * 0.1 + time * 0.02;
        const radius = i * 0.25;

        if (radius > maxRadius) break;

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        const hue = (i * 2 + time * 2) % 360;
        const size = 2 + Math.sin(i * 0.1 + time * 0.05) * 2;

        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

        switch (currentStyle) {
            case 'classic':
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'dots':
                ctx.beginPath();
                ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'squares':
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                ctx.fillRect(-size, -size, size * 2, size * 2);
                ctx.restore();
                break;
            case 'lines':
                if (i > 0) {
                    const prevAngle = (i - 1) * 0.1 + time * 0.02;
                    const prevRadius = (i - 1) * 0.25;
                    const prevX = cx + Math.cos(prevAngle) * prevRadius;
                    const prevY = cy + Math.sin(prevAngle) * prevRadius;
                    ctx.lineWidth = size;
                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                break;
        }
    }
}

function drawBackground() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`樣式: ${styles[style]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();
    drawSpiral();
    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('styleBtn').addEventListener('click', changeStyle);

ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
animate();
