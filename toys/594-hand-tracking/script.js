const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mode1Btn = document.getElementById('mode1');
const mode2Btn = document.getElementById('mode2');
const mode3Btn = document.getElementById('mode3');
const infoEl = document.getElementById('info');

let mode = 'track';
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let time = 0;
let isPressed = false;

const drawPoints = [];
const interactiveObjects = [];

// Hand skeleton structure
const handStructure = {
    palm: { x: 0, y: 0 },
    fingers: [
        { name: 'thumb', joints: 3, angle: -0.6, length: 25 },
        { name: 'index', joints: 3, angle: -0.3, length: 35 },
        { name: 'middle', joints: 3, angle: 0, length: 38 },
        { name: 'ring', joints: 3, angle: 0.3, length: 35 },
        { name: 'pinky', joints: 3, angle: 0.6, length: 28 }
    ]
};

// Initialize interactive objects
for (let i = 0; i < 5; i++) {
    interactiveObjects.push({
        x: 60 + i * 60,
        y: 100 + (i % 2) * 80,
        radius: 20,
        color: `hsl(${i * 60}, 70%, 50%)`,
        grabbed: false,
        vx: 0,
        vy: 0
    });
}

function getFingerTip(palmX, palmY, fingerIndex, curl = 0) {
    const finger = handStructure.fingers[fingerIndex];
    const baseAngle = finger.angle - 0.5; // Palm rotation

    let x = palmX;
    let y = palmY - 20; // Offset from palm center

    for (let j = 0; j < finger.joints; j++) {
        const jointLength = finger.length / finger.joints;
        const jointAngle = baseAngle + curl * (j + 1) * 0.3;
        x += Math.sin(jointAngle) * jointLength;
        y -= Math.cos(jointAngle) * jointLength;
    }

    return { x, y };
}

function drawHand(palmX, palmY, curl = 0) {
    // Palm
    ctx.fillStyle = 'rgba(255, 200, 180, 0.8)';
    ctx.beginPath();
    ctx.ellipse(palmX, palmY, 35, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200, 150, 130, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw each finger
    handStructure.fingers.forEach((finger, fi) => {
        const baseAngle = finger.angle - 0.5;
        let x = palmX;
        let y = palmY - 20;

        ctx.strokeStyle = 'rgba(255, 200, 180, 0.9)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y);

        for (let j = 0; j < finger.joints; j++) {
            const jointLength = finger.length / finger.joints;
            const jointAngle = baseAngle + curl * (j + 1) * 0.3;
            x += Math.sin(jointAngle) * jointLength;
            y -= Math.cos(jointAngle) * jointLength;
            ctx.lineTo(x, y);
        }

        ctx.stroke();

        // Joint dots
        x = palmX;
        y = palmY - 20;
        for (let j = 0; j <= finger.joints; j++) {
            ctx.fillStyle = 'rgba(200, 150, 130, 0.6)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            if (j < finger.joints) {
                const jointLength = finger.length / finger.joints;
                const jointAngle = baseAngle + curl * (j + 1) * 0.3;
                x += Math.sin(jointAngle) * jointLength;
                y -= Math.cos(jointAngle) * jointLength;
            }
        }
    });

    // Tracking points overlay
    ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';

    // Palm center
    ctx.beginPath();
    ctx.arc(palmX, palmY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Fingertips
    handStructure.fingers.forEach((_, fi) => {
        const tip = getFingerTip(palmX, palmY, fi, curl);
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Connection lines
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.4)';
    ctx.lineWidth = 1;
    handStructure.fingers.forEach((_, fi) => {
        const tip = getFingerTip(palmX, palmY, fi, curl);
        ctx.beginPath();
        ctx.moveTo(palmX, palmY);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
    });
}

function drawTrackMode() {
    // Grid background
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw hand following mouse
    const curl = isPressed ? 0.8 : 0;
    drawHand(mouseX, mouseY, curl);

    // Status display
    ctx.fillStyle = 'rgba(0, 255, 100, 0.8)';
    ctx.font = '12px monospace';
    ctx.fillText(`手掌位置: (${Math.round(mouseX)}, ${Math.round(mouseY)})`, 10, 20);
    ctx.fillText(`握拳狀態: ${isPressed ? '握緊' : '張開'}`, 10, 35);
}

function drawInteractMode() {
    // Update and draw interactive objects
    interactiveObjects.forEach(obj => {
        // Check if index finger tip is touching
        const indexTip = getFingerTip(mouseX, mouseY, 1, isPressed ? 0.8 : 0);
        const dist = Math.sqrt((indexTip.x - obj.x) ** 2 + (indexTip.y - obj.y) ** 2);

        if (dist < obj.radius + 10 && isPressed) {
            obj.grabbed = true;
        }

        if (obj.grabbed) {
            if (isPressed) {
                obj.x = indexTip.x;
                obj.y = indexTip.y;
                obj.vx = 0;
                obj.vy = 0;
            } else {
                obj.grabbed = false;
                obj.vx = (indexTip.x - obj.x) * 0.2;
                obj.vy = (indexTip.y - obj.y) * 0.2;
            }
        } else {
            // Physics
            obj.vy += 0.3;
            obj.x += obj.vx;
            obj.y += obj.vy;
            obj.vx *= 0.99;
            obj.vy *= 0.99;

            // Bounds
            if (obj.y > canvas.height - obj.radius) {
                obj.y = canvas.height - obj.radius;
                obj.vy *= -0.6;
            }
            if (obj.x < obj.radius) {
                obj.x = obj.radius;
                obj.vx *= -0.6;
            }
            if (obj.x > canvas.width - obj.radius) {
                obj.x = canvas.width - obj.radius;
                obj.vx *= -0.6;
            }
        }

        // Draw object
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
        ctx.fill();

        if (dist < obj.radius + 20) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });

    // Draw hand
    drawHand(mouseX, mouseY, isPressed ? 0.8 : 0);
}

function drawPaintMode() {
    // Draw existing points
    if (drawPoints.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < drawPoints.length; i++) {
            const p0 = drawPoints[i - 1];
            const p1 = drawPoints[i];

            if (p0.drawing && p1.drawing) {
                ctx.strokeStyle = `hsl(${(i * 2) % 360}, 70%, 60%)`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }
        }
    }

    // Add new point if drawing
    const indexTip = getFingerTip(mouseX, mouseY, 1, isPressed ? 0.8 : 0);
    if (isPressed) {
        drawPoints.push({ x: indexTip.x, y: indexTip.y, drawing: true });
    } else if (drawPoints.length > 0 && drawPoints[drawPoints.length - 1].drawing) {
        drawPoints.push({ x: indexTip.x, y: indexTip.y, drawing: false });
    }

    // Limit points
    if (drawPoints.length > 500) {
        drawPoints.splice(0, 100);
    }

    // Draw hand with transparency
    ctx.globalAlpha = 0.7;
    drawHand(mouseX, mouseY, isPressed ? 0.8 : 0);
    ctx.globalAlpha = 1;

    // Drawing indicator
    if (isPressed) {
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(indexTip.x, indexTip.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function draw() {
    time += 0.016;

    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (mode) {
        case 'track':
            drawTrackMode();
            break;
        case 'interact':
            drawInteractMode();
            break;
        case 'paint':
            drawPaintMode();
            break;
    }

    requestAnimationFrame(draw);
}

function setMode(newMode, btn) {
    mode = newMode;
    [mode1Btn, mode2Btn, mode3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (newMode === 'paint') {
        drawPoints.length = 0;
    }
    if (newMode === 'interact') {
        interactiveObjects.forEach((obj, i) => {
            obj.x = 60 + i * 60;
            obj.y = 100 + (i % 2) * 80;
            obj.vx = 0;
            obj.vy = 0;
            obj.grabbed = false;
        });
    }
}

mode1Btn.addEventListener('click', () => setMode('track', mode1Btn));
mode2Btn.addEventListener('click', () => setMode('interact', mode2Btn));
mode3Btn.addEventListener('click', () => setMode('paint', mode3Btn));

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => isPressed = true);
canvas.addEventListener('mouseup', () => isPressed = false);
canvas.addEventListener('mouseleave', () => isPressed = false);

canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    isPressed = true;
});

canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    e.preventDefault();
});

canvas.addEventListener('touchend', () => isPressed = false);

draw();
