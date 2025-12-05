/**
 * 軟糖熊 - Gummy Bear
 * Q彈軟糖物理模擬
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

// 軟糖點
class GummyPoint {
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

// 軟糖熊
class GummyBear {
    constructor(x, y) {
        this.centerX = x;
        this.centerY = y;

        // 顏色主題
        this.colors = [
            { main: '#e53935', light: '#ff6f60', dark: '#ab000d', name: '紅色' },    // 紅色
            { main: '#43a047', light: '#76d275', dark: '#00701a', name: '綠色' },    // 綠色
            { main: '#fdd835', light: '#ffff6b', dark: '#c6a700', name: '黃色' },    // 黃色
            { main: '#fb8c00', light: '#ffbd45', dark: '#c25e00', name: '橙色' },    // 橙色
            { main: '#ffffff', light: '#ffffff', dark: '#cccccc', name: '白色' }     // 白色
        ];
        this.colorIndex = 0;

        this.bodyPoints = [];
        this.headPoints = [];
        this.earPoints = { left: [], right: [] };
        this.armPoints = { left: [], right: [] };
        this.legPoints = { left: [], right: [] };

        this.velocity = new Vector2();

        this.initPoints();
    }

    get color() {
        return this.colors[this.colorIndex];
    }

    initPoints() {
        // 身體
        this.bodyPoints = this.createOval(0, 30, 45, 55, 12);

        // 頭部
        this.headPoints = this.createOval(0, -50, 40, 35, 10);

        // 耳朵
        this.earPoints.left = this.createOval(-30, -80, 15, 15, 6);
        this.earPoints.right = this.createOval(30, -80, 15, 15, 6);

        // 手臂
        this.armPoints.left = this.createOval(-55, 20, 18, 25, 6);
        this.armPoints.right = this.createOval(55, 20, 18, 25, 6);

        // 腿
        this.legPoints.left = this.createOval(-25, 90, 20, 25, 6);
        this.legPoints.right = this.createOval(25, 90, 20, 25, 6);
    }

    createOval(offsetX, offsetY, width, height, segments) {
        const points = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = this.centerX + offsetX + Math.cos(angle) * width;
            const y = this.centerY + offsetY + Math.sin(angle) * height;

            const point = new GummyPoint(x, y);
            point.restOffset = new Vector2(
                offsetX + Math.cos(angle) * width,
                offsetY + Math.sin(angle) * height
            );
            points.push(point);
        }

        return points;
    }

    getAllPoints() {
        return [
            ...this.bodyPoints,
            ...this.headPoints,
            ...this.earPoints.left,
            ...this.earPoints.right,
            ...this.armPoints.left,
            ...this.armPoints.right,
            ...this.legPoints.left,
            ...this.legPoints.right
        ];
    }

    update(jiggle, stickiness, gravity, groundY) {
        const stiffness = jiggle * 0.004;
        const damping = stickiness * 0.01;
        const grav = gravity * 0.015;

        // 整體重力
        this.velocity.y += grav;
        this.velocity = this.velocity.mul(0.98);

        this.centerX += this.velocity.x;
        this.centerY += this.velocity.y;

        // 地面碰撞
        const footY = this.centerY + 115;
        if (footY > groundY) {
            this.centerY = groundY - 115;
            this.velocity.y *= -0.6;
            this.velocity.x *= 0.9;
        }

        // 更新所有點
        const allPoints = this.getAllPoints();

        for (const point of allPoints) {
            point.update(damping);
        }

        // 約束迭代
        for (let iter = 0; iter < 4; iter++) {
            this.constrainShape(this.bodyPoints, stiffness);
            this.constrainShape(this.headPoints, stiffness);
            this.constrainShape(this.earPoints.left, stiffness);
            this.constrainShape(this.earPoints.right, stiffness);
            this.constrainShape(this.armPoints.left, stiffness);
            this.constrainShape(this.armPoints.right, stiffness);
            this.constrainShape(this.legPoints.left, stiffness);
            this.constrainShape(this.legPoints.right, stiffness);

            // 地面約束
            for (const point of allPoints) {
                if (point.position.y > groundY) {
                    point.position.y = groundY;
                }
            }
        }

        // 形狀恢復
        for (const point of allPoints) {
            const targetX = this.centerX + point.restOffset.x;
            const targetY = this.centerY + point.restOffset.y;
            const toTarget = new Vector2(targetX, targetY).sub(point.position);
            point.applyForce(toTarget.mul(stiffness * 0.5));
        }
    }

    constrainShape(points, stiffness) {
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            const restDist = Vector2.dist(
                new Vector2(p1.restOffset.x, p1.restOffset.y),
                new Vector2(p2.restOffset.x, p2.restOffset.y)
            );

            const diff = p2.position.sub(p1.position);
            const dist = diff.length();

            if (dist > 0) {
                const correction = diff.mul((dist - restDist) / dist * stiffness);
                p1.applyForce(correction);
                p2.applyForce(correction.mul(-1));
            }
        }
    }

    bounce() {
        this.velocity.y = -12;
        this.velocity.x = (Math.random() - 0.5) * 5;
    }

    nextColor() {
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }

    push(x, y, strength) {
        const dist = Vector2.dist(new Vector2(x, y), new Vector2(this.centerX, this.centerY));

        if (dist < 120) {
            const dir = new Vector2(this.centerX - x, this.centerY - y).normalize();
            this.velocity = this.velocity.add(dir.mul(strength * 0.15));

            // 局部變形
            const allPoints = this.getAllPoints();
            for (const point of allPoints) {
                const pointDist = Vector2.dist(new Vector2(x, y), point.position);
                if (pointDist < 60) {
                    const factor = 1 - pointDist / 60;
                    point.applyForce(dir.mul(strength * factor * 0.5));
                }
            }
        }
    }

    draw(ctx) {
        // 繪製陰影
        this.drawShadow(ctx);

        // 繪製各部位（從後到前）
        this.drawShape(ctx, this.earPoints.left, true);
        this.drawShape(ctx, this.earPoints.right, true);
        this.drawShape(ctx, this.armPoints.left, false);
        this.drawShape(ctx, this.armPoints.right, false);
        this.drawShape(ctx, this.legPoints.left, false);
        this.drawShape(ctx, this.legPoints.right, false);
        this.drawShape(ctx, this.bodyPoints, false);
        this.drawShape(ctx, this.headPoints, false);

        // 繪製臉部
        this.drawFace(ctx);
    }

    drawShadow(ctx) {
        ctx.beginPath();
        ctx.ellipse(
            this.centerX,
            this.centerY + 125,
            50,
            15,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();
    }

    drawShape(ctx, points, isEar) {
        if (points.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(points[0].position.x, points[0].position.y);

        for (let i = 0; i < points.length; i++) {
            const curr = points[i];
            const next = points[(i + 1) % points.length];

            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;

            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();

        // 漸層
        const centerX = points.reduce((sum, p) => sum + p.position.x, 0) / points.length;
        const centerY = points.reduce((sum, p) => sum + p.position.y, 0) / points.length;

        const gradient = ctx.createRadialGradient(
            centerX - 10, centerY - 10, 0,
            centerX, centerY, 60
        );

        if (isEar) {
            gradient.addColorStop(0, this.color.light);
            gradient.addColorStop(0.5, this.color.main);
            gradient.addColorStop(1, this.color.dark);
        } else {
            gradient.addColorStop(0, this.color.light);
            gradient.addColorStop(0.4, this.color.main);
            gradient.addColorStop(1, this.color.dark);
        }

        ctx.fillStyle = gradient;
        ctx.fill();

        // 透明邊緣效果（軟糖質感）
        ctx.strokeStyle = this.color.dark + '40';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.ellipse(
            centerX - 5,
            centerY - 10,
            15,
            8,
            -0.3,
            0, Math.PI * 2
        );

        const highlightGradient = ctx.createRadialGradient(
            centerX - 5, centerY - 10, 0,
            centerX - 5, centerY - 10, 15
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.fill();
    }

    drawFace(ctx) {
        // 計算頭部中心
        const headCenterX = this.headPoints.reduce((sum, p) => sum + p.position.x, 0) / this.headPoints.length;
        const headCenterY = this.headPoints.reduce((sum, p) => sum + p.position.y, 0) / this.headPoints.length;

        // 眼睛
        const eyeOffsetX = 15;
        const eyeOffsetY = -5;

        // 左眼
        ctx.beginPath();
        ctx.ellipse(headCenterX - eyeOffsetX, headCenterY + eyeOffsetY, 6, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#212121';
        ctx.fill();

        // 右眼
        ctx.beginPath();
        ctx.ellipse(headCenterX + eyeOffsetX, headCenterY + eyeOffsetY, 6, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#212121';
        ctx.fill();

        // 眼睛高光
        ctx.beginPath();
        ctx.arc(headCenterX - eyeOffsetX - 2, headCenterY + eyeOffsetY - 3, 2, 0, Math.PI * 2);
        ctx.arc(headCenterX + eyeOffsetX - 2, headCenterY + eyeOffsetY - 3, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 鼻子
        ctx.beginPath();
        ctx.ellipse(headCenterX, headCenterY + 8, 5, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color.dark;
        ctx.fill();

        // 嘴巴
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY + 18, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = this.color.dark;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    reset(x, y) {
        this.centerX = x;
        this.centerY = y;
        this.velocity = new Vector2();
        this.initPoints();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.jiggle = 75;
        this.stickiness = 90;
        this.gravity = 50;

        this.bear = null;
        this.groundY = 0;
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
        this.groundY = this.height - 40;
    }

    init() {
        this.bear = new GummyBear(this.width / 2, this.height / 2 - 50);
    }

    setupControls() {
        const jiggleSlider = document.getElementById('jiggle');
        const jiggleValue = document.getElementById('jiggleValue');
        jiggleSlider.addEventListener('input', (e) => {
            this.jiggle = parseInt(e.target.value);
            jiggleValue.textContent = this.jiggle;
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
            this.bear.reset(this.width / 2, this.height / 2 - 50);
        });

        document.getElementById('bounceBtn').addEventListener('click', () => {
            this.bear.bounce();
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.bear.nextColor();
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
        const pos = this.getPointerPos(e);
        this.bear.push(pos.x, pos.y, 10);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        const pos = this.getPointerPos(e);
        this.bear.push(pos.x, pos.y, 6);
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    update() {
        this.bear.update(this.jiggle, this.stickiness, this.gravity, this.groundY);

        // 邊界
        if (this.bear.centerX < 60) {
            this.bear.centerX = 60;
            this.bear.velocity.x *= -0.5;
        }
        if (this.bear.centerX > this.width - 60) {
            this.bear.centerX = this.width - 60;
            this.bear.velocity.x *= -0.5;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景
        this.drawBackground();

        // 軟糖熊
        this.bear.draw(this.ctx);
    }

    drawBackground() {
        // 漸層背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#fbe9e7');
        gradient.addColorStop(1, '#ffccbc');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 地面
        this.ctx.fillStyle = '#ffab91';
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        // 地面線
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.width, this.groundY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 裝飾糖果
        this.drawCandyDecorations();
    }

    drawCandyDecorations() {
        const candyColors = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50'];

        for (let i = 0; i < 8; i++) {
            const x = (i * 150 + 50) % this.width;
            const y = this.groundY + 15;
            const color = candyColors[i % candyColors.length];

            // 小糖果
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2);

            const candyGradient = this.ctx.createRadialGradient(
                x - 3, y - 2, 0,
                x, y, 10
            );
            candyGradient.addColorStop(0, '#ffffff');
            candyGradient.addColorStop(0.3, color);
            candyGradient.addColorStop(1, color);

            this.ctx.fillStyle = candyGradient;
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
