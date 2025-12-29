const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const speedSlider = document.getElementById('speedSlider');
const infoEl = document.getElementById('info');

let mode = 'vortex';
let speed = 5;
let time = 0;

const cx = canvas.width / 2;
const cy = canvas.height / 2;

function drawVortex(t) {
    const numRings = 20;
    const numSegments = 60;

    for (let ring = 0; ring < numRings; ring++) {
        const depth = (ring + t * 0.5) % numRings;
        const z = depth / numRings;
        const radius = 20 + (1 - z) * 150;
        const alpha = z * 0.8;

        const hue = (ring * 20 + t * 50) % 360;

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 1 + (1 - z) * 2;

        ctx.beginPath();
        for (let i = 0; i <= numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
            const twist = t * 0.5 + z * 3;
            const x = cx + Math.cos(angle + twist) * radius;
            const y = cy + Math.sin(angle + twist) * radius;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Spiral arms
        for (let arm = 0; arm < 6; arm++) {
            const armAngle = (arm / 6) * Math.PI * 2 + t * 0.3 + z * 5;
            const x = cx + Math.cos(armAngle) * radius;
            const y = cy + Math.sin(armAngle) * radius;

            ctx.fillStyle = `hsla(${(hue + 180) % 360}, 80%, 70%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + (1 - z) * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawTunnel(t) {
    const numRings = 25;

    for (let ring = 0; ring < numRings; ring++) {
        const depth = (ring + t * 0.3) % numRings;
        const z = depth / numRings;
        const radius = 30 + (1 - z) * 140;
        const alpha = z;

        const hue = (depth * 15 + t * 30) % 360;

        // Checkerboard pattern
        const numSegments = 16;
        const segmentAngle = (Math.PI * 2) / numSegments;

        for (let seg = 0; seg < numSegments; seg++) {
            const checker = (ring + seg) % 2;
            if (checker === 0) continue;

            const angle1 = seg * segmentAngle + t * 0.2;
            const angle2 = (seg + 1) * segmentAngle + t * 0.2;

            ctx.fillStyle = `hsla(${hue}, 70%, ${40 + z * 30}%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, angle1, angle2);
            ctx.arc(cx, cy, radius * 0.85, angle2, angle1, true);
            ctx.closePath();
            ctx.fill();
        }

        // Ring outline
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Center light
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    gradient.addColorStop(0, `hsla(${t * 50 % 360}, 80%, 90%, 0.8)`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();
}

function drawPetals(t) {
    const numLayers = 12;
    const numPetals = 8;

    for (let layer = 0; layer < numLayers; layer++) {
        const depth = (layer + t * 0.4) % numLayers;
        const z = depth / numLayers;
        const radius = 30 + (1 - z) * 130;
        const alpha = z * 0.9;

        const hue = (layer * 30 + t * 40) % 360;
        const rotation = t * 0.3 + z * 2;

        for (let petal = 0; petal < numPetals; petal++) {
            const angle = (petal / numPetals) * Math.PI * 2 + rotation;

            // Petal shape
            const petalWidth = 0.3 + z * 0.2;
            const x = cx + Math.cos(angle) * radius * 0.5;
            const y = cy + Math.sin(angle) * radius * 0.5;
            const tipX = cx + Math.cos(angle) * radius;
            const tipY = cy + Math.sin(angle) * radius;

            const perpAngle = angle + Math.PI / 2;
            const ctrlDist = radius * petalWidth;
            const ctrl1X = x + Math.cos(perpAngle) * ctrlDist * 0.5;
            const ctrl1Y = y + Math.sin(perpAngle) * ctrlDist * 0.5;
            const ctrl2X = x - Math.cos(perpAngle) * ctrlDist * 0.5;
            const ctrl2Y = y - Math.sin(perpAngle) * ctrlDist * 0.5;

            ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
            ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(ctrl1X, ctrl1Y, tipX, tipY);
            ctx.quadraticCurveTo(ctrl2X, ctrl2Y, x, y);
            ctx.fill();
            ctx.stroke();
        }
    }

    // Center flower
    const centerHue = t * 60 % 360;
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + t * 0.5;
        const dist = 15;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        ctx.fillStyle = `hsl(${(centerHue + i * 30) % 360}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = `hsl(${centerHue}, 90%, 85%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    time += 0.016 * speed;

    // Background fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
        case 'vortex':
            drawVortex(time);
            break;
        case 'tunnel':
            drawTunnel(time);
            break;
        case 'petals':
            drawPetals(time);
            break;
    }

    const modeNames = {
        vortex: '漩渦模式',
        tunnel: '隧道模式',
        petals: '花瓣模式'
    };
    infoEl.textContent = modeNames[mode];

    requestAnimationFrame(draw);
}

function setMode(newMode, btn) {
    mode = newMode;
    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Clear canvas when switching modes
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

mode1Btn.addEventListener('click', () => setMode('vortex', mode1Btn));
mode2Btn.addEventListener('click', () => setMode('tunnel', mode2Btn));
mode3Btn.addEventListener('click', () => setMode('petals', mode3Btn));

speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
});

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
draw();
