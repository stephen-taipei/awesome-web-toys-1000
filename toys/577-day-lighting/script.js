const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const timeSlider = document.getElementById('timeSlider');
const timeLabel = document.getElementById('timeLabel');
const infoEl = document.getElementById('info');

let timeOfDay = 12;
let rotationY = 0.6;

function getSunPosition(hour) {
    // Sun rises at 6, peaks at 12, sets at 18
    const normalizedTime = (hour - 6) / 12; // 0 to 1 during daytime
    const angle = normalizedTime * Math.PI;

    const sunHeight = Math.sin(angle);
    const sunX = Math.cos(angle);

    return {
        x: sunX * 5,
        y: Math.max(0, sunHeight * 5),
        z: -3,
        intensity: Math.max(0, sunHeight)
    };
}

function getSkyColor(hour) {
    if (hour < 5 || hour > 20) {
        return { top: '#0a1030', bottom: '#1a2040' }; // Night
    } else if (hour < 7) {
        const t = (hour - 5) / 2;
        return {
            top: lerpColor('#1a2040', '#ff9966', t),
            bottom: lerpColor('#2a3050', '#ffcc99', t)
        };
    } else if (hour < 8) {
        const t = hour - 7;
        return {
            top: lerpColor('#ff9966', '#4a90d9', t),
            bottom: lerpColor('#ffcc99', '#87ceeb', t)
        };
    } else if (hour < 17) {
        return { top: '#4a90d9', bottom: '#87ceeb' }; // Day
    } else if (hour < 19) {
        const t = (hour - 17) / 2;
        return {
            top: lerpColor('#4a90d9', '#ff6633', t),
            bottom: lerpColor('#87ceeb', '#ffcc66', t)
        };
    } else {
        const t = (hour - 19) / 1.5;
        return {
            top: lerpColor('#ff6633', '#1a2040', t),
            bottom: lerpColor('#ffcc66', '#2a3050', t)
        };
    }
}

function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);

    const r = Math.floor(r1 + (r2 - r1) * t);
    const g = Math.floor(g1 + (g2 - g1) * t);
    const b = Math.floor(b1 + (b2 - b1) * t);

    return `rgb(${r}, ${g}, ${b})`;
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.25);
    const sinX = Math.sin(0.25);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 50 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height - 50 - y1 * scale,
        scale,
        z: z2
    };
}

function calculateShading(nx, ny, nz, sun) {
    // Normal dot light direction
    const lightDir = {
        x: sun.x / Math.sqrt(sun.x * sun.x + sun.y * sun.y + sun.z * sun.z),
        y: sun.y / Math.sqrt(sun.x * sun.x + sun.y * sun.y + sun.z * sun.z),
        z: sun.z / Math.sqrt(sun.x * sun.x + sun.y * sun.y + sun.z * sun.z)
    };

    const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
    return Math.max(0.3, Math.min(1, 0.3 + dot * 0.7 * sun.intensity));
}

function drawBox(x, y, z, w, h, d, color, sun) {
    const hw = w / 2, hd = d / 2;

    const vertices = [
        project(x - hw, y, z - hd),
        project(x + hw, y, z - hd),
        project(x + hw, y, z + hd),
        project(x - hw, y, z + hd),
        project(x - hw, y + h, z - hd),
        project(x + hw, y + h, z - hd),
        project(x + hw, y + h, z + hd),
        project(x - hw, y + h, z + hd)
    ];

    const faces = [
        { verts: [0, 1, 5, 4], normal: [0, 0, -1] },
        { verts: [1, 2, 6, 5], normal: [1, 0, 0] },
        { verts: [2, 3, 7, 6], normal: [0, 0, 1] },
        { verts: [3, 0, 4, 7], normal: [-1, 0, 0] },
        { verts: [4, 5, 6, 7], normal: [0, 1, 0] }
    ];

    faces.sort((a, b) => {
        const aZ = a.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        const bZ = b.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        return bZ - aZ;
    });

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);
        const shade = calculateShading(face.normal[0], face.normal[1], face.normal[2], sun);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
}

function draw() {
    rotationY += 0.003;

    const sun = getSunPosition(timeOfDay);
    const sky = getSkyColor(timeOfDay);

    // Draw sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, sky.top);
    skyGrad.addColorStop(1, sky.bottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sun/moon
    if (sun.intensity > 0) {
        const sunPos = project(sun.x, sun.y, sun.z);
        const sunRadius = 15 + sun.intensity * 10;

        const sunGrad = ctx.createRadialGradient(sunPos.x, sunPos.y, 0, sunPos.x, sunPos.y, sunRadius * 2);
        sunGrad.addColorStop(0, 'rgba(255, 220, 100, 1)');
        sunGrad.addColorStop(0.3, 'rgba(255, 180, 50, 0.8)');
        sunGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunPos.x, sunPos.y, sunRadius * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground
    ctx.fillStyle = sun.intensity > 0.3 ? '#5a8a5a' : '#3a5a3a';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // Shadow on ground
    if (sun.intensity > 0.1) {
        const shadowLength = 3 / (sun.intensity + 0.3);
        const shadowX = -sun.x * shadowLength * 0.5;

        ctx.fillStyle = `rgba(0, 0, 0, ${sun.intensity * 0.3})`;
        const sp = [
            project(-1.5 + shadowX, 0.01, -1),
            project(1.5 + shadowX, 0.01, -1),
            project(1.5 + shadowX * 2, 0.01, 1 + shadowLength),
            project(-1.5 + shadowX * 2, 0.01, 1 + shadowLength)
        ];
        ctx.beginPath();
        ctx.moveTo(sp[0].x, sp[0].y);
        sp.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.fill();
    }

    // Building
    drawBox(0, 0, 0, 3, 2.5, 2, { r: 220, g: 200, b: 180 }, sun);

    // Roof
    drawBox(0, 2.5, 0, 3.2, 0.3, 2.2, { r: 139, g: 90, b: 43 }, sun);

    // Windows
    const windowColor = sun.intensity > 0.2 ?
        { r: 150, g: 200, b: 255 } :
        { r: 255, g: 200, b: 100 };

    drawBox(-0.8, 0.8, -1.01, 0.5, 0.6, 0.05, windowColor, sun);
    drawBox(0.8, 0.8, -1.01, 0.5, 0.6, 0.05, windowColor, sun);
    drawBox(-0.8, 1.6, -1.01, 0.5, 0.6, 0.05, windowColor, sun);
    drawBox(0.8, 1.6, -1.01, 0.5, 0.6, 0.05, windowColor, sun);

    // Door
    drawBox(0, 0, -1.01, 0.6, 1.2, 0.05, { r: 100, g: 70, b: 50 }, sun);

    // Update info
    const lightLevel = Math.round(sun.intensity * 100);
    infoEl.textContent = `日照強度: ${lightLevel}%`;
}

function updateTime() {
    const hours = Math.floor(timeOfDay);
    const minutes = Math.round((timeOfDay - hours) * 60);
    timeLabel.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

timeSlider.addEventListener('input', (e) => {
    timeOfDay = parseFloat(e.target.value);
    updateTime();
});

updateTime();
animate();
