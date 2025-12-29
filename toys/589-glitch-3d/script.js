const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const glitchSlider = document.getElementById('glitchSlider');
const triggerBtn = document.getElementById('triggerBtn');
const infoEl = document.getElementById('info');

let glitchIntensity = 0.5;
let rotationY = 0;
let time = 0;
let glitchTrigger = 0;

function generateCube() {
    const size = 1;
    return {
        vertices: [
            { x: -size, y: -size, z: -size },
            { x: size, y: -size, z: -size },
            { x: size, y: size, z: -size },
            { x: -size, y: size, z: -size },
            { x: -size, y: -size, z: size },
            { x: size, y: -size, z: size },
            { x: size, y: size, z: size },
            { x: -size, y: size, z: size }
        ],
        edges: [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ]
    };
}

function applyGlitch(v, intensity, t) {
    const glitchAmount = intensity * (glitchTrigger + 0.2);

    // Random displacement
    const noise = Math.sin(v.x * 10 + t * 5) * Math.cos(v.y * 8 + t * 3);
    const displacement = noise * glitchAmount * 0.3;

    // Slice effect
    const slice = Math.floor((v.y + 1) * 5) % 2 === 0;
    const sliceOffset = slice ? Math.sin(t * 10) * glitchAmount * 0.5 : 0;

    return {
        x: v.x + displacement + sliceOffset,
        y: v.y + displacement * 0.5,
        z: v.z + displacement
    };
}

function project(v) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = v.x * cosY - v.z * sinY;
    let z1 = v.x * sinY + v.z * cosY;
    let y1 = v.y * cosX - z1 * sinX;
    let z2 = v.y * sinX + z1 * cosX;

    const scale = 80 / (4 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale
    };
}

function drawGlitchLine(p1, p2, color, offset = 0) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x + offset, p1.y);
    ctx.lineTo(p2.x + offset, p2.y);
    ctx.stroke();
}

function draw() {
    time += 0.016;
    rotationY += 0.01;

    // Decay glitch trigger
    glitchTrigger *= 0.95;

    // Random glitch spikes
    if (Math.random() < glitchIntensity * 0.05) {
        glitchTrigger = Math.min(1, glitchTrigger + 0.3);
    }

    // Background with scan lines
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scan lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1);
    }

    // Horizontal glitch bars
    if (glitchTrigger > 0.3) {
        const numBars = Math.floor(glitchTrigger * 5);
        for (let i = 0; i < numBars; i++) {
            const y = Math.random() * canvas.height;
            const h = 2 + Math.random() * 10;
            const offset = (Math.random() - 0.5) * 50 * glitchTrigger;

            ctx.fillStyle = `rgba(255, 0, 102, ${0.3 * glitchTrigger})`;
            ctx.fillRect(offset, y, canvas.width, h);
        }
    }

    const cube = generateCube();

    // Apply glitch to vertices
    const glitchedVertices = cube.vertices.map(v =>
        applyGlitch(v, glitchIntensity, time)
    );

    // Project vertices
    const projected = glitchedVertices.map(v => project(v));

    // Draw with RGB separation
    const rgbOffset = glitchIntensity * glitchTrigger * 10 + glitchIntensity * 2;

    cube.edges.forEach(([i, j]) => {
        // Red channel (offset left)
        drawGlitchLine(projected[i], projected[j], 'rgba(255, 0, 0, 0.7)', -rgbOffset);

        // Green channel (center)
        drawGlitchLine(projected[i], projected[j], 'rgba(0, 255, 0, 0.7)', 0);

        // Blue channel (offset right)
        drawGlitchLine(projected[i], projected[j], 'rgba(0, 0, 255, 0.7)', rgbOffset);

        // White overlay
        drawGlitchLine(projected[i], projected[j], 'rgba(255, 255, 255, 0.3)', 0);
    });

    // Draw vertices with glitch effect
    projected.forEach((p, i) => {
        const flickerAlpha = 0.5 + Math.sin(time * 20 + i) * 0.5;

        ctx.fillStyle = `rgba(255, 0, 102, ${flickerAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + glitchTrigger * 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // VHS noise overlay
    if (glitchIntensity > 0.3) {
        const noiseAlpha = glitchIntensity * 0.1;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgba(255, 255, 255, ${noiseAlpha * Math.random()})`;
            ctx.fillRect(x, y, 2, 1);
        }
    }

    infoEl.textContent = `故障: ${Math.round(glitchIntensity * 100)}%`;

    requestAnimationFrame(draw);
}

glitchSlider.addEventListener('input', (e) => {
    glitchIntensity = parseInt(e.target.value) / 100;
});

triggerBtn.addEventListener('click', () => {
    glitchTrigger = 1;
});

draw();
