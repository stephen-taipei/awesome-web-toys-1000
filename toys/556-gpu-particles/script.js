const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const countSlider = document.getElementById('countSlider');
const countLabel = document.getElementById('countLabel');
const infoEl = document.getElementById('info');

let particleCount = 15000;
let time = 0;
let fps = 0;
let lastTime = performance.now();
let frameCount = 0;

// Typed arrays for better performance
let posX, posY, posZ;
let velX, velY, velZ;
let colors;

function initParticles() {
    posX = new Float32Array(particleCount);
    posY = new Float32Array(particleCount);
    posZ = new Float32Array(particleCount);
    velX = new Float32Array(particleCount);
    velY = new Float32Array(particleCount);
    velZ = new Float32Array(particleCount);
    colors = new Uint8Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        resetParticle(i);
    }
}

function resetParticle(i) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 5;

    posX[i] = Math.cos(angle) * r;
    posY[i] = 100;
    posZ[i] = Math.sin(angle) * r;

    const speed = 2 + Math.random() * 3;
    const spreadAngle = Math.random() * Math.PI * 2;
    const spreadR = Math.random() * 0.5;

    velX[i] = Math.cos(spreadAngle) * spreadR * speed;
    velY[i] = -speed;
    velZ[i] = Math.sin(spreadAngle) * spreadR * speed;

    // Color (cyan to blue gradient)
    const t = Math.random();
    colors[i * 3] = Math.floor(50 + t * 100);     // R
    colors[i * 3 + 1] = Math.floor(200 + t * 55); // G
    colors[i * 3 + 2] = 255;                       // B
}

function updateParticles() {
    const gravity = 0.05;

    for (let i = 0; i < particleCount; i++) {
        velY[i] += gravity;

        posX[i] += velX[i];
        posY[i] += velY[i];
        posZ[i] += velZ[i];

        // Reset if below ground
        if (posY[i] > 120) {
            resetParticle(i);
        }
    }
}

function draw() {
    time += 0.016;

    // FPS calculation
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = now;
    }

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateParticles();

    // Camera rotation
    const rotY = time * 0.3;
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    // Get image data for direct pixel manipulation
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < particleCount; i++) {
        // Rotate around Y
        const x1 = posX[i] * cosR - posZ[i] * sinR;
        const z1 = posX[i] * sinR + posZ[i] * cosR;

        // Project
        const scale = 200 / (200 + z1);
        const screenX = Math.floor(centerX + x1 * scale);
        const screenY = Math.floor(centerY + posY[i] * scale);

        // Bounds check
        if (screenX < 0 || screenX >= canvas.width || screenY < 0 || screenY >= canvas.height) {
            continue;
        }

        const idx = (screenY * canvas.width + screenX) * 4;

        // Additive blending
        const alpha = scale * 0.8;
        data[idx] = Math.min(255, data[idx] + colors[i * 3] * alpha);
        data[idx + 1] = Math.min(255, data[idx + 1] + colors[i * 3 + 1] * alpha);
        data[idx + 2] = Math.min(255, data[idx + 2] + colors[i * 3 + 2] * alpha);
        data[idx + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply glow effect using compositing
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(2px)';
    ctx.globalAlpha = 0.3;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // FPS display
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.fillText(`FPS: ${fps}`, 10, 20);
    ctx.fillText(`Particles: ${particleCount}`, 10, 35);

    requestAnimationFrame(draw);
}

countSlider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    countLabel.textContent = particleCount;
    initParticles();
    infoEl.textContent = `粒子數: ${particleCount}`;
});

initParticles();
draw();
