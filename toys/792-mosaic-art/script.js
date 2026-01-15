const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tileSizeInput = document.getElementById('tileSize');
const gapInput = document.getElementById('gap');

canvas.width = 370;
canvas.height = 280;

function generateMosaic() {
    const tileSize = parseInt(tileSizeInput.value);
    const gap = parseInt(gapInput.value);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const baseHue = Math.random() * 360;

    for (let y = 0; y < canvas.height; y += tileSize + gap) {
        for (let x = 0; x < canvas.width; x += tileSize + gap) {
            const hue = (baseHue + Math.random() * 60 - 30 + 360) % 360;
            const sat = 50 + Math.random() * 40;
            const light = 30 + Math.random() * 40;

            ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;

            const variation = Math.random();
            if (variation < 0.7) {
                ctx.fillRect(x, y, tileSize, tileSize);
            } else if (variation < 0.85) {
                ctx.beginPath();
                ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(x + tileSize/2, y);
                ctx.lineTo(x + tileSize, y + tileSize);
                ctx.lineTo(x, y + tileSize);
                ctx.closePath();
                ctx.fill();
            }

            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
            ctx.fillRect(x, y, tileSize/2, tileSize/2);
        }
    }
}

tileSizeInput.addEventListener('input', generateMosaic);
gapInput.addEventListener('input', generateMosaic);
document.getElementById('generateBtn').addEventListener('click', generateMosaic);

generateMosaic();
