const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sectionSlider = document.getElementById('sectionSlider');
const xAxisBtn = document.getElementById('xAxisBtn');
const zAxisBtn = document.getElementById('zAxisBtn');
const infoEl = document.getElementById('info');

let rotationY = 0.6;
let sectionPosition = 50;
let sectionAxis = 'x'; // 'x' or 'z'

// Building structure
const building = {
    width: 4,
    height: 3,
    depth: 3,
    floors: [
        { height: 0, thickness: 0.2, color: { r: 100, g: 100, b: 100 } }, // Foundation
        { height: 1, thickness: 0.15, color: { r: 180, g: 180, b: 180 } }, // Floor 1
        { height: 2, thickness: 0.15, color: { r: 180, g: 180, b: 180 } }  // Floor 2
    ],
    walls: { r: 220, g: 200, b: 180 },
    interior: { r: 245, g: 240, b: 230 },
    cutFace: { r: 180, g: 100, b: 100 }
};

function project(x, y, z) {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(0.3);
    const sinX = Math.sin(0.3);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;
    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    const scale = 45 / (6 + z2);
    return {
        x: canvas.width / 2 + x1 * scale,
        y: canvas.height / 2 + 20 - y1 * scale,
        scale,
        z: z2
    };
}

function drawFace(points, color, shade = 1) {
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
    rotationY += 0.003;

    // Background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const hw = building.width / 2;
    const hd = building.depth / 2;
    const h = building.height;

    // Calculate section plane position
    const sectionNorm = (sectionPosition / 100) * 2 - 1; // -1 to 1

    let cutX = sectionAxis === 'x' ? sectionNorm * hw : null;
    let cutZ = sectionAxis === 'z' ? sectionNorm * hd : null;

    const elements = [];

    // Floor slabs with section cut
    building.floors.forEach(floor => {
        const y = floor.height;
        const th = floor.thickness;

        // Cut section
        if (sectionAxis === 'x') {
            // Part before cut
            if (cutX > -hw) {
                const x1 = -hw;
                const x2 = Math.min(cutX, hw);
                if (x2 > x1) {
                    elements.push({
                        type: 'floor',
                        points: [
                            project(x1, y, -hd),
                            project(x2, y, -hd),
                            project(x2, y, hd),
                            project(x1, y, hd)
                        ],
                        color: floor.color,
                        z: (project(x1, y, 0).z + project(x2, y, 0).z) / 2 - 0.1
                    });
                }
            }
        } else {
            // Z axis cut
            if (cutZ > -hd) {
                const z1 = -hd;
                const z2 = Math.min(cutZ, hd);
                if (z2 > z1) {
                    elements.push({
                        type: 'floor',
                        points: [
                            project(-hw, y, z1),
                            project(hw, y, z1),
                            project(hw, y, z2),
                            project(-hw, y, z2)
                        ],
                        color: floor.color,
                        z: (project(0, y, z1).z + project(0, y, z2).z) / 2 - 0.1
                    });
                }
            }
        }
    });

    // Walls with section
    const wallThickness = 0.15;

    if (sectionAxis === 'x') {
        // Front wall (if not cut)
        if (cutX > -hw) {
            const x2 = Math.min(cutX, hw);
            elements.push({
                type: 'wall',
                points: [
                    project(-hw, 0, -hd),
                    project(x2, 0, -hd),
                    project(x2, h, -hd),
                    project(-hw, h, -hd)
                ],
                color: building.walls,
                shade: 0.85,
                z: project(0, h / 2, -hd).z
            });
        }

        // Back wall
        elements.push({
            type: 'wall',
            points: [
                project(-hw, 0, hd),
                project(hw, 0, hd),
                project(hw, h, hd),
                project(-hw, h, hd)
            ],
            color: building.walls,
            shade: 0.8,
            z: project(0, h / 2, hd).z
        });

        // Left wall
        elements.push({
            type: 'wall',
            points: [
                project(-hw, 0, -hd),
                project(-hw, 0, hd),
                project(-hw, h, hd),
                project(-hw, h, -hd)
            ],
            color: building.walls,
            shade: 0.75,
            z: project(-hw, h / 2, 0).z
        });

        // Cut face (section reveal)
        if (cutX > -hw && cutX < hw) {
            elements.push({
                type: 'cut',
                points: [
                    project(cutX, 0, -hd),
                    project(cutX, 0, hd),
                    project(cutX, h, hd),
                    project(cutX, h, -hd)
                ],
                color: building.cutFace,
                shade: 1.0,
                z: project(cutX, h / 2, 0).z + 0.01
            });

            // Interior detail lines on cut face
            building.floors.forEach(floor => {
                if (floor.height > 0) {
                    elements.push({
                        type: 'line',
                        p1: project(cutX, floor.height, -hd),
                        p2: project(cutX, floor.height, hd),
                        z: project(cutX, floor.height, 0).z + 0.02
                    });
                }
            });
        }
    } else {
        // Z axis section
        // Left wall
        elements.push({
            type: 'wall',
            points: [
                project(-hw, 0, -hd),
                project(-hw, 0, hd),
                project(-hw, h, hd),
                project(-hw, h, -hd)
            ],
            color: building.walls,
            shade: 0.75,
            z: project(-hw, h / 2, 0).z
        });

        // Right wall
        elements.push({
            type: 'wall',
            points: [
                project(hw, 0, -hd),
                project(hw, 0, hd),
                project(hw, h, hd),
                project(hw, h, -hd)
            ],
            color: building.walls,
            shade: 0.7,
            z: project(hw, h / 2, 0).z
        });

        // Front wall (if not cut)
        if (cutZ > -hd) {
            elements.push({
                type: 'wall',
                points: [
                    project(-hw, 0, -hd),
                    project(hw, 0, -hd),
                    project(hw, h, -hd),
                    project(-hw, h, -hd)
                ],
                color: building.walls,
                shade: 0.85,
                z: project(0, h / 2, -hd).z
            });
        }

        // Cut face
        if (cutZ > -hd && cutZ < hd) {
            elements.push({
                type: 'cut',
                points: [
                    project(-hw, 0, cutZ),
                    project(hw, 0, cutZ),
                    project(hw, h, cutZ),
                    project(-hw, h, cutZ)
                ],
                color: building.cutFace,
                shade: 1.0,
                z: project(0, h / 2, cutZ).z + 0.01
            });
        }
    }

    // Sort and draw
    elements.sort((a, b) => b.z - a.z);

    elements.forEach(el => {
        if (el.type === 'line') {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(el.p1.x, el.p1.y);
            ctx.lineTo(el.p2.x, el.p2.y);
            ctx.stroke();
        } else {
            drawFace(el.points, el.color, el.shade || 1);
        }
    });

    // Section plane indicator
    ctx.strokeStyle = '#ce93d8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (sectionAxis === 'x' && cutX > -hw && cutX < hw) {
        const sp1 = project(cutX, -0.2, -hd - 0.5);
        const sp2 = project(cutX, -0.2, hd + 0.5);
        ctx.beginPath();
        ctx.moveTo(sp1.x, sp1.y);
        ctx.lineTo(sp2.x, sp2.y);
        ctx.stroke();
    } else if (sectionAxis === 'z' && cutZ > -hd && cutZ < hd) {
        const sp1 = project(-hw - 0.5, -0.2, cutZ);
        const sp2 = project(hw + 0.5, -0.2, cutZ);
        ctx.beginPath();
        ctx.moveTo(sp1.x, sp1.y);
        ctx.lineTo(sp2.x, sp2.y);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    requestAnimationFrame(draw);
}

sectionSlider.addEventListener('input', (e) => {
    sectionPosition = parseInt(e.target.value);
    infoEl.textContent = `剖面位置: ${sectionPosition}%`;
});

xAxisBtn.addEventListener('click', () => {
    sectionAxis = 'x';
    xAxisBtn.classList.add('active');
    zAxisBtn.classList.remove('active');
    infoEl.textContent = '剖面軸: X軸';
});

zAxisBtn.addEventListener('click', () => {
    sectionAxis = 'z';
    zAxisBtn.classList.add('active');
    xAxisBtn.classList.remove('active');
    infoEl.textContent = '剖面軸: Z軸';
});

draw();
