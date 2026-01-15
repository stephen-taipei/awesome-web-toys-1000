const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const densityInput = document.getElementById('density');

canvas.width = 370;
canvas.height = 280;

function generate() {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellSize = parseInt(densityInput.value);
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * cellSize;
            const y = row * cellSize;

            ctx.beginPath();

            // Randomly draw / or \
            if (Math.random() > 0.5) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y + cellSize);
            } else {
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x, y + cellSize);
            }
            ctx.stroke();
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
densityInput.addEventListener('input', generate);

generate();
