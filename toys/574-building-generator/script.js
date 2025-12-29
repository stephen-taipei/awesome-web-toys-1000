const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const regenerateBtn = document.getElementById('regenerateBtn');
const floorSlider = document.getElementById('floorSlider');
const floorLabel = document.getElementById('floorLabel');
const infoEl = document.getElementById('info');

let rotationY = 0.5;
let building = null;
let floors = 6;
let seed = Math.random() * 1000;

function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
}

function generateBuilding() {
    const baseWidth = 3 + random() * 2;
    const baseDepth = 2 + random() * 1.5;
    const floorHeight = 0.8 + random() * 0.3;

    // Building style
    const styles = ['modern', 'classic', 'office'];
    const style = styles[Math.floor(random() * styles.length)];

    // Wall colors
    const colors = {
        modern: { r: 200, g: 210, b: 220 },
        classic: { r: 220, g: 200, b: 170 },
        office: { r: 180, g: 200, b: 220 }
    };

    building = {
        width: baseWidth,
        depth: baseDepth,
        floorHeight,
        floors,
        style,
        color: colors[style],
        windows: [],
        features: []
    };

    // Generate windows
    const windowsPerFloor = Math.floor(baseWidth / 0.8);
    for (let f = 0; f < floors; f++) {
        for (let w = 0; w < windowsPerFloor; w++) {
            const lit = random() > 0.6;
            building.windows.push({
                floor: f,
                position: w,
                lit
            });
        }
    }

    // Add features
    if (style === 'modern') {
        building.features.push({ type: 'balcony', floors: [floors - 1, floors - 2] });
    } else if (style === 'classic') {
        building.features.push({ type: 'columns' });
    }

    infoEl.textContent = `風格: ${style === 'modern' ? '現代' : style === 'classic' ? '古典' : '辦公'} | ${floors}層`;
}

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.2);
    const sinX = Math.sin(0.2);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 50 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height - 40 - y1 * scale,
        scale,
        z: z2
    };
}

function drawFace(points, color, shade) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgb(${Math.floor(color.r * shade)}, ${Math.floor(color.g * shade)}, ${Math.floor(color.b * shade)})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
}

function draw() {
    rotationY += 0.004;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90d9');
    skyGrad.addColorStop(1, '#c8e6f5');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#6b8e6b';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    if (!building) return requestAnimationFrame(draw);

    const { width, depth, floorHeight, color } = building;
    const hw = width / 2;
    const hd = depth / 2;
    const totalHeight = floors * floorHeight;

    // Main building body
    const vertices = [
        project(-hw, 0, -hd),
        project(hw, 0, -hd),
        project(hw, 0, hd),
        project(-hw, 0, hd),
        project(-hw, totalHeight, -hd),
        project(hw, totalHeight, -hd),
        project(hw, totalHeight, hd),
        project(-hw, totalHeight, hd)
    ];

    // Draw faces based on visibility
    const faces = [
        { verts: [0, 1, 5, 4], shade: 0.85, type: 'front' },
        { verts: [1, 2, 6, 5], shade: 0.7, type: 'side' },
        { verts: [2, 3, 7, 6], shade: 0.85, type: 'back' },
        { verts: [3, 0, 4, 7], shade: 0.7, type: 'side' },
        { verts: [4, 5, 6, 7], shade: 1.0, type: 'roof' }
    ];

    faces.sort((a, b) => {
        const aZ = a.verts.reduce((s, i) => s + vertices[i].z, 0) / 4;
        const bZ = b.verts.reduce((s, i) => s + vertices[i].z, 0) / 4;
        return bZ - aZ;
    });

    faces.forEach(face => {
        const points = face.verts.map(i => vertices[i]);

        if (face.type === 'roof') {
            drawFace(points, { r: 100, g: 100, b: 110 }, 1.0);
        } else {
            drawFace(points, color, face.shade);

            // Draw windows
            if (face.type === 'front' || face.type === 'side') {
                const windowsPerFloor = Math.floor(width / 0.8);
                const windowWidth = (width * 0.7) / windowsPerFloor;
                const windowHeight = floorHeight * 0.5;

                for (let f = 0; f < floors; f++) {
                    for (let w = 0; w < windowsPerFloor; w++) {
                        const windowIdx = f * windowsPerFloor + w;
                        const isLit = building.windows[windowIdx]?.lit;

                        const wx = -hw + 0.3 + w * (width - 0.6) / windowsPerFloor + windowWidth / 2;
                        const wy = f * floorHeight + floorHeight * 0.3;

                        let wz;
                        if (face.type === 'front') {
                            wz = -hd - 0.01;
                        } else {
                            wz = hd + 0.01;
                        }

                        const wp = [
                            project(wx - windowWidth / 3, wy, wz),
                            project(wx + windowWidth / 3, wy, wz),
                            project(wx + windowWidth / 3, wy + windowHeight, wz),
                            project(wx - windowWidth / 3, wy + windowHeight, wz)
                        ];

                        ctx.beginPath();
                        ctx.moveTo(wp[0].x, wp[0].y);
                        wp.forEach(p => ctx.lineTo(p.x, p.y));
                        ctx.closePath();

                        if (isLit) {
                            ctx.fillStyle = 'rgba(255, 240, 180, 0.8)';
                        } else {
                            ctx.fillStyle = 'rgba(100, 150, 200, 0.7)';
                        }
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(60, 60, 60, 0.5)';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }
    });

    // Entrance
    const entranceWidth = 0.8;
    const entranceHeight = floorHeight * 0.9;
    const ep = [
        project(-entranceWidth / 2, 0, -hd - 0.02),
        project(entranceWidth / 2, 0, -hd - 0.02),
        project(entranceWidth / 2, entranceHeight, -hd - 0.02),
        project(-entranceWidth / 2, entranceHeight, -hd - 0.02)
    ];
    ctx.beginPath();
    ctx.moveTo(ep[0].x, ep[0].y);
    ep.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();

    requestAnimationFrame(draw);
}

regenerateBtn.addEventListener('click', () => {
    seed = Math.random() * 1000;
    generateBuilding();
});

floorSlider.addEventListener('input', (e) => {
    floors = parseInt(e.target.value);
    floorLabel.textContent = floors;
    generateBuilding();
});

generateBuilding();
draw();
