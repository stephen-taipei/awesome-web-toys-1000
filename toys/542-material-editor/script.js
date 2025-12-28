const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const shininessSlider = document.getElementById('shininessSlider');
const ambientSlider = document.getElementById('ambientSlider');
const infoEl = document.getElementById('info');

let materialColor = { r: 107, g: 140, b: 206 };
let shininess = 30;
let ambient = 0.2;
let rotationY = 0;

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

function normalize(v) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function drawMaterialSphere(cx, cy, radius, label) {
    const lightDir = normalize([1, -1, 1]);
    const viewDir = [0, 0, 1];

    for (let y = cy - radius; y < cy + radius; y++) {
        for (let x = cx - radius; x < cx + radius; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const distSq = dx * dx + dy * dy;

            if (distSq < radius * radius) {
                const z = Math.sqrt(radius * radius - distSq);
                let normal = normalize([dx, dy, z]);

                // Apply rotation
                const cosR = Math.cos(rotationY);
                const sinR = Math.sin(rotationY);
                normal = [
                    normal[0] * cosR - normal[2] * sinR,
                    normal[1],
                    normal[0] * sinR + normal[2] * cosR
                ];

                // Diffuse
                const NdotL = Math.max(0, dot(normal, lightDir));

                // Specular (Blinn-Phong)
                const halfVec = normalize([
                    lightDir[0] + viewDir[0],
                    lightDir[1] + viewDir[1],
                    lightDir[2] + viewDir[2]
                ]);
                const NdotH = Math.max(0, dot(normal, halfVec));
                const spec = Math.pow(NdotH, shininess);

                // Combine
                const diffuse = NdotL;
                const r = Math.min(255, materialColor.r * (ambient + diffuse * 0.7) + 255 * spec * 0.5);
                const g = Math.min(255, materialColor.g * (ambient + diffuse * 0.7) + 255 * spec * 0.5);
                const b = Math.min(255, materialColor.b * (ambient + diffuse * 0.7) + 255 * spec * 0.5);

                ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Label
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, cy + radius + 15);
}

function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rotationY += 0.015;

    // Draw three spheres showing different properties
    drawMaterialSphere(90, 110, 55, '低光澤');
    drawMaterialSphere(180, 110, 55, '當前設定');
    drawMaterialSphere(270, 110, 55, '高光澤');

    // Override for comparison spheres
    const origShininess = shininess;

    // First sphere: low shininess
    shininess = 5;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(35, 55, 110, 110);
    drawMaterialSphere(90, 110, 55, '低光澤');

    // Middle sphere: current settings
    shininess = origShininess;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(125, 55, 110, 110);
    drawMaterialSphere(180, 110, 55, '當前');

    // Third sphere: high shininess
    shininess = 80;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(215, 55, 110, 110);
    drawMaterialSphere(270, 110, 55, '高光澤');

    shininess = origShininess;

    requestAnimationFrame(draw);
}

colorPicker.addEventListener('input', (e) => {
    materialColor = hexToRgb(e.target.value);
    infoEl.textContent = `顏色已更新`;
});

shininessSlider.addEventListener('input', (e) => {
    shininess = parseInt(e.target.value);
    infoEl.textContent = `光澤度: ${shininess}`;
});

ambientSlider.addEventListener('input', (e) => {
    ambient = parseInt(e.target.value) / 100;
    infoEl.textContent = `環境光: ${(ambient * 100).toFixed(0)}%`;
});

draw();
