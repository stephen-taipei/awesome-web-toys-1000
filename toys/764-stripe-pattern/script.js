const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('width');
const angleInput = document.getElementById('angle');

canvas.width = 370;
canvas.height = 280;

const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71'];

function generate() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stripeWidth = parseInt(widthInput.value);
    const angle = parseInt(angleInput.value) * Math.PI / 180;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);

    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    const stripeCount = Math.ceil(diagonal / stripeWidth) * 2;

    for (let i = -stripeCount; i < stripeCount; i++) {
        ctx.fillStyle = colors[Math.abs(i) % colors.length];
        ctx.fillRect(
            i * stripeWidth - diagonal,
            -diagonal,
            stripeWidth,
            diagonal * 2
        );
    }

    ctx.restore();
}

document.getElementById('generateBtn').addEventListener('click', generate);
widthInput.addEventListener('input', generate);
angleInput.addEventListener('input', generate);

generate();
