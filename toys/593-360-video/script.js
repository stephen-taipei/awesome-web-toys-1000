const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const playBtn = document.getElementById('playBtn');
const scene1Btn = document.getElementById('scene1');
const scene2Btn = document.getElementById('scene2');
const scene3Btn = document.getElementById('scene3');
const infoEl = document.getElementById('info');

let scene = 'ocean';
let isPlaying = true;
let panX = 0;
let panY = 0;
let time = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

const panoramaWidth = 720;

function drawOceanScene(offsetX, t) {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#4fc3f7');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4 - panY * 0.3);

    // Sun with rays
    const sunX = ((300 - offsetX * 0.5) % panoramaWidth + panoramaWidth) % panoramaWidth;
    if (sunX < canvas.width + 60) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + t * 0.2;
            ctx.strokeStyle = 'rgba(255,200,100,0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(sunX + Math.cos(angle) * 35, 50 - panY * 0.2 + Math.sin(angle) * 35);
            ctx.lineTo(sunX + Math.cos(angle) * 60, 50 - panY * 0.2 + Math.sin(angle) * 60);
            ctx.stroke();
        }
        ctx.fillStyle = '#fff5d4';
        ctx.beginPath();
        ctx.arc(sunX, 50 - panY * 0.2, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ocean with waves
    for (let layer = 0; layer < 5; layer++) {
        const baseY = canvas.height * 0.4 + layer * 40 - panY * 0.2;
        const alpha = 0.9 - layer * 0.1;

        ctx.fillStyle = `rgba(0, ${100 + layer * 20}, ${180 + layer * 10}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x += 5) {
            const worldX = x + offsetX;
            const wave = Math.sin(worldX * 0.03 + t * 2 + layer) * (10 - layer * 1.5);
            const wave2 = Math.sin(worldX * 0.05 + t * 1.5) * 5;
            ctx.lineTo(x, baseY + wave + wave2);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    // Fish
    for (let i = 0; i < 5; i++) {
        const fishX = ((i * 150 + t * 50 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const fishY = canvas.height * 0.6 + Math.sin(t * 2 + i) * 20 - panY * 0.1;

        if (fishX < canvas.width + 20) {
            ctx.fillStyle = `hsl(${30 + i * 20}, 80%, 60%)`;
            ctx.beginPath();
            ctx.ellipse(fishX, fishY, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(fishX - 15, fishY);
            ctx.lineTo(fishX - 25, fishY - 8);
            ctx.lineTo(fishX - 25, fishY + 8);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Bubbles
    for (let i = 0; i < 10; i++) {
        const bubbleX = ((i * 80 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const bubbleY = canvas.height - ((t * 30 + i * 50) % (canvas.height * 0.6));

        if (bubbleX < canvas.width) {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, 3 + i % 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawForestScene(offsetX, t) {
    // Sky through canopy
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Light rays
    for (let i = 0; i < 8; i++) {
        const rayX = ((i * 100 - offsetX * 0.3) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const rayAlpha = 0.1 + Math.sin(t + i) * 0.05;

        if (rayX < canvas.width + 50) {
            ctx.fillStyle = `rgba(255, 255, 200, ${rayAlpha})`;
            ctx.beginPath();
            ctx.moveTo(rayX, 0);
            ctx.lineTo(rayX - 30, canvas.height);
            ctx.lineTo(rayX + 30, canvas.height);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Trees
    for (let i = 0; i < 12; i++) {
        const treeX = ((i * 70 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const treeHeight = 150 + (i * 31) % 80;

        if (treeX < canvas.width + 40) {
            // Trunk
            ctx.fillStyle = '#3d2a1a';
            ctx.fillRect(treeX - 8, canvas.height - treeHeight - panY * 0.2, 16, treeHeight);

            // Leaves layers
            for (let j = 0; j < 3; j++) {
                const leafY = canvas.height - treeHeight + j * 30 - panY * 0.2;
                const leafSize = 40 - j * 8;
                const sway = Math.sin(t * 2 + i + j) * 3;

                ctx.fillStyle = `hsl(${100 + j * 10}, 60%, ${25 + j * 5}%)`;
                ctx.beginPath();
                ctx.moveTo(treeX + sway, leafY);
                ctx.lineTo(treeX - leafSize + sway, leafY + 35);
                ctx.lineTo(treeX + leafSize + sway, leafY + 35);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    // Fireflies
    for (let i = 0; i < 15; i++) {
        const ffX = ((i * 60 + Math.sin(t + i) * 20 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const ffY = canvas.height * 0.5 + Math.sin(t * 1.5 + i * 2) * 50 - panY * 0.3;
        const glow = 0.5 + Math.sin(t * 5 + i * 3) * 0.5;

        if (ffX < canvas.width) {
            ctx.fillStyle = `rgba(255, 255, 100, ${glow})`;
            ctx.beginPath();
            ctx.arc(ffX, ffY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Ground
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(0, canvas.height - 30 - panY * 0.1, canvas.width, 30);
}

function drawSpaceScene(offsetX, t) {
    // Deep space
    ctx.fillStyle = '#000020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant galaxies
    for (let i = 0; i < 3; i++) {
        const gx = ((i * 250 - offsetX * 0.2) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const gy = 80 + i * 60 - panY * 0.3;

        if (gx < canvas.width + 50) {
            const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, 40);
            gradient.addColorStop(0, `hsla(${(t * 10 + i * 80) % 360}, 60%, 50%, 0.4)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(gx, gy, 50, 25, t * 0.1 + i, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Stars
    for (let i = 0; i < 150; i++) {
        const starX = ((i * 53 - offsetX * 0.8) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const starY = ((i * 37) % canvas.height) - panY * 0.4;
        const twinkle = 0.5 + Math.sin(t * 3 + i) * 0.5;

        if (starX < canvas.width && starY > 0 && starY < canvas.height) {
            ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
            ctx.beginPath();
            ctx.arc(starX, starY, 1 + i % 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Planet
    const planetX = ((400 - offsetX * 0.5) % panoramaWidth + panoramaWidth) % panoramaWidth;
    if (planetX < canvas.width + 60) {
        const planetY = 120 - panY * 0.2;

        // Planet glow
        const glow = ctx.createRadialGradient(planetX, planetY, 30, planetX, planetY, 60);
        glow.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(planetX, planetY, 60, 0, Math.PI * 2);
        ctx.fill();

        // Planet body
        const planetGrad = ctx.createRadialGradient(planetX - 10, planetY - 10, 0, planetX, planetY, 40);
        planetGrad.addColorStop(0, '#6080c0');
        planetGrad.addColorStop(1, '#304060');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(planetX, planetY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = 'rgba(200, 180, 150, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(planetX, planetY, 60, 15, 0.3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Asteroid field
    for (let i = 0; i < 8; i++) {
        const ax = ((i * 100 + t * 20 - offsetX) % panoramaWidth + panoramaWidth) % panoramaWidth;
        const ay = canvas.height * 0.7 + Math.sin(i * 2) * 30 - panY * 0.2;

        if (ax < canvas.width) {
            ctx.fillStyle = '#4a4a5a';
            ctx.beginPath();
            ctx.ellipse(ax, ay, 8 + i % 5, 5 + i % 3, t + i, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function draw() {
    if (isPlaying) {
        time += 0.016;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (scene) {
        case 'ocean':
            drawOceanScene(panX, time);
            break;
        case 'forest':
            drawForestScene(panX, time);
            break;
        case 'space':
            drawSpaceScene(panX, time);
            break;
    }

    // Play indicator
    if (!isPlaying) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 8, canvas.height / 2 - 12);
        ctx.lineTo(canvas.width / 2 + 12, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 - 8, canvas.height / 2 + 12);
        ctx.closePath();
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

function setScene(newScene, btn) {
    scene = newScene;
    [scene1Btn, scene2Btn, scene3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.textContent = isPlaying ? '暫停' : '播放';
});

scene1Btn.addEventListener('click', () => setScene('ocean', scene1Btn));
scene2Btn.addEventListener('click', () => setScene('forest', scene2Btn));
scene3Btn.addEventListener('click', () => setScene('space', scene3Btn));

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
