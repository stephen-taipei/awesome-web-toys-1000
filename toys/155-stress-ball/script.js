/**
 * 155 - 減壓球
 * Stress Ball
 *
 * 擠壓減壓球，觀察形變後慢慢恢復的過程
 * 包含應力鬆弛效果和多種材質
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
}

// 減壓球質點
class StressPoint {
    constructor(x, y, restX, restY) {
        this.position = new Vector2(x, y);
        this.restPosition = new Vector2(restX, restY);
        this.velocity = new Vector2();
        this.force = new Vector2();
        this.isPinched = false;
    }

    applyForce(force) {
        this.force = this.force.add(force);
    }

    update(recovery, damping) {
        if (this.isPinched) {
            this.velocity = new Vector2();
            return;
        }

        // 應力鬆弛 - 慢慢回到靜止位置
        const toRest = this.restPosition.sub(this.position);
        const restoreForce = toRest.mul(recovery * 0.001);
        this.force = this.force.add(restoreForce);

        // 更新速度和位置
        this.velocity = this.velocity.add(this.force).mul(damping);
        this.position = this.position.add(this.velocity);
        this.force = new Vector2();
    }
}

// 減壓球類別
class StressBall {
    constructor(x, y, radius, colorScheme, textureType) {
        this.centerX = x;
        this.centerY = y;
        this.radius = radius;
        this.colorScheme = colorScheme;
        this.textureType = textureType;
        this.numPoints = 32;
        this.numRings = 4;

        this.points = [];
        this.stressLevel = 0;
        this.maxStress = 0;

        this.createBall();
    }

    createBall() {
        this.points = [];

        // 中心點
        this.points.push(new StressPoint(
            this.centerX, this.centerY,
            this.centerX, this.centerY
        ));

        // 同心圓環
        for (let ring = 1; ring <= this.numRings; ring++) {
            const ringRadius = (ring / this.numRings) * this.radius;
            const pointsInRing = Math.floor(this.numPoints * (ring / this.numRings));

            for (let i = 0; i < pointsInRing; i++) {
                const angle = (i / pointsInRing) * Math.PI * 2;
                const px = this.centerX + Math.cos(angle) * ringRadius;
                const py = this.centerY + Math.sin(angle) * ringRadius;
                this.points.push(new StressPoint(px, py, px, py));
            }
        }
    }

    pinch(mousePos, radius, strength) {
        let totalDisplacement = 0;

        for (const p of this.points) {
            const dist = p.position.dist(mousePos);

            if (dist < radius) {
                p.isPinched = true;

                // 計算擠壓方向和強度
                const toMouse = mousePos.sub(p.position);
                const factor = 1 - dist / radius;

                // 將點推向滑鼠方向
                const displacement = toMouse.mul(factor * strength * 0.1);
                p.position = p.position.add(displacement);

                totalDisplacement += displacement.length();
            } else {
                p.isPinched = false;
            }
        }

        // 更新壓力等級
        this.stressLevel = Math.min(100, this.stressLevel + totalDisplacement * 0.5);
        this.maxStress = Math.max(this.maxStress, this.stressLevel);
    }

    release() {
        for (const p of this.points) {
            p.isPinched = false;
        }
    }

    update(params) {
        const { recovery, softness, deformation } = params;
        const damping = 0.92;

        // 更新所有點
        for (const p of this.points) {
            p.update(recovery * 0.02, damping);
        }

        // 維持形狀約束
        this.maintainShape(softness / 100, deformation / 100);

        // 壓力等級衰減
        this.stressLevel *= 0.98;
    }

    maintainShape(softness, deformationLimit) {
        const center = this.points[0];
        const iterations = 3;

        for (let iter = 0; iter < iterations; iter++) {
            // 環形約束
            let pointIndex = 1;
            for (let ring = 1; ring <= this.numRings; ring++) {
                const pointsInRing = Math.floor(this.numPoints * (ring / this.numRings));
                const ringRadius = (ring / this.numRings) * this.radius;

                for (let i = 0; i < pointsInRing; i++) {
                    const p = this.points[pointIndex + i];
                    if (!p) continue;

                    // 與中心的距離約束
                    const toCenter = center.position.sub(p.position);
                    const dist = toCenter.length();
                    const targetDist = ringRadius;
                    const maxDist = targetDist * (1 + deformationLimit);
                    const minDist = targetDist * (1 - deformationLimit * 0.5);

                    if (!p.isPinched) {
                        if (dist > maxDist) {
                            const correction = toCenter.normalize().mul((dist - maxDist) * softness);
                            p.position = p.position.add(correction);
                        } else if (dist < minDist) {
                            const correction = toCenter.normalize().mul((dist - minDist) * softness);
                            p.position = p.position.add(correction);
                        }
                    }

                    // 相鄰點約束
                    const next = this.points[pointIndex + (i + 1) % pointsInRing];
                    if (next && !p.isPinched && !next.isPinched) {
                        const diff = next.position.sub(p.position);
                        const d = diff.length();
                        const targetLen = (2 * Math.PI * ringRadius) / pointsInRing;
                        const delta = (d - targetLen) / d * 0.3 * softness;

                        if (d > 0) {
                            const correction = diff.mul(delta);
                            p.position = p.position.add(correction);
                            next.position = next.position.sub(correction);
                        }
                    }
                }

                pointIndex += pointsInRing;
            }
        }
    }

    draw(ctx, time) {
        const center = this.points[0].position;

        // 繪製陰影
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.centerY + this.radius * 0.9,
            this.radius * 0.8, this.radius * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // 繪製球體
        this.drawBody(ctx, time);

        // 繪製材質
        this.drawTexture(ctx, time);

        // 繪製高光
        this.drawHighlights(ctx);
    }

    drawBody(ctx, time) {
        // 獲取外圈點
        const outerPoints = this.getOuterRingPoints();

        if (outerPoints.length < 3) return;

        ctx.beginPath();

        // 使用平滑曲線繪製
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

        // 漸層填充
        const center = this.points[0].position;
        const gradient = ctx.createRadialGradient(
            center.x - this.radius * 0.3,
            center.y - this.radius * 0.3,
            0,
            center.x,
            center.y,
            this.radius * 1.2
        );

        gradient.addColorStop(0, this.colorScheme.highlight);
        gradient.addColorStop(0.3, this.colorScheme.light);
        gradient.addColorStop(0.7, this.colorScheme.main);
        gradient.addColorStop(1, this.colorScheme.dark);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 邊框
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    getOuterRingPoints() {
        const outerRingSize = Math.floor(this.numPoints * (this.numRings / this.numRings));
        const startIndex = this.points.length - outerRingSize;
        return this.points.slice(startIndex);
    }

    drawTexture(ctx, time) {
        const center = this.points[0].position;

        ctx.save();

        // 創建剪裁區域
        const outerPoints = this.getOuterRingPoints();
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

        switch (this.textureType) {
            case 'dots':
                this.drawDotsTexture(ctx, center);
                break;
            case 'mesh':
                this.drawMeshTexture(ctx, center);
                break;
            case 'foam':
                this.drawFoamTexture(ctx, center, time);
                break;
            default:
                // 無材質
                break;
        }

        ctx.restore();
    }

    drawDotsTexture(ctx, center) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';

        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2 + (i % 5) * 0.5;
            const r = (i % 4 + 1) * (this.radius / 5);
            const x = center.x + Math.cos(angle) * r;
            const y = center.y + Math.sin(angle) * r;
            const size = 3 + (i % 3) * 2;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawMeshTexture(ctx, center) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 繪製網格線
        for (let ring = 1; ring <= this.numRings; ring++) {
            const ringRadius = (ring / this.numRings) * this.radius * 0.9;
            const pointsInRing = Math.floor(this.numPoints * (ring / this.numRings));

            // 環形線
            ctx.beginPath();
            for (let i = 0; i <= pointsInRing; i++) {
                const angle = (i / pointsInRing) * Math.PI * 2;
                const x = center.x + Math.cos(angle) * ringRadius;
                const y = center.y + Math.sin(angle) * ringRadius;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // 放射線
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(
                center.x + Math.cos(angle) * this.radius * 0.9,
                center.y + Math.sin(angle) * this.radius * 0.9
            );
            ctx.stroke();
        }
    }

    drawFoamTexture(ctx, center, time) {
        // 泡沫材質
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + Math.sin(time + i) * 0.1;
            const r = (0.3 + (i % 3) * 0.2) * this.radius;
            const x = center.x + Math.cos(angle) * r;
            const y = center.y + Math.sin(angle) * r;
            const size = 8 + Math.sin(time * 2 + i) * 3;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.sin(time + i) * 0.03})`;
            ctx.fill();
        }
    }

    drawHighlights(ctx) {
        const center = this.points[0].position;

        // 主高光
        ctx.beginPath();
        ctx.ellipse(
            center.x - this.radius * 0.35,
            center.y - this.radius * 0.35,
            this.radius * 0.25,
            this.radius * 0.15,
            -Math.PI / 4,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 次高光
        ctx.beginPath();
        ctx.arc(
            center.x - this.radius * 0.2,
            center.y - this.radius * 0.2,
            this.radius * 0.08,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
    }

    reset() {
        this.createBall();
        this.stressLevel = 0;
        this.maxStress = 0;
    }
}

// 主應用程式
class StressBallApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stressMeter = document.getElementById('stressMeter');

        this.params = {
            recovery: 50,
            softness: 60,
            deformation: 70
        };

        this.colorSchemes = [
            {
                highlight: 'rgba(255, 150, 150, 0.9)',
                light: 'rgba(255, 100, 100, 0.85)',
                main: 'rgba(231, 76, 60, 0.8)',
                dark: 'rgba(192, 57, 43, 0.85)',
                outline: 'rgba(120, 40, 30, 0.6)'
            },
            {
                highlight: 'rgba(150, 200, 255, 0.9)',
                light: 'rgba(100, 180, 255, 0.85)',
                main: 'rgba(52, 152, 219, 0.8)',
                dark: 'rgba(41, 128, 185, 0.85)',
                outline: 'rgba(30, 80, 130, 0.6)'
            },
            {
                highlight: 'rgba(150, 255, 200, 0.9)',
                light: 'rgba(100, 255, 150, 0.85)',
                main: 'rgba(46, 204, 113, 0.8)',
                dark: 'rgba(39, 174, 96, 0.85)',
                outline: 'rgba(30, 120, 70, 0.6)'
            },
            {
                highlight: 'rgba(255, 220, 150, 0.9)',
                light: 'rgba(255, 200, 100, 0.85)',
                main: 'rgba(243, 156, 18, 0.8)',
                dark: 'rgba(211, 84, 0, 0.85)',
                outline: 'rgba(150, 60, 0, 0.6)'
            },
            {
                highlight: 'rgba(220, 180, 255, 0.9)',
                light: 'rgba(180, 130, 255, 0.85)',
                main: 'rgba(155, 89, 182, 0.8)',
                dark: 'rgba(142, 68, 173, 0.85)',
                outline: 'rgba(100, 50, 120, 0.6)'
            }
        ];

        this.textureTypes = ['none', 'dots', 'mesh', 'foam'];
        this.currentColorIndex = 0;
        this.currentTextureIndex = 0;

        this.ball = null;
        this.time = 0;
        this.isPressed = false;
        this.mousePos = new Vector2();

        this.resize();
        this.createBall();
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

    createBall() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.25;
        this.ball = new StressBall(
            x, y, radius,
            this.colorSchemes[this.currentColorIndex],
            this.textureTypes[this.currentTextureIndex]
        );
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPressed = true;
            this.updateMousePos(e);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.updateMousePos(e);
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPressed = false;
            this.ball.release();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPressed = false;
            this.ball.release();
        });

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isPressed = true;
            this.updateTouchPos(e);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateTouchPos(e);
        });

        this.canvas.addEventListener('touchend', () => {
            this.isPressed = false;
            this.ball.release();
        });

        // 視窗大小調整
        window.addEventListener('resize', () => {
            this.resize();
            this.createBall();
        });

        // 控制項
        document.getElementById('recovery').addEventListener('input', (e) => {
            this.params.recovery = parseInt(e.target.value);
            document.getElementById('recoveryValue').textContent = e.target.value;
        });

        document.getElementById('softness').addEventListener('input', (e) => {
            this.params.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = e.target.value;
        });

        document.getElementById('deformation').addEventListener('input', (e) => {
            this.params.deformation = parseInt(e.target.value);
            document.getElementById('deformationValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.ball.reset();
        });

        document.getElementById('textureBtn').addEventListener('click', () => {
            this.currentTextureIndex = (this.currentTextureIndex + 1) % this.textureTypes.length;
            this.ball.textureType = this.textureTypes[this.currentTextureIndex];
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colorSchemes.length;
            this.ball.colorScheme = this.colorSchemes[this.currentColorIndex];
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
        if (this.isPressed) {
            const pinchRadius = this.ball.radius * 0.6;
            const strength = this.params.deformation / 100;
            this.ball.pinch(this.mousePos, pinchRadius, strength);
        }

        this.ball.update(this.params);

        // 更新壓力計量表
        this.stressMeter.style.width = `${this.ball.stressLevel}%`;
    }

    draw() {
        // 背景
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        bgGradient.addColorStop(0, '#34495e');
        bgGradient.addColorStop(0.5, '#2c3e50');
        bgGradient.addColorStop(1, '#1a252f');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 環境光效果
        const ambientGradient = this.ctx.createRadialGradient(
            this.bounds.width / 2,
            this.bounds.height / 2,
            0,
            this.bounds.width / 2,
            this.bounds.height / 2,
            this.bounds.width * 0.6
        );
        ambientGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        ambientGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = ambientGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 繪製減壓球
        this.ball.draw(this.ctx, this.time);

        // 擠壓指示器
        if (this.isPressed) {
            this.ctx.beginPath();
            this.ctx.arc(this.mousePos.x, this.mousePos.y, 30, 0, Math.PI * 2);
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
    new StressBallApp();
});
