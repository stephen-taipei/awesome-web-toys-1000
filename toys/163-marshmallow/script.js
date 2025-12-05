/**
 * 棉花糖 - Marshmallow
 * 軟綿綿物理模擬
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

    div(s) {
        return s !== 0 ? new Vector2(this.x / s, this.y / s) : new Vector2();
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const len = this.length();
        return len > 0 ? this.div(len) : new Vector2();
    }

    lerp(v, t) {
        return new Vector2(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t
        );
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    static dist(a, b) {
        return a.sub(b).length();
    }
}

// 棉花糖粒子
class MarshmallowPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.pinned = false;
    }

    update(gravity, damping) {
        if (this.pinned) return;

        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel).add(new Vector2(0, gravity));
    }

    applyForce(force) {
        if (this.pinned) return;
        this.position = this.position.add(force);
    }
}

// 棉花糖軟體
class Marshmallow {
    constructor(x, y, width, height) {
        this.centerX = x;
        this.centerY = y;
        this.baseWidth = width;
        this.baseHeight = height;

        this.points = [];
        this.links = [];
        this.outerPoints = [];

        this.cols = 8;
        this.rows = 10;

        this.initPoints();
        this.initLinks();
    }

    initPoints() {
        this.points = [];
        this.outerPoints = [];

        // 創建圓角矩形形狀的網格
        for (let row = 0; row <= this.rows; row++) {
            for (let col = 0; col <= this.cols; col++) {
                const u = col / this.cols;
                const v = row / this.rows;

                // 棉花糖形狀 - 上下圓潤
                let width = this.baseWidth;
                let heightOffset = 0;

                // 上下邊緣收縮
                const edgeFactor = Math.sin(v * Math.PI);
                width *= 0.6 + edgeFactor * 0.4;

                const x = this.centerX + (u - 0.5) * width;
                const y = this.centerY - this.baseHeight / 2 + v * this.baseHeight;

                const point = new MarshmallowPoint(x, y);
                this.points.push(point);

                // 記錄外圍點
                if (col === 0 || col === this.cols || row === 0 || row === this.rows) {
                    this.outerPoints.push(this.points.length - 1);
                }
            }
        }
    }

    initLinks() {
        this.links = [];
        const colCount = this.cols + 1;

        // 水平連結
        for (let row = 0; row <= this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + 1);
            }
        }

        // 垂直連結
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col <= this.cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + colCount);
            }
        }

        // 對角連結（增加穩定性）
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + colCount + 1);
                this.addLink(idx + 1, idx + colCount);
            }
        }

        // 長距離連結（保持整體形狀）
        for (let row = 0; row < this.rows - 1; row++) {
            for (let col = 0; col < this.cols - 1; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + colCount * 2 + 2, 0.3);
            }
        }
    }

    addLink(a, b, stiffnessMod = 1) {
        if (a >= 0 && b >= 0 && a < this.points.length && b < this.points.length) {
            const dist = Vector2.dist(this.points[a].position, this.points[b].position);
            this.links.push({ a, b, restLength: dist, stiffnessMod });
        }
    }

    update(softness, stickiness, gravity) {
        const grav = gravity * 0.012;
        const damp = 0.97;
        const stiffness = (100 - softness) * 0.003 + 0.05;
        const sticky = stickiness * 0.0005;

        // 更新點位置
        for (const point of this.points) {
            point.update(grav, damp);
        }

        // 約束迭代
        for (let iter = 0; iter < 6; iter++) {
            // 連結約束
            for (const link of this.links) {
                const p1 = this.points[link.a];
                const p2 = this.points[link.b];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist > 0) {
                    // 棉花糖特性：被壓縮時更軟，被拉伸時有阻力
                    let effectiveStiffness = stiffness * (link.stiffnessMod || 1);

                    if (dist < link.restLength) {
                        effectiveStiffness *= 0.5; // 壓縮時更軟
                    } else {
                        effectiveStiffness *= 1.2; // 拉伸時更硬（黏性）
                    }

                    const displacement = (dist - link.restLength) / dist;
                    const correction = diff.mul(displacement * 0.5 * effectiveStiffness);

                    p1.applyForce(correction);
                    p2.applyForce(correction.mul(-1));
                }
            }

            // 體積保持（壓力）
            this.applyPressure(0.8);

            // 地面約束
            for (const point of this.points) {
                if (point.position.y > this.centerY + this.baseHeight) {
                    point.position.y = this.centerY + this.baseHeight;

                    // 黏性效果
                    const friction = 1 - sticky;
                    point.prevPosition.x = point.position.x -
                        (point.position.x - point.prevPosition.x) * friction;
                }
            }
        }

        // 形狀恢復
        for (const point of this.points) {
            const toRest = point.restPosition.sub(point.position);
            point.applyForce(toRest.mul(stiffness * 0.1));
        }
    }

    applyPressure(strength) {
        // 計算當前面積
        let area = 0;
        const center = this.getCenter();

        for (let i = 0; i < this.outerPoints.length; i++) {
            const idx1 = this.outerPoints[i];
            const idx2 = this.outerPoints[(i + 1) % this.outerPoints.length];

            const p1 = this.points[idx1].position;
            const p2 = this.points[idx2].position;

            area += (p1.x - center.x) * (p2.y - center.y);
            area -= (p2.x - center.x) * (p1.y - center.y);
        }
        area = Math.abs(area) / 2;

        // 目標面積
        const targetArea = this.baseWidth * this.baseHeight * 0.8;
        const pressure = (targetArea - area) / targetArea * strength;

        // 向外推力
        for (const idx of this.outerPoints) {
            const point = this.points[idx];
            const toCenter = center.sub(point.position);
            const normal = toCenter.normalize().mul(-1);
            point.applyForce(normal.mul(pressure));
        }
    }

    getCenter() {
        let cx = 0, cy = 0;
        for (const point of this.points) {
            cx += point.position.x;
            cy += point.position.y;
        }
        return new Vector2(cx / this.points.length, cy / this.points.length);
    }

    squish() {
        const center = this.getCenter();

        for (const point of this.points) {
            const toCenter = point.position.sub(center);

            // 垂直壓縮，水平擴展
            point.applyForce(new Vector2(toCenter.x * 0.1, -toCenter.y * 0.15));
        }
    }

    stretch() {
        const center = this.getCenter();

        for (const point of this.points) {
            const toCenter = point.position.sub(center);

            // 垂直拉長
            point.applyForce(new Vector2(0, toCenter.y * 0.1));
        }
    }

    poke(x, y, strength) {
        for (const point of this.points) {
            const dist = Vector2.dist(point.position, new Vector2(x, y));
            if (dist < 60) {
                const factor = 1 - dist / 60;
                const dir = point.position.sub(new Vector2(x, y)).normalize();
                point.applyForce(dir.mul(strength * factor));
            }
        }
    }

    drag(x, y, prevX, prevY) {
        const dragPos = new Vector2(x, y);
        const prevPos = new Vector2(prevX, prevY);
        const movement = dragPos.sub(prevPos);

        for (const point of this.points) {
            const dist = Vector2.dist(point.position, dragPos);
            if (dist < 80) {
                const factor = 1 - dist / 80;
                point.applyForce(movement.mul(factor * 0.5));
            }
        }
    }

    draw(ctx) {
        // 繪製陰影
        this.drawShadow(ctx);

        // 繪製主體
        this.drawBody(ctx);

        // 繪製高光
        this.drawHighlights(ctx);
    }

    drawShadow(ctx) {
        const center = this.getCenter();

        ctx.beginPath();
        ctx.ellipse(
            center.x,
            this.centerY + this.baseHeight + 15,
            this.baseWidth / 2 + 10,
            15,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
    }

    drawBody(ctx) {
        const colCount = this.cols + 1;

        // 創建漸層
        const gradient = ctx.createLinearGradient(
            this.centerX - this.baseWidth / 2,
            this.centerY - this.baseHeight / 2,
            this.centerX + this.baseWidth / 2,
            this.centerY + this.baseHeight / 2
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#fff5f8');
        gradient.addColorStop(0.7, '#fce4ec');
        gradient.addColorStop(1, '#f8bbd9');

        // 繪製輪廓
        ctx.beginPath();

        // 左側
        for (let row = 0; row <= this.rows; row++) {
            const p = this.points[row * colCount].position;
            if (row === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        // 底部
        for (let col = 0; col <= this.cols; col++) {
            const p = this.points[this.rows * colCount + col].position;
            ctx.lineTo(p.x, p.y);
        }

        // 右側
        for (let row = this.rows; row >= 0; row--) {
            const p = this.points[row * colCount + this.cols].position;
            ctx.lineTo(p.x, p.y);
        }

        // 頂部
        for (let col = this.cols; col >= 0; col--) {
            const p = this.points[col].position;
            ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 柔和邊緣
        ctx.strokeStyle = 'rgba(248, 187, 217, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 內部柔軟紋理
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;

        for (let row = 2; row < this.rows - 1; row += 2) {
            ctx.beginPath();
            for (let col = 1; col < this.cols; col++) {
                const p = this.points[row * colCount + col].position;
                if (col === 1) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }
    }

    drawHighlights(ctx) {
        // 頂部高光
        const topPoints = [];
        const colCount = this.cols + 1;

        for (let col = 1; col < this.cols; col++) {
            topPoints.push(this.points[col].position);
        }

        if (topPoints.length > 2) {
            const gradient = ctx.createLinearGradient(
                topPoints[0].x, topPoints[0].y - 10,
                topPoints[0].x, topPoints[0].y + 20
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(topPoints[0].x, topPoints[0].y);

            for (let i = 1; i < topPoints.length; i++) {
                ctx.lineTo(topPoints[i].x, topPoints[i].y);
            }

            ctx.lineTo(topPoints[topPoints.length - 1].x, topPoints[topPoints.length - 1].y + 20);
            ctx.lineTo(topPoints[0].x, topPoints[0].y + 20);
            ctx.closePath();

            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // 側面光澤
        const leftHighlight = this.points[Math.floor(this.rows / 3) * colCount + 1].position;

        const sideGradient = ctx.createRadialGradient(
            leftHighlight.x, leftHighlight.y, 0,
            leftHighlight.x, leftHighlight.y, 30
        );
        sideGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        sideGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(leftHighlight.x, leftHighlight.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = sideGradient;
        ctx.fill();
    }

    reset() {
        this.initPoints();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.softness = 70;
        this.stickiness = 50;
        this.gravity = 40;

        this.marshmallow = null;
        this.isDragging = false;
        this.lastPointerPos = null;

        this.setupCanvas();
        this.setupControls();
        this.setupEvents();
        this.init();
        this.animate();
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = 500 * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = 500;
    }

    init() {
        this.marshmallow = new Marshmallow(
            this.width / 2,
            this.height / 2,
            120,
            160
        );
    }

    setupControls() {
        const softnessSlider = document.getElementById('softness');
        const softnessValue = document.getElementById('softnessValue');
        softnessSlider.addEventListener('input', (e) => {
            this.softness = parseInt(e.target.value);
            softnessValue.textContent = this.softness;
        });

        const stickinessSlider = document.getElementById('stickiness');
        const stickinessValue = document.getElementById('stickinessValue');
        stickinessSlider.addEventListener('input', (e) => {
            this.stickiness = parseInt(e.target.value);
            stickinessValue.textContent = this.stickiness;
        });

        const gravitySlider = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravityValue');
        gravitySlider.addEventListener('input', (e) => {
            this.gravity = parseInt(e.target.value);
            gravityValue.textContent = this.gravity;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.init();
        });

        document.getElementById('squishBtn').addEventListener('click', () => {
            this.marshmallow.squish();
        });

        document.getElementById('stretchBtn').addEventListener('click', () => {
            this.marshmallow.stretch();
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());
        this.canvas.addEventListener('mouseleave', () => this.handlePointerUp());

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.handlePointerUp());

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.init();
        });
    }

    getPointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    }

    handlePointerDown(e) {
        this.isDragging = true;
        this.lastPointerPos = this.getPointerPos(e);
        this.marshmallow.poke(this.lastPointerPos.x, this.lastPointerPos.y, 8);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;

        const pos = this.getPointerPos(e);

        if (this.lastPointerPos) {
            this.marshmallow.drag(
                pos.x, pos.y,
                this.lastPointerPos.x, this.lastPointerPos.y
            );
        }

        this.lastPointerPos = pos;
    }

    handlePointerUp() {
        this.isDragging = false;
        this.lastPointerPos = null;
    }

    update() {
        this.marshmallow.update(this.softness, this.stickiness, this.gravity);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景
        this.drawBackground();

        // 繪製棉花糖
        this.marshmallow.draw(this.ctx);
    }

    drawBackground() {
        // 柔和漸層背景
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, '#fffde7');
        gradient.addColorStop(1, '#fff8e1');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 裝飾小點
        this.ctx.fillStyle = 'rgba(255, 183, 197, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = (i * 137) % this.width;
            const y = (i * 89 + 50) % this.height;
            const size = 3 + (i % 3);

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => {
    new App();
});
