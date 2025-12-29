const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const waveBtn = document.getElementById('waveBtn');
const twistBtn = document.getElementById('twistBtn');
const bulgeBtn = document.getElementById('bulgeBtn');
const noiseBtn = document.getElementById('noiseBtn');
const infoEl = document.getElementById('info');

let deformType = 'wave';
let rotationY = 0;
let time = 0;

function generateGrid(size, divisions) {
    const vertices = [];
    const step = size / divisions;

    for (let z = 0; z <= divisions; z++) {
        for (let x = 0; x <= divisions; x++) {
            vertices.push({
                x: (x - divisions / 2) * step,
                y: 0,
                z: (z - divisions / 2) * step,
                origX: (x - divisions / 2) * step,
                origY: 0,
                origZ: (z - divisions / 2) * step
            });
        }
    }

    return vertices;
}

function applyDeformation(vertices, t) {
    return vertices.map(v => {
        let x = v.origX;
        let y = v.origY;
        let z = v.origZ;

        switch (deformType) {
            case 'wave':
                y = Math.sin(x * 0.8 + t * 2) * 0.5 + Math.sin(z * 0.6 + t * 1.5) * 0.4;
                break;

            case 'twist':
                const angle = y * 0.5 + t;
                const dist = Math.sqrt(x * x + z * z);
                const twistAngle = dist * 0.3 + t;
                x = v.origX * Math.cos(twistAngle) - v.origZ * Math.sin(twistAngle);
                z = v.origX * Math.sin(twistAngle) + v.origZ * Math.cos(twistAngle);
                y = Math.sin(dist * 0.5 - t) * 0.5;
                break;

            case 'bulge':
                const d = Math.sqrt(x * x + z * z);
                const bulge = Math.exp(-d * 0.3) * Math.sin(t * 2) * 1.5;
                y = bulge;
                break;

            case 'noise':
                const nx = Math.sin(x * 2 + t) * Math.cos(z * 1.5 + t * 0.7);
                const nz = Math.cos(x * 1.8 - t * 0.5) * Math.sin(z * 2.2 + t);
                y = (nx + nz) * 0.4;
                break;
        }

        return { x, y, z };
    });
}

function project(v) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.5);
    const sinX = Math.sin(0.5);

    let x1 = v.x * cosY - v.z * sinY;
    let z1 = v.x * sinY + v.z * cosY;
    let y1 = v.y * cosX - z1 * sinX;
    let z2 = v.y * sinX + z1 * cosX;

    const scale = 80 / (5 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 - y1 * scale,
        z: z2
    };
}

const gridVertices = generateGrid(4, 20);
const divisions = 21;

function draw() {
    time += 0.016;
    rotationY += 0.008;

    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const deformed = applyDeformation(gridVertices, time);
    const projected = deformed.map(v => project(v));

    // Draw wireframe
    ctx.strokeStyle = 'rgba(244, 143, 177, 0.4)';
    ctx.lineWidth = 1;

    for (let z = 0; z < divisions - 1; z++) {
        for (let x = 0; x < divisions - 1; x++) {
            const idx = z * divisions + x;
            const p1 = projected[idx];
            const p2 = projected[idx + 1];
            const p3 = projected[idx + divisions];

            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
        }
    }

    // Draw right edge
    for (let z = 0; z < divisions - 1; z++) {
        const idx = z * divisions + (divisions - 1);
        const p1 = projected[idx];
        const p2 = projected[idx + divisions];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Draw bottom edge
    for (let x = 0; x < divisions - 1; x++) {
        const idx = (divisions - 1) * divisions + x;
        const p1 = projected[idx];
        const p2 = projected[idx + 1];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Draw vertices
    projected.forEach((p, i) => {
        const origV = gridVertices[i];
        const defV = deformed[i];
        const displacement = Math.abs(defV.y - origV.origY);
        const hue = displacement * 100 + 320;

        ctx.fillStyle = `hsl(${hue % 360}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 + displacement * 2, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

function setDeform(type, btn) {
    deformType = type;
    [waveBtn, twistBtn, bulgeBtn, noiseBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const names = { wave: '波浪', twist: '扭曲', bulge: '膨脹', noise: '噪聲' };
    infoEl.textContent = `形變: ${names[type]}`;
}

waveBtn.addEventListener('click', () => setDeform('wave', waveBtn));
twistBtn.addEventListener('click', () => setDeform('twist', twistBtn));
bulgeBtn.addEventListener('click', () => setDeform('bulge', bulgeBtn));
noiseBtn.addEventListener('click', () => setDeform('noise', noiseBtn));

draw();
