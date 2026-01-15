const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let operation = 'union';

const circle1 = { x: canvas.width * 0.35, y: canvas.height * 0.5, r: 60 };
const circle2 = { x: canvas.width * 0.65, y: canvas.height * 0.5, r: 60 };

function draw() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'source-over';

    switch (operation) {
        case 'union':
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'intersect':
            ctx.save();
            ctx.beginPath();
            ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;

        case 'subtract':
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'xor':
            ctx.fillStyle = '#f39c12';
            ctx.globalCompositeOperation = 'xor';
            ctx.beginPath();
            ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    // Draw outlines
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(circle1.x, circle1.y, circle1.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(circle2.x, circle2.y, circle2.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

document.querySelectorAll('.toolbar button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toolbar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        operation = btn.dataset.op;
        draw();
    });
});

draw();
