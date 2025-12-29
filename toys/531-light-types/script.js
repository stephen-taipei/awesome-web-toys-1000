const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const buttons = document.querySelectorAll('.light-btn');
const infoEl = document.getElementById('info');

let lightType = 'point';
let time = 0;
let rotY = 0;

// Light properties
const lights = {
    point: { x: 0, y: -2, z: -2, color: '#ffeaa7', intensity: 1 },
    directional: { dx: 0.5, dy: -1, dz: 0.5, color: '#74b9ff', intensity: 0.8 },
    spot: { x: 0, y: -3, z: -2, dx: 0, dy: 1, dz: 0.5, angle: 30, color: '#ff7675', intensity: 1 }
};

// Spheres to light
const spheres = [
    { x: 0, y: 0, z: 0, radius: 0.8, baseColor: [200, 200, 200] },
    { x: -1.8, y: 0.3, z: 0.5, radius: 0.5, baseColor: [180, 220, 255] },
    { x: 1.8, y: 0.3, z: 0.5, radius: 0.5, baseColor: [255, 200, 180] }
];

function normalize(v) {
    const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
    return [v[0]/len, v[1]/len, v[2]/len];
}

function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function project(x, y, z) {
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;

    const dist = 6;
    const adjustedZ = rz + dist;
    if (adjustedZ <= 0.1) return null;

    const fov = 150;
    return {
        x: canvas.width / 2 + (rx / adjustedZ) * fov,
        y: canvas.height / 2 + (y / adjustedZ) * fov,
        z: adjustedZ
    };
}

function calculateLighting(px, py, pz, nx, ny, nz) {
    const normal = normalize([nx, ny, nz]);
    let intensity = 0.1; // Ambient

    if (lightType === 'point') {
        const light = lights.point;
        const toLight = normalize([light.x - px, light.y - py, light.z - pz]);
        const diff = Math.max(0, dot(normal, toLight));
        const dist = Math.sqrt((light.x-px)**2 + (light.y-py)**2 + (light.z-pz)**2);
        intensity += diff * light.intensity / (1 + dist * 0.3);
    } else if (lightType === 'directional') {
        const light = lights.directional;
        const dir = normalize([-light.dx, -light.dy, -light.dz]);
        const diff = Math.max(0, dot(normal, dir));
        intensity += diff * light.intensity;
    } else if (lightType === 'spot') {
        const light = lights.spot;
        const toLight = normalize([light.x - px, light.y - py, light.z - pz]);
        const spotDir = normalize([light.dx, light.dy, light.dz]);
        const spotAngle = Math.acos(dot([-toLight[0], -toLight[1], -toLight[2]], spotDir));
        const maxAngle = light.angle * Math.PI / 180;

        if (spotAngle < maxAngle) {
            const diff = Math.max(0, dot(normal, toLight));
            const falloff = 1 - spotAngle / maxAngle;
            intensity += diff * light.intensity * falloff;
        }
    }

    return Math.min(1, intensity);
}

function drawSphere(sphere) {
    const projected = project(sphere.x, sphere.y, sphere.z);
    if (!projected) return null;

    const screenRadius = sphere.radius * 150 / projected.z;

    return {
        z: projected.z,
        draw: () => {
            // Draw sphere with shading
            const steps = 20;
            for (let i = steps; i >= 0; i--) {
                const t = i / steps;
                const angle = t * Math.PI / 2;

                // Calculate normal at this ring
                const ny = -Math.cos(angle);
                const ringRadius = Math.sin(angle);

                // Sample lighting at front of sphere
                const worldY = sphere.y + ny * sphere.radius;
                const nz = -Math.sqrt(1 - ny * ny);
                const intensity = calculateLighting(
                    sphere.x, worldY, sphere.z - sphere.radius,
                    0, ny, nz
                );

                const r = Math.floor(sphere.baseColor[0] * intensity);
                const g = Math.floor(sphere.baseColor[1] * intensity);
                const b = Math.floor(sphere.baseColor[2] * intensity);

                ctx.beginPath();
                ctx.arc(projected.x, projected.y, screenRadius * (1 - t * 0.1), 0, Math.PI * 2);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fill();
            }

            // Highlight
            const highlightIntensity = calculateLighting(
                sphere.x, sphere.y - sphere.radius * 0.7, sphere.z - sphere.radius * 0.7,
                0, -0.7, -0.7
            );
            if (highlightIntensity > 0.5) {
                ctx.beginPath();
                ctx.arc(
                    projected.x - screenRadius * 0.3,
                    projected.y - screenRadius * 0.3,
                    screenRadius * 0.15,
                    0, Math.PI * 2
                );
                ctx.fillStyle = `rgba(255, 255, 255, ${(highlightIntensity - 0.5) * 0.8})`;
                ctx.fill();
            }
        }
    };
}

function drawLightIndicator() {
    let lightPos;

    if (lightType === 'point') {
        lightPos = project(lights.point.x, lights.point.y, lights.point.z);
        if (lightPos) {
            // Glow
            const gradient = ctx.createRadialGradient(lightPos.x, lightPos.y, 0, lightPos.x, lightPos.y, 30);
            gradient.addColorStop(0, 'rgba(255, 234, 167, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 234, 167, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(lightPos.x, lightPos.y, 30, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(lightPos.x, lightPos.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffeaa7';
            ctx.fill();
        }
    } else if (lightType === 'directional') {
        // Draw parallel rays
        ctx.strokeStyle = 'rgba(116, 185, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            const startX = canvas.width / 2 + i * 40 - 30;
            const startY = 30;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + 60, startY + 80);
            ctx.stroke();

            // Arrow
            ctx.beginPath();
            ctx.moveTo(startX + 60, startY + 80);
            ctx.lineTo(startX + 50, startY + 70);
            ctx.moveTo(startX + 60, startY + 80);
            ctx.lineTo(startX + 55, startY + 65);
            ctx.stroke();
        }
    } else if (lightType === 'spot') {
        lightPos = project(lights.spot.x, lights.spot.y, lights.spot.z);
        if (lightPos) {
            // Cone
            ctx.beginPath();
            ctx.moveTo(lightPos.x, lightPos.y);
            ctx.lineTo(lightPos.x - 40, lightPos.y + 80);
            ctx.lineTo(lightPos.x + 40, lightPos.y + 80);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 118, 117, 0.2)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(lightPos.x, lightPos.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ff7675';
            ctx.fill();
        }
    }
}

function drawFloor() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let i = -5; i <= 5; i++) {
        const p1 = project(i, 1, -5);
        const p2 = project(i, 1, 5);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

function draw() {
    time += 0.016;

    // Animate light position
    if (lightType === 'point') {
        lights.point.x = Math.cos(time) * 2;
        lights.point.z = Math.sin(time) * 2 - 2;
    } else if (lightType === 'spot') {
        lights.spot.dx = Math.sin(time * 0.5) * 0.5;
    }

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFloor();
    drawLightIndicator();

    // Draw spheres sorted by depth
    const drawables = spheres
        .map(s => drawSphere(s))
        .filter(d => d !== null)
        .sort((a, b) => b.z - a.z);

    drawables.forEach(d => d.draw());

    // Light type label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    const typeNames = { point: '點光源', directional: '平行光', spot: '聚光燈' };
    ctx.fillText(`類型: ${typeNames[lightType]}`, 10, 20);

    rotY += 0.003;

    requestAnimationFrame(draw);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        lightType = btn.dataset.type;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const descriptions = {
            point: '點光源 - 從一點向四周發散',
            directional: '平行光 - 模擬太陽等遠距離光源',
            spot: '聚光燈 - 圓錐形照射範圍'
        };
        infoEl.textContent = descriptions[lightType];
    });
});

draw();
