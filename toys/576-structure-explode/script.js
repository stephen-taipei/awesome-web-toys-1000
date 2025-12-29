const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const explodeSlider = document.getElementById('explodeSlider');
const animateBtn = document.getElementById('animateBtn');
const infoEl = document.getElementById('info');

let rotationY = 0.5;
let explodeAmount = 0;
let isAnimating = false;
let animationDir = 1;

// Building components
const components = [
    // Foundation
    { name: '基礎', baseY: 0, height: 0.3, width: 3, depth: 2, color: { r: 100, g: 100, b: 100 }, explodeY: -0.5 },
    // Floor 1
    { name: '一樓', baseY: 0.3, height: 1, width: 2.8, depth: 1.8, color: { r: 200, g: 180, b: 160 }, explodeY: 0 },
    // Floor 2
    { name: '二樓', baseY: 1.3, height: 1, width: 2.6, depth: 1.6, color: { r: 190, g: 200, b: 180 }, explodeY: 0.8 },
    // Floor 3
    { name: '三樓', baseY: 2.3, height: 1, width: 2.4, depth: 1.4, color: { r: 180, g: 190, b: 200 }, explodeY: 1.6 },
    // Roof
    { name: '屋頂', baseY: 3.3, height: 0.5, width: 2.6, depth: 1.6, color: { r: 139, g: 90, b: 43 }, explodeY: 2.4 },
    // Chimney
    { name: '煙囪', baseY: 3.8, height: 0.8, width: 0.3, depth: 0.3, offsetX: 0.8, color: { r: 160, g: 80, b: 60 }, explodeY: 3.2 }
];

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 50 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + 40 - y1 * scale,
        scale,
        z: z2
    };
}

function drawBox(x, y, z, w, h, d, color) {
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
        { verts: [0, 1, 5, 4], shade: 0.85 },
        { verts: [1, 2, 6, 5], shade: 0.7 },
        { verts: [2, 3, 7, 6], shade: 0.8 },
        { verts: [3, 0, 4, 7], shade: 0.75 },
        { verts: [4, 5, 6, 7], shade: 1.0 },
        { verts: [0, 3, 2, 1], shade: 0.6 }
    ];

    // Sort faces by depth
    const sortedFaces = faces.map((face, i) => {
        const avgZ = face.verts.reduce((s, v) => s + vertices[v].z, 0) / 4;
        return { ...face, index: i, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    sortedFaces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();

        ctx.fillStyle = `rgb(${Math.floor(color.r * face.shade)}, ${Math.floor(color.g * face.shade)}, ${Math.floor(color.b * face.shade)})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    });

    return (vertices[0].z + vertices[2].z + vertices[4].z + vertices[6].z) / 4;
}

function draw() {
    rotationY += 0.004;

    // Animation
    if (isAnimating) {
        explodeAmount += animationDir * 1.5;
        if (explodeAmount >= 100) {
            explodeAmount = 100;
            animationDir = -1;
        } else if (explodeAmount <= 0) {
            explodeAmount = 0;
            animationDir = 1;
            isAnimating = false;
        }
        explodeSlider.value = explodeAmount;
    }

    // Background
    ctx.fillStyle = '#f0f5fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground shadow
    const shadowSize = 2 + explodeAmount * 0.02;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height - 50, 80, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Calculate component positions with explosion
    const explodeFactor = explodeAmount / 100;

    const sortedComponents = components.map(comp => {
        const offsetX = comp.offsetX || 0;
        const explodeOffset = comp.explodeY * explodeFactor * 2;

        return {
            ...comp,
            renderY: comp.baseY + explodeOffset,
            renderX: offsetX,
            depth: project(offsetX, comp.baseY + comp.height / 2 + explodeOffset, 0).z
        };
    }).sort((a, b) => b.depth - a.depth);

    // Draw components
    sortedComponents.forEach(comp => {
        drawBox(comp.renderX, comp.renderY, 0, comp.width, comp.height, comp.depth, comp.color);

        // Draw label when exploded
        if (explodeAmount > 30) {
            const labelPos = project(comp.renderX + comp.width / 2 + 0.5, comp.renderY + comp.height / 2, 0);
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = '10px Arial';
            ctx.fillText(comp.name, labelPos.x, labelPos.y);
        }
    });

    // Info
    infoEl.textContent = `分解: ${Math.round(explodeAmount)}%`;

    requestAnimationFrame(draw);
}

explodeSlider.addEventListener('input', (e) => {
    explodeAmount = parseInt(e.target.value);
    isAnimating = false;
});

animateBtn.addEventListener('click', () => {
    isAnimating = true;
    if (explodeAmount >= 100) {
        animationDir = -1;
    } else if (explodeAmount <= 0) {
        animationDir = 1;
    }
});

draw();
