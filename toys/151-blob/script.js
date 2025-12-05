/**
 * 151 - 軟體球
 * Blob Physics
 *
 * 使用壓力軟體物理模擬可拖曳擠壓的軟 Q 球體
 * 碰撞後變形並恢復原狀
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mul(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2();
        return this.mul(1 / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    perpendicular() {
        return new Vector2(-this.y, this.x);
    }
}

// 軟體球質點
class BlobPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.acceleration = new Vector2();
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    update(damping) {
        const velocity = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = new Vector2(this.position.x, this.position.y);
        this.position = this.position.add(velocity).add(this.acceleration.mul(0.016 * 0.016));
        this.acceleration = new Vector2();
    }
}

// 軟體球類別
class Blob {
    constructor(x, y, radius, numPoints, color) {
        this.center = new Vector2(x, y);
        this.radius = radius;
        this.numPoints = numPoints;
        this.color = color;
        this.points = [];
        this.restLengths = [];

        // 建立環形質點
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.points.push(new BlobPoint(px, py));
        }

        // 計算靜止彈簧長度
        for (let i = 0; i < numPoints; i++) {
            const next = (i + 1) % numPoints;
            const len = this.points[i].position.sub(this.points[next].position).length();
            this.restLengths.push(len);
        }

        // 計算初始面積（用於壓力計算）
        this.restArea = this.calculateArea();
    }

    calculateArea() {
        // 使用鞋帶公式計算多邊形面積
        let area = 0;
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            area += this.points[i].position.x * this.points[j].position.y;
            area -= this.points[j].position.x * this.points[i].position.y;
        }
        return Math.abs(area) / 2;
    }

    getCenter() {
        let cx = 0, cy = 0;
        for (const p of this.points) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.numPoints, cy / this.numPoints);
    }

    update(params, bounds, mousePos, mouseDown) {
        const { softness, pressure, damping, gravity } = params;

        // 施加重力
        const gravityForce = new Vector2(0, gravity * 0.01);
        for (const p of this.points) {
            p.applyForce(gravityForce);
        }

        // 滑鼠互動
        if (mousePos) {
            const center = this.getCenter();
            const toMouse = mousePos.sub(center);
            const dist = toMouse.length();

            if (mouseDown && dist < this.radius * 3) {
                // 推開或吸引
                const force = toMouse.normalize().mul(0.5);
                for (const p of this.points) {
                    const pointToMouse = mousePos.sub(p.position);
                    const pointDist = pointToMouse.length();
                    if (pointDist < this.radius * 2) {
                        const pushForce = pointToMouse.normalize().mul(0.3);
                        p.applyForce(pushForce);
                    }
                }
            }
        }

        // 更新質點
        for (const p of this.points) {
            p.update(damping);
        }

        // 壓力軟體約束
        this.applyPressure(pressure);
        this.applySprings(softness);

        // 邊界碰撞
        this.handleBounds(bounds);
    }

    applyPressure(pressureStrength) {
        // 計算當前面積
        const currentArea = this.calculateArea();
        const areaRatio = this.restArea / (currentArea + 0.001);

        // 壓力力道（面積越小，壓力越大）
        const pressureForce = (areaRatio - 1) * pressureStrength * 0.01;

        // 對每條邊施加向外的壓力
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            const p1 = this.points[i];
            const p2 = this.points[j];

            const edge = p2.position.sub(p1.position);
            const normal = edge.perpendicular().normalize();

            // 確定法線方向（向外）
            const center = this.getCenter();
            const midPoint = p1.position.add(p2.position).mul(0.5);
            const toCenter = center.sub(midPoint);
            if (normal.dot(toCenter) > 0) {
                normal.x = -normal.x;
                normal.y = -normal.y;
            }

            const force = new Vector2(normal.x * pressureForce, normal.y * pressureForce);
            p1.applyForce(force);
            p2.applyForce(force);
        }
    }

    applySprings(softness) {
        const stiffness = softness * 0.001;
        const iterations = 3;

        for (let iter = 0; iter < iterations; iter++) {
            // 邊緣彈簧
            for (let i = 0; i < this.numPoints; i++) {
                const j = (i + 1) % this.numPoints;
                const p1 = this.points[i];
                const p2 = this.points[j];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const restLen = this.restLengths[i];

                if (dist === 0) continue;

                const delta = (dist - restLen) / dist * 0.5;
                const correction = diff.mul(delta);

                p1.position = p1.position.add(correction);
                p2.position = p2.position.sub(correction);
            }

            // 對角彈簧（保持形狀）
            for (let i = 0; i < this.numPoints; i++) {
                const opposite = (i + Math.floor(this.numPoints / 2)) % this.numPoints;
                const p1 = this.points[i];
                const p2 = this.points[opposite];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const targetDist = this.radius * 2;

                if (dist === 0) continue;

                const delta = (dist - targetDist) / dist * stiffness;
                const correction = diff.mul(delta);

                p1.position = p1.position.add(correction);
                p2.position = p2.position.sub(correction);
            }
        }
    }

    handleBounds(bounds) {
        const bounce = 0.5;
        const friction = 0.8;

        for (const p of this.points) {
            // 底部
            if (p.position.y > bounds.height - 10) {
                p.position.y = bounds.height - 10;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
                p.prevPosition.x = p.position.x - (p.position.x - p.prevPosition.x) * (1 - friction);
            }

            // 頂部
            if (p.position.y < 10) {
                p.position.y = 10;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
            }

            // 左右
            if (p.position.x < 10) {
                p.position.x = 10;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
            if (p.position.x > bounds.width - 10) {
                p.position.x = bounds.width - 10;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
        }
    }

    draw(ctx, rainbowMode, time) {
        ctx.beginPath();

        // 使用貝茲曲線繪製平滑輪廓
        const firstPoint = this.points[0];
        const lastPoint = this.points[this.numPoints - 1];
        const startX = (lastPoint.position.x + firstPoint.position.x) / 2;
        const startY = (lastPoint.position.y + firstPoint.position.y) / 2;

        ctx.moveTo(startX, startY);

        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.numPoints];

            const midX = (p1.position.x + p2.position.x) / 2;
            const midY = (p1.position.y + p2.position.y) / 2;

            ctx.quadraticCurveTo(p1.position.x, p1.position.y, midX, midY);
        }

        ctx.closePath();

        // 填充顏色
        if (rainbowMode) {
            const center = this.getCenter();
            const gradient = ctx.createRadialGradient(
                center.x, center.y, 0,
                center.x, center.y, this.radius * 1.5
            );

            const hue1 = (time * 50) % 360;
            const hue2 = (hue1 + 60) % 360;
            const hue3 = (hue1 + 120) % 360;

            gradient.addColorStop(0, `hsla(${hue1}, 80%, 60%, 0.9)`);
            gradient.addColorStop(0.5, `hsla(${hue2}, 80%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(${hue3}, 80%, 40%, 0.7)`);

            ctx.fillStyle = gradient;
        } else {
            const center = this.getCenter();
            const gradient = ctx.createRadialGradient(
                center.x - this.radius * 0.3,
                center.y - this.radius * 0.3,
                0,
                center.x,
                center.y,
                this.radius * 1.5
            );

            gradient.addColorStop(0, this.color.light);
            gradient.addColorStop(0.5, this.color.main);
            gradient.addColorStop(1, this.color.dark);

            ctx.fillStyle = gradient;
        }

        ctx.fill();

        // 高光效果
        const center = this.getCenter();
        ctx.beginPath();
        ctx.arc(
            center.x - this.radius * 0.3,
            center.y - this.radius * 0.3,
            this.radius * 0.15,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(
            center.x - this.radius * 0.15,
            center.y - this.radius * 0.15,
            this.radius * 0.08,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }
}

// 主應用程式
class BlobApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.blobs = [];
        this.mousePos = null;
        this.mouseDown = false;
        this.rainbowMode = false;
        this.time = 0;

        this.params = {
            softness: 50,
            pressure: 100,
            damping: 0.97,
            gravity: 50
        };

        this.colors = [
            { main: '#ff6b9d', light: '#ff9dc4', dark: '#c44569' },
            { main: '#4ecdc4', light: '#7eeee7', dark: '#2e9e97' },
            { main: '#ffe66d', light: '#fff4a3', dark: '#ccb654' },
            { main: '#95e1d3', light: '#c5f5eb', dark: '#6bb3a5' },
            { main: '#f38181', light: '#ffa5a5', dark: '#c66565' },
            { main: '#aa96da', light: '#d4c7f5', dark: '#8872b8' },
            { main: '#fcbad3', light: '#ffdce8', dark: '#d498b1' },
            { main: '#a8d8ea', light: '#d4ecf5', dark: '#86b8cc' }
        ];

        this.resize();
        this.createInitialBlob();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.bounds = { width: rect.width, height: rect.height };
    }

    createInitialBlob() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.15;
        this.blobs.push(new Blob(x, y, radius, 24, this.colors[0]));
    }

    addBlob() {
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.1;
        const x = radius + Math.random() * (this.bounds.width - radius * 2);
        const y = radius;
        const colorIndex = this.blobs.length % this.colors.length;
        this.blobs.push(new Blob(x, y, radius, 20, this.colors[colorIndex]));
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.updateMousePos(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePos(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseDown = false;
            this.mousePos = null;
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mouseDown = true;
            this.updateTouchPos(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateTouchPos(e);
        });

        this.canvas.addEventListener('touchend', () => {
            this.mouseDown = false;
            this.mousePos = null;
        });

        // 視窗大小調整
        window.addEventListener('resize', () => this.resize());

        // 控制項
        document.getElementById('softness').addEventListener('input', (e) => {
            this.params.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = e.target.value;
        });

        document.getElementById('pressure').addEventListener('input', (e) => {
            this.params.pressure = parseInt(e.target.value);
            document.getElementById('pressureValue').textContent = e.target.value;
        });

        document.getElementById('damping').addEventListener('input', (e) => {
            this.params.damping = parseInt(e.target.value) / 100;
            document.getElementById('dampingValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.params.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.blobs = [];
            this.createInitialBlob();
        });

        document.getElementById('addBlobBtn').addEventListener('click', () => {
            if (this.blobs.length < 8) {
                this.addBlob();
            }
        });

        document.getElementById('rainbowBtn').addEventListener('click', (e) => {
            this.rainbowMode = !this.rainbowMode;
            e.target.classList.toggle('active', this.rainbowMode);
        });
    }

    updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    }

    updateTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos = new Vector2(
            touch.clientX - rect.left,
            touch.clientY - rect.top
        );
    }

    handleBlobCollisions() {
        for (let i = 0; i < this.blobs.length; i++) {
            for (let j = i + 1; j < this.blobs.length; j++) {
                this.resolveBlobCollision(this.blobs[i], this.blobs[j]);
            }
        }
    }

    resolveBlobCollision(blob1, blob2) {
        const c1 = blob1.getCenter();
        const c2 = blob2.getCenter();
        const diff = c2.sub(c1);
        const dist = diff.length();
        const minDist = blob1.radius + blob2.radius;

        if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const direction = diff.normalize();

            // 推開質點
            for (const p of blob1.points) {
                const force = direction.mul(-overlap * 0.1);
                p.position = p.position.add(force);
            }

            for (const p of blob2.points) {
                const force = direction.mul(overlap * 0.1);
                p.position = p.position.add(force);
            }
        }
    }

    update() {
        for (const blob of this.blobs) {
            blob.update(this.params, this.bounds, this.mousePos, this.mouseDown);
        }

        this.handleBlobCollisions();
    }

    draw() {
        // 清除畫布
        this.ctx.fillStyle = 'rgba(15, 15, 35, 0.3)';
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 繪製所有軟體球
        for (const blob of this.blobs) {
            blob.draw(this.ctx, this.rainbowMode, this.time);
        }

        // 滑鼠互動指示
        if (this.mousePos && this.mouseDown) {
            this.ctx.beginPath();
            this.ctx.arc(this.mousePos.x, this.mousePos.y, 20, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    animate() {
        this.time += 0.016;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlobApp();
});
