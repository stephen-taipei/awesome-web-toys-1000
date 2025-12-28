const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const shapeSelect = document.getElementById('shape');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');
const sizeSlider = document.getElementById('size');
const spacingSlider = document.getElementById('spacing');
const rotationSlider = document.getElementById('rotation');

function drawShape(x, y, size, shape, color, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.fillStyle = color;

    switch(shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'square':
            ctx.fillRect(-size / 2, -size / 2, size, size);
            break;
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(size / 2, size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
            ctx.fill();
            break;
        case 'star':
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 72 - 90) * Math.PI / 180;
                const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
                if (i === 0) {
                    ctx.moveTo(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
                } else {
                    ctx.lineTo(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
                }
                ctx.lineTo(Math.cos(innerAngle) * size / 4, Math.sin(innerAngle) * size / 4);
            }
            ctx.closePath();
            ctx.fill();
            break;
    }

    ctx.restore();
}

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shape = shapeSelect.value;
    const color1 = color1Input.value;
    const color2 = color2Input.value;
    const size = parseInt(sizeSlider.value);
    const spacing = parseInt(spacingSlider.value);
    const rotation = parseInt(rotationSlider.value);

    let toggle = false;
    for (let y = spacing / 2; y < canvas.height; y += spacing) {
        for (let x = spacing / 2; x < canvas.width; x += spacing) {
            const color = toggle ? color1 : color2;
            const offset = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
            drawShape(x + offset, y, size, shape, color, rotation);
            toggle = !toggle;
        }
    }
}

function randomize() {
    const shapes = ['circle', 'square', 'triangle', 'star'];
    shapeSelect.value = shapes[Math.floor(Math.random() * shapes.length)];

    color1Input.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    color2Input.value = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    sizeSlider.value = 15 + Math.floor(Math.random() * 35);
    spacingSlider.value = 25 + Math.floor(Math.random() * 55);
    rotationSlider.value = Math.floor(Math.random() * 360);

    draw();
}

shapeSelect.addEventListener('change', draw);
color1Input.addEventListener('input', draw);
color2Input.addEventListener('input', draw);
sizeSlider.addEventListener('input', draw);
spacingSlider.addEventListener('input', draw);
rotationSlider.addEventListener('input', draw);
document.getElementById('randomize').addEventListener('click', randomize);

draw();
