const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const style1Btn = document.getElementById('style1');
const style2Btn = document.getElementById('style2');
const style3Btn = document.getElementById('style3');
const infoEl = document.getElementById('info');

let style = 'panel';
let rotationY = 0;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let time = 0;
let hoveredElement = null;
let selectedElement = null;

const cx = canvas.width / 2;
const cy = canvas.height / 2;

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    const fov = 150;
    const scale = fov / (4 + rz);

    return {
        x: cx + rx * scale,
        y: cy - y * scale,
        z: rz,
        scale: scale
    };
}

function drawPanelUI() {
    // Main panel
    const panelVerts = [
        { x: -1.5, y: 1.2, z: 1 },
        { x: 1.5, y: 1.2, z: 1 },
        { x: 1.5, y: -0.8, z: 1 },
        { x: -1.5, y: -0.8, z: 1 }
    ];

    const projPanel = panelVerts.map(v => project(v.x, v.y, v.z));

    // Panel background
    ctx.fillStyle = 'rgba(20, 40, 60, 0.9)';
    ctx.beginPath();
    ctx.moveTo(projPanel[0].x, projPanel[0].y);
    projPanel.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(128, 203, 196, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Header
    const headerY = 1.0;
    const h1 = project(-1.4, headerY, 1);
    const h2 = project(1.4, headerY, 1);

    ctx.fillStyle = 'rgba(128, 203, 196, 0.3)';
    ctx.beginPath();
    ctx.moveTo(projPanel[0].x, projPanel[0].y);
    ctx.lineTo(projPanel[1].x, projPanel[1].y);
    ctx.lineTo(h2.x, h2.y);
    ctx.lineTo(h1.x, h1.y);
    ctx.closePath();
    ctx.fill();

    // Title
    const titlePos = project(0, 1.1, 1);
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(10, 14 * titlePos.scale / 40)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('系統控制', titlePos.x, titlePos.y);

    // Buttons
    const buttons = [
        { x: -0.8, y: 0.5, label: '設定', id: 'settings' },
        { x: 0.8, y: 0.5, label: '檔案', id: 'files' },
        { x: -0.8, y: 0, label: '網路', id: 'network' },
        { x: 0.8, y: 0, label: '音效', id: 'audio' }
    ];

    buttons.forEach(btn => {
        const p = project(btn.x, btn.y, 1);
        const size = 40 * p.scale / 40;

        const isHovered = hoveredElement === btn.id;
        const isSelected = selectedElement === btn.id;

        ctx.fillStyle = isSelected ? 'rgba(128, 203, 196, 0.8)' :
            isHovered ? 'rgba(128, 203, 196, 0.5)' : 'rgba(128, 203, 196, 0.2)';
        ctx.beginPath();
        ctx.roundRect(p.x - size, p.y - size / 2, size * 2, size, 5);
        ctx.fill();

        ctx.strokeStyle = 'rgba(128, 203, 196, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(8, 12 * p.scale / 40)}px sans-serif`;
        ctx.fillText(btn.label, p.x, p.y + 4);

        // Store bounds for hit testing
        btn.bounds = { x: p.x - size, y: p.y - size / 2, w: size * 2, h: size };
    });

    // Slider
    const sliderY = -0.5;
    const sliderP = project(0, sliderY, 1);
    const sliderWidth = 100 * sliderP.scale / 40;

    ctx.fillStyle = 'rgba(128, 203, 196, 0.2)';
    ctx.beginPath();
    ctx.roundRect(sliderP.x - sliderWidth, sliderP.y - 5, sliderWidth * 2, 10, 5);
    ctx.fill();

    const sliderValue = 0.5 + Math.sin(time) * 0.3;
    ctx.fillStyle = 'rgba(128, 203, 196, 0.8)';
    ctx.beginPath();
    ctx.roundRect(sliderP.x - sliderWidth, sliderP.y - 5, sliderWidth * 2 * sliderValue, 10, 5);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sliderP.x - sliderWidth + sliderWidth * 2 * sliderValue, sliderP.y, 8, 0, Math.PI * 2);
    ctx.fill();

    return buttons;
}

function drawCircularUI() {
    const numItems = 6;
    const radius = 1.2;
    const items = ['首頁', '搜尋', '設定', '訊息', '檔案', '結束'];
    const icons = ['⌂', '⚲', '⚙', '✉', '📁', '✕'];

    // Center hub
    const centerP = project(0, 0, 1);
    ctx.fillStyle = 'rgba(128, 203, 196, 0.3)';
    ctx.beginPath();
    ctx.arc(centerP.x, centerP.y, 30 * centerP.scale / 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(128, 203, 196, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    const buttons = [];

    for (let i = 0; i < numItems; i++) {
        const angle = (i / numItems) * Math.PI * 2 - Math.PI / 2 + time * 0.2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;
        const z = 1 + Math.sin(angle) * 0.3;

        const p = project(x, y, z);
        const size = 35 * p.scale / 40;

        const isHovered = hoveredElement === `item${i}`;
        const isSelected = selectedElement === `item${i}`;

        // Connection line
        ctx.strokeStyle = 'rgba(128, 203, 196, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerP.x, centerP.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Item circle
        ctx.fillStyle = isSelected ? 'rgba(128, 203, 196, 0.9)' :
            isHovered ? 'rgba(128, 203, 196, 0.6)' : 'rgba(30, 50, 70, 0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(128, 203, 196, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(12, 18 * p.scale / 40)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icons[i], p.x, p.y - 5);

        // Label
        ctx.font = `${Math.max(8, 10 * p.scale / 40)}px sans-serif`;
        ctx.fillText(items[i], p.x, p.y + 15);

        buttons.push({
            id: `item${i}`,
            bounds: { x: p.x - size, y: p.y - size, w: size * 2, h: size * 2 }
        });
    }

    return buttons;
}

function drawFloatingUI() {
    const buttons = [];

    // Multiple floating panels at different depths
    const panels = [
        { x: -1.2, y: 0.8, z: 0.5, title: '通知', content: '3 則新訊息' },
        { x: 1.2, y: 0.6, z: 1.5, title: '系統', content: 'CPU: 45%' },
        { x: 0, y: -0.5, z: 1, title: '時間', content: '' },
        { x: -1, y: -0.3, z: 2, title: '天氣', content: '25°C 晴' }
    ];

    panels.forEach((panel, i) => {
        const bobY = panel.y + Math.sin(time * 2 + i) * 0.1;
        const p = project(panel.x, bobY, panel.z);

        const width = 80 * p.scale / 40;
        const height = 50 * p.scale / 40;

        const isHovered = hoveredElement === `panel${i}`;
        const isSelected = selectedElement === `panel${i}`;

        // Panel shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.roundRect(p.x - width / 2 + 5, p.y - height / 2 + 5, width, height, 8);
        ctx.fill();

        // Panel background
        ctx.fillStyle = isSelected ? 'rgba(128, 203, 196, 0.4)' :
            isHovered ? 'rgba(40, 60, 80, 0.95)' : 'rgba(20, 40, 60, 0.9)';
        ctx.beginPath();
        ctx.roundRect(p.x - width / 2, p.y - height / 2, width, height, 8);
        ctx.fill();

        ctx.strokeStyle = isHovered ? 'rgba(128, 203, 196, 1)' : 'rgba(128, 203, 196, 0.5)';
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#80cbc4';
        ctx.font = `bold ${Math.max(8, 11 * p.scale / 40)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(panel.title, p.x, p.y - height / 4);

        // Content
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(8, 10 * p.scale / 40)}px sans-serif`;

        if (panel.title === '時間') {
            const now = new Date();
            ctx.fillText(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`, p.x, p.y + height / 6);
        } else {
            ctx.fillText(panel.content, p.x, p.y + height / 6);
        }

        buttons.push({
            id: `panel${i}`,
            bounds: { x: p.x - width / 2, y: p.y - height / 2, w: width, h: height }
        });
    });

    // Floating action button
    const fabP = project(1.5, -0.8, 0.8);
    const fabSize = 25 * fabP.scale / 40;

    const fabHovered = hoveredElement === 'fab';
    const fabSelected = selectedElement === 'fab';

    ctx.fillStyle = fabSelected ? '#4db6ac' : fabHovered ? '#80cbc4' : '#26a69a';
    ctx.beginPath();
    ctx.arc(fabP.x, fabP.y, fabSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `${fabSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', fabP.x, fabP.y);

    buttons.push({
        id: 'fab',
        bounds: { x: fabP.x - fabSize, y: fabP.y - fabSize, w: fabSize * 2, h: fabSize * 2 }
    });

    return buttons;
}

function draw() {
    time += 0.016;

    // Auto-rotate slightly
    rotationY = Math.sin(time * 0.3) * 0.3;

    // Background
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(1, '#0a1a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid floor
    ctx.strokeStyle = 'rgba(128, 203, 196, 0.1)';
    ctx.lineWidth = 1;
    for (let x = -5; x <= 5; x++) {
        const p1 = project(x, -1.5, -2);
        const p2 = project(x, -1.5, 5);
        if (p1 && p2 && p1.z > 0 && p2.z > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }
    for (let z = -2; z <= 5; z++) {
        const p1 = project(-5, -1.5, z);
        const p2 = project(5, -1.5, z);
        if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }
    }

    let buttons = [];

    switch (style) {
        case 'panel':
            buttons = drawPanelUI();
            break;
        case 'circular':
            buttons = drawCircularUI();
            break;
        case 'floating':
            buttons = drawFloatingUI();
            break;
    }

    // Hit testing
    hoveredElement = null;
    buttons.forEach(btn => {
        if (btn.bounds &&
            mouseX >= btn.bounds.x && mouseX <= btn.bounds.x + btn.bounds.w &&
            mouseY >= btn.bounds.y && mouseY <= btn.bounds.y + btn.bounds.h) {
            hoveredElement = btn.id;
        }
    });

    requestAnimationFrame(draw);
}

function setStyle(newStyle, btn) {
    style = newStyle;
    selectedElement = null;
    [style1Btn, style2Btn, style3Btn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

style1Btn.addEventListener('click', () => setStyle('panel', style1Btn));
style2Btn.addEventListener('click', () => setStyle('circular', style2Btn));
style3Btn.addEventListener('click', () => setStyle('floating', style3Btn));

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', () => {
    if (hoveredElement) {
        selectedElement = selectedElement === hoveredElement ? null : hoveredElement;
        infoEl.textContent = selectedElement ? `已選擇: ${selectedElement}` : '3D空間中的使用者介面';
    }
});

draw();
