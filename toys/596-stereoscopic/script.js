const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const infoEl = document.getElementById('info');

let mode = 'anaglyph';
let rotationY = 0;
let time = 0;

const eyeSeparation = 0.15;

function generateScene() {
    const objects = [];

    // Torus
    for (let u = 0; u < 24; u++) {
        for (let v = 0; v < 12; v++) {
            const uAngle = (u / 24) * Math.PI * 2;
            const vAngle = (v / 12) * Math.PI * 2;

            const R = 1.2;
            const r = 0.4;

            objects.push({
                x: (R + r * Math.cos(vAngle)) * Math.cos(uAngle),
                y: r * Math.sin(vAngle),
                z: (R + r * Math.cos(vAngle)) * Math.sin(uAngle),
                size: 3,
                hue: (u * 15 + v * 30) % 360
            });
        }
    }

    // Floating cubes
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        objects.push({
            x: Math.cos(angle) * 2.5,
            y: Math.sin(time + i) * 0.5,
            z: Math.sin(angle) * 2.5,
            size: 8,
            hue: i * 45
        });
    }

    return objects;
}

function project(v, eyeX, cx, cy) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    let x1 = v.x * cosY - v.z * sinY;
    let z1 = v.x * sinY + v.z * cosY;
    let y1 = v.y;

    // Eye offset
    x1 -= eyeX;

    const fov = 60;
    const scale = fov / (4 + z1);

    return {
        x: cx + x1 * scale,
        y: cy - y1 * scale,
        z: z1,
        scale: scale
    };
}

function drawSceneToBuffer(eyeX, width, height, offsetX = 0) {
    const objects = generateScene();
    const cx = offsetX + width / 2;
    const cy = height / 2;

    // Sort by depth
    const projected = objects.map(obj => ({
        ...project(obj, eyeX, cx, cy),
        size: obj.size,
        hue: obj.hue
    }));

    projected.sort((a, b) => a.z - b.z);

    const points = [];
    projected.forEach(p => {
        if (p.z > -3) {
            points.push({
                x: p.x,
                y: p.y,
                size: p.size * p.scale * 0.5,
                hue: p.hue,
                brightness: 30 + (3 - p.z) * 15
            });
        }
    });

    return points;
}

function drawAnaglyph() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const leftPoints = drawSceneToBuffer(-eyeSeparation, canvas.width, canvas.height);
    const rightPoints = drawSceneToBuffer(eyeSeparation, canvas.width, canvas.height);

    // Draw cyan (right eye) first
    ctx.globalCompositeOperation = 'lighter';

    rightPoints.forEach(p => {
        ctx.fillStyle = `hsl(180, 100%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw red (left eye)
    leftPoints.forEach(p => {
        ctx.fillStyle = `hsl(0, 100%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    infoEl.textContent = '使用紅藍眼鏡觀看3D效果';
}

function drawSideBySide() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const halfWidth = canvas.width / 2;

    // Left eye (left side)
    const leftPoints = drawSceneToBuffer(-eyeSeparation, halfWidth, canvas.height, 0);
    leftPoints.forEach(p => {
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Right eye (right side)
    const rightPoints = drawSceneToBuffer(eyeSeparation, halfWidth, canvas.height, halfWidth);
    rightPoints.forEach(p => {
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, canvas.height);
    ctx.stroke();

    infoEl.textContent = '平行視法：放鬆眼睛讓圖像重疊';
}

function drawCrossEye() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const halfWidth = canvas.width / 2;

    // Right eye view on LEFT side (for cross-eye)
    const rightPoints = drawSceneToBuffer(eyeSeparation, halfWidth, canvas.height, 0);
    rightPoints.forEach(p => {
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Left eye view on RIGHT side (for cross-eye)
    const leftPoints = drawSceneToBuffer(-eyeSeparation, halfWidth, canvas.height, halfWidth);
    leftPoints.forEach(p => {
        ctx.fillStyle = `hsl(${p.hue}, 70%, ${p.brightness}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfWidth, 0);
    ctx.lineTo(halfWidth, canvas.height);
    ctx.stroke();

    infoEl.textContent = '交叉視法：交叉雙眼讓圖像重疊';
}

function draw() {
    time += 0.016;
    rotationY += 0.01;

    switch (mode) {
        case 'anaglyph':
            drawAnaglyph();
            break;
        case 'sidebyside':
            drawSideBySide();
            break;
        case 'crosseye':
            drawCrossEye();
            break;
    }

    requestAnimationFrame(draw);
}

function setMode(newMode, btn) {
    mode = newMode;
    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

mode1Btn.addEventListener('click', () => setMode('anaglyph', mode1Btn));
mode2Btn.addEventListener('click', () => setMode('sidebyside', mode2Btn));
mode3Btn.addEventListener('click', () => setMode('crosseye', mode3Btn));

draw();
