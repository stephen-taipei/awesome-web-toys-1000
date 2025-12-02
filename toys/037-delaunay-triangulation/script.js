/**
 * Delaunay Triangulation 德勞內三角剖分
 * Web Toys #037
 *
 * 互動式德勞內三角剖分視覺化
 *
 * 技術重點：
 * - Bowyer-Watson 演算法
 * - 超三角形概念
 * - 動態頂點移動
 */

// ==================== 畫布設定 ====================

const canvas = document.getElementById('delaunayCanvas');
const ctx = canvas.getContext('2d');

// ==================== 配置參數 ====================

let config = {
    pointCount: 80,
    speed: 0.5,
    colorMode: 'gradient',
    showPoints: true,
    showEdges: true
};

let points = [];
let triangles = [];
let time = 0;

// ==================== 頂點類別 ====================

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
    }

    update(width, height, speed) {
        // 添加隨機擾動
        this.vx += (Math.random() - 0.5) * 0.05;
        this.vy += (Math.random() - 0.5) * 0.05;

        // 限制速度
        const maxSpeed = 1.5 * speed;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        // 更新位置
        this.x += this.vx * speed;
        this.y += this.vy * speed;

        // 邊界反彈
        if (this.x < 0 || this.x > width) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(width, this.x));
        }
        if (this.y < 0 || this.y > height) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(height, this.y));
        }
    }
}

// ==================== 三角形類別 ====================

class Triangle {
    constructor(p1, p2, p3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.circumcircle = this.calculateCircumcircle();
    }

    calculateCircumcircle() {
        const ax = this.p1.x;
        const ay = this.p1.y;
        const bx = this.p2.x;
        const by = this.p2.y;
        const cx = this.p3.x;
        const cy = this.p3.y;

        const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
        if (Math.abs(d) < 0.0001) {
            return { x: 0, y: 0, r: Infinity };
        }

        const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
        const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;

        const dx = ax - ux;
        const dy = ay - uy;

        return {
            x: ux,
            y: uy,
            r: Math.sqrt(dx * dx + dy * dy)
        };
    }

    containsPoint(p) {
        const dx = p.x - this.circumcircle.x;
        const dy = p.y - this.circumcircle.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.circumcircle.r;
    }

    getArea() {
        return Math.abs(
            (this.p1.x * (this.p2.y - this.p3.y) +
             this.p2.x * (this.p3.y - this.p1.y) +
             this.p3.x * (this.p1.y - this.p2.y)) / 2
        );
    }

    getCentroid() {
        return {
            x: (this.p1.x + this.p2.x + this.p3.x) / 3,
            y: (this.p1.y + this.p2.y + this.p3.y) / 3
        };
    }
}

// ==================== 德勞內三角剖分 ====================

/**
 * Bowyer-Watson 演算法
 */
function triangulate(pointList) {
    if (pointList.length < 3) return [];

    // 建立超三角形
    const minX = Math.min(...pointList.map(p => p.x));
    const maxX = Math.max(...pointList.map(p => p.x));
    const minY = Math.min(...pointList.map(p => p.y));
    const maxY = Math.max(...pointList.map(p => p.y));

    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy) * 2;

    const superP1 = { x: minX - deltaMax, y: minY - deltaMax };
    const superP2 = { x: minX + deltaMax * 2, y: minY - deltaMax };
    const superP3 = { x: minX + dx / 2, y: maxY + deltaMax };

    let triangulation = [new Triangle(superP1, superP2, superP3)];

    // 逐點插入
    for (const point of pointList) {
        const badTriangles = [];
        const polygon = [];

        // 找出包含該點的三角形
        for (const triangle of triangulation) {
            if (triangle.containsPoint(point)) {
                badTriangles.push(triangle);
            }
        }

        // 找出多邊形邊界
        for (const triangle of badTriangles) {
            const edges = [
                [triangle.p1, triangle.p2],
                [triangle.p2, triangle.p3],
                [triangle.p3, triangle.p1]
            ];

            for (const edge of edges) {
                let isShared = false;
                for (const other of badTriangles) {
                    if (other === triangle) continue;
                    const otherEdges = [
                        [other.p1, other.p2],
                        [other.p2, other.p3],
                        [other.p3, other.p1]
                    ];
                    for (const otherEdge of otherEdges) {
                        if ((edge[0] === otherEdge[0] && edge[1] === otherEdge[1]) ||
                            (edge[0] === otherEdge[1] && edge[1] === otherEdge[0])) {
                            isShared = true;
                            break;
                        }
                    }
                    if (isShared) break;
                }
                if (!isShared) {
                    polygon.push(edge);
                }
            }
        }

        // 移除壞三角形
        triangulation = triangulation.filter(t => !badTriangles.includes(t));

        // 建立新三角形
        for (const edge of polygon) {
            triangulation.push(new Triangle(edge[0], edge[1], point));
        }
    }

    // 移除包含超三角形頂點的三角形
    triangulation = triangulation.filter(t =>
        t.p1 !== superP1 && t.p1 !== superP2 && t.p1 !== superP3 &&
        t.p2 !== superP1 && t.p2 !== superP2 && t.p2 !== superP3 &&
        t.p3 !== superP1 && t.p3 !== superP2 && t.p3 !== superP3
    );

    return triangulation;
}

// ==================== 顏色模式 ====================

const colorModes = {
    gradient: (triangle, index, total, maxArea) => {
        const centroid = triangle.getCentroid();
        const h = (centroid.x / canvas.width * 60 + centroid.y / canvas.height * 60 + 140) % 360;
        const l = 30 + (triangle.getArea() / maxArea) * 30;
        return `hsl(${h}, 70%, ${l}%)`;
    },
    rainbow: (triangle, index, total) => {
        const h = (index / total) * 360;
        return `hsl(${h}, 75%, 45%)`;
    },
    area: (triangle, index, total, maxArea) => {
        const ratio = triangle.getArea() / maxArea;
        const h = 200 - ratio * 150;
        return `hsl(${h}, 80%, 45%)`;
    },
    wireframe: () => 'transparent'
};

// ==================== 繪製函數 ====================

function draw() {
    // 清除畫布
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (triangles.length === 0) return;

    // 計算最大面積
    const maxArea = Math.max(...triangles.map(t => t.getArea()));

    // 繪製三角形
    for (let i = 0; i < triangles.length; i++) {
        const triangle = triangles[i];
        const colorFn = colorModes[config.colorMode];
        const fillColor = colorFn(triangle, i, triangles.length, maxArea);

        // 填充
        if (fillColor !== 'transparent') {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(triangle.p1.x, triangle.p1.y);
            ctx.lineTo(triangle.p2.x, triangle.p2.y);
            ctx.lineTo(triangle.p3.x, triangle.p3.y);
            ctx.closePath();
            ctx.fill();
        }

        // 邊框
        if (config.showEdges) {
            ctx.strokeStyle = config.colorMode === 'wireframe'
                ? 'rgba(120, 200, 180, 0.8)'
                : 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = config.colorMode === 'wireframe' ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(triangle.p1.x, triangle.p1.y);
            ctx.lineTo(triangle.p2.x, triangle.p2.y);
            ctx.lineTo(triangle.p3.x, triangle.p3.y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    // 繪製頂點
    if (config.showPoints) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
}

function updateInfo() {
    document.getElementById('pointDisplay').textContent = points.length;
    document.getElementById('triangleDisplay').textContent = triangles.length;
}

// ==================== 初始化 ====================

function initPoints() {
    points = [];
    const width = canvas.width;
    const height = canvas.height;

    for (let i = 0; i < config.pointCount; i++) {
        points.push(new Point(
            Math.random() * width,
            Math.random() * height
        ));
    }

    triangles = triangulate(points);
    updateInfo();
}

// ==================== 動畫迴圈 ====================

function animate() {
    time++;

    // 更新頂點位置
    if (config.speed > 0) {
        for (const point of points) {
            point.update(canvas.width, canvas.height, config.speed);
        }
        // 重新計算三角剖分
        triangles = triangulate(points);
    }

    draw();
    updateInfo();

    requestAnimationFrame(animate);
}

// ==================== 畫布大小調整 ====================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPoints();
}

// ==================== 事件處理 ====================

window.addEventListener('resize', resizeCanvas);

// 點擊添加新頂點
canvas.addEventListener('click', (e) => {
    points.push(new Point(e.clientX, e.clientY));
    triangles = triangulate(points);
    updateInfo();
});

// 觸控支援
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    points.push(new Point(touch.clientX, touch.clientY));
    triangles = triangulate(points);
    updateInfo();
});

document.getElementById('pointCount').addEventListener('input', (e) => {
    config.pointCount = parseInt(e.target.value);
    document.getElementById('pointCountValue').textContent = config.pointCount;
    initPoints();
});

document.getElementById('speed').addEventListener('input', (e) => {
    config.speed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = config.speed.toFixed(1);
});

document.getElementById('colorMode').addEventListener('change', (e) => {
    config.colorMode = e.target.value;
});

document.getElementById('showPoints').addEventListener('change', (e) => {
    config.showPoints = e.target.checked;
});

document.getElementById('showEdges').addEventListener('change', (e) => {
    config.showEdges = e.target.checked;
});

document.getElementById('resetBtn').addEventListener('click', initPoints);

// ==================== 啟動 ====================

resizeCanvas();
requestAnimationFrame(animate);
