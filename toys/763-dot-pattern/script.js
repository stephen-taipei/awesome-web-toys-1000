const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spacingInput = document.getElementById('spacing');
const dotSizeInput = document.getElementById('dotSize');

canvas.width = 370;
canvas.height = 280;

function generate() {
    ctx.fillStyle = '#fce4ec';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const spacing = parseInt(spacingInput.value);
    const dotSize = parseInt(dotSizeInput.value);
    const cols = Math.ceil(canvas.width / spacing);
    const rows = Math.ceil(canvas.height / spacing);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * spacing + spacing / 2;
            const y = row * spacing + spacing / 2;

            const distFromCenter = Math.sqrt(
                Math.pow(x - canvas.width / 2, 2) +
                Math.pow(y - canvas.height / 2, 2)
            );
            const maxDist = Math.sqrt(
                Math.pow(canvas.width / 2, 2) +
                Math.pow(canvas.height / 2, 2)
            );
            const sizeVariation = 1 - distFromCenter / maxDist;
            const currentSize = dotSize * (0.5 + sizeVariation * 0.8);

            ctx.fillStyle = `hsl(340, 80%, ${40 + sizeVariation * 30}%)`;
            ctx.beginPath();
            ctx.arc(x, y, currentSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
spacingInput.addEventListener('input', generate);
dotSizeInput.addEventListener('input', generate);

generate();
