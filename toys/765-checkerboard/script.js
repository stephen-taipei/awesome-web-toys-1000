const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cellsInput = document.getElementById('cells');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');

canvas.width = 370;
canvas.height = 280;

function generate() {
    const cells = parseInt(cellsInput.value);
    const cellWidth = canvas.width / cells;
    const cellHeight = canvas.height / Math.ceil(cells * canvas.height / canvas.width);
    const rows = Math.ceil(canvas.height / cellHeight);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cells; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? color1Input.value : color2Input.value;
            ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        }
    }
}

document.getElementById('generateBtn').addEventListener('click', generate);
cellsInput.addEventListener('input', generate);
color1Input.addEventListener('input', generate);
color2Input.addEventListener('input', generate);

generate();
