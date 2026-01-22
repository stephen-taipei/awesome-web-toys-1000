const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let sources = [
    { x: canvas.width / 2 - 40, y: 50 },
    { x: canvas.width / 2 + 40, y: 50 }
];

let time = 0;
const wavelength = 30;
const speed = 0.15;

function addSource() {
    if (sources.length >= 5) {
        sources = [
            { x: canvas.width / 2 - 40, y: 50 },
            { x: canvas.width / 2 + 40, y: 50 }
        ];
    } else {
        sources.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 30 + Math.random() * 60
        });
    }
}

function calculateWave(x, y) {
    let totalAmplitude = 0;

    sources.forEach(source => {
        const dx = x - source.x;
        const dy = y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const phase = (distance / wavelength) * Math.PI * 2 - time * speed;
        const amplitude = Math.sin(phase) / (1 + distance * 0.01);

        totalAmplitude += amplitude;
    });

    return totalAmplitude / sources.length;
}

function draw() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const amplitude = calculateWave(x, y);
            const normalized = (amplitude + 1) / 2;

            const i = (y * canvas.width + x) * 4;

            data[i] = normalized * 50;
            data[i + 1] = normalized * 200 + 50;
            data[i + 2] = normalized * 255;
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    sources.forEach(source => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(source.x, source.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(source.x, source.y, 10, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawInfo() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 100, 50);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '11px Arial';
    ctx.fillText(`波源: ${sources.length}`, 20, 28);
    ctx.fillText(`波長: ${wavelength}px`, 20, 45);
}

function animate() {
    time++;
    draw();
    drawInfo();

    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (sources.length < 5) {
        sources.push({ x, y });
    }
});

document.getElementById('sourceBtn').addEventListener('click', addSource);

animate();
