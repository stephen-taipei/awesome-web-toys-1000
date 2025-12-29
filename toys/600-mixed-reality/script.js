const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scene1Btn = document.getElementById('scene1');
const scene2Btn = document.getElementById('scene2');
const scene3Btn = document.getElementById('scene3');
const infoEl = document.getElementById('info');

let scene = 'office';
let time = 0;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// Virtual objects in the scene
const virtualObjects = {
    office: [
        { type: 'hologram', x: 0.3, y: 0.4, z: 1, label: '3D模型' },
        { type: 'screen', x: -0.5, y: 0.5, z: 1.5, label: '虛擬螢幕' },
        { type: 'widget', x: 0.8, y: 0.7, z: 0.8, label: '時鐘' },
        { type: 'note', x: -0.3, y: 0.2, z: 1.2, label: '便條' }
    ],
    living: [
        { type: 'pet', x: 0, y: 0.2, z: 1, label: '虛擬寵物' },
        { type: 'plant', x: 0.6, y: 0.3, z: 1.3, label: '虛擬植物' },
        { type: 'frame', x: -0.5, y: 0.6, z: 1, label: '相框' },
        { type: 'lamp', x: 0.7, y: 0.7, z: 0.9, label: '智慧燈' }
    ],
    outdoor: [
        { type: 'arrow', x: 0, y: 0.5, z: 1, label: '導航' },
        { type: 'info', x: 0.5, y: 0.6, z: 1.2, label: '景點資訊' },
        { type: 'creature', x: -0.4, y: 0.3, z: 0.8, label: '虛擬生物' },
        { type: 'portal', x: 0.3, y: 0.4, z: 1.5, label: '傳送門' }
    ]
};

function drawRealWorld(sceneType) {
    // Simulated camera background with appropriate scene
    switch (sceneType) {
        case 'office':
            drawOfficeBackground();
            break;
        case 'living':
            drawLivingRoomBackground();
            break;
        case 'outdoor':
            drawOutdoorBackground();
            break;
    }
}

function drawOfficeBackground() {
    // Office gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#d0d0d0');
    gradient.addColorStop(1, '#a0a0a0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desk
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

    // Wall elements
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(50, 30, 80, 60);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 30, 80, 60);

    // Monitor (real)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(canvas.width - 120, canvas.height * 0.35, 100, 70);
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width - 115, canvas.height * 0.35 + 5, 90, 60);

    // Keyboard
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(canvas.width - 130, canvas.height * 0.65, 110, 25);

    // Coffee mug
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(80, canvas.height * 0.7, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.ellipse(80, canvas.height * 0.7, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawLivingRoomBackground() {
    // Living room
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floor
    ctx.fillStyle = '#c9a86c';
    ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);

    // Couch
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(20, canvas.height * 0.5, 150, 60);
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(25, canvas.height * 0.45, 60, 40);
    ctx.fillRect(95, canvas.height * 0.45, 60, 40);

    // Window
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(canvas.width - 100, 20, 80, 100);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width - 100, 20, 80, 100);
    ctx.beginPath();
    ctx.moveTo(canvas.width - 60, 20);
    ctx.lineTo(canvas.width - 60, 120);
    ctx.moveTo(canvas.width - 100, 70);
    ctx.lineTo(canvas.width - 20, 70);
    ctx.stroke();

    // TV
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(200, canvas.height * 0.3, 80, 50);
}

function drawOutdoorBackground() {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // Sun
    ctx.fillStyle = '#fff5c0';
    ctx.beginPath();
    ctx.arc(300, 50, 25, 0, Math.PI * 2);
    ctx.fill();

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let i = 0; i < 3; i++) {
        const cx = 50 + i * 120;
        ctx.beginPath();
        ctx.arc(cx, 40, 20, 0, Math.PI * 2);
        ctx.arc(cx + 25, 35, 25, 0, Math.PI * 2);
        ctx.arc(cx + 50, 40, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // Ground/path
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

    // Path
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 40, canvas.height);
    ctx.lineTo(canvas.width / 2 - 20, canvas.height * 0.6);
    ctx.lineTo(canvas.width / 2 + 20, canvas.height * 0.6);
    ctx.lineTo(canvas.width / 2 + 40, canvas.height);
    ctx.fill();

    // Trees
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(30, canvas.height * 0.4, 15, 80);
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(37, canvas.height * 0.15);
    ctx.lineTo(0, canvas.height * 0.45);
    ctx.lineTo(75, canvas.height * 0.45);
    ctx.closePath();
    ctx.fill();
}

function project(x, y, z) {
    const fov = 150;
    const scale = fov / (2 + z);

    return {
        x: canvas.width / 2 + (x - 0.5) * canvas.width * scale / 2,
        y: canvas.height * (1 - y) * scale / 2 + canvas.height * 0.3,
        scale: scale
    };
}

function drawHologram(obj) {
    const p = project(obj.x, obj.y, obj.z);
    const size = 40 * p.scale;

    // Hologram base
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + size * 0.8, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating cube hologram
    const cubeSize = size * 0.4;
    const rot = time * 2;

    ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(time * 5) * 0.3})`;
    ctx.lineWidth = 2;

    // Simple rotating cube
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    const verts = [
        { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
        { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
        { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
    ];

    const projected = verts.map(v => ({
        x: p.x + (v.x * cos - v.z * sin) * cubeSize,
        y: p.y - v.y * cubeSize + (v.x * sin + v.z * cos) * cubeSize * 0.3
    }));

    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];

    edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
    });

    // Scan lines
    ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
        const lineY = p.y - size * 0.5 + ((time * 50 + i * 20) % (size * 1.5));
        ctx.fillRect(p.x - size * 0.5, lineY, size, 2);
    }
}

function drawVirtualScreen(obj) {
    const p = project(obj.x, obj.y, obj.z);
    const width = 80 * p.scale;
    const height = 50 * p.scale;

    // Screen glow
    ctx.shadowColor = 'rgba(179, 157, 219, 0.5)';
    ctx.shadowBlur = 20;

    ctx.fillStyle = 'rgba(30, 30, 50, 0.9)';
    ctx.beginPath();
    ctx.roundRect(p.x - width / 2, p.y - height / 2, width, height, 5);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(179, 157, 219, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Screen content
    ctx.fillStyle = '#b39ddb';
    ctx.font = `${10 * p.scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Virtual Display', p.x, p.y - 10);

    // Progress bar
    ctx.fillStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.fillRect(p.x - width * 0.4, p.y + 5, width * 0.8, 8);
    ctx.fillStyle = 'rgba(179, 157, 219, 0.8)';
    ctx.fillRect(p.x - width * 0.4, p.y + 5, width * 0.8 * ((Math.sin(time) + 1) / 2), 8);
}

function drawWidget(obj) {
    const p = project(obj.x, obj.y, obj.z);
    const size = 35 * p.scale;

    // Clock widget
    ctx.fillStyle = 'rgba(20, 20, 40, 0.8)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(179, 157, 219, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Clock hands
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();

    // Hour hand
    const hourAngle = (hours / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(hourAngle) * size * 0.5, p.y + Math.sin(hourAngle) * size * 0.5);
    ctx.stroke();

    // Minute hand
    const minAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(minAngle) * size * 0.7, p.y + Math.sin(minAngle) * size * 0.7);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#b39ddb';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawVirtualPet(obj) {
    const p = project(obj.x, obj.y + Math.sin(time * 3) * 0.05, obj.z);
    const size = 30 * p.scale;

    // Pet body
    ctx.fillStyle = 'rgba(255, 180, 100, 0.9)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 150, 50, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x - size * 0.3, p.y - size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.arc(p.x + size * 0.3, p.y - size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#333';
    const blinkOffset = Math.sin(time * 2) > 0.9 ? size * 0.1 : 0;
    ctx.beginPath();
    ctx.arc(p.x - size * 0.3, p.y - size * 0.2 + blinkOffset, size * 0.12, 0, Math.PI * 2);
    ctx.arc(p.x + size * 0.3, p.y - size * 0.2 + blinkOffset, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y + size * 0.1, size * 0.3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Floating hearts
    if (Math.sin(time * 4) > 0.5) {
        ctx.fillStyle = 'rgba(255, 100, 150, 0.8)';
        ctx.font = `${size * 0.4}px sans-serif`;
        ctx.fillText('♥', p.x + size, p.y - size);
    }
}

function drawNavigationArrow(obj) {
    const p = project(obj.x, obj.y + Math.sin(time * 2) * 0.05, obj.z);
    const size = 40 * p.scale;

    // Arrow glow
    ctx.shadowColor = 'rgba(100, 255, 150, 0.5)';
    ctx.shadowBlur = 15;

    ctx.fillStyle = 'rgba(100, 255, 150, 0.8)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - size);
    ctx.lineTo(p.x + size * 0.5, p.y);
    ctx.lineTo(p.x + size * 0.2, p.y);
    ctx.lineTo(p.x + size * 0.2, p.y + size * 0.5);
    ctx.lineTo(p.x - size * 0.2, p.y + size * 0.5);
    ctx.lineTo(p.x - size * 0.2, p.y);
    ctx.lineTo(p.x - size * 0.5, p.y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;

    // Distance text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${12 * p.scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('150m', p.x, p.y + size);
}

function drawPortal(obj) {
    const p = project(obj.x, obj.y, obj.z);
    const size = 35 * p.scale;

    // Portal ring
    for (let i = 0; i < 3; i++) {
        const ringSize = size * (1 + i * 0.15);
        const alpha = 0.8 - i * 0.2;
        const hue = (time * 50 + i * 30) % 360;

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 3 - i;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, ringSize, ringSize * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Portal center
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 0.8);
    gradient.addColorStop(0, 'rgba(150, 100, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 50, 200, 0.5)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    for (let i = 0; i < 5; i++) {
        const angle = time * 2 + i * Math.PI * 0.4;
        const dist = size * 0.5 * (0.5 + Math.sin(time * 3 + i) * 0.5);
        const px = p.x + Math.cos(angle) * dist;
        const py = p.y + Math.sin(angle) * dist * 0.4;

        ctx.fillStyle = `hsla(${(time * 100 + i * 50) % 360}, 80%, 70%, 0.8)`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGenericVirtualObject(obj) {
    const p = project(obj.x, obj.y, obj.z);
    const size = 25 * p.scale;

    ctx.fillStyle = 'rgba(179, 157, 219, 0.7)';
    ctx.strokeStyle = 'rgba(179, 157, 219, 1)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${8 * p.scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(obj.label, p.x, p.y + size + 15);
}

function drawVirtualObject(obj) {
    switch (obj.type) {
        case 'hologram':
            drawHologram(obj);
            break;
        case 'screen':
            drawVirtualScreen(obj);
            break;
        case 'widget':
            drawWidget(obj);
            break;
        case 'pet':
            drawVirtualPet(obj);
            break;
        case 'arrow':
            drawNavigationArrow(obj);
            break;
        case 'portal':
            drawPortal(obj);
            break;
        default:
            drawGenericVirtualObject(obj);
    }

    // Label
    const p = project(obj.x, obj.y, obj.z);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(obj.label, p.x, p.y + 50 * p.scale);
}

function drawMROverlay() {
    // Scan effect
    const scanY = (time * 100) % canvas.height;
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(canvas.width, scanY);
    ctx.stroke();

    // Corner brackets (AR frame)
    ctx.strokeStyle = 'rgba(179, 157, 219, 0.6)';
    ctx.lineWidth = 2;
    const margin = 15;
    const bracketSize = 25;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, margin + bracketSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + bracketSize, margin);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - bracketSize, margin);
    ctx.lineTo(canvas.width - margin, margin);
    ctx.lineTo(canvas.width - margin, margin + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin - bracketSize);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.lineTo(margin + bracketSize, canvas.height - margin);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - margin - bracketSize, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin - bracketSize);
    ctx.stroke();

    // Status indicator
    ctx.fillStyle = 'rgba(0, 200, 100, 0.8)';
    ctx.beginPath();
    ctx.arc(canvas.width - 25, 25, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('MR Active', canvas.width - 35, 28);
}

function draw() {
    time += 0.016;

    // Draw real world background
    drawRealWorld(scene);

    // Get virtual objects for current scene
    const sceneKey = scene === 'office' ? 'office' : (scene === 'living' ? 'living' : 'outdoor');
    const objects = virtualObjects[sceneKey];

    // Draw virtual objects
    objects.forEach(obj => {
        drawVirtualObject(obj);
    });

    // Draw MR overlay
    drawMROverlay();

    requestAnimationFrame(draw);
}

function setScene(newScene, btn) {
    scene = newScene;
    [scene1Btn, scene2Btn, scene3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

scene1Btn.addEventListener('click', () => setScene('office', scene1Btn));
scene2Btn.addEventListener('click', () => setScene('living', scene2Btn));
scene3Btn.addEventListener('click', () => setScene('outdoor', scene3Btn));

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

draw();
