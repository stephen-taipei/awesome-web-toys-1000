const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const typeSelect = document.getElementById('type');

canvas.width = 370;
canvas.height = 280;

function generate() {
    const color1 = color1Input.value;
    const color2 = color2Input.value;
    const type = typeSelect.value;

    let gradient;

    if (type === 'linear') {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.max(canvas.width, canvas.height);
        gradient = ctx.createLinearGradient(
            canvas.width/2 - Math.cos(angle) * length,
            canvas.height/2 - Math.sin(angle) * length,
            canvas.width/2 + Math.cos(angle) * length,
            canvas.height/2 + Math.sin(angle) * length
        );
    } else if (type === 'radial') {
        gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height) * 0.6
        );
    } else {
        // Conic gradient simulation
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const angle = Math.atan2(y - cy, x - cx);
                const t = (angle + Math.PI) / (Math.PI * 2);

                const idx = (y * canvas.width + x) * 4;
                imageData.data[idx] = rgb1.r + (rgb2.r - rgb1.r) * t;
                imageData.data[idx + 1] = rgb1.g + (rgb2.g - rgb1.g) * t;
                imageData.data[idx + 2] = rgb1.b + (rgb2.b - rgb1.b) * t;
                imageData.data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return;
    }

    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color1);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

document.getElementById('generateBtn').addEventListener('click', generate);
color1Input.addEventListener('input', generate);
color2Input.addEventListener('input', generate);
typeSelect.addEventListener('change', generate);

generate();
