const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let pattern = 0;
let time = 0;

const patterns = ['hexagons', 'triangles', 'squares', 'circles'];

function changePattern() {
    pattern = (pattern + 1) % patterns.length;
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawHexagons() {
    const size = 25;
    const h = size * Math.sqrt(3);

    for (let row = -1; row < canvas.height / h + 1; row++) {
        for (let col = -1; col < canvas.width / (size * 1.5) + 1; col++) {
            const x = col * size * 1.5;
            const y = row * h + (col % 2) * h / 2;

            const hue = (col * 30 + row * 30 + time * 2) % 360;
            const scale = 0.8 + Math.sin(col * 0.5 + row * 0.5 + time * 0.05) * 0.2;

            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
            ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.9)`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
                const px = x + Math.cos(angle) * size * scale;
                const py = y + Math.sin(angle) * size * scale;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawTriangles() {
    const size = 30;
    const h = size * Math.sqrt(3) / 2;

    for (let row = 0; row < canvas.height / h + 1; row++) {
        for (let col = 0; col < canvas.width / size + 1; col++) {
            const x = col * size + (row % 2) * size / 2;
            const y = row * h;
            const flip = (col + row) % 2 === 0;

            const hue = (col * 20 + row * 20 + time * 2) % 360;

            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
            ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.9)`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            if (flip) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size / 2, y + h);
            } else {
                ctx.moveTo(x + size / 2, y);
                ctx.lineTo(x, y + h);
                ctx.lineTo(x + size, y + h);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawSquares() {
    const size = 30;

    for (let row = 0; row < canvas.height / size + 1; row++) {
        for (let col = 0; col < canvas.width / size + 1; col++) {
            const x = col * size;
            const y = row * size;

            const hue = (col * 25 + row * 25 + time * 2) % 360;
            const rotation = Math.sin(col * 0.3 + row * 0.3 + time * 0.03) * 0.3;
            const scale = 0.6 + Math.sin(col * 0.2 + row * 0.2 + time * 0.05) * 0.3;

            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(rotation);

            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
            ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.9)`;
            ctx.lineWidth = 2;

            ctx.fillRect(-size * scale / 2, -size * scale / 2, size * scale, size * scale);
            ctx.strokeRect(-size * scale / 2, -size * scale / 2, size * scale, size * scale);

            ctx.restore();
        }
    }
}

function drawCircles() {
    const size = 35;

    for (let row = 0; row < canvas.height / size + 1; row++) {
        for (let col = 0; col < canvas.width / size + 1; col++) {
            const x = col * size + size / 2;
            const y = row * size + size / 2;

            const hue = (col * 20 + row * 20 + time * 2) % 360;
            const radius = (size / 2) * (0.5 + Math.sin(col * 0.3 + row * 0.3 + time * 0.05) * 0.4);

            ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.6)`;
            ctx.strokeStyle = `hsla(${hue}, 70%, 70%, 0.9)`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 30);

    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`圖案: ${patterns[pattern]}`, 20, 28);
}

function animate() {
    time++;
    drawBackground();

    switch (patterns[pattern]) {
        case 'hexagons': drawHexagons(); break;
        case 'triangles': drawTriangles(); break;
        case 'squares': drawSquares(); break;
        case 'circles': drawCircles(); break;
    }

    drawInfo();

    requestAnimationFrame(animate);
}

document.getElementById('patternBtn').addEventListener('click', changePattern);

animate();
