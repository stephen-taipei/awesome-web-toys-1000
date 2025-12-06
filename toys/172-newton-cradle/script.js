/**
 * 牛頓擺 - Newton's Cradle
 * 動量守恆與能量傳遞的經典演示
 */

class Ball {
    constructor(x, y, radius, pivotX, pivotY, stringLength) {
        this.pivotX = pivotX;
        this.pivotY = pivotY;
        this.stringLength = stringLength;
        this.radius = radius;
        this.mass = 1;

        // 用角度和角速度來模擬
        this.angle = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;

        // 計算位置
        this.updatePosition();

        // 拖曳狀態
        this.dragging = false;
        this.velocity = 0; // 線速度（用於碰撞）
    }

    updatePosition() {
        this.x = this.pivotX + Math.sin(this.angle) * this.stringLength;
        this.y = this.pivotY + Math.cos(this.angle) * this.stringLength;
    }

    update(gravity, damping) {
        if (this.dragging) return;

        // 單擺運動方程
        this.angularAcceleration = -gravity * Math.sin(this.angle);

        // 阻尼
        this.angularVelocity += this.angularAcceleration;
        this.angularVelocity *= (1 - damping);

        this.angle += this.angularVelocity;

        // 更新線速度
        this.velocity = this.angularVelocity * this.stringLength;

        this.updatePosition();
    }

    draw(ctx) {
        // 繪製細繩（雙線）
        ctx.save();

        const ropeOffset = 3;
        const perpX = Math.cos(this.angle);
        const perpY = -Math.sin(this.angle);

        // 左繩
        ctx.beginPath();
        ctx.moveTo(this.pivotX - perpX * ropeOffset, this.pivotY - perpY * ropeOffset);
        ctx.lineTo(this.x - perpX * ropeOffset, this.y - this.radius - perpY * ropeOffset);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 右繩
        ctx.beginPath();
        ctx.moveTo(this.pivotX + perpX * ropeOffset, this.pivotY + perpY * ropeOffset);
        ctx.lineTo(this.x + perpX * ropeOffset, this.y - this.radius + perpY * ropeOffset);
        ctx.stroke();

        ctx.restore();

        // 繪製金屬球
        ctx.save();

        // 球體漸層
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, '#e0e0e0');
        gradient.addColorStop(0.5, '#a0a0a0');
        gradient.addColorStop(0.8, '#606060');
        gradient.addColorStop(1, '#404040');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 球體陰影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // 高光
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.35,
            this.y - this.radius * 0.35,
            this.radius * 0.25,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // 次高光
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.15,
            this.y - this.radius * 0.15,
            this.radius * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.restore();
    }

    contains(px, py) {
        const dx = px - this.x;
        const dy = py - this.y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }

    setAngleFromPosition(px, py) {
        const dx = px - this.pivotX;
        const dy = py - this.pivotY;
        this.angle = Math.atan2(dx, dy);
        this.angularVelocity = 0;
        this.updatePosition();
    }
}

class NewtonCradle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.balls = [];
        this.ballCount = 5;
        this.gravity = 0.002;
        this.damping = 0.001;
        this.draggedBall = null;
        this.lastMousePos = null;

        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;

        // 支架尺寸
        this.frameTop = this.height * 0.12;
        this.stringLength = this.height * 0.5;
        this.ballRadius = Math.min(this.width / 20, 30);
    }

    init() {
        this.balls = [];

        const spacing = this.ballRadius * 2.02; // 微小間隙
        const totalWidth = spacing * (this.ballCount - 1);
        const startX = (this.width - totalWidth) / 2;

        for (let i = 0; i < this.ballCount; i++) {
            const pivotX = startX + i * spacing;
            const pivotY = this.frameTop;
            const ball = new Ball(
                pivotX,
                pivotY + this.stringLength,
                this.ballRadius,
                pivotX,
                pivotY,
                this.stringLength
            );
            this.balls.push(ball);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseDown(touch);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch);
        });
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());

        // 控制項
        document.getElementById('ballCount').addEventListener('input', (e) => {
            this.ballCount = parseInt(e.target.value);
            document.getElementById('ballCountValue').textContent = this.ballCount;
            this.init();
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.gravity = val * 0.00003;
            document.getElementById('gravityValue').textContent = val;
        });

        document.getElementById('damping').addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.damping = val * 0.0002;
            document.getElementById('dampingValue').textContent = val + '%';
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
        document.getElementById('pullOneBtn').addEventListener('click', () => this.pullBalls(1));
        document.getElementById('pullTwoBtn').addEventListener('click', () => this.pullBalls(2));
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 只能拖曳最左或最右的球
        const leftBall = this.balls[0];
        const rightBall = this.balls[this.balls.length - 1];

        if (leftBall.contains(x, y)) {
            this.draggedBall = leftBall;
            leftBall.dragging = true;
        } else if (rightBall.contains(x, y)) {
            this.draggedBall = rightBall;
            rightBall.dragging = true;
        }

        this.lastMousePos = { x, y };
    }

    handleMouseMove(e) {
        if (!this.draggedBall) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 限制角度範圍
        const dx = x - this.draggedBall.pivotX;
        const dy = y - this.draggedBall.pivotY;
        let angle = Math.atan2(dx, dy);

        // 限制拉動角度
        const maxAngle = Math.PI * 0.4;
        const isLeftBall = this.draggedBall === this.balls[0];

        if (isLeftBall) {
            angle = Math.max(-maxAngle, Math.min(0, angle));
        } else {
            angle = Math.min(maxAngle, Math.max(0, angle));
        }

        this.draggedBall.angle = angle;
        this.draggedBall.updatePosition();

        // 計算釋放速度
        if (this.lastMousePos) {
            const dt = 1 / 60;
            const mouseVelX = (x - this.lastMousePos.x) / dt;
            this.draggedBall.angularVelocity = mouseVelX * 0.00001;
        }

        this.lastMousePos = { x, y };
    }

    handleMouseUp() {
        if (this.draggedBall) {
            this.draggedBall.dragging = false;
            this.draggedBall = null;
        }
    }

    pullBalls(count) {
        // 重置所有球
        this.balls.forEach(ball => {
            ball.angle = 0;
            ball.angularVelocity = 0;
            ball.updatePosition();
        });

        // 拉左邊的球
        const pullAngle = -Math.PI * 0.35;
        for (let i = 0; i < count && i < this.balls.length; i++) {
            this.balls[i].angle = pullAngle;
            this.balls[i].updatePosition();
        }
    }

    update() {
        // 更新每個球
        this.balls.forEach(ball => {
            ball.update(this.gravity, this.damping);
        });

        // 碰撞檢測
        this.handleCollisions();
    }

    handleCollisions() {
        for (let i = 0; i < this.balls.length - 1; i++) {
            const ball1 = this.balls[i];
            const ball2 = this.balls[i + 1];

            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = ball1.radius + ball2.radius;

            if (dist < minDist) {
                // 彈性碰撞 - 動量傳遞
                // 對於相同質量的球，速度完全交換

                // 計算碰撞法線
                const nx = dx / dist;
                const ny = dy / dist;

                // 相對速度
                const v1 = ball1.angularVelocity * ball1.stringLength;
                const v2 = ball2.angularVelocity * ball2.stringLength;

                // 沿碰撞法線的速度分量
                const v1n = v1 * nx;
                const v2n = v2 * nx;

                // 只有當球靠近時才處理碰撞
                if (v1n - v2n > 0) {
                    // 完美彈性碰撞 - 交換速度
                    const restitution = 0.98; // 恢復係數

                    ball1.angularVelocity = (v2n * restitution) / ball1.stringLength;
                    ball2.angularVelocity = (v1n * restitution) / ball2.stringLength;

                    // 分離球體
                    const overlap = minDist - dist;
                    ball1.angle -= overlap / ball1.stringLength * 0.5 * nx;
                    ball2.angle += overlap / ball2.stringLength * 0.5 * nx;

                    ball1.updatePosition();
                    ball2.updatePosition();
                }
            }
        }
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#0a0a14';
        ctx.fillRect(0, 0, this.width, this.height);

        // 繪製支架
        this.drawFrame();

        // 繪製球（按從後到前的順序）
        this.balls.forEach(ball => ball.draw(ctx));

        // 繪製底座反光
        this.drawReflection();
    }

    drawFrame() {
        const ctx = this.ctx;
        const frameWidth = this.ballRadius * 2 * this.ballCount + 80;
        const frameLeft = (this.width - frameWidth) / 2;
        const frameRight = frameLeft + frameWidth;

        ctx.save();

        // 頂部橫桿
        const barGradient = ctx.createLinearGradient(0, this.frameTop - 15, 0, this.frameTop + 5);
        barGradient.addColorStop(0, '#555');
        barGradient.addColorStop(0.5, '#888');
        barGradient.addColorStop(1, '#444');

        ctx.fillStyle = barGradient;
        ctx.beginPath();
        ctx.roundRect(frameLeft, this.frameTop - 10, frameWidth, 15, 5);
        ctx.fill();

        // 左支柱
        this.drawPillar(ctx, frameLeft + 20, this.frameTop, 60);

        // 右支柱
        this.drawPillar(ctx, frameRight - 20, this.frameTop, 60);

        // 底座
        const baseY = this.height * 0.88;
        const baseWidth = frameWidth + 40;
        const baseLeft = (this.width - baseWidth) / 2;

        const baseGradient = ctx.createLinearGradient(0, baseY, 0, baseY + 25);
        baseGradient.addColorStop(0, '#444');
        baseGradient.addColorStop(0.5, '#333');
        baseGradient.addColorStop(1, '#222');

        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.roundRect(baseLeft, baseY, baseWidth, 25, 8);
        ctx.fill();

        ctx.restore();
    }

    drawPillar(ctx, x, topY, height) {
        const pillarWidth = 12;
        const bottomY = this.height * 0.88;

        const gradient = ctx.createLinearGradient(x - pillarWidth / 2, 0, x + pillarWidth / 2, 0);
        gradient.addColorStop(0, '#444');
        gradient.addColorStop(0.3, '#666');
        gradient.addColorStop(0.5, '#777');
        gradient.addColorStop(0.7, '#666');
        gradient.addColorStop(1, '#444');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x - pillarWidth / 2, topY, pillarWidth, bottomY - topY, 3);
        ctx.fill();
    }

    drawReflection() {
        const ctx = this.ctx;
        const reflectionY = this.height * 0.85;

        ctx.save();

        // 反射區域裁剪
        ctx.beginPath();
        ctx.rect(0, reflectionY, this.width, this.height - reflectionY);
        ctx.clip();

        // 半透明倒影
        ctx.globalAlpha = 0.15;
        ctx.translate(0, reflectionY * 2);
        ctx.scale(1, -1);

        this.balls.forEach(ball => {
            // 簡化的倒影
            const gradient = ctx.createRadialGradient(
                ball.x, ball.y, 0,
                ball.x, ball.y, ball.radius
            );
            gradient.addColorStop(0, '#aaa');
            gradient.addColorStop(1, '#444');

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        ctx.restore();

        // 漸層遮罩
        const fadeGradient = ctx.createLinearGradient(0, reflectionY, 0, this.height);
        fadeGradient.addColorStop(0, 'rgba(10, 10, 20, 0)');
        fadeGradient.addColorStop(1, 'rgba(10, 10, 20, 1)');

        ctx.fillStyle = fadeGradient;
        ctx.fillRect(0, reflectionY, this.width, this.height - reflectionY);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    new NewtonCradle(canvas);
});
