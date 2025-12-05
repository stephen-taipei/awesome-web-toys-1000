/**
 * 橡皮鴨 - Rubber Duck
 * 浴缸小鴨物理模擬
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

    clone() {
        return new Vector2(this.x, this.y);
    }

    static dist(a, b) {
        return a.sub(b).length();
    }
}

// 軟體點
class DuckPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restOffset = new Vector2(x, y);
    }

    update(damping) {
        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel);
    }

    applyForce(force) {
        this.position = this.position.add(force);
    }
}

// 橡皮鴨
class RubberDuck {
    constructor(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.baseY = y;

        this.bodyPoints = [];
        this.headPoints = [];
        this.beakPoints = [];

        this.velocity = new Vector2();
        this.rotation = 0;
        this.angularVelocity = 0;

        this.squeaking = false;
        this.squeezeAmount = 0;

        this.initPoints();
    }

    initPoints() {
        // 身體（橢圓形）
        this.bodyPoints = [];
        const bodyWidth = 80;
        const bodyHeight = 50;
        const bodySegments = 16;

        for (let i = 0; i < bodySegments; i++) {
            const angle = (i / bodySegments) * Math.PI * 2;
            const x = this.centerX + Math.cos(angle) * bodyWidth;
            const y = this.centerY + Math.sin(angle) * bodyHeight;

            const point = new DuckPoint(x, y);
            point.restOffset = new Vector2(
                Math.cos(angle) * bodyWidth,
                Math.sin(angle) * bodyHeight
            );
            this.bodyPoints.push(point);
        }

        // 頭部（圓形）
        this.headPoints = [];
        const headRadius = 35;
        const headCenterX = this.centerX - 50;
        const headCenterY = this.centerY - 40;
        const headSegments = 12;

        for (let i = 0; i < headSegments; i++) {
            const angle = (i / headSegments) * Math.PI * 2;
            const x = headCenterX + Math.cos(angle) * headRadius;
            const y = headCenterY + Math.sin(angle) * headRadius;

            const point = new DuckPoint(x, y);
            point.restOffset = new Vector2(
                -50 + Math.cos(angle) * headRadius,
                -40 + Math.sin(angle) * headRadius
            );
            this.headPoints.push(point);
        }

        // 嘴巴
        this.beakPoints = [];
        const beakPoints = [
            { x: -85, y: -40 },
            { x: -110, y: -35 },
            { x: -85, y: -30 }
        ];

        for (const bp of beakPoints) {
            const point = new DuckPoint(this.centerX + bp.x, this.centerY + bp.y);
            point.restOffset = new Vector2(bp.x, bp.y);
            this.beakPoints.push(point);
        }
    }

    update(softness, buoyancy, waveStrength, waterLevel, time) {
        const stiffness = (100 - softness) * 0.003 + 0.05;
        const damping = 0.95;
        const buoyancyForce = buoyancy * 0.003;

        // 水波效果
        const waveOffset = Math.sin(time * 2 + this.centerX * 0.01) * waveStrength * 0.3;

        // 浮力
        const submergedDepth = Math.max(0, this.centerY - waterLevel + 30);
        const floatForce = -submergedDepth * buoyancyForce;
        this.velocity.y += floatForce;

        // 重力
        this.velocity.y += 0.2;

        // 阻尼
        this.velocity = this.velocity.mul(0.98);
        this.angularVelocity *= 0.95;

        // 更新位置
        this.centerX += this.velocity.x;
        this.centerY += this.velocity.y + waveOffset * 0.1;
        this.rotation += this.angularVelocity;

        // 水位約束
        if (this.centerY > waterLevel + 20) {
            this.centerY = waterLevel + 20;
            this.velocity.y *= -0.3;
        }

        // 擠壓動畫
        if (this.squeaking) {
            this.squeezeAmount = Math.min(this.squeezeAmount + 0.1, 0.3);
        } else {
            this.squeezeAmount *= 0.9;
        }

        // 更新所有點
        const allPoints = [...this.bodyPoints, ...this.headPoints, ...this.beakPoints];

        for (const point of allPoints) {
            point.update(damping);
        }

        // 約束
        for (let iter = 0; iter < 3; iter++) {
            this.constrainPoints(this.bodyPoints, stiffness, 1 - this.squeezeAmount * 0.5);
            this.constrainPoints(this.headPoints, stiffness, 1 - this.squeezeAmount * 0.3);
        }

        // 更新點位置（跟隨中心）
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        for (const point of allPoints) {
            const targetX = this.centerX + point.restOffset.x * cos - point.restOffset.y * sin;
            const targetY = this.centerY + point.restOffset.x * sin + point.restOffset.y * cos;

            const toTarget = new Vector2(targetX, targetY).sub(point.position);
            point.applyForce(toTarget.mul(stiffness));
        }
    }

    constrainPoints(points, stiffness, scale) {
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            const restDist = Vector2.dist(
                new Vector2(p1.restOffset.x, p1.restOffset.y),
                new Vector2(p2.restOffset.x, p2.restOffset.y)
            ) * scale;

            const diff = p2.position.sub(p1.position);
            const dist = diff.length();

            if (dist > 0) {
                const correction = diff.mul((dist - restDist) / dist * stiffness);
                p1.applyForce(correction);
                p2.applyForce(correction.mul(-1));
            }
        }
    }

    squeak() {
        this.squeaking = true;
        setTimeout(() => {
            this.squeaking = false;
        }, 200);

        // 發出聲音效果（視覺）
        this.velocity.y -= 3;
        this.angularVelocity += (Math.random() - 0.5) * 0.1;
    }

    splash(strength) {
        this.velocity.x += (Math.random() - 0.5) * strength;
        this.velocity.y -= strength * 0.5;
        this.angularVelocity += (Math.random() - 0.5) * 0.2;
    }

    push(x, y, strength) {
        const dist = Vector2.dist(new Vector2(x, y), new Vector2(this.centerX, this.centerY));

        if (dist < 100) {
            const dir = new Vector2(this.centerX - x, this.centerY - y).normalize();
            this.velocity = this.velocity.add(dir.mul(strength * 0.2));
            this.angularVelocity += (x - this.centerX) * 0.001 * strength;

            // 局部變形
            const allPoints = [...this.bodyPoints, ...this.headPoints];
            for (const point of allPoints) {
                const pointDist = Vector2.dist(new Vector2(x, y), point.position);
                if (pointDist < 50) {
                    const factor = 1 - pointDist / 50;
                    point.applyForce(dir.mul(strength * factor * 0.5));
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // 繪製身體
        this.drawBody(ctx);

        // 繪製頭部
        this.drawHead(ctx);

        // 繪製嘴巴
        this.drawBeak(ctx);

        // 繪製眼睛
        this.drawEyes(ctx);

        ctx.restore();
    }

    drawBody(ctx) {
        // 身體漸層
        const gradient = ctx.createRadialGradient(
            this.centerX - 20, this.centerY - 20, 0,
            this.centerX, this.centerY, 100
        );
        gradient.addColorStop(0, '#fff59d');
        gradient.addColorStop(0.5, '#ffeb3b');
        gradient.addColorStop(1, '#fbc02d');

        ctx.beginPath();
        ctx.moveTo(this.bodyPoints[0].position.x, this.bodyPoints[0].position.y);

        for (let i = 0; i < this.bodyPoints.length; i++) {
            const curr = this.bodyPoints[i];
            const next = this.bodyPoints[(i + 1) % this.bodyPoints.length];

            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;

            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 身體陰影
        ctx.strokeStyle = 'rgba(251, 192, 45, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawHead(ctx) {
        // 頭部漸層
        const headCenter = this.getHeadCenter();

        const gradient = ctx.createRadialGradient(
            headCenter.x - 10, headCenter.y - 10, 0,
            headCenter.x, headCenter.y, 45
        );
        gradient.addColorStop(0, '#fff59d');
        gradient.addColorStop(0.5, '#ffeb3b');
        gradient.addColorStop(1, '#fbc02d');

        ctx.beginPath();
        ctx.moveTo(this.headPoints[0].position.x, this.headPoints[0].position.y);

        for (let i = 0; i < this.headPoints.length; i++) {
            const curr = this.headPoints[i];
            const next = this.headPoints[(i + 1) % this.headPoints.length];

            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;

            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = 'rgba(251, 192, 45, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawBeak(ctx) {
        if (this.beakPoints.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(this.beakPoints[0].position.x, this.beakPoints[0].position.y);
        ctx.lineTo(this.beakPoints[1].position.x, this.beakPoints[1].position.y);
        ctx.lineTo(this.beakPoints[2].position.x, this.beakPoints[2].position.y);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
            this.beakPoints[0].position.x, this.beakPoints[0].position.y,
            this.beakPoints[1].position.x, this.beakPoints[1].position.y
        );
        gradient.addColorStop(0, '#ff9800');
        gradient.addColorStop(1, '#f57c00');

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawEyes(ctx) {
        const headCenter = this.getHeadCenter();
        const cos = Math.cos(this.rotation);
        const sin = Math.sin(this.rotation);

        // 眼睛位置
        const eyeOffsetX = -10;
        const eyeOffsetY = -10;
        const eyeX = headCenter.x + eyeOffsetX * cos - eyeOffsetY * sin;
        const eyeY = headCenter.y + eyeOffsetX * sin + eyeOffsetY * cos;

        // 眼白
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 瞳孔
        ctx.beginPath();
        ctx.arc(eyeX - 2, eyeY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#212121';
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(eyeX - 4, eyeY - 2, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    getHeadCenter() {
        let cx = 0, cy = 0;
        for (const point of this.headPoints) {
            cx += point.position.x;
            cy += point.position.y;
        }
        return new Vector2(cx / this.headPoints.length, cy / this.headPoints.length);
    }

    reset(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.velocity = new Vector2();
        this.rotation = 0;
        this.angularVelocity = 0;
        this.initPoints();
    }
}

// 水波
class WaterWave {
    constructor(width, waterLevel) {
        this.width = width;
        this.waterLevel = waterLevel;
        this.points = [];
        this.numPoints = 50;

        this.initPoints();
    }

    initPoints() {
        this.points = [];
        const spacing = this.width / (this.numPoints - 1);

        for (let i = 0; i < this.numPoints; i++) {
            this.points.push({
                x: i * spacing,
                y: this.waterLevel,
                velocity: 0
            });
        }
    }

    update(time, waveStrength) {
        const tension = 0.02;
        const damping = 0.98;

        // 波動傳播
        for (let i = 1; i < this.points.length - 1; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const next = this.points[i + 1];

            const force = (prev.y + next.y) / 2 - curr.y;
            curr.velocity += force * tension;
            curr.velocity *= damping;
        }

        // 更新位置
        for (const point of this.points) {
            point.y += point.velocity;
        }

        // 基礎波動
        for (let i = 0; i < this.points.length; i++) {
            const wave = Math.sin(time * 2 + i * 0.2) * waveStrength * 0.3;
            this.points[i].y = this.waterLevel + wave + this.points[i].velocity;
        }
    }

    splash(x, strength) {
        for (const point of this.points) {
            const dist = Math.abs(point.x - x);
            if (dist < 100) {
                const factor = 1 - dist / 100;
                point.velocity += strength * factor;
            }
        }
    }

    draw(ctx, height) {
        // 水面
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }

        ctx.lineTo(this.width, height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, this.waterLevel, 0, height);
        gradient.addColorStop(0, 'rgba(41, 182, 246, 0.7)');
        gradient.addColorStop(0.3, 'rgba(3, 169, 244, 0.8)');
        gradient.addColorStop(1, 'rgba(2, 136, 209, 0.9)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // 水面線
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.softness = 60;
        this.buoyancy = 70;
        this.wave = 40;

        this.duck = null;
        this.water = null;
        this.waterLevel = 0;
        this.time = 0;

        this.isDragging = false;

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
        this.waterLevel = this.height * 0.5;
    }

    init() {
        this.duck = new RubberDuck(this.width / 2, this.waterLevel);
        this.water = new WaterWave(this.width, this.waterLevel);
    }

    setupControls() {
        const softnessSlider = document.getElementById('softness');
        const softnessValue = document.getElementById('softnessValue');
        softnessSlider.addEventListener('input', (e) => {
            this.softness = parseInt(e.target.value);
            softnessValue.textContent = this.softness;
        });

        const buoyancySlider = document.getElementById('buoyancy');
        const buoyancyValue = document.getElementById('buoyancyValue');
        buoyancySlider.addEventListener('input', (e) => {
            this.buoyancy = parseInt(e.target.value);
            buoyancyValue.textContent = this.buoyancy;
        });

        const waveSlider = document.getElementById('wave');
        const waveValue = document.getElementById('waveValue');
        waveSlider.addEventListener('input', (e) => {
            this.wave = parseInt(e.target.value);
            waveValue.textContent = this.wave;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.duck.reset(this.width / 2, this.waterLevel);
            this.water.initPoints();
        });

        document.getElementById('squeakBtn').addEventListener('click', () => {
            this.duck.squeak();
        });

        document.getElementById('splashBtn').addEventListener('click', () => {
            this.duck.splash(15);
            this.water.splash(this.duck.centerX, 10);
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());

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
        const pos = this.getPointerPos(e);
        this.duck.push(pos.x, pos.y, 8);
        this.water.splash(pos.x, 5);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        const pos = this.getPointerPos(e);
        this.duck.push(pos.x, pos.y, 5);
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    update() {
        this.time += 0.016;

        this.duck.update(this.softness, this.buoyancy, this.wave, this.waterLevel, this.time);
        this.water.update(this.time, this.wave);

        // 邊界
        if (this.duck.centerX < 80) {
            this.duck.centerX = 80;
            this.duck.velocity.x *= -0.5;
        }
        if (this.duck.centerX > this.width - 80) {
            this.duck.centerX = this.width - 80;
            this.duck.velocity.x *= -0.5;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景（天空）
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.waterLevel);
        skyGradient.addColorStop(0, '#b3e5fc');
        skyGradient.addColorStop(1, '#81d4fa');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.width, this.waterLevel);

        // 繪製水
        this.water.draw(this.ctx, this.height);

        // 繪製小鴨
        this.duck.draw(this.ctx);

        // 繪製水面上的反光
        this.drawWaterReflection();
    }

    drawWaterReflection() {
        // 水面反光
        this.ctx.globalAlpha = 0.3;

        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + this.time * 20) % this.width;
            const y = this.waterLevel + 5;

            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 30, 5, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
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
