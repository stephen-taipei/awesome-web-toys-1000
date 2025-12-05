/**
 * 154 - 水球
 * Water Balloon Physics
 *
 * 模擬裝滿水的氣球物理
 * 包含水的慣性晃動和氣球的彈性變形
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
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
}

// 水球質點
class BalloonPoint {
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
        this.position = this.position.add(velocity).add(this.acceleration.mul(0.5));
        this.acceleration = new Vector2();
    }
}

// 水的粒子
class WaterParticle {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.radius = 4;
    }

    update(damping) {
        this.position = this.position.add(this.velocity);
        this.velocity = this.velocity.mul(damping);
    }
}

// 水球類別
class WaterBalloon {
    constructor(x, y, radius, colorScheme) {
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        this.colorScheme = colorScheme;
        this.numPoints = 20;

        this.points = [];
        this.restLengths = [];
        this.waterParticles = [];

        this.isDragged = false;
        this.dragOffset = new Vector2();

        this.createBalloon();
        this.createWater();
    }

    createBalloon() {
        this.points = [];

        // 外圈點
        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2 - Math.PI / 2;
            // 氣球形狀 - 頂部較窄
            const radiusMultiplier = 1 - Math.cos(angle) * 0.15;
            const px = this.centerX + Math.cos(angle) * this.radius * radiusMultiplier;
            const py = this.centerY + Math.sin(angle) * this.radius * radiusMultiplier;
            this.points.push(new BalloonPoint(px, py));
        }

        // 計算靜止長度
        this.restLengths = [];
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            this.restLengths.push(
                this.points[i].position.sub(this.points[j].position).length()
            );
        }
    }

    createWater() {
        this.waterParticles = [];
        const waterCount = 80;
        const center = this.getCenter();

        for (let i = 0; i < waterCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * this.radius * 0.7;
            const px = center.x + Math.cos(angle) * r;
            const py = center.y + Math.sin(angle) * r;
            this.waterParticles.push(new WaterParticle(px, py));
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

    startDrag(mousePos) {
        const center = this.getCenter();
        const dist = mousePos.sub(center).length();

        if (dist < this.radius * 1.5) {
            this.isDragged = true;
            this.dragOffset = center.sub(mousePos);
            return true;
        }
        return false;
    }

    drag(mousePos) {
        if (!this.isDragged) return;

        const targetCenter = mousePos.add(this.dragOffset);
        const currentCenter = this.getCenter();
        const delta = targetCenter.sub(currentCenter);

        // 移動所有點
        for (const p of this.points) {
            p.position = p.position.add(delta.mul(0.3));
        }
    }

    endDrag() {
        this.isDragged = false;
    }

    throwDown(force) {
        for (const p of this.points) {
            p.applyForce(new Vector2(0, force));
        }
    }

    update(params, bounds) {
        const { waterAmount, elasticity, inertia, gravity } = params;
        const damping = 0.97;
        const stiffness = elasticity / 100;
        const waterDamping = inertia / 100;

        // 重力
        const gravityForce = new Vector2(0, gravity * 0.015);
        for (const p of this.points) {
            if (!this.isDragged) {
                p.applyForce(gravityForce);
            }
        }

        // 更新氣球點
        for (const p of this.points) {
            p.update(damping);
        }

        // 約束求解
        this.satisfyConstraints(stiffness, waterAmount / 100);

        // 更新水粒子
        this.updateWater(waterDamping, gravity);

        // 邊界處理
        this.handleBounds(bounds);
    }

    satisfyConstraints(stiffness, pressureScale) {
        const iterations = 5;
        const center = this.getCenter();

        for (let iter = 0; iter < iterations; iter++) {
            // 相鄰約束
            for (let i = 0; i < this.numPoints; i++) {
                const j = (i + 1) % this.numPoints;
                const p1 = this.points[i];
                const p2 = this.points[j];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const restLen = this.restLengths[i];

                if (dist > 0) {
                    const delta = (dist - restLen) / dist * 0.5 * stiffness;
                    const correction = diff.mul(delta);
                    p1.position = p1.position.add(correction);
                    p2.position = p2.position.sub(correction);
                }
            }

            // 壓力約束（水的壓力維持形狀）
            const currentArea = this.calculateArea();
            const targetArea = Math.PI * this.radius * this.radius * pressureScale;
            const pressureStrength = (targetArea - currentArea) / targetArea * 0.3;

            for (const p of this.points) {
                const toOut = p.position.sub(center).normalize();
                const force = toOut.mul(pressureStrength * 2);
                p.position = p.position.add(force);
            }

            // 對角約束
            for (let i = 0; i < this.numPoints / 2; i++) {
                const j = i + this.numPoints / 2;
                const p1 = this.points[i];
                const p2 = this.points[Math.floor(j)];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const targetDist = this.radius * 2 * pressureScale;

                if (dist > 0) {
                    const delta = (dist - targetDist) / dist * 0.05;
                    const correction = diff.mul(delta);
                    p1.position = p1.position.add(correction);
                    p2.position = p2.position.sub(correction);
                }
            }
        }
    }

    calculateArea() {
        let area = 0;
        for (let i = 0; i < this.numPoints; i++) {
            const j = (i + 1) % this.numPoints;
            area += this.points[i].position.x * this.points[j].position.y;
            area -= this.points[j].position.x * this.points[i].position.y;
        }
        return Math.abs(area) / 2;
    }

    updateWater(inertia, gravity) {
        const center = this.getCenter();
        const gravityForce = new Vector2(0, gravity * 0.008);

        for (const w of this.waterParticles) {
            // 重力
            w.velocity = w.velocity.add(gravityForce);

            // 更新位置
            w.update(inertia);

            // 限制在氣球內
            const toCenter = center.sub(w.position);
            const dist = toCenter.length();
            const maxDist = this.radius * 0.75;

            if (dist > maxDist) {
                w.position = center.add(toCenter.normalize().mul(-maxDist));
                // 反彈
                const normal = toCenter.normalize();
                const dot = w.velocity.x * normal.x + w.velocity.y * normal.y;
                w.velocity = w.velocity.sub(normal.mul(dot * 1.5));
            }

            // 水粒子之間的斥力（簡化版）
            for (const other of this.waterParticles) {
                if (other === w) continue;
                const diff = w.position.sub(other.position);
                const d = diff.length();
                if (d < w.radius * 3 && d > 0) {
                    const repel = diff.normalize().mul(0.1);
                    w.velocity = w.velocity.add(repel);
                }
            }
        }
    }

    handleBounds(bounds) {
        const groundY = bounds.height - 30;
        const bounce = 0.4;
        const friction = 0.8;

        for (const p of this.points) {
            // 地面
            if (p.position.y > groundY) {
                p.position.y = groundY;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
                p.prevPosition.x = p.position.x - (p.position.x - p.prevPosition.x) * (1 - friction);
            }

            // 天花板
            if (p.position.y < 20) {
                p.position.y = 20;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
            }

            // 左右
            if (p.position.x < 20) {
                p.position.x = 20;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
            if (p.position.x > bounds.width - 20) {
                p.position.x = bounds.width - 20;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
        }
    }

    draw(ctx, time) {
        const center = this.getCenter();

        // 繪製陰影
        ctx.beginPath();
        ctx.ellipse(center.x, ctx.canvas.height / window.devicePixelRatio - 20,
            this.radius * 0.7, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // 繪製氣球外殼
        ctx.beginPath();
        const firstMid = this.points[this.numPoints - 1].position.lerp(
            this.points[0].position, 0.5
        );
        ctx.moveTo(firstMid.x, firstMid.y);

        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.numPoints];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        // 氣球漸層
        const gradient = ctx.createRadialGradient(
            center.x - this.radius * 0.3,
            center.y - this.radius * 0.3,
            0,
            center.x,
            center.y,
            this.radius * 1.3
        );

        gradient.addColorStop(0, this.colorScheme.highlight);
        gradient.addColorStop(0.3, this.colorScheme.light);
        gradient.addColorStop(0.7, this.colorScheme.main);
        gradient.addColorStop(1, this.colorScheme.dark);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 繪製水
        this.drawWater(ctx, center, time);

        // 氣球外框
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.ellipse(
            center.x - this.radius * 0.35,
            center.y - this.radius * 0.35,
            this.radius * 0.2,
            this.radius * 0.1,
            -Math.PI / 4,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // 氣球結
        this.drawKnot(ctx, center);
    }

    drawWater(ctx, center, time) {
        // 使用 clipping 限制水在氣球內
        ctx.save();
        ctx.beginPath();
        const firstMid = this.points[this.numPoints - 1].position.lerp(
            this.points[0].position, 0.5
        );
        ctx.moveTo(firstMid.x, firstMid.y);
        for (let i = 0; i < this.numPoints; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.numPoints];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();
        ctx.clip();

        // 繪製水粒子
        for (const w of this.waterParticles) {
            const alpha = 0.3 + Math.sin(time * 3 + w.position.x * 0.1) * 0.1;
            ctx.beginPath();
            ctx.arc(w.position.x, w.position.y, w.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.fill();
        }

        // 水面效果
        const waterGradient = ctx.createLinearGradient(
            center.x, center.y - this.radius,
            center.x, center.y + this.radius
        );
        waterGradient.addColorStop(0, 'rgba(150, 220, 255, 0.1)');
        waterGradient.addColorStop(0.5, 'rgba(100, 180, 255, 0.2)');
        waterGradient.addColorStop(1, 'rgba(50, 150, 255, 0.3)');

        ctx.fillStyle = waterGradient;
        ctx.fill();

        ctx.restore();
    }

    drawKnot(ctx, center) {
        // 找到底部的點
        let bottomPoint = this.points[0];
        for (const p of this.points) {
            if (p.position.y > bottomPoint.position.y) {
                bottomPoint = p;
            }
        }

        const kx = bottomPoint.position.x;
        const ky = bottomPoint.position.y;

        // 氣球結
        ctx.beginPath();
        ctx.moveTo(kx - 8, ky);
        ctx.quadraticCurveTo(kx, ky + 15, kx + 8, ky);
        ctx.quadraticCurveTo(kx, ky + 8, kx - 8, ky);
        ctx.fillStyle = this.colorScheme.knot;
        ctx.fill();
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    reset(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.createBalloon();
        this.createWater();
    }
}

// 主應用程式
class WaterBalloonApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.params = {
            waterAmount: 100,
            elasticity: 60,
            inertia: 70,
            gravity: 50
        };

        this.colorSchemes = [
            {
                highlight: 'rgba(255, 150, 150, 0.5)',
                light: 'rgba(255, 100, 100, 0.6)',
                main: 'rgba(255, 50, 50, 0.7)',
                dark: 'rgba(200, 30, 30, 0.8)',
                outline: 'rgba(150, 20, 20, 0.6)',
                knot: 'rgba(200, 50, 50, 0.9)'
            },
            {
                highlight: 'rgba(150, 200, 255, 0.5)',
                light: 'rgba(100, 150, 255, 0.6)',
                main: 'rgba(50, 100, 255, 0.7)',
                dark: 'rgba(30, 70, 200, 0.8)',
                outline: 'rgba(20, 50, 150, 0.6)',
                knot: 'rgba(50, 100, 200, 0.9)'
            },
            {
                highlight: 'rgba(200, 255, 150, 0.5)',
                light: 'rgba(150, 255, 100, 0.6)',
                main: 'rgba(100, 220, 50, 0.7)',
                dark: 'rgba(70, 180, 30, 0.8)',
                outline: 'rgba(50, 130, 20, 0.6)',
                knot: 'rgba(80, 180, 50, 0.9)'
            },
            {
                highlight: 'rgba(255, 220, 150, 0.5)',
                light: 'rgba(255, 180, 100, 0.6)',
                main: 'rgba(255, 150, 50, 0.7)',
                dark: 'rgba(220, 120, 30, 0.8)',
                outline: 'rgba(180, 90, 20, 0.6)',
                knot: 'rgba(220, 140, 50, 0.9)'
            },
            {
                highlight: 'rgba(255, 180, 255, 0.5)',
                light: 'rgba(255, 130, 255, 0.6)',
                main: 'rgba(220, 80, 220, 0.7)',
                dark: 'rgba(180, 50, 180, 0.8)',
                outline: 'rgba(130, 30, 130, 0.6)',
                knot: 'rgba(200, 80, 200, 0.9)'
            }
        ];

        this.currentColorIndex = 0;
        this.balloon = null;
        this.time = 0;
        this.mousePos = new Vector2();

        this.resize();
        this.createBalloon();
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

    createBalloon() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2 - 50;
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.15;
        this.balloon = new WaterBalloon(x, y, radius, this.colorSchemes[this.currentColorIndex]);
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
            this.balloon.startDrag(this.mousePos);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
            this.balloon.drag(this.mousePos);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.balloon.endDrag();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.balloon.endDrag();
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
            this.balloon.startDrag(this.mousePos);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
            this.balloon.drag(this.mousePos);
        });

        this.canvas.addEventListener('touchend', () => {
            this.balloon.endDrag();
        });

        // 視窗大小調整
        window.addEventListener('resize', () => this.resize());

        // 控制項
        document.getElementById('waterAmount').addEventListener('input', (e) => {
            this.params.waterAmount = parseInt(e.target.value);
            document.getElementById('waterAmountValue').textContent = e.target.value;
        });

        document.getElementById('elasticity').addEventListener('input', (e) => {
            this.params.elasticity = parseInt(e.target.value);
            document.getElementById('elasticityValue').textContent = e.target.value;
        });

        document.getElementById('inertia').addEventListener('input', (e) => {
            this.params.inertia = parseInt(e.target.value);
            document.getElementById('inertiaValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.params.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.balloon.reset(this.bounds.width / 2, this.bounds.height / 2 - 50);
        });

        document.getElementById('throwBtn').addEventListener('click', () => {
            this.balloon.throwDown(15);
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colorSchemes.length;
            this.balloon.colorScheme = this.colorSchemes[this.currentColorIndex];
        });
    }

    update() {
        this.balloon.update(this.params, this.bounds);
    }

    draw() {
        // 背景
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        bgGradient.addColorStop(0, '#87ceeb');
        bgGradient.addColorStop(0.6, '#e0f7fa');
        bgGradient.addColorStop(1, '#a8d8ea');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 雲朵
        this.drawClouds();

        // 地面
        this.ctx.fillStyle = '#90c695';
        this.ctx.fillRect(0, this.bounds.height - 30, this.bounds.width, 30);

        // 草地紋理
        this.ctx.strokeStyle = '#7ab37f';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.bounds.width; x += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.bounds.height - 30);
            this.ctx.lineTo(x + 5, this.bounds.height - 35);
            this.ctx.stroke();
        }

        // 水球
        this.balloon.draw(this.ctx, this.time);
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        const cloudPositions = [
            { x: 100, y: 60 },
            { x: 300, y: 40 },
            { x: 500, y: 70 },
            { x: 700, y: 50 }
        ];

        for (const cloud of cloudPositions) {
            const cx = (cloud.x + this.time * 5) % (this.bounds.width + 100) - 50;
            this.ctx.beginPath();
            this.ctx.arc(cx, cloud.y, 25, 0, Math.PI * 2);
            this.ctx.arc(cx + 25, cloud.y - 10, 20, 0, Math.PI * 2);
            this.ctx.arc(cx + 50, cloud.y, 25, 0, Math.PI * 2);
            this.ctx.arc(cx + 25, cloud.y + 5, 18, 0, Math.PI * 2);
            this.ctx.fill();
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
    new WaterBalloonApp();
});
