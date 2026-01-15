const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const densityInput = document.getElementById('density');

canvas.width = 370;
canvas.height = 280;

function generateLowPoly() {
    const density = parseInt(densityInput.value);
    const points = [];

    for (let i = 0; i < density; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    points.push({ x: 0, y: 0 });
    points.push({ x: canvas.width, y: 0 });
    points.push({ x: 0, y: canvas.height });
    points.push({ x: canvas.width, y: canvas.height });
    points.push({ x: canvas.width / 2, y: 0 });
    points.push({ x: canvas.width / 2, y: canvas.height });
    points.push({ x: 0, y: canvas.height / 2 });
    points.push({ x: canvas.width, y: canvas.height / 2 });

    const triangles = delaunay(points);

    const baseHue = Math.random() * 360;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    triangles.forEach(tri => {
        const centerY = (tri[0].y + tri[1].y + tri[2].y) / 3;
        const hue = (baseHue + centerY * 0.3) % 360;
        const lightness = 30 + (centerY / canvas.height) * 40;

        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        ctx.strokeStyle = `hsl(${hue}, 70%, ${lightness + 5}%)`;
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });
}

function delaunay(points) {
    const triangles = [];
    const n = points.length;

    for (let i = 0; i < n - 2; i++) {
        for (let j = i + 1; j < n - 1; j++) {
            for (let k = j + 1; k < n; k++) {
                const p1 = points[i], p2 = points[j], p3 = points[k];
                const center = circumcenter(p1, p2, p3);
                if (!center) continue;

                const r = Math.sqrt((p1.x - center.x) ** 2 + (p1.y - center.y) ** 2);
                let valid = true;

                for (let m = 0; m < n && valid; m++) {
                    if (m === i || m === j || m === k) continue;
                    const d = Math.sqrt((points[m].x - center.x) ** 2 + (points[m].y - center.y) ** 2);
                    if (d < r - 0.001) valid = false;
                }

                if (valid) {
                    triangles.push([p1, p2, p3]);
                }
            }
        }
    }

    return triangles;
}

function circumcenter(p1, p2, p3) {
    const ax = p1.x, ay = p1.y;
    const bx = p2.x, by = p2.y;
    const cx = p3.x, cy = p3.y;

    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 0.001) return null;

    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

    return { x: ux, y: uy };
}

document.getElementById('generateBtn').addEventListener('click', generateLowPoly);
densityInput.addEventListener('input', generateLowPoly);

generateLowPoly();
