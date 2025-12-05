/**
 * 158 - 輪胎物理
 * Tire Physics
 *
 * 充氣輪胎碰撞和滾動的行為模擬
 * 包含氣壓變形、彈跳和滾動物理
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    mul(s) { return new Vector2(this.x * s, this.y * s); }
    div(s) { return s !== 0 ? new Vector2(this.x / s, this.y / s) : new Vector2(); }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { const len = this.length(); return len > 0 ? this.div(len) : new Vector2(); }
    lerp(v, t) { return this.add(v.sub(this).mul(t)); }
    dist(v) { return this.sub(v).length(); }
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    clone() { return new Vector2(this.x, this.y); }
}

// 輪胎質點
class TirePoint {
    constructor(x, y, isInner = false) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.acceleration = new Vector2();
        this.isInner = isInner;
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    update(damping) {
        const velocity = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(velocity).add(this.acceleration.mul(0.5));
        this.acceleration = new Vector2();
    }
}

// 輪胎類別
class Tire {
    constructor(x, y, outerRadius, innerRadius) {
        this.centerX = x;
        this.centerY = y;
        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.numPoints = 24;

        this.outerPoints = [];
        this.innerPoints = [];
        this.links = [];

        this.angularVelocity = 0;
        this.rotation = 0;
        this.isDragged = false;

        this.createTire();
    }

    createTire() {
        this.outerPoints = [];
        this.innerPoints = [];
        this.links = [];

        // 外圈點
        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            const px = this.centerX + Math.cos(angle) * this.outerRadius;
            const py = this.centerY + Math.sin(angle) * this.outerRadius;
            this.outerPoints.push(new TirePoint(px, py, false));
        }

        // 內圈點（輪框）
        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            const px = this.centerX + Math.cos(angle) * this.innerRadius;
            const py = this.centerY + Math.sin(angle) * this.innerRadius;
            this.innerPoints.push(new TirePoint(px, py, true));
        }

        // 建立連接
        this.createLinks();
    }

    createLinks() {
        // 外圈相鄰連接
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            this.links.push({
                p1: this.outerPoints[i],
                p2: this.outerPoints[j],
                restLength: this.outerPoints[i].position.dist(this.outerPoints[j].position)
            });
        }

        // 內圈相鄰連接
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            this.links.push({
                p1: this.innerPoints[i],
                p2: this.innerPoints[j],
                restLength: this.innerPoints[i].position.dist(this.innerPoints[j].position)
            });
        }

        // 內外圈連接（輪輻）
        for (let i = 0; i < this.numPoints; i++) {
            this.links.push({
                p1: this.outerPoints[i],
                p2: this.innerPoints[i],
                restLength: this.outerPoints[i].position.dist(this.innerPoints[i].position)
            });

            // 交叉連接增加穩定性
            const j = (i + 1) % this.numPoints;
            this.links.push({
                p1: this.outerPoints[i],
                p2: this.innerPoints[j],
                restLength: this.outerPoints[i].position.dist(this.innerPoints[j].position)
            });
        }

        // 對角連接
        for (let i = 0; i < this.numPoints; i++) {
            const opposite = (i + this.numPoints / 2) % this.numPoints;
            this.links.push({
                p1: this.innerPoints[i],
                p2: this.innerPoints[Math.floor(opposite)],
                restLength: this.innerPoints[i].position.dist(this.innerPoints[Math.floor(opposite)].position)
            });
        }
    }

    getCenter() {
        let cx = 0, cy = 0;
        for (const p of this.innerPoints) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.innerPoints.length, cy / this.innerPoints.length);
    }

    startDrag(pos) {
        const center = this.getCenter();
        if (pos.dist(center) < this.outerRadius * 1.2) {
            this.isDragged = true;
            return true;
        }
        return false;
    }

    drag(pos, prevPos) {
        if (!this.isDragged) return;

        const delta = pos.sub(prevPos);
        for (const p of [...this.outerPoints, ...this.innerPoints]) {
            p.position = p.position.add(delta.mul(0.8));
            p.prevPosition = p.prevPosition.add(delta.mul(0.8));
        }
    }

    endDrag() {
        this.isDragged = false;
    }

    push(force) {
        for (const p of this.outerPoints) {
            p.applyForce(new Vector2(force, -Math.abs(force) * 0.3));
        }
        this.angularVelocity += force * 0.01;
    }

    dropFromTop(bounds) {
        const center = this.getCenter();
        const newY = 100;
        const deltaY = newY - center.y;

        for (const p of [...this.outerPoints, ...this.innerPoints]) {
            p.position.y += deltaY;
            p.prevPosition.y += deltaY;
        }
    }

    update(params, bounds) {
        const { pressure, bounce, gravity } = params;
        const damping = 0.98;

        if (this.isDragged) return;

        // 重力
        const gravityForce = new Vector2(0, gravity * 0.02);
        for (const p of [...this.outerPoints, ...this.innerPoints]) {
            p.applyForce(gravityForce);
        }

        // 更新點
        for (const p of [...this.outerPoints, ...this.innerPoints]) {
            p.update(damping);
        }

        // 約束求解
        this.satisfyConstraints(pressure / 100);

        // 氣壓
        this.applyPressure(pressure / 100);

        // 邊界和地面碰撞
        this.handleBounds(bounds, bounce / 100);

        // 更新旋轉
        this.updateRotation();
    }

    satisfyConstraints(stiffness) {
        const iterations = 5;

        for (let iter = 0; iter < iterations; iter++) {
            for (const link of this.links) {
                const diff = link.p2.position.sub(link.p1.position);
                const dist = diff.length();

                if (dist === 0) continue;

                const delta = (dist - link.restLength) / dist * stiffness * 0.5;
                const correction = diff.mul(delta);

                link.p1.position = link.p1.position.add(correction);
                link.p2.position = link.p2.position.sub(correction);
            }
        }
    }

    applyPressure(pressureStrength) {
        // 計算外圈面積
        let area = 0;
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            area += this.outerPoints[i].position.x * this.outerPoints[j].position.y;
            area -= this.outerPoints[j].position.x * this.outerPoints[i].position.y;
        }
        area = Math.abs(area) / 2;

        const targetArea = Math.PI * this.outerRadius * this.outerRadius;
        const pressureForce = (targetArea - area) / targetArea * pressureStrength * 0.5;

        const center = this.getCenter();

        // 對外圈施加向外的壓力
        for (const p of this.outerPoints) {
            const toOut = p.position.sub(center).normalize();
            p.position = p.position.add(toOut.mul(pressureForce));
        }
    }

    handleBounds(bounds, bounce) {
        const groundY = bounds.height - 40;
        const friction = 0.95;
        let isGrounded = false;

        for (const p of this.outerPoints) {
            // 地面碰撞
            if (p.position.y > groundY) {
                const penetration = p.position.y - groundY;
                p.position.y = groundY;

                // 計算碰撞速度
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;

                // 摩擦力產生旋轉
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x - vx * friction;

                // 根據水平速度更新角速度
                this.angularVelocity += vx * 0.001;
                isGrounded = true;
            }

            // 左右牆壁
            if (p.position.x < 30) {
                p.position.x = 30;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
            if (p.position.x > bounds.width - 30) {
                p.position.x = bounds.width - 30;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }

            // 天花板
            if (p.position.y < 30) {
                p.position.y = 30;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
            }
        }

        // 地面時減緩角速度
        if (isGrounded) {
            this.angularVelocity *= 0.99;
        }
    }

    updateRotation() {
        this.rotation += this.angularVelocity;
        this.angularVelocity *= 0.995; // 角速度衰減
    }

    draw(ctx) {
        const center = this.getCenter();

        // 陰影
        ctx.beginPath();
        ctx.ellipse(center.x, ctx.canvas.height / window.devicePixelRatio - 30,
            this.outerRadius * 0.9, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fill();

        // 繪製輪胎外圈
        this.drawTireRubber(ctx);

        // 繪製輪框
        this.drawRim(ctx, center);

        // 繪製輪轂
        this.drawHub(ctx, center);
    }

    drawTireRubber(ctx) {
        // 外圈（橡膠）
        ctx.beginPath();
        const firstOuter = this.outerPoints[0];
        ctx.moveTo(firstOuter.position.x, firstOuter.position.y);

        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.outerPoints[i];
            const p2 = this.outerPoints[(i + 1) % this.numPoints];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        // 外圈漸層
        const center = this.getCenter();
        const outerGradient = ctx.createRadialGradient(
            center.x, center.y, this.innerRadius,
            center.x, center.y, this.outerRadius
        );
        outerGradient.addColorStop(0, '#4a4a4a');
        outerGradient.addColorStop(0.3, '#3a3a3a');
        outerGradient.addColorStop(0.7, '#2a2a2a');
        outerGradient.addColorStop(1, '#1a1a1a');

        ctx.fillStyle = outerGradient;
        ctx.fill();

        // 內圈孔洞
        ctx.beginPath();
        const firstInner = this.innerPoints[0];
        ctx.moveTo(firstInner.position.x, firstInner.position.y);

        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.innerPoints[i];
            const p2 = this.innerPoints[(i + 1) % this.numPoints];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // 胎紋
        this.drawTread(ctx, center);
    }

    drawTread(ctx, center) {
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;

        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2 + this.rotation;
            const innerR = this.innerRadius + (this.outerRadius - this.innerRadius) * 0.2;
            const outerR = this.outerRadius - 5;

            const x1 = center.x + Math.cos(angle) * innerR;
            const y1 = center.y + Math.sin(angle) * innerR;
            const x2 = center.x + Math.cos(angle) * outerR;
            const y2 = center.y + Math.sin(angle) * outerR;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    drawRim(ctx, center) {
        // 輪框（銀色金屬）
        ctx.beginPath();
        const firstInner = this.innerPoints[0];
        ctx.moveTo(firstInner.position.x, firstInner.position.y);

        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.innerPoints[i];
            const p2 = this.innerPoints[(i + 1) % this.numPoints];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        const rimGradient = ctx.createRadialGradient(
            center.x - this.innerRadius * 0.3,
            center.y - this.innerRadius * 0.3,
            0,
            center.x,
            center.y,
            this.innerRadius
        );
        rimGradient.addColorStop(0, '#e8e8e8');
        rimGradient.addColorStop(0.3, '#c0c0c0');
        rimGradient.addColorStop(0.7, '#a0a0a0');
        rimGradient.addColorStop(1, '#808080');

        ctx.fillStyle = rimGradient;
        ctx.fill();
        ctx.strokeStyle = '#606060';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 輪輻
        ctx.strokeStyle = '#909090';
        ctx.lineWidth = 4;
        const hubRadius = this.innerRadius * 0.3;
        const spokeCount = 5;

        for (let i = 0; i < spokeCount; i++) {
            const angle = (i / spokeCount) * Math.PI * 2 + this.rotation;
            const x1 = center.x + Math.cos(angle) * hubRadius;
            const y1 = center.y + Math.sin(angle) * hubRadius;
            const x2 = center.x + Math.cos(angle) * (this.innerRadius - 5);
            const y2 = center.y + Math.sin(angle) * (this.innerRadius - 5);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    drawHub(ctx, center) {
        const hubRadius = this.innerRadius * 0.3;

        // 輪轂
        ctx.beginPath();
        ctx.arc(center.x, center.y, hubRadius, 0, Math.PI * 2);

        const hubGradient = ctx.createRadialGradient(
            center.x - hubRadius * 0.3,
            center.y - hubRadius * 0.3,
            0,
            center.x,
            center.y,
            hubRadius
        );
        hubGradient.addColorStop(0, '#d0d0d0');
        hubGradient.addColorStop(0.5, '#a0a0a0');
        hubGradient.addColorStop(1, '#707070');

        ctx.fillStyle = hubGradient;
        ctx.fill();
        ctx.strokeStyle = '#505050';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 中心螺絲
        ctx.beginPath();
        ctx.arc(center.x, center.y, hubRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#404040';
        ctx.fill();

        // 螺絲高光
        ctx.beginPath();
        ctx.arc(center.x - hubRadius * 0.1, center.y - hubRadius * 0.1,
            hubRadius * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    reset(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.angularVelocity = 0;
        this.rotation = 0;
        this.createTire();
    }
}

// 主應用程式
class TireApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.params = {
            pressure: 80,
            bounce: 60,
            gravity: 50
        };

        this.tire = null;
        this.time = 0;
        this.mousePos = new Vector2();
        this.prevMousePos = new Vector2();
        this.isPressed = false;

        this.resize();
        this.createTire();
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

    createTire() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const outerRadius = Math.min(this.bounds.width, this.bounds.height) * 0.18;
        const innerRadius = outerRadius * 0.55;
        this.tire = new Tire(x, y, outerRadius, innerRadius);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.updateMousePos(e);
            this.prevMousePos = this.mousePos.clone();
            if (this.tire.startDrag(this.mousePos)) {
                this.isPressed = true;
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.prevMousePos = this.mousePos.clone();
            this.updateMousePos(e);
            if (this.isPressed) {
                this.tire.drag(this.mousePos, this.prevMousePos);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPressed = false;
            this.tire.endDrag();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPressed = false;
            this.tire.endDrag();
        });

        // 觸控
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.updateTouchPos(e);
            this.prevMousePos = this.mousePos.clone();
            if (this.tire.startDrag(this.mousePos)) {
                this.isPressed = true;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.prevMousePos = this.mousePos.clone();
            this.updateTouchPos(e);
            if (this.isPressed) {
                this.tire.drag(this.mousePos, this.prevMousePos);
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.isPressed = false;
            this.tire.endDrag();
        });

        window.addEventListener('resize', () => {
            this.resize();
            this.createTire();
        });

        // 控制項
        document.getElementById('pressure').addEventListener('input', (e) => {
            this.params.pressure = parseInt(e.target.value);
            document.getElementById('pressureValue').textContent = e.target.value;
        });

        document.getElementById('bounce').addEventListener('input', (e) => {
            this.params.bounce = parseInt(e.target.value);
            document.getElementById('bounceValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.params.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.tire.reset(this.bounds.width / 2, this.bounds.height / 2);
        });

        document.getElementById('dropBtn').addEventListener('click', () => {
            this.tire.dropFromTop(this.bounds);
        });

        document.getElementById('pushBtn').addEventListener('click', () => {
            this.tire.push(15);
        });
    }

    updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
    }

    updateTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    update() {
        this.tire.update(this.params, this.bounds);
    }

    draw() {
        // 天空背景
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height * 0.7);
        skyGradient.addColorStop(0, '#87ceeb');
        skyGradient.addColorStop(1, '#e0f4ff');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 地面
        const groundGradient = this.ctx.createLinearGradient(
            0, this.bounds.height - 60,
            0, this.bounds.height
        );
        groundGradient.addColorStop(0, '#78909c');
        groundGradient.addColorStop(0.3, '#607d8b');
        groundGradient.addColorStop(1, '#455a64');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.bounds.height - 40, this.bounds.width, 40);

        // 道路標線
        this.ctx.strokeStyle = '#cfd8dc';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([30, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.bounds.height - 20);
        this.ctx.lineTo(this.bounds.width, this.bounds.height - 20);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // 繪製輪胎
        this.tire.draw(this.ctx);
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
    new TireApp();
});
