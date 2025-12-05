/**
 * 橡皮筋彈弓 - Rubber Band Slingshot
 * 波動傳遞與彈射物理模擬
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

    dot(v) {
        return this.x * v.x + this.y * v.y;
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

// 橡皮筋上的節點
class BandPoint {
    constructor(x, y, fixed = false) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.fixed = fixed;
    }

    update(gravity, damping) {
        if (this.fixed) return;

        // Verlet integration
        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel).add(new Vector2(0, gravity));
    }

    applySpringForce(target, stiffness) {
        if (this.fixed) return;

        const diff = target.sub(this.position);
        const force = diff.mul(stiffness);
        this.position = this.position.add(force);
    }
}

// 發射的球
class Ball {
    constructor(x, y, vx, vy, radius = 15) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.radius = radius;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.trail = [];
        this.maxTrail = 20;
    }

    update(gravity, damping, width, height) {
        // 記錄軌跡
        this.trail.push(this.position.clone());
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }

        // 應用重力
        this.velocity.y += gravity;

        // 應用阻尼
        this.velocity = this.velocity.mul(damping);

        // 更新位置
        this.position = this.position.add(this.velocity);

        // 邊界碰撞
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -0.8;
        }
        if (this.position.x + this.radius > width) {
            this.position.x = width - this.radius;
            this.velocity.x *= -0.8;
        }
        if (this.position.y - this.radius < 0) {
            this.position.y = this.radius;
            this.velocity.y *= -0.8;
        }
        if (this.position.y + this.radius > height) {
            this.position.y = height - this.radius;
            this.velocity.y *= -0.8;
        }
    }

    draw(ctx) {
        // 繪製軌跡
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = this.color + '40';
            ctx.lineWidth = this.radius * 0.5;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // 繪製球體
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            0,
            this.position.x,
            this.position.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.color.replace('50%', '30%'));

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 陰影
        ctx.beginPath();
        ctx.ellipse(
            this.position.x,
            this.position.y + this.radius * 1.5,
            this.radius * 0.8,
            this.radius * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();
    }
}

// 橡皮筋
class RubberBand {
    constructor(x, y, width) {
        this.points = [];
        this.numPoints = 21; // 奇數，確保有中心點
        this.centerIndex = Math.floor(this.numPoints / 2);
        this.baseY = y;
        this.leftX = x - width / 2;
        this.rightX = x + width / 2;
        this.width = width;

        this.initPoints();
    }

    initPoints() {
        this.points = [];
        const spacing = this.width / (this.numPoints - 1);

        for (let i = 0; i < this.numPoints; i++) {
            const x = this.leftX + i * spacing;
            const fixed = (i === 0 || i === this.numPoints - 1);
            this.points.push(new BandPoint(x, this.baseY, fixed));
        }
    }

    update(elasticity, damping, gravity) {
        const stiffness = elasticity * 0.003;
        const grav = gravity * 0.01;
        const damp = damping * 0.01;

        // 更新每個點
        for (const point of this.points) {
            point.update(grav, damp);
        }

        // 應用彈簧力 - 向靜止位置回彈
        for (const point of this.points) {
            point.applySpringForce(point.restPosition, stiffness);
        }

        // 相鄰點之間的約束
        for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < this.points.length - 1; i++) {
                const p1 = this.points[i];
                const p2 = this.points[i + 1];

                const restDist = this.width / (this.numPoints - 1);
                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist > 0) {
                    const correction = diff.mul((dist - restDist) / dist * 0.5);

                    if (!p1.fixed) {
                        p1.position = p1.position.add(correction);
                    }
                    if (!p2.fixed) {
                        p2.position = p2.position.sub(correction);
                    }
                }
            }
        }

        // 波動傳遞 - 從中心向兩側
        for (let i = 1; i < this.points.length - 1; i++) {
            const prev = this.points[i - 1];
            const curr = this.points[i];
            const next = this.points[i + 1];

            if (!curr.fixed) {
                const avgY = (prev.position.y + next.position.y) / 2;
                curr.position.y += (avgY - curr.position.y) * 0.1;
            }
        }
    }

    getCenterPoint() {
        return this.points[this.centerIndex];
    }

    pullCenter(targetPos) {
        const center = this.points[this.centerIndex];
        center.position = targetPos.clone();
        center.prevPosition = targetPos.clone();

        // 影響鄰近的點
        for (let i = 1; i <= this.centerIndex; i++) {
            const leftIdx = this.centerIndex - i;
            const rightIdx = this.centerIndex + i;
            const factor = 1 - (i / this.centerIndex);

            if (leftIdx >= 0 && !this.points[leftIdx].fixed) {
                const p = this.points[leftIdx];
                const target = p.restPosition.lerp(targetPos, factor * 0.5);
                p.position = p.position.lerp(target, 0.3);
            }

            if (rightIdx < this.numPoints && !this.points[rightIdx].fixed) {
                const p = this.points[rightIdx];
                const target = p.restPosition.lerp(targetPos, factor * 0.5);
                p.position = p.position.lerp(target, 0.3);
            }
        }
    }

    release() {
        const center = this.getCenterPoint();
        const velocity = center.restPosition.sub(center.position).mul(0.3);
        return {
            position: center.position.clone(),
            velocity: velocity
        };
    }

    draw(ctx) {
        // 繪製橡皮筋陰影
        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y + 5);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].position.x, this.points[i].position.y + 5);
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 繪製橡皮筋主體
        const gradient = ctx.createLinearGradient(
            this.leftX, this.baseY - 20,
            this.leftX, this.baseY + 20
        );
        gradient.addColorStop(0, '#ff7043');
        gradient.addColorStop(0.5, '#ff5722');
        gradient.addColorStop(1, '#e64a19');

        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y);

        // 使用貝塞爾曲線平滑繪製
        for (let i = 1; i < this.points.length - 1; i++) {
            const curr = this.points[i];
            const next = this.points[i + 1];
            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;
            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }
        ctx.lineTo(this.points[this.points.length - 1].position.x,
                   this.points[this.points.length - 1].position.y);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 繪製高光
        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y - 2);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].position.x, this.points[i].position.y - 2);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 繪製固定點（柱子）
        this.drawPost(ctx, this.leftX, this.baseY);
        this.drawPost(ctx, this.rightX, this.baseY);

        // 繪製中心抓取點
        const center = this.getCenterPoint();
        ctx.beginPath();
        ctx.arc(center.position.x, center.position.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.strokeStyle = '#f57f17';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawPost(ctx, x, y) {
        // 柱子底座
        ctx.beginPath();
        ctx.ellipse(x, y + 40, 25, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#5d4037';
        ctx.fill();

        // 柱子主體
        const postGradient = ctx.createLinearGradient(x - 15, y, x + 15, y);
        postGradient.addColorStop(0, '#8d6e63');
        postGradient.addColorStop(0.5, '#6d4c41');
        postGradient.addColorStop(1, '#5d4037');

        ctx.beginPath();
        ctx.moveTo(x - 15, y);
        ctx.lineTo(x - 12, y + 40);
        ctx.lineTo(x + 12, y + 40);
        ctx.lineTo(x + 15, y);
        ctx.closePath();
        ctx.fillStyle = postGradient;
        ctx.fill();

        // 頂部金屬環
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ffc107';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ff8f00';
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

        this.elasticity = 60;
        this.damping = 95;
        this.gravity = 50;

        this.balls = [];
        this.rubberBand = null;

        this.isDragging = false;
        this.isAiming = false;

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
        // 創建橡皮筋在畫布中央偏上位置
        const centerX = this.width / 2;
        const centerY = this.height * 0.3;
        const bandWidth = this.width * 0.4;

        this.rubberBand = new RubberBand(centerX, centerY, bandWidth);
    }

    setupControls() {
        // 彈力滑桿
        const elasticitySlider = document.getElementById('elasticity');
        const elasticityValue = document.getElementById('elasticityValue');
        elasticitySlider.addEventListener('input', (e) => {
            this.elasticity = parseInt(e.target.value);
            elasticityValue.textContent = this.elasticity;
        });

        // 阻尼滑桿
        const dampingSlider = document.getElementById('damping');
        const dampingValue = document.getElementById('dampingValue');
        dampingSlider.addEventListener('input', (e) => {
            this.damping = parseInt(e.target.value);
            dampingValue.textContent = this.damping;
        });

        // 重力滑桿
        const gravitySlider = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravityValue');
        gravitySlider.addEventListener('input', (e) => {
            this.gravity = parseInt(e.target.value);
            gravityValue.textContent = this.gravity;
        });

        // 按鈕
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.rubberBand.reset();
            this.balls = [];
        });

        document.getElementById('addBallBtn').addEventListener('click', () => {
            this.addRandomBall();
        });

        document.getElementById('clearBallsBtn').addEventListener('click', () => {
            this.balls = [];
        });
    }

    addRandomBall() {
        const x = Math.random() * (this.width - 100) + 50;
        const y = 50;
        const vx = (Math.random() - 0.5) * 5;
        const vy = Math.random() * 3;
        this.balls.push(new Ball(x, y, vx, vy));
    }

    setupEvents() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());
        this.canvas.addEventListener('mouseleave', () => this.handlePointerUp());

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.handlePointerUp());

        // 視窗調整
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
        const pos = this.getPointerPos(e);
        const center = this.rubberBand.getCenterPoint();
        const dist = Vector2.dist(pos, center.position);

        if (dist < 30) {
            this.isDragging = true;
            this.isAiming = true;
        }
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;

        const pos = this.getPointerPos(e);
        this.rubberBand.pullCenter(pos);
    }

    handlePointerUp() {
        if (this.isDragging && this.isAiming) {
            const launch = this.rubberBand.release();

            // 只有當拉力足夠時才發射球
            if (launch.velocity.length() > 2) {
                const ball = new Ball(
                    launch.position.x,
                    launch.position.y,
                    launch.velocity.x,
                    launch.velocity.y
                );
                this.balls.push(ball);
            }
        }

        this.isDragging = false;
        this.isAiming = false;
    }

    update() {
        // 更新橡皮筋
        this.rubberBand.update(this.elasticity, this.damping, this.gravity);

        // 更新球
        const ballGravity = this.gravity * 0.02;
        const ballDamping = 0.999;

        for (const ball of this.balls) {
            ball.update(ballGravity, ballDamping, this.width, this.height);
        }

        // 球之間的碰撞
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.resolveBallCollision(this.balls[i], this.balls[j]);
            }
        }

        // 移除太慢的球（已停止）
        this.balls = this.balls.filter(ball =>
            ball.velocity.length() > 0.1 ||
            ball.position.y < this.height - ball.radius - 5
        );
    }

    resolveBallCollision(a, b) {
        const diff = b.position.sub(a.position);
        const dist = diff.length();
        const minDist = a.radius + b.radius;

        if (dist < minDist && dist > 0) {
            const normal = diff.normalize();
            const overlap = minDist - dist;

            // 分離
            a.position = a.position.sub(normal.mul(overlap * 0.5));
            b.position = b.position.add(normal.mul(overlap * 0.5));

            // 速度交換（彈性碰撞）
            const relVel = a.velocity.sub(b.velocity);
            const velAlongNormal = relVel.dot(normal);

            if (velAlongNormal > 0) return;

            const restitution = 0.8;
            const impulse = -(1 + restitution) * velAlongNormal / 2;

            a.velocity = a.velocity.add(normal.mul(impulse));
            b.velocity = b.velocity.sub(normal.mul(impulse));
        }
    }

    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景裝飾
        this.drawBackground();

        // 繪製瞄準線（如果正在拉）
        if (this.isAiming) {
            this.drawAimLine();
        }

        // 繪製橡皮筋
        this.rubberBand.draw(this.ctx);

        // 繪製球
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }

        // 繪製得分區域提示
        this.drawTargetZones();
    }

    drawBackground() {
        // 草地
        const grassGradient = this.ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
        grassGradient.addColorStop(0, '#81c784');
        grassGradient.addColorStop(1, '#4caf50');

        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);

        // 草的細節
        this.ctx.strokeStyle = '#66bb6a';
        this.ctx.lineWidth = 2;
        for (let x = 0; x < this.width; x += 15) {
            const baseY = this.height * 0.7;
            this.ctx.beginPath();
            this.ctx.moveTo(x, baseY);
            this.ctx.quadraticCurveTo(
                x + 5, baseY - 15,
                x + 10, baseY
            );
            this.ctx.stroke();
        }
    }

    drawAimLine() {
        const center = this.rubberBand.getCenterPoint();
        const restPos = center.restPosition;

        // 計算預測軌跡
        const vel = restPos.sub(center.position).mul(0.3);
        let pos = center.position.clone();
        let v = vel.clone();
        const gravity = this.gravity * 0.02;

        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.setLineDash([5, 5]);

        for (let i = 0; i < 30; i++) {
            v.y += gravity;
            v = v.mul(0.99);
            pos = pos.add(v);

            if (pos.y > this.height) break;
            this.ctx.lineTo(pos.x, pos.y);
        }

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawTargetZones() {
        // 繪製一些目標區域
        const targets = [
            { x: this.width * 0.2, y: this.height * 0.6, size: 30 },
            { x: this.width * 0.8, y: this.height * 0.5, size: 25 },
            { x: this.width * 0.5, y: this.height * 0.8, size: 35 }
        ];

        for (const target of targets) {
            // 外圈
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // 內圈
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size * 0.5, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 中心
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 啟動
window.addEventListener('load', () => {
    new App();
});
