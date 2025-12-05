/**
 * 157 - 麵團
 * Dough
 *
 * 可揉捏的麵團，保留形變歷史
 * 塑性變形模擬 - 被拉扯後不會完全恢復原狀
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
    clone() { return new Vector2(this.x, this.y); }
}

// 麵團質點
class DoughPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.isPinned = false;
    }

    // 更新靜止位置（塑性變形）
    updateRestPosition(plasticity) {
        // 根據塑性係數，靜止位置會慢慢向當前位置靠近
        this.restPosition = this.restPosition.lerp(this.position, plasticity * 0.01);
    }

    update(recovery, damping) {
        if (this.isPinned) {
            this.velocity = new Vector2();
            return;
        }

        // 回復力 - 向靜止位置移動
        const toRest = this.restPosition.sub(this.position);
        this.velocity = this.velocity.add(toRest.mul(recovery * 0.003));

        // 阻尼
        this.velocity = this.velocity.mul(damping);

        // 更新位置
        this.position = this.position.add(this.velocity);
    }
}

// 麵團類別
class Dough {
    constructor(x, y, radius) {
        this.centerX = x;
        this.centerY = y;
        this.baseRadius = radius;
        this.numRings = 5;
        this.pointsPerRing = 16;

        this.points = [];
        this.links = [];

        this.createDough();
    }

    createDough() {
        this.points = [];
        this.links = [];

        // 中心點
        this.points.push(new DoughPoint(this.centerX, this.centerY));

        // 同心圓環
        for (let ring = 1; ring <= this.numRings; ring++) {
            const ringRadius = (ring / this.numRings) * this.baseRadius;
            const numPoints = Math.floor(this.pointsPerRing * (ring / this.numRings)) + 4;

            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const px = this.centerX + Math.cos(angle) * ringRadius;
                const py = this.centerY + Math.sin(angle) * ringRadius;
                this.points.push(new DoughPoint(px, py));
            }
        }

        // 建立連接
        this.createLinks();
    }

    createLinks() {
        // 連接相鄰點
        let startIndex = 1;
        for (let ring = 1; ring <= this.numRings; ring++) {
            const numPoints = Math.floor(this.pointsPerRing * (ring / this.numRings)) + 4;

            for (let i = 0; i < numPoints; i++) {
                const current = startIndex + i;
                const next = startIndex + (i + 1) % numPoints;

                // 環內連接
                this.links.push({
                    p1: current,
                    p2: next,
                    restLength: this.points[current].position.dist(this.points[next].position)
                });

                // 與內環連接
                if (ring > 1) {
                    const innerStartIndex = ring === 2 ? 1 :
                        1 + this.getPointsBeforeRing(ring - 1);
                    const innerNumPoints = ring === 2 ? 1 :
                        Math.floor(this.pointsPerRing * ((ring - 1) / this.numRings)) + 4;

                    const innerIndex = innerStartIndex + Math.floor(i * innerNumPoints / numPoints) % innerNumPoints;
                    if (innerIndex < this.points.length) {
                        this.links.push({
                            p1: current,
                            p2: innerIndex,
                            restLength: this.points[current].position.dist(this.points[innerIndex].position)
                        });
                    }
                } else {
                    // 第一環連接中心
                    this.links.push({
                        p1: current,
                        p2: 0,
                        restLength: this.points[current].position.dist(this.points[0].position)
                    });
                }
            }

            startIndex += numPoints;
        }
    }

    getPointsBeforeRing(ring) {
        let count = 0;
        for (let r = 1; r < ring; r++) {
            count += Math.floor(this.pointsPerRing * (r / this.numRings)) + 4;
        }
        return count;
    }

    pinch(pos, radius, strength) {
        for (const p of this.points) {
            const dist = p.position.dist(pos);
            if (dist < radius) {
                p.isPinned = true;
                const dir = pos.sub(p.position).normalize();
                const factor = 1 - dist / radius;
                p.position = p.position.add(dir.mul(factor * strength * 0.5));
            } else {
                p.isPinned = false;
            }
        }
    }

    release() {
        for (const p of this.points) {
            p.isPinned = false;
        }
    }

    flatten() {
        const center = this.getCenter();

        for (const p of this.points) {
            const toCenter = p.position.sub(center);
            const dist = toCenter.length();

            // 擴展水平方向，壓縮垂直方向
            p.position.x = center.x + toCenter.x * 1.3;
            p.position.y = center.y + toCenter.y * 0.5;

            // 更新靜止位置
            p.restPosition = p.position.clone();
        }
    }

    rollRound() {
        const center = this.getCenter();

        // 重新排列成圓形
        this.points[0].restPosition = center.clone();
        this.points[0].position = center.clone();

        let startIndex = 1;
        for (let ring = 1; ring <= this.numRings; ring++) {
            const ringRadius = (ring / this.numRings) * this.baseRadius;
            const numPoints = Math.floor(this.pointsPerRing * (ring / this.numRings)) + 4;

            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const px = center.x + Math.cos(angle) * ringRadius;
                const py = center.y + Math.sin(angle) * ringRadius;

                this.points[startIndex + i].restPosition = new Vector2(px, py);
            }

            startIndex += numPoints;
        }

        // 更新連接長度
        for (const link of this.links) {
            link.restLength = this.points[link.p1].restPosition.dist(
                this.points[link.p2].restPosition
            );
        }
    }

    getCenter() {
        let cx = 0, cy = 0;
        for (const p of this.points) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.points.length, cy / this.points.length);
    }

    update(params, bounds) {
        const { stickiness, softness, plasticity } = params;
        const recovery = softness / 100;
        const damping = 0.9 + stickiness * 0.001;

        // 塑性變形 - 更新靜止位置
        for (const p of this.points) {
            p.updateRestPosition(plasticity);
        }

        // 更新點
        for (const p of this.points) {
            p.update(recovery, damping);
        }

        // 約束求解
        this.satisfyConstraints(stickiness / 100);

        // 邊界
        this.handleBounds(bounds);
    }

    satisfyConstraints(stiffness) {
        const iterations = 4;

        for (let iter = 0; iter < iterations; iter++) {
            for (const link of this.links) {
                const p1 = this.points[link.p1];
                const p2 = this.points[link.p2];

                if (p1.isPinned && p2.isPinned) continue;

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist === 0) continue;

                const delta = (dist - link.restLength) / dist * stiffness * 0.5;
                const correction = diff.mul(delta);

                if (!p1.isPinned) {
                    p1.position = p1.position.add(correction);
                }
                if (!p2.isPinned) {
                    p2.position = p2.position.sub(correction);
                }
            }

            // 體積保持（壓力）
            this.maintainVolume();
        }
    }

    maintainVolume() {
        const center = this.getCenter();
        let avgDist = 0;

        for (const p of this.points) {
            avgDist += p.position.dist(center);
        }
        avgDist /= this.points.length;

        const targetAvg = this.baseRadius * 0.6;
        const pressureStrength = (targetAvg - avgDist) * 0.05;

        for (const p of this.points) {
            if (p.isPinned) continue;
            const toOut = p.position.sub(center).normalize();
            p.position = p.position.add(toOut.mul(pressureStrength));
        }
    }

    handleBounds(bounds) {
        const margin = 20;

        for (const p of this.points) {
            if (p.position.x < margin) {
                p.position.x = margin;
                p.velocity.x *= -0.3;
            }
            if (p.position.x > bounds.width - margin) {
                p.position.x = bounds.width - margin;
                p.velocity.x *= -0.3;
            }
            if (p.position.y < margin) {
                p.position.y = margin;
                p.velocity.y *= -0.3;
            }
            if (p.position.y > bounds.height - margin) {
                p.position.y = bounds.height - margin;
                p.velocity.y *= -0.3;
            }
        }
    }

    getOuterPoints() {
        const startIndex = 1 + this.getPointsBeforeRing(this.numRings);
        return this.points.slice(startIndex);
    }

    draw(ctx, time) {
        const center = this.getCenter();

        // 陰影
        ctx.beginPath();
        ctx.ellipse(center.x + 5, center.y + 10,
            this.baseRadius * 0.9, this.baseRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // 繪製麵團主體
        this.drawBody(ctx);

        // 繪製紋理
        this.drawTexture(ctx, time);

        // 高光
        this.drawHighlights(ctx);
    }

    drawBody(ctx) {
        const outerPoints = this.getOuterPoints();

        if (outerPoints.length < 3) return;

        ctx.beginPath();

        const first = outerPoints[0];
        const last = outerPoints[outerPoints.length - 1];
        const startMid = last.position.lerp(first.position, 0.5);

        ctx.moveTo(startMid.x, startMid.y);

        for (let i = 0; i < outerPoints.length; i++) {
            const p1 = outerPoints[i];
            const p2 = outerPoints[(i + 1) % outerPoints.length];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }

        ctx.closePath();

        // 漸層
        const center = this.getCenter();
        const gradient = ctx.createRadialGradient(
            center.x - this.baseRadius * 0.2,
            center.y - this.baseRadius * 0.2,
            0,
            center.x,
            center.y,
            this.baseRadius * 1.2
        );

        gradient.addColorStop(0, '#fff8e1');
        gradient.addColorStop(0.3, '#ffe0b2');
        gradient.addColorStop(0.6, '#ffcc80');
        gradient.addColorStop(1, '#ffb74d');

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = '#e6a23c';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawTexture(ctx, time) {
        const center = this.getCenter();

        ctx.save();

        // 創建剪裁區域
        const outerPoints = this.getOuterPoints();
        ctx.beginPath();
        const first = outerPoints[0];
        const last = outerPoints[outerPoints.length - 1];
        const startMid = last.position.lerp(first.position, 0.5);
        ctx.moveTo(startMid.x, startMid.y);

        for (let i = 0; i < outerPoints.length; i++) {
            const p1 = outerPoints[i];
            const p2 = outerPoints[(i + 1) % outerPoints.length];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();
        ctx.clip();

        // 麵粉紋理
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + time * 0.1;
            const r = (0.2 + (i % 4) * 0.2) * this.baseRadius;
            const x = center.x + Math.cos(angle) * r;
            const y = center.y + Math.sin(angle) * r;
            const size = 3 + (i % 5);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 褶皺線條
        ctx.strokeStyle = 'rgba(200, 150, 100, 0.15)';
        ctx.lineWidth = 1;

        for (let ring = 2; ring < this.numRings; ring++) {
            const startIndex = 1 + this.getPointsBeforeRing(ring);
            const numPoints = Math.floor(this.pointsPerRing * (ring / this.numRings)) + 4;

            ctx.beginPath();
            for (let i = 0; i <= numPoints; i++) {
                const p = this.points[startIndex + (i % numPoints)];
                if (i === 0) {
                    ctx.moveTo(p.position.x, p.position.y);
                } else {
                    ctx.lineTo(p.position.x, p.position.y);
                }
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    drawHighlights(ctx) {
        const center = this.getCenter();

        // 主高光
        ctx.beginPath();
        ctx.ellipse(
            center.x - this.baseRadius * 0.25,
            center.y - this.baseRadius * 0.25,
            this.baseRadius * 0.2,
            this.baseRadius * 0.1,
            -Math.PI / 4,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 次高光
        ctx.beginPath();
        ctx.arc(
            center.x - this.baseRadius * 0.15,
            center.y - this.baseRadius * 0.15,
            this.baseRadius * 0.06,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }

    reset(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.createDough();
    }
}

// 主應用程式
class DoughApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.params = {
            stickiness: 60,
            softness: 70,
            plasticity: 50
        };

        this.dough = null;
        this.time = 0;
        this.mousePos = new Vector2();
        this.isPressed = false;

        this.resize();
        this.createDough();
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

    createDough() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.2;
        this.dough = new Dough(x, y, radius);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPressed = true;
            this.updateMousePos(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePos(e);
            if (this.isPressed) {
                this.dough.pinch(this.mousePos, this.dough.baseRadius * 0.5, 5);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPressed = false;
            this.dough.release();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPressed = false;
            this.dough.release();
        });

        // 觸控
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isPressed = true;
            this.updateTouchPos(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateTouchPos(e);
            if (this.isPressed) {
                this.dough.pinch(this.mousePos, this.dough.baseRadius * 0.5, 5);
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.isPressed = false;
            this.dough.release();
        });

        window.addEventListener('resize', () => {
            this.resize();
            this.createDough();
        });

        // 控制項
        document.getElementById('stickiness').addEventListener('input', (e) => {
            this.params.stickiness = parseInt(e.target.value);
            document.getElementById('stickinessValue').textContent = e.target.value;
        });

        document.getElementById('softness').addEventListener('input', (e) => {
            this.params.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = e.target.value;
        });

        document.getElementById('plasticity').addEventListener('input', (e) => {
            this.params.plasticity = parseInt(e.target.value);
            document.getElementById('plasticityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.dough.reset(this.bounds.width / 2, this.bounds.height / 2);
        });

        document.getElementById('flattenBtn').addEventListener('click', () => {
            this.dough.flatten();
        });

        document.getElementById('rollBtn').addEventListener('click', () => {
            this.dough.rollRound();
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
        this.dough.update(this.params, this.bounds);
    }

    draw() {
        // 背景 - 木桌面
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        bgGradient.addColorStop(0, '#5d4037');
        bgGradient.addColorStop(0.5, '#4e342e');
        bgGradient.addColorStop(1, '#3e2723');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 木紋
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let y = 0; y < this.bounds.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + Math.sin(y * 0.1) * 5);
            for (let x = 0; x < this.bounds.width; x += 20) {
                this.ctx.lineTo(x, y + Math.sin((x + y) * 0.05) * 3);
            }
            this.ctx.stroke();
        }

        // 麵粉痕跡
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 123.456) % this.bounds.width;
            const y = (i * 78.901) % this.bounds.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2 + (i % 4), 0, Math.PI * 2);
            this.ctx.fill();
        }

        // 繪製麵團
        this.dough.draw(this.ctx, this.time);

        // 滑鼠指示
        if (this.isPressed) {
            this.ctx.beginPath();
            this.ctx.arc(this.mousePos.x, this.mousePos.y, this.dough.baseRadius * 0.5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
    new DoughApp();
});
