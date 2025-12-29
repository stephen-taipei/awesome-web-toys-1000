const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scene1Btn = document.getElementById('scene1');
const scene2Btn = document.getElementById('scene2');
const scene3Btn = document.getElementById('scene3');
const infoEl = document.getElementById('info');

let scene = 'mountain';
let panX = 0;
let panY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

const panoramaWidth = 720;

function drawMountainScene(offsetX) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGrad.addColorStop(0, '#1a3a5c');
    skyGrad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Sun
    const sunX = ((200 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
    if (sunX < canvas.width + 50) {
        ctx.fillStyle = '#fff5d4';
        ctx.beginPath();
        ctx.arc(sunX, 60 - panY * 0.5, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Mountains
    for (let layer = 0; layer < 3; layer++) {
        const baseY = canvas.height * 0.4 + layer * 30 - panY * (0.3 - layer * 0.1);
        const colors = ['#2d5a3d', '#3d7a4d', '#4d9a5d'];

        ctx.fillStyle = colors[layer];
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 10) {
            const worldX = x + offsetX + layer * 100;
            const noise = Math.sin(worldX * 0.02) * 40 + Math.sin(worldX * 0.05) * 20;
            const y = baseY + noise;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    // Trees
    for (let i = 0; i < 10; i++) {
        const treeWorldX = i * 80 + 20;
        const treeX = ((treeWorldX - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;

        if (treeX < canvas.width + 20) {
            const treeY = canvas.height * 0.7 - panY * 0.2;
            ctx.fillStyle = '#1a4a2a';
            ctx.beginPath();
            ctx.moveTo(treeX, treeY);
            ctx.lineTo(treeX - 15, treeY + 40);
            ctx.lineTo(treeX + 15, treeY + 40);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Ground
    ctx.fillStyle = '#3d6a4d';
    ctx.fillRect(0, canvas.height * 0.85 - panY * 0.1, canvas.width, canvas.height * 0.15);
}

function drawCityScene(offsetX) {
    // Night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#0a0a2a');
    skyGrad.addColorStop(1, '#1a1a4a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (let i = 0; i < 50; i++) {
        const starX = ((i * 47 - offsetX * 0.3) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const starY = (i * 31) % (canvas.height * 0.5) - panY * 0.2;
        if (starX < canvas.width && starY > 0) {
            ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
            ctx.fillRect(starX, starY, 2, 2);
        }
    }

    // Buildings
    for (let i = 0; i < 15; i++) {
        const buildingWorldX = i * 60;
        const buildingX = ((buildingWorldX - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth - 30;

        if (buildingX < canvas.width + 50 && buildingX > -50) {
            const height = 80 + (i * 37) % 100;
            const buildingY = canvas.height - height - panY * 0.3;

            ctx.fillStyle = '#1a2a3a';
            ctx.fillRect(buildingX, buildingY, 40, height);

            // Windows
            ctx.fillStyle = '#ffcc00';
            for (let wy = buildingY + 10; wy < canvas.height - 20; wy += 15) {
                for (let wx = buildingX + 5; wx < buildingX + 35; wx += 10) {
                    if (Math.random() > 0.3) {
                        ctx.fillRect(wx, wy, 6, 8);
                    }
                }
            }
        }
    }

    // Street
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, canvas.height - 30 - panY * 0.1, canvas.width, 30);
}

function drawStarScene(offsetX) {
    // Deep space
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula
    for (let i = 0; i < 5; i++) {
        const nebulaX = ((i * 180 - offsetX * 0.5) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const nebulaY = canvas.height / 2 + Math.sin(i * 2) * 50 - panY;

        const gradient = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, 80);
        const hue = (i * 60) % 360;
        gradient.addColorStop(0, `hsla(${hue}, 70%, 30%, 0.3)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebulaX, nebulaY, 80, 0, Math.PI * 2);
        ctx.fill();
    }

    // Stars
    for (let i = 0; i < 200; i++) {
        const starWorldX = (i * 73) % panoramaWidth;
        const starX = ((starWorldX - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const starY = ((i * 41) % canvas.height) - panY * 0.5;

        if (starX < canvas.width && starY > 0 && starY < canvas.height) {
            const size = 1 + (i % 3);
            const brightness = 0.5 + (i % 5) * 0.1;
            ctx.fillStyle = `rgba(255,255,255,${brightness})`;
            ctx.beginPath();
            ctx.arc(starX, starY, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Shooting star
    const shootX = ((Date.now() * 0.1 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
    if (shootX < canvas.width) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootX, 50 - panY * 0.3);
        ctx.lineTo(shootX - 30, 80 - panY * 0.3);
        ctx.stroke();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (scene) {
        case 'mountain':
            drawMountainScene(panX);
            break;
        case 'city':
            drawCityScene(panX);
            break;
        case 'stars':
            drawStarScene(panX);
            break;
    }

    // Compass
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 30, 20, 0, Math.PI * 2);
    ctx.fill();

    const angle = (panX / panoramaWidth) * Math.PI * 2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 30, 30);
    ctx.lineTo(canvas.width - 30 + Math.sin(angle) * 12, 30 - Math.cos(angle) * 12);
    ctx.stroke();

    ctx.fillStyle = '#f44';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', canvas.width - 30, 18);

    requestAnimationFrame(draw);
}

function setScene(newScene, btn) {
    scene = newScene;
    [scene1Btn, scene2Btn, scene3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    panX = 0;
    panY = 0;
}

scene1Btn.addEventListener('click', () => setScene('mountain', scene1Btn));
scene2Btn.addEventListener('click', () => setScene('city', scene2Btn));
scene3Btn.addEventListener('click', () => setScene('stars', scene3Btn));

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX += (e.clientX - lastX) * 2;
    panY += (e.clientY - lastY);
    panY = Math.max(-50, Math.min(50, panY));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    panX += (e.touches[0].clientX - lastX) * 2;
    panY += (e.touches[0].clientY - lastY);
    panY = Math.max(-50, Math.min(50, panY));
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchend', () => isDragging = false);

draw();
