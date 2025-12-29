const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sphereBtn = document.getElementById('sphereBtn');
const torusBtn = document.getElementById('torusBtn');
const boxBtn = document.getElementById('boxBtn');
const blobBtn = document.getElementById('blobBtn');
const infoEl = document.getElementById('info');

let currentShape = 'sphere';
let time = 0;
const imageData = ctx.createImageData(canvas.width, canvas.height);
const data = imageData.data;

// SDF functions
function sdSphere(p, r) {
    return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) - r;
}

function sdTorus(p, r1, r2) {
    const q = Math.sqrt(p.x * p.x + p.z * p.z) - r1;
    return Math.sqrt(q * q + p.y * p.y) - r2;
}

function sdBox(p, b) {
    const dx = Math.abs(p.x) - b.x;
    const dy = Math.abs(p.y) - b.y;
    const dz = Math.abs(p.z) - b.z;
    const outside = Math.sqrt(
        Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2 + Math.max(dz, 0) ** 2
    );
    const inside = Math.min(Math.max(dx, dy, dz), 0);
    return outside + inside;
}

function smoothMin(a, b, k) {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * k * 0.25;
}

function sceneSDF(p, t) {
    const rotY = t * 0.5;
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);

    const rp = {
        x: p.x * cosR - p.z * sinR,
        y: p.y,
        z: p.x * sinR + p.z * cosR
    };

    switch (currentShape) {
        case 'sphere':
            return sdSphere(rp, 1.0);
        case 'torus':
            return sdTorus(rp, 0.8, 0.3);
        case 'box':
            return sdBox(rp, { x: 0.7, y: 0.7, z: 0.7 });
        case 'blob':
            const d1 = sdSphere({ x: rp.x - 0.5, y: rp.y, z: rp.z }, 0.6);
            const d2 = sdSphere({ x: rp.x + 0.5, y: rp.y, z: rp.z }, 0.6);
            const d3 = sdSphere({ x: rp.x, y: rp.y + Math.sin(t * 2) * 0.3, z: rp.z }, 0.5);
            return smoothMin(smoothMin(d1, d2, 0.5), d3, 0.5);
        default:
            return sdSphere(rp, 1.0);
    }
}

function calcNormal(p, t) {
    const eps = 0.001;
    const d = sceneSDF(p, t);
    return normalize({
        x: sceneSDF({ x: p.x + eps, y: p.y, z: p.z }, t) - d,
        y: sceneSDF({ x: p.x, y: p.y + eps, z: p.z }, t) - d,
        z: sceneSDF({ x: p.x, y: p.y, z: p.z + eps }, t) - d
    });
}

function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function raymarch(ro, rd, t) {
    let totalDist = 0;
    const maxDist = 10;
    const maxSteps = 64;
    const minDist = 0.001;

    for (let i = 0; i < maxSteps; i++) {
        const p = {
            x: ro.x + rd.x * totalDist,
            y: ro.y + rd.y * totalDist,
            z: ro.z + rd.z * totalDist
        };

        const dist = sceneSDF(p, t);

        if (dist < minDist) {
            return { hit: true, dist: totalDist, p };
        }

        totalDist += dist;

        if (totalDist > maxDist) break;
    }

    return { hit: false };
}

function render() {
    time += 0.016;

    const w = canvas.width;
    const h = canvas.height;

    const cameraPos = { x: 0, y: 0, z: -3 };
    const lightDir = normalize({ x: 1, y: 1, z: -1 });

    for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
            const uv = {
                x: (px / w - 0.5) * (w / h),
                y: -(py / h - 0.5)
            };

            const rayDir = normalize({ x: uv.x, y: uv.y, z: 1 });

            const result = raymarch(cameraPos, rayDir, time);

            let r, g, b;

            if (result.hit) {
                const normal = calcNormal(result.p, time);
                const diff = Math.max(0, dot(normal, lightDir));
                const ambient = 0.2;
                const lighting = ambient + diff * 0.8;

                // Color based on shape
                const baseColor = {
                    sphere: { r: 0.8, g: 0.3, b: 0.3 },
                    torus: { r: 0.3, g: 0.8, b: 0.5 },
                    box: { r: 0.3, g: 0.5, b: 0.8 },
                    blob: { r: 0.8, g: 0.6, b: 0.3 }
                }[currentShape];

                r = baseColor.r * lighting;
                g = baseColor.g * lighting;
                b = baseColor.b * lighting;

                // Specular
                const reflectDir = {
                    x: rayDir.x - 2 * dot(rayDir, normal) * normal.x,
                    y: rayDir.y - 2 * dot(rayDir, normal) * normal.y,
                    z: rayDir.z - 2 * dot(rayDir, normal) * normal.z
                };
                const spec = Math.pow(Math.max(0, dot(reflectDir, lightDir)), 32);
                r += spec * 0.5;
                g += spec * 0.5;
                b += spec * 0.5;
            } else {
                // Background gradient
                const t = py / h;
                r = 0.05 + t * 0.1;
                g = 0.05 + t * 0.15;
                b = 0.1 + t * 0.2;
            }

            const i = (py * w + px) * 4;
            data[i] = Math.floor(Math.min(1, r) * 255);
            data[i + 1] = Math.floor(Math.min(1, g) * 255);
            data[i + 2] = Math.floor(Math.min(1, b) * 255);
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(render);
}

function setShape(shape, btn) {
    currentShape = shape;
    [sphereBtn, torusBtn, boxBtn, blobBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const names = { sphere: '球體', torus: '環面', box: '方塊', blob: '混合' };
    infoEl.textContent = `形狀: ${names[shape]}`;
}

sphereBtn.addEventListener('click', () => setShape('sphere', sphereBtn));
torusBtn.addEventListener('click', () => setShape('torus', torusBtn));
boxBtn.addEventListener('click', () => setShape('box', boxBtn));
blobBtn.addEventListener('click', () => setShape('blob', blobBtn));

render();
