const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const bothBtn = document.getElementById('bothBtn');
const infoEl = document.getElementById('info');

let mode = 'both';
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let isPressed = false;
let time = 0;

// Controller states
const leftController = {
    x: canvas.width * 0.3,
    y: canvas.height * 0.5,
    rotation: 0.3,
    trigger: 0,
    grip: 0,
    thumbstick: { x: 0, y: 0 },
    buttons: { a: false, b: false, menu: false }
};

const rightController = {
    x: canvas.width * 0.7,
    y: canvas.height * 0.5,
    rotation: -0.3,
    trigger: 0,
    grip: 0,
    thumbstick: { x: 0, y: 0 },
    buttons: { a: false, b: false, menu: false }
};

function drawController(ctrl, isLeft, active) {
    ctx.save();
    ctx.translate(ctrl.x, ctrl.y);
    ctx.rotate(ctrl.rotation);

    const scale = active ? 1 : 0.8;
    ctx.scale(scale, scale);

    // Controller body
    const gradient = ctx.createLinearGradient(-25, -60, 25, 60);
    gradient.addColorStop(0, '#3a3a4a');
    gradient.addColorStop(0.5, '#2a2a3a');
    gradient.addColorStop(1, '#1a1a2a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-25, -60, 50, 120, 10);
    ctx.fill();

    ctx.strokeStyle = active ? '#7986cb' : '#4a4a5a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tracking ring
    ctx.strokeStyle = active ? 'rgba(121, 134, 203, 0.6)' : 'rgba(100, 100, 120, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -70, 35, 15, 0, 0, Math.PI * 2);
    ctx.stroke();

    // LED indicators
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const lx = Math.cos(angle) * 30;
        const ly = -70 + Math.sin(angle) * 12;

        ctx.fillStyle = active ? `hsl(${time * 100 + i * 90}, 70%, 50%)` : '#333';
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Thumbstick
    const thumbX = ctrl.thumbstick.x * 8;
    const thumbY = ctrl.thumbstick.y * 8;

    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(0, -30, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3a3a4a';
    ctx.strokeStyle = '#5a5a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(thumbX, -30 + thumbY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Buttons
    const buttonY = 5;
    const buttonSpacing = 20;

    // A/X button
    ctx.fillStyle = ctrl.buttons.a ? '#4caf50' : '#2a2a3a';
    ctx.beginPath();
    ctx.arc(-buttonSpacing / 2, buttonY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isLeft ? 'X' : 'A', -buttonSpacing / 2, buttonY);

    // B/Y button
    ctx.fillStyle = ctrl.buttons.b ? '#f44336' : '#2a2a3a';
    ctx.beginPath();
    ctx.arc(buttonSpacing / 2, buttonY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(isLeft ? 'Y' : 'B', buttonSpacing / 2, buttonY - 10);

    // Menu button
    ctx.fillStyle = ctrl.buttons.menu ? '#2196f3' : '#2a2a3a';
    ctx.beginPath();
    ctx.arc(0, buttonY + 20, 5, 0, Math.PI * 2);
    ctx.fill();

    // Trigger
    const triggerY = 45 + ctrl.trigger * 10;
    ctx.fillStyle = ctrl.trigger > 0.5 ? '#7986cb' : '#3a3a4a';
    ctx.beginPath();
    ctx.roundRect(-15, triggerY, 30, 15, 5);
    ctx.fill();

    // Trigger percentage
    if (ctrl.trigger > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText(`${Math.round(ctrl.trigger * 100)}%`, 0, triggerY + 8);
    }

    // Grip button (sides)
    ctx.fillStyle = ctrl.grip > 0.5 ? '#9575cd' : '#2a2a3a';
    ctx.fillRect(-28, 10, 5, 30);
    ctx.fillRect(23, 10, 5, 30);

    ctx.restore();

    // Controller label
    ctx.fillStyle = active ? '#fff' : '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isLeft ? '左手' : '右手', ctrl.x, ctrl.y + 90);
}

function drawTrail(ctrl) {
    // Motion trail effect
    ctx.strokeStyle = 'rgba(121, 134, 203, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ctrl.x, ctrl.y - 70);

    for (let i = 0; i < 5; i++) {
        const t = time - i * 0.1;
        const wobble = Math.sin(t * 5) * 5;
        ctx.lineTo(ctrl.x + wobble, ctrl.y - 70 - i * 10);
    }
    ctx.stroke();
}

function drawInputDisplay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, canvas.height - 80, 150, 70);

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    const ctrl = mode === 'left' ? leftController : rightController;

    ctx.fillText(`搖桿: (${ctrl.thumbstick.x.toFixed(2)}, ${ctrl.thumbstick.y.toFixed(2)})`, 15, canvas.height - 65);
    ctx.fillText(`扳機: ${(ctrl.trigger * 100).toFixed(0)}%`, 15, canvas.height - 50);
    ctx.fillText(`握把: ${(ctrl.grip * 100).toFixed(0)}%`, 15, canvas.height - 35);
    ctx.fillText(`按鈕: ${Object.entries(ctrl.buttons).filter(([k, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || '無'}`, 15, canvas.height - 20);
}

function drawVibrationFeedback() {
    if (isPressed) {
        const ctrl = mode === 'left' ? leftController : (mode === 'right' ? rightController : rightController);

        ctx.strokeStyle = 'rgba(121, 134, 203, 0.5)';
        ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            const radius = 20 + i * 15 + (time * 50) % 30;
            ctx.globalAlpha = 1 - i * 0.3;
            ctx.beginPath();
            ctx.arc(ctrl.x, ctrl.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

function update() {
    // Update controller positions based on mouse
    const targetX = mouseX;
    const targetY = mouseY;

    if (mode === 'left' || mode === 'both') {
        const offsetX = mode === 'both' ? -60 : 0;
        leftController.x += ((targetX + offsetX) - leftController.x) * 0.1;
        leftController.y += (targetY - leftController.y) * 0.1;
        leftController.rotation = 0.3 + Math.sin(time * 2) * 0.05;

        if (isPressed && (mode === 'left' || mode === 'both')) {
            leftController.trigger = Math.min(1, leftController.trigger + 0.1);
        } else {
            leftController.trigger = Math.max(0, leftController.trigger - 0.1);
        }
    }

    if (mode === 'right' || mode === 'both') {
        const offsetX = mode === 'both' ? 60 : 0;
        rightController.x += ((targetX + offsetX) - rightController.x) * 0.1;
        rightController.y += (targetY - rightController.y) * 0.1;
        rightController.rotation = -0.3 + Math.sin(time * 2 + 1) * 0.05;

        if (isPressed && (mode === 'right' || mode === 'both')) {
            rightController.trigger = Math.min(1, rightController.trigger + 0.1);
        } else {
            rightController.trigger = Math.max(0, rightController.trigger - 0.1);
        }
    }

    // Simulate thumbstick based on keyboard
    leftController.thumbstick.x *= 0.9;
    leftController.thumbstick.y *= 0.9;
    rightController.thumbstick.x *= 0.9;
    rightController.thumbstick.y *= 0.9;
}

function draw() {
    time += 0.016;
    update();

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(50, 50, 80, 0.3)';
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

    drawVibrationFeedback();

    // Draw controllers
    if (mode === 'left' || mode === 'both') {
        drawTrail(leftController);
        drawController(leftController, true, mode === 'left' || mode === 'both');
    }

    if (mode === 'right' || mode === 'both') {
        drawTrail(rightController);
        drawController(rightController, false, mode === 'right' || mode === 'both');
    }

    drawInputDisplay();

    requestAnimationFrame(draw);
}

function setMode(newMode, btn) {
    mode = newMode;
    [leftBtn, rightBtn, bothBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

leftBtn.addEventListener('click', () => setMode('left', leftBtn));
rightBtn.addEventListener('click', () => setMode('right', rightBtn));
bothBtn.addEventListener('click', () => setMode('both', bothBtn));

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    isPressed = true;
    if (mode === 'left' || mode === 'both') {
        leftController.buttons.a = true;
    }
    if (mode === 'right' || mode === 'both') {
        rightController.buttons.a = true;
    }
});

canvas.addEventListener('mouseup', () => {
    isPressed = false;
    leftController.buttons.a = false;
    rightController.buttons.a = false;
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (mode === 'left' || mode === 'both') {
        leftController.buttons.b = !leftController.buttons.b;
    }
    if (mode === 'right' || mode === 'both') {
        rightController.buttons.b = !rightController.buttons.b;
    }
});

document.addEventListener('keydown', (e) => {
    const ctrl = mode === 'left' ? leftController : rightController;

    switch (e.key.toLowerCase()) {
        case 'w': ctrl.thumbstick.y = -1; break;
        case 's': ctrl.thumbstick.y = 1; break;
        case 'a': ctrl.thumbstick.x = -1; break;
        case 'd': ctrl.thumbstick.x = 1; break;
        case 'g': ctrl.grip = 1; break;
        case 'm': ctrl.buttons.menu = true; break;
    }
});

document.addEventListener('keyup', (e) => {
    const ctrl = mode === 'left' ? leftController : rightController;

    switch (e.key.toLowerCase()) {
        case 'g': ctrl.grip = 0; break;
        case 'm': ctrl.buttons.menu = false; break;
    }
});

draw();
