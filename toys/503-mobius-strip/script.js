const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const twistsSlider = document.getElementById('twists');
const twistValue = document.getElementById('twistValue');
const infoEl = document.getElementById('info');

let rotX = 0.3, rotY = 0;
let isDragging = false;
let lastX, lastY;
let antPosition = 0;

function generateMobius(twists) {
    const strips = [];
    const uSteps = 80;
    const vSteps = 10;

    for (let i = 0; i < uSteps; i++) {
        const strip = [];
        const u = (i / uSteps) * Math.PI * 2;
        const nextU = ((i + 1) / uSteps) * Math.PI * 2;

        for (let j = 0; j <= vSteps; j++) {
            const v = (j / vSteps - 0.5) * 0.8;

            // Möbius parametric equations
            const twist = twists * u / 2;
            const r = 1 + v * Math.cos(twist);

            const x = r * Math.cos(u);
            const y = r * Math.sin(u);
            const z = v * Math.sin(twist);

            const nextTwist = twists * nextU / 2;
            const nextR = 1 + v * Math.cos(nextTwist);
            const nx = nextR * Math.cos(nextU);
            const ny = nextR * Math.sin(nextU);
            const nz = v * Math.sin(nextTwist);

            strip.push({ x, y, z, nx, ny, nz });
        }
        strips.push(strip);
    }
    return strips;
}

function rotate(x, y, z) {
    let cos = Math.cos(rotX), sin = Math.sin(rotX);
    [y, z] = [y * cos - z * sin, y * sin + z * cos];
    cos = Math.cos(rotY); sin = Math.sin(rotY);
    [x, z] = [x * cos + z * sin, -x * sin + z * cos];
    return { x, y, z };
}

function project(x, y, z) {
    const scale = 80;
    const dist = 4;
    const factor = dist / (dist + z);
    return {
        x: canvas.width / 2 + x * scale * factor,
        y: canvas.height / 2 + y * scale * factor,
        z: z
    };
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const twists = parseInt(twistsSlider.value);
    const strips = generateMobius(twists);

    // Sort strips by depth
    const sortedStrips = strips.map((strip, i) => {
        const avgZ = strip.reduce((sum, p) => {
            const r = rotate(p.x, p.y, p.z);
            return sum + r.z;
        }, 0) / strip.length;
        return { strip, avgZ, index: i };
    }).sort((a, b) => a.avgZ - b.avgZ);

    // Draw strips
    sortedStrips.forEach(({ strip, avgZ }) => {
        for (let j = 0; j < strip.length - 1; j++) {
            const p1 = strip[j];
            const p2 = strip[j + 1];

            const r1 = rotate(p1.x, p1.y, p1.z);
            const r2 = rotate(p2.x, p2.y, p2.z);
            const r3 = rotate(p1.nx, p1.ny, p1.nz);
            const r4 = rotate(p2.nx, p2.ny, p2.nz);

            const pr1 = project(r1.x, r1.y, r1.z);
            const pr2 = project(r2.x, r2.y, r2.z);
            const pr3 = project(r3.x, r3.y, r3.z);
            const pr4 = project(r4.x, r4.y, r4.z);

            const brightness = 0.3 + (avgZ + 1.5) * 0.25;
            const hue = (j / strip.length * 120 + rotY * 20) % 360;

            ctx.beginPath();
            ctx.moveTo(pr1.x, pr1.y);
            ctx.lineTo(pr2.x, pr2.y);
            ctx.lineTo(pr4.x, pr4.y);
            ctx.lineTo(pr3.x, pr3.y);
            ctx.closePath();
            ctx.fillStyle = `hsla(${hue}, 70%, ${brightness * 50}%, 0.9)`;
            ctx.fill();
        }
    });

    // Draw ant
    const antU = antPosition * Math.PI * 2;
    const antTwist = twists * antU / 2;
    const antV = 0;
    const antR = 1 + antV * Math.cos(antTwist);
    const antX = antR * Math.cos(antU);
    const antY = antR * Math.sin(antU);
    const antZ = antV * Math.sin(antTwist);

    const rotAnt = rotate(antX, antY, antZ);
    const projAnt = project(rotAnt.x, rotAnt.y, rotAnt.z);

    ctx.beginPath();
    ctx.arc(projAnt.x, projAnt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Möbius Strip', canvas.width / 2, 20);

    antPosition = (antPosition + 0.003) % 2; // Ant walks the strip twice to return
    rotY += isDragging ? 0 : 0.01;
    requestAnimationFrame(draw);
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotY += (e.clientX - lastX) * 0.01;
    rotX += (e.clientY - lastY) * 0.01;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

twistsSlider.addEventListener('input', () => {
    twistValue.textContent = twistsSlider.value;
    const t = parseInt(twistsSlider.value);
    const sides = t % 2 === 1 ? '單面' : '雙面';
    infoEl.textContent = `${t} 次扭轉 = ${sides}曲面`;
});

draw();
