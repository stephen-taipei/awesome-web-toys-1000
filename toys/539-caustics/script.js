const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedSlider = document.getElementById('speedSlider');
const intensitySlider = document.getElementById('intensitySlider');
const infoEl = document.getElementById('info');

let waveSpeed = 5;
let intensity = 6;
let time = 0;

// Pool floor tiles
const tileSize = 40;
const tilesX = Math.ceil(canvas.width / tileSize);
const tilesY = Math.ceil(canvas.height / tileSize);

// Wave sources (ripples)
const waves = [
    { x: 0.3, y: 0.3, freq: 1.2, amp: 1 },
    { x: 0.7, y: 0.4, freq: 0.8, amp: 0.8 },
    { x: 0.5, y: 0.7, freq: 1.5, amp: 0.6 },
    { x: 0.2, y: 0.8, freq: 1.0, amp: 0.7 }
];

function getWaterHeight(x, y, t) {
    let height = 0;
    waves.forEach(wave => {
        const dx = x - wave.x * canvas.width;
        const dy = y - wave.y * canvas.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        height += wave.amp * Math.sin(dist * 0.05 * wave.freq - t * waveSpeed * 0.5);
    });
    return height;
}

function getCausticBrightness(x, y, t) {
    // Calculate light concentration based on water surface curvature
    const delta = 2;
    const h = getWaterHeight(x, y, t);
    const hx1 = getWaterHeight(x - delta, y, t);
    const hx2 = getWaterHeight(x + delta, y, t);
    const hy1 = getWaterHeight(x, y - delta, t);
    const hy2 = getWaterHeight(x, y + delta, t);

    // Surface gradient (normal)
    const dhdx = (hx2 - hx1) / (2 * delta);
    const dhdy = (hy2 - hy1) / (2 * delta);

    // Curvature (second derivative) - caustics form where curvature is high
    const d2hdx2 = (hx2 - 2 * h + hx1) / (delta * delta);
    const d2hdy2 = (hy2 - 2 * h + hy1) / (delta * delta);

    // Laplacian approximates light concentration
    const laplacian = d2hdx2 + d2hdy2;

    // Light refraction offset
    const refractX = dhdx * 20;
    const refractY = dhdy * 20;

    // Combine effects
    const brightness = 0.5 + laplacian * intensity * 0.3;

    return {
        brightness: Math.max(0, Math.min(1, brightness)),
        offsetX: refractX,
        offsetY: refractY
    };
}

function draw() {
    time += 0.016;

    // Pool floor base color
    ctx.fillStyle = '#1a6a8a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
            const x = tx * tileSize;
            const y = ty * tileSize;
            const isLight = (tx + ty) % 2 === 0;

            ctx.fillStyle = isLight ? '#2a7a9a' : '#1a6080';
            ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);
        }
    }

    // Draw caustics using additive blending
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const step = 3; // Sample every N pixels for performance
    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
            const caustic = getCausticBrightness(x, y, time);
            const brightness = caustic.brightness;

            // Apply caustic brightness to surrounding pixels
            for (let dy = 0; dy < step && y + dy < canvas.height; dy++) {
                for (let dx = 0; dx < step && x + dx < canvas.width; dx++) {
                    const idx = ((y + dy) * canvas.width + (x + dx)) * 4;

                    // Add caustic light (cyan-white)
                    const add = (brightness - 0.5) * 200 * (intensity / 6);
                    data[idx] = Math.min(255, Math.max(0, data[idx] + add * 0.6));     // R
                    data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + add));   // G
                    data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + add));   // B
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw bright caustic lines on top for extra effect
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;

    for (let i = 0; i < 30; i++) {
        const startX = (i * 73 + time * 30 * waveSpeed) % (canvas.width + 100) - 50;
        const startY = (i * 47) % canvas.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let j = 0; j < 5; j++) {
            const px = startX + j * 15;
            const py = startY + Math.sin(time * waveSpeed + i + j * 0.5) * 20;
            ctx.lineTo(px, py);
        }

        const alpha = 0.1 + 0.1 * Math.sin(time * 3 + i);
        ctx.strokeStyle = `rgba(150, 255, 255, ${alpha * intensity / 10})`;
        ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';

    // Light rays from above
    for (let i = 0; i < 5; i++) {
        const rx = (i * 80 + 40);
        const rayAlpha = 0.05 + 0.03 * Math.sin(time * 2 + i);

        const gradient = ctx.createLinearGradient(rx, 0, rx + 30, canvas.height);
        gradient.addColorStop(0, `rgba(200, 255, 255, ${rayAlpha * intensity / 6})`);
        gradient.addColorStop(1, 'rgba(200, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(rx - 10, 0);
        ctx.lineTo(rx + 20, 0);
        ctx.lineTo(rx + 40, canvas.height);
        ctx.lineTo(rx, canvas.height);
        ctx.closePath();
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

speedSlider.addEventListener('input', (e) => {
    waveSpeed = parseInt(e.target.value);
    infoEl.textContent = `波動速度: ${waveSpeed}`;
});

intensitySlider.addEventListener('input', (e) => {
    intensity = parseInt(e.target.value);
    infoEl.textContent = `焦散強度: ${intensity}`;
});

draw();
