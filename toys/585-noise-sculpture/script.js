const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const freqSlider = document.getElementById('freqSlider');
const ampSlider = document.getElementById('ampSlider');
const infoEl = document.getElementById('info');

let frequency = 4;
let amplitude = 0.5;
let rotationY = 0;
let rotationX = 0.3;
let time = 0;

function noise3D(x, y, z) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
}

function fbm(x, y, z, octaves) {
    let value = 0;
    let amp = 1;
    let freq = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        value += amp * noise3D(x * freq, y * freq, z * freq);
        maxValue += amp;
        amp *= 0.5;
        freq *= 2;
    }

    return value / maxValue;
}

function project(v) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    let x1 = v.x * cosY - v.z * sinY;
    let z1 = v.x * sinY + v.z * cosY;
    let y1 = v.y * cosX - z1 * sinX;
    let z2 = v.y * sinX + z1 * cosX;

    const scale = 100 / (4 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        z: z2
    };
}

function generateSculpture() {
    const vertices = [];
    const resolution = 20;

    for (let i = 0; i <= resolution; i++) {
        const phi = (i / resolution) * Math.PI;
        for (let j = 0; j <= resolution; j++) {
            const theta = (j / resolution) * Math.PI * 2;

            const baseX = Math.sin(phi) * Math.cos(theta);
            const baseY = Math.cos(phi);
            const baseZ = Math.sin(phi) * Math.sin(theta);

            // Apply noise displacement
            const noiseVal = fbm(
                baseX * frequency + time * 0.3,
                baseY * frequency + time * 0.2,
                baseZ * frequency + time * 0.25,
                4
            );

            const displacement = 1 + noiseVal * amplitude;

            vertices.push({
                x: baseX * displacement,
                y: baseY * displacement,
                z: baseZ * displacement,
                noise: noiseVal
            });
        }
    }

    return vertices;
}

function draw() {
    time += 0.02;
    rotationY += 0.008;

    // Background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vertices = generateSculpture();
    const projected = vertices.map(v => ({
        ...project(v),
        noise: v.noise
    }));

    // Sort by depth
    const sorted = projected.map((p, i) => ({ ...p, i }))
        .sort((a, b) => b.z - a.z);

    // Draw connections
    const resolution = 21;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < resolution - 1; i++) {
        for (let j = 0; j < resolution; j++) {
            const idx1 = i * resolution + j;
            const idx2 = i * resolution + ((j + 1) % resolution);
            const idx3 = (i + 1) * resolution + j;

            const p1 = projected[idx1];
            const p2 = projected[idx2];
            const p3 = projected[idx3];

            if (p1 && p2) {
                const hue = (p1.noise * 60 + 240) % 360;
                ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.3)`;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }

            if (p1 && p3) {
                const hue = (p1.noise * 60 + 240) % 360;
                ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.3)`;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.stroke();
            }
        }
    }

    // Draw points
    sorted.forEach(p => {
        const size = 2 + p.z * 0.3;
        const hue = (p.noise * 60 + 240) % 360;
        const lightness = 50 + p.z * 5;

        ctx.fillStyle = `hsl(${hue}, 70%, ${Math.max(30, Math.min(70, lightness))}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, size), 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

freqSlider.addEventListener('input', (e) => {
    frequency = parseInt(e.target.value);
    infoEl.textContent = `頻率: ${frequency} | 振幅: ${amplitude.toFixed(1)}`;
});

ampSlider.addEventListener('input', (e) => {
    amplitude = parseInt(e.target.value) / 10;
    infoEl.textContent = `頻率: ${frequency} | 振幅: ${amplitude.toFixed(1)}`;
});

draw();
