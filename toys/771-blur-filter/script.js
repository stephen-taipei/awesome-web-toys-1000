const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const blurInput = document.getElementById('blur');

canvas.width = 370;
canvas.height = 250;

let originalData = null;

function generateImage() {
    // Create random colorful image
    for (let y = 0; y < canvas.height; y += 20) {
        for (let x = 0; x < canvas.width; x += 20) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
            ctx.fillRect(x, y, 20, 20);
        }
    }
    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyBlur();
}

function applyBlur() {
    if (!originalData) return;

    const blur = parseInt(blurInput.value);
    ctx.putImageData(originalData, 0, 0);

    if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }
}

blurInput.addEventListener('input', applyBlur);
document.getElementById('generateBtn').addEventListener('click', generateImage);

generateImage();
