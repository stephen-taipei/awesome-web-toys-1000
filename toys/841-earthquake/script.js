const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 370;
canvas.height = 300;

let waves = [];
let buildings = [];
let shakeIntensity = 0;
let epicenter = { x: canvas.width / 2, y: canvas.height - 50 };

function initBuildings() {
    buildings = [];
    for (let i = 0; i < 8; i++) {
        buildings.push({
            x: 30 + i * 45,
            width: 30 + Math.random() * 15,
            height: 40 + Math.random() * 60,
            color: `hsl(${200 + Math.random() * 40}, 20%, ${40 + Math.random() * 20}%)`,
            offset: 0
        });
    }
}

function triggerEarthquake() {
    shakeIntensity = 15;
    epicenter = {
        x: 50 + Math.random() * (canvas.width - 100),
        y: canvas.height - 30 - Math.random() * 50
    };

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            waves.push({
                x: epicenter.x,
                y: epicenter.y,
                radius: 0,
                maxRadius: 300,
                alpha: 1
            });
        }, i * 200);
    }
}

function updateWaves() {
    for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].radius += 3;
        waves[i].alpha = 1 - waves[i].radius / waves[i].maxRadius;

        if (waves[i].radius > waves[i].maxRadius) {
            waves.splice(i, 1);
        }
    }
}

function updateShake() {
    if (shakeIntensity > 0) {
        shakeIntensity *= 0.95;
        if (shakeIntensity < 0.1) shakeIntensity = 0;

        buildings.forEach(b => {
            b.offset = (Math.random() - 0.5) * shakeIntensity;
        });
    } else {
        buildings.forEach(b => {
            b.offset *= 0.9;
        });
    }
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(0, canvas.height * 0.5, canvas.width, canvas.height * 0.5);
}

function drawLayers() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 30);

    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}

function drawWaves() {
    waves.forEach(wave => {
        ctx.strokeStyle = `rgba(255, 100, 100, ${wave.alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 150, 100, ${wave.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawEpicenter() {
    if (shakeIntensity > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${shakeIntensity / 15})`;
        ctx.beginPath();
        ctx.arc(epicenter.x, epicenter.y, 10 + shakeIntensity, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawBuildings() {
    buildings.forEach(b => {
        const groundY = canvas.height * 0.5;

        ctx.fillStyle = b.color;
        ctx.save();
        ctx.translate(b.x + b.offset, groundY);

        ctx.fillRect(0, -b.height, b.width, b.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        const windowSize = 6;
        const windowGap = 10;
        for (let row = 0; row < Math.floor(b.height / windowGap) - 1; row++) {
            for (let col = 0; col < Math.floor(b.width / windowGap) - 1; col++) {
                ctx.fillRect(
                    5 + col * windowGap,
                    -b.height + 8 + row * windowGap,
                    windowSize,
                    windowSize
                );
            }
        }

        ctx.restore();
    });
}

function drawSeismograph() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(canvas.width - 110, 10, 100, 60);

    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 105, 40);

    for (let i = 0; i < 90; i++) {
        const x = canvas.width - 105 + i;
        const y = 40 + Math.sin(i * 0.3 + Date.now() * 0.01) * shakeIntensity;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText(`強度: ${shakeIntensity.toFixed(1)}`, canvas.width - 100, 60);
}

function animate() {
    drawBackground();
    drawLayers();
    drawWaves();
    drawEpicenter();
    drawBuildings();
    drawSeismograph();
    updateWaves();
    updateShake();
    requestAnimationFrame(animate);
}

document.getElementById('quakeBtn').addEventListener('click', triggerEarthquake);

initBuildings();
animate();
