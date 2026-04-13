const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let light = { x: canvas.width / 2, y: 50 };
let plants = [];

function initPlants() {
    plants = [];
    for (let i = 0; i < 5; i++) {
        plants.push({
            x: 50 + i * 70,
            segments: [{ x: 50 + i * 70, y: canvas.height - 40, angle: -Math.PI / 2, length: 0, targetLength: 20 }],
            maxSegments: 8,
            growthSpeed: 0.5
        });
    }
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#3d2817';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 150);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawLight() {
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(light.x, light.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(light.x + Math.cos(angle) * 20, light.y + Math.sin(angle) * 20);
        ctx.lineTo(light.x + Math.cos(angle) * 30, light.y + Math.sin(angle) * 30);
        ctx.stroke();
    }
}

function updatePlants() {
    plants.forEach(plant => {
        const lastSeg = plant.segments[plant.segments.length - 1];

        if (lastSeg.length < lastSeg.targetLength) {
            lastSeg.length += plant.growthSpeed;
        } else if (plant.segments.length < plant.maxSegments) {
            const endX = lastSeg.x + Math.cos(lastSeg.angle) * lastSeg.length;
            const endY = lastSeg.y + Math.sin(lastSeg.angle) * lastSeg.length;

            const angleToLight = Math.atan2(light.y - endY, light.x - endX);
            const newAngle = lastSeg.angle + (angleToLight - lastSeg.angle) * 0.3;

            plant.segments.push({
                x: endX,
                y: endY,
                angle: newAngle,
                length: 0,
                targetLength: 15 + Math.random() * 10
            });
        }

        plant.segments.forEach((seg, i) => {
            if (i > 0) {
                const endX = seg.x + Math.cos(seg.angle) * seg.length;
                const endY = seg.y + Math.sin(seg.angle) * seg.length;
                const angleToLight = Math.atan2(light.y - endY, light.x - endX);
                seg.angle += (angleToLight - seg.angle) * 0.01;
            }
        });
    });
}

function drawPlants() {
    plants.forEach(plant => {
        let currentX = plant.segments[0].x;
        let currentY = plant.segments[0].y;

        plant.segments.forEach((seg, i) => {
            const endX = seg.x + Math.cos(seg.angle) * seg.length;
            const endY = seg.y + Math.sin(seg.angle) * seg.length;

            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 4 - i * 0.3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(seg.x, seg.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            if (i > 0 && i % 2 === 0) {
                const leafAngle = seg.angle + Math.PI / 3;
                ctx.fillStyle = '#32CD32';
                ctx.beginPath();
                ctx.ellipse(seg.x, seg.y, 8, 4, leafAngle, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.ellipse(seg.x, seg.y, 8, 4, leafAngle + Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        const lastSeg = plant.segments[plant.segments.length - 1];
        if (lastSeg.length > 5) {
            const tipX = lastSeg.x + Math.cos(lastSeg.angle) * lastSeg.length;
            const tipY = lastSeg.y + Math.sin(lastSeg.angle) * lastSeg.length;

            ctx.fillStyle = '#90EE90';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function animate() {
    drawBackground();
    drawLight();
    updatePlants();
    drawPlants();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    light.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    light.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    light.x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    light.y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
});

document.getElementById('resetBtn').addEventListener('click', initPlants);

initPlants();
animate();
