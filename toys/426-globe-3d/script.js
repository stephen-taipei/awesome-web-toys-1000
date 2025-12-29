const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const cx = canvas.width / 2;
const cy = canvas.height / 2;
const radius = 140;

let rotationY = 0;
let rotationX = 0.3;
let autoRotate = true;
let dragging = false;
let lastX, lastY;

// Simplified continent points (lon, lat)
const continents = [
    // North America
    [[-130, 50], [-100, 60], [-80, 45], [-70, 30], [-100, 20], [-120, 35]],
    // South America
    [[-80, 10], [-50, 0], [-40, -30], [-60, -50], [-75, -20]],
    // Europe
    [[0, 50], [30, 60], [40, 45], [10, 35]],
    // Africa
    [[-15, 30], [35, 30], [45, 0], [20, -35], [-10, 5]],
    // Asia
    [[60, 60], [140, 50], [130, 20], [100, 10], [70, 25], [50, 40]],
    // Australia
    [[115, -20], [150, -20], [150, -40], [115, -35]]
];

function lonLatTo3D(lon, lat) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + rotationY * 180 / Math.PI) * Math.PI / 180;

    let x = radius * Math.sin(phi) * Math.cos(theta);
    let y = radius * Math.cos(phi);
    let z = radius * Math.sin(phi) * Math.sin(theta);

    // Apply X rotation
    const y2 = y * Math.cos(rotationX) - z * Math.sin(rotationX);
    const z2 = y * Math.sin(rotationX) + z * Math.cos(rotationX);

    return { x: cx + x, y: cy - y2, z: z2 };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Globe shadow
    const gradient = ctx.createRadialGradient(cx + 20, cy + 20, 0, cx + 20, cy + 20, radius + 30);
    gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx + 20, cy + 20, radius + 20, 0, Math.PI * 2);
    ctx.fill();

    // Ocean
    const oceanGradient = ctx.createRadialGradient(cx - 40, cy - 40, 0, cx, cy, radius);
    oceanGradient.addColorStop(0, '#4facfe');
    oceanGradient.addColorStop(1, '#1a5276');
    ctx.fillStyle = oceanGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 5) {
            const p = lonLatTo3D(lon, lat);
            if (p.z > 0) {
                if (lon === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
        }
        ctx.stroke();
    }

    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 5) {
            const p = lonLatTo3D(lon, lat);
            if (p.z > 0) {
                if (lat === -90) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
        }
        ctx.stroke();
    }

    // Draw continents
    ctx.fillStyle = '#27ae60';
    continents.forEach(continent => {
        ctx.beginPath();
        let started = false;
        continent.forEach(([lon, lat], i) => {
            const p = lonLatTo3D(lon, lat);
            if (p.z > 0) {
                if (!started) {
                    ctx.moveTo(p.x, p.y);
                    started = true;
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        });
        if (started) {
            ctx.closePath();
            ctx.fill();
        }
    });

    // Highlight
    ctx.beginPath();
    ctx.arc(cx - 50, cy - 50, 30, 0, Math.PI * 2);
    const highlight = ctx.createRadialGradient(cx - 50, cy - 50, 0, cx - 50, cy - 50, 30);
    highlight.addColorStop(0, 'rgba(255,255,255,0.3)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.fill();
}

function animate() {
    if (autoRotate && !dragging) {
        rotationY += 0.005;
    }
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    rotationY += dx * 0.01;
    rotationX = Math.max(-1, Math.min(1, rotationX + dy * 0.01));
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => { dragging = false; });
canvas.addEventListener('mouseleave', () => { dragging = false; });

document.getElementById('autoRotate').addEventListener('click', function() {
    autoRotate = !autoRotate;
    this.classList.toggle('active', autoRotate);
});

animate();
