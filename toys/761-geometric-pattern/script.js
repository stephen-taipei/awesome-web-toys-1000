const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeInput = document.getElementById('size');
const rotationInput = document.getElementById('rotation');

canvas.width = 370;
canvas.height = 280;

const colors = ['#00bcd4', '#e91e63', '#4caf50', '#ff9800', '#9c27b0'];

function generate() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = parseInt(sizeInput.value);
    const rotation = parseInt(rotationInput.value) * Math.PI / 180;
    const cols = Math.ceil(canvas.width / size) + 1;
    const rows = Math.ceil(canvas.height / size) + 1;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * size + size / 2;
            const y = row * size + size / 2;
            const colorIndex = (row + col) % colors.length;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            ctx.fillStyle = colors[colorIndex];
            ctx.beginPath();

            const shape = (row + col) % 3;
            if (shape === 0) {
                ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
            } else if (shape === 1) {
                ctx.rect(-size * 0.3, -size * 0.3, size * 0.6, size * 0.6);
            } else {
                ctx.moveTo(0, -size * 0.35);
                ctx.lineTo(size * 0.35, size * 0.25);
                ctx.lineTo(-size * 0.35, size * 0.25);
                ctx.closePath();
            }
            ctx.fill();
            ctx.restore();
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
sizeInput.addEventListener('input', generate);
rotationInput.addEventListener('input', generate);

generate();
