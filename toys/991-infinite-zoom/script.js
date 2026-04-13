const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 280;

let time = 0;
let zoomDirection = 1;
let layers = [];

class Layer {
    constructor(depth) {
        this.depth = depth;
        this.scale = Math.pow(1.5, depth);
        this.rotation = depth * 0.2;
        this.hue = (depth * 30) % 360;
        this.shapes = [];
        this.generateShapes();
    }

    generateShapes() {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            this.shapes.push({
                angle,
                dist: 80,
                size: 20,
                type: Math.floor(Math.random() * 3)
            });
        }
    }

    draw(zoom) {
        const effectiveScale = this.scale / zoom;
        if (effectiveScale < 0.1 || effectiveScale > 10) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const alpha = Math.max(0, Math.min(1, 1 - Math.abs(Math.log10(effectiveScale))));

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation + time * 0.01);
        ctx.scale(effectiveScale, effectiveScale);

        this.shapes.forEach(shape => {
            const x = Math.cos(shape.angle + time * 0.02) * shape.dist;
            const y = Math.sin(shape.angle + time * 0.02) * shape.dist;

            ctx.fillStyle = `hsla(${this.hue + time}, 70%, 60%, ${alpha})`;
            ctx.beginPath();

            switch (shape.type) {
                case 0:
                    ctx.arc(x, y, shape.size, 0, Math.PI * 2);
                    break;
                case 1:
                    ctx.rect(x - shape.size / 2, y - shape.size / 2, shape.size, shape.size);
                    break;
                case 2:
                    ctx.moveTo(x, y - shape.size);
                    ctx.lineTo(x + shape.size, y + shape.size);
                    ctx.lineTo(x - shape.size, y + shape.size);
                    ctx.closePath();
                    break;
            }
            ctx.fill();
        });

        ctx.strokeStyle = `hsla(${this.hue + time + 180}, 70%, 70%, ${alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

function init() {
    layers = [];
    for (let i = -10; i < 10; i++) {
        layers.push(new Layer(i));
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const zoom = Math.pow(1.5, (time * 0.02 * zoomDirection) % 20 - 10);

    layers.forEach(layer => layer.draw(zoom));

    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 150
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    time++;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

document.getElementById('zoomBtn').addEventListener('click', () => {
    zoomDirection *= -1;
});

init();
animate();
