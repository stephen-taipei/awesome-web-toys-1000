const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const complexityInput = document.getElementById('complexity');

canvas.width = 370;
canvas.height = 280;

function drawStar(cx, cy, radius, points) {
    const angleStep = Math.PI / points;

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.4;
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}

function generate() {
    ctx.fillStyle = '#0d2137';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const complexity = parseInt(complexityInput.value);
    const tileSize = 80;
    const cols = Math.ceil(canvas.width / tileSize) + 1;
    const rows = Math.ceil(canvas.height / tileSize) + 1;

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cx = col * tileSize + (row % 2) * (tileSize / 2);
            const cy = row * tileSize;

            // Central star
            drawStar(cx, cy, tileSize * 0.35, complexity);
            ctx.fillStyle = `hsla(${(row + col) * 30}, 60%, 20%, 0.5)`;
            ctx.fill();
            ctx.stroke();

            // Connecting lines
            ctx.beginPath();
            for (let i = 0; i < complexity; i++) {
                const angle = (i / complexity) * Math.PI * 2;
                const x1 = cx + Math.cos(angle) * tileSize * 0.35;
                const y1 = cy + Math.sin(angle) * tileSize * 0.35;
                const x2 = cx + Math.cos(angle) * tileSize * 0.5;
                const y2 = cy + Math.sin(angle) * tileSize * 0.5;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
complexityInput.addEventListener('input', generate);

generate();
