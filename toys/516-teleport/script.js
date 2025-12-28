const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const infoEl = document.getElementById('info');

let playerX = 0, playerZ = 0;
let targetX = 0, targetZ = 0;
let isTeleporting = false;
let teleportProgress = 0;
let rotY = 0;

// Teleport markers
const markers = [];
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    markers.push({
        x: Math.cos(angle) * 6,
        z: Math.sin(angle) * 6 + 5,
        hue: (i / 8) * 360
    });
}

// Particles for teleport effect
let particles = [];

function project(x, y, z) {
    const dx = x - playerX;
    const dz = z - playerZ;

    if (dz <= 0.1) return null;

    const fov = 200;
    return {
        x: canvas.width / 2 + (dx / dz) * fov,
        y: canvas.height / 2 + (y / dz) * fov,
        z: dz
    };
}

function screenToWorld(screenX, screenY) {
    // Inverse projection to get world coordinates on ground plane (y = 1)
    const fx = (screenX - canvas.width / 2);
    const fy = (screenY - canvas.height / 2);

    // At y = 1, find z first
    if (fy <= 0) return null; // Above horizon

    const fov = 200;
    const groundY = 1;
    const z = groundY * fov / fy + playerZ;
    const x = fx * (z - playerZ) / fov + playerX;

    return { x, z };
}

function drawGrid() {
    const gridSize = 20;
    const step = 2;

    for (let x = -gridSize; x <= gridSize; x += step) {
        const p1 = project(x, 1, 1);
        const p2 = project(x, 1, gridSize);
        if (p1 && p2) {
            ctx.strokeStyle = `rgba(224, 64, 251, ${0.1 + 0.05 * Math.sin(Date.now() / 500 + x)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    for (let z = 1; z <= gridSize; z += step) {
        const p1 = project(-gridSize, 1, z);
        const p2 = project(gridSize, 1, z);
        if (p1 && p2) {
            ctx.strokeStyle = `rgba(224, 64, 251, ${0.1 + 0.05 * Math.sin(Date.now() / 500 + z)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
}

function drawMarker(marker) {
    const p = project(marker.x, 0.5, marker.z);
    if (!p || p.z > 20) return;

    const size = 30 / p.z;
    const pulse = 1 + 0.2 * Math.sin(Date.now() / 300 + marker.hue);

    // Glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${marker.hue}, 100%, 50%, 0.1)`;
    ctx.fill();

    // Ring
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${marker.hue}, 100%, 60%, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${marker.hue}, 100%, 70%, 1)`;
    ctx.fill();
}

function spawnTeleportParticles() {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            hue: Math.random() * 60 + 260
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.life})`;
        ctx.fill();
    });
}

function update() {
    if (isTeleporting) {
        teleportProgress += 0.05;

        if (teleportProgress >= 1) {
            playerX = targetX;
            playerZ = targetZ;
            isTeleporting = false;
            teleportProgress = 0;
            infoEl.textContent = '傳送完成！';
            spawnTeleportParticles();
        } else {
            // Interpolate position with ease
            const t = teleportProgress;
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            playerX = playerX + (targetX - playerX) * ease * 0.1;
            playerZ = playerZ + (targetZ - playerZ) * ease * 0.1;
        }
    }

    updateParticles();
    rotY += 0.01;
}

function draw() {
    update();

    // Background
    ctx.fillStyle = '#0d001a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    for (let i = 0; i < 50; i++) {
        const x = (i * 73 + Date.now() / 100) % canvas.width;
        const y = (i * 37) % (canvas.height / 2);
        const brightness = 0.3 + 0.3 * Math.sin(Date.now() / 500 + i);
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();
    }

    drawGrid();

    // Draw markers sorted by distance
    const sortedMarkers = [...markers].sort((a, b) => {
        const distA = Math.hypot(a.x - playerX, a.z - playerZ);
        const distB = Math.hypot(b.x - playerX, b.z - playerZ);
        return distB - distA;
    });
    sortedMarkers.forEach(m => drawMarker(m));

    drawParticles();

    // Teleport effect
    if (isTeleporting) {
        const alpha = Math.sin(teleportProgress * Math.PI);
        ctx.fillStyle = `rgba(224, 64, 251, ${alpha * 0.3})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Speed lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const r1 = 50 + teleportProgress * 100;
            const r2 = 100 + teleportProgress * 150;
            ctx.beginPath();
            ctx.moveTo(
                canvas.width / 2 + Math.cos(angle) * r1,
                canvas.height / 2 + Math.sin(angle) * r1
            );
            ctx.lineTo(
                canvas.width / 2 + Math.cos(angle) * r2,
                canvas.height / 2 + Math.sin(angle) * r2
            );
            ctx.stroke();
        }
    }

    // Crosshair
    ctx.strokeStyle = 'rgba(224, 64, 251, 0.6)';
    ctx.lineWidth = 1;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx - 5, cy);
    ctx.moveTo(cx + 5, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy - 5);
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Position indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`位置: (${playerX.toFixed(1)}, ${playerZ.toFixed(1)})`, 10, 20);

    requestAnimationFrame(draw);
}

canvas.addEventListener('click', (e) => {
    if (isTeleporting) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = screenToWorld(screenX, screenY);
    if (worldPos && worldPos.z > 0) {
        targetX = worldPos.x;
        targetZ = worldPos.z;
        isTeleporting = true;
        teleportProgress = 0;
        infoEl.textContent = '傳送中...';
    }
});

resetBtn.addEventListener('click', () => {
    if (isTeleporting) return;
    targetX = 0;
    targetZ = 0;
    isTeleporting = true;
    teleportProgress = 0;
    infoEl.textContent = '返回原點...';
});

draw();
