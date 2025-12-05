/**
 * 彈跳城堡 - Bouncy Castle
 * 充氣城堡物理模擬
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

// 城堡節點
class CastlePoint {
    constructor(x, y, fixed = false) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.fixed = fixed;
    }

    update(gravity, damping) {
        if (this.fixed) return;

        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel).add(new Vector2(0, gravity));
    }

    applyForce(force) {
        if (this.fixed) return;
        this.position = this.position.add(force);
    }
}

// 彈跳球
class BouncyBall {
    constructor(x, y, radius = 20) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = radius;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
    }

    update(gravity, damping, width, height, groundY) {
        this.velocity.y += gravity;
        this.velocity = this.velocity.mul(damping);
        this.position = this.position.add(this.velocity);

        // 邊界
        if (this.position.x - this.radius < 0) {
            this.position.x = this.radius;
            this.velocity.x *= -0.8;
        }
        if (this.position.x + this.radius > width) {
            this.position.x = width - this.radius;
            this.velocity.x *= -0.8;
        }
        if (this.position.y + this.radius > groundY) {
            this.position.y = groundY - this.radius;
            this.velocity.y *= -0.8;
        }
    }

    bounceOnSurface(surfaceY, bounceStrength) {
        if (this.position.y + this.radius > surfaceY && this.velocity.y > 0) {
            this.position.y = surfaceY - this.radius;
            this.velocity.y = -Math.abs(this.velocity.y) * bounceStrength;
            this.velocity.x += (Math.random() - 0.5) * 2;
            return true;
        }
        return false;
    }

    draw(ctx) {
        // 陰影
        ctx.beginPath();
        ctx.ellipse(this.position.x, this.position.y + this.radius + 5, this.radius * 0.8, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // 球體
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
        gradient.addColorStop(1, this.color.replace('60%', '40%'));

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// 充氣城堡
class BouncyCastle {
    constructor(x, y, width, height) {
        this.baseX = x;
        this.baseY = y;
        this.width = width;
        this.height = height;

        this.points = [];
        this.links = [];
        this.towers = [];

        this.initStructure();
    }

    initStructure() {
        this.points = [];
        this.links = [];

        const cols = 12;
        const rows = 6;

        // 創建主體網格
        for (let row = 0; row <= rows; row++) {
            for (let col = 0; col <= cols; col++) {
                const x = this.baseX - this.width / 2 + (col / cols) * this.width;
                const y = this.baseY - this.height + (row / rows) * this.height;

                // 底部固定
                const fixed = row === rows;
                this.points.push(new CastlePoint(x, y, fixed));
            }
        }

        const colCount = cols + 1;

        // 水平連結
        for (let row = 0; row <= rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + 1);
            }
        }

        // 垂直連結
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + colCount);
            }
        }

        // 對角連結
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx = row * colCount + col;
                this.addLink(idx, idx + colCount + 1);
                this.addLink(idx + 1, idx + colCount);
            }
        }

        // 創建塔樓
        this.createTowers();
    }

    createTowers() {
        this.towers = [];

        // 左塔
        this.towers.push({
            baseIdx: 0,
            points: this.createTower(this.baseX - this.width / 2 + 30, this.baseY - this.height - 60, 40, 80)
        });

        // 右塔
        this.towers.push({
            baseIdx: 12,
            points: this.createTower(this.baseX + this.width / 2 - 30, this.baseY - this.height - 60, 40, 80)
        });
    }

    createTower(x, y, width, height) {
        const points = [];
        const segments = 8;

        // 塔身
        for (let i = 0; i <= segments; i++) {
            const ratio = i / segments;
            const py = y + ratio * height;
            const pw = width * (1 - ratio * 0.2); // 上窄下寬

            points.push({
                left: new CastlePoint(x - pw / 2, py, i === segments),
                right: new CastlePoint(x + pw / 2, py, i === segments)
            });
        }

        // 塔頂
        points.push({
            top: new CastlePoint(x, y - 20, false)
        });

        return points;
    }

    addLink(a, b) {
        if (a >= 0 && b >= 0 && a < this.points.length && b < this.points.length) {
            const dist = Vector2.dist(this.points[a].position, this.points[b].position);
            this.links.push({ a, b, restLength: dist });
        }
    }

    update(inflation, bounce, gravity) {
        const grav = gravity * 0.015;
        const damp = 0.98;
        const stiffness = bounce * 0.004;
        const pressure = inflation * 0.002;

        // 更新點位置
        for (const point of this.points) {
            point.update(grav, damp);
        }

        // 更新塔樓
        for (const tower of this.towers) {
            for (const layer of tower.points) {
                if (layer.left) layer.left.update(grav, damp);
                if (layer.right) layer.right.update(grav, damp);
                if (layer.top) layer.top.update(grav * 0.5, damp);
            }
        }

        // 約束迭代
        for (let iter = 0; iter < 4; iter++) {
            // 連結約束
            for (const link of this.links) {
                const p1 = this.points[link.a];
                const p2 = this.points[link.b];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist > 0) {
                    const displacement = (dist - link.restLength) / dist;
                    const correction = diff.mul(displacement * 0.5 * stiffness);

                    p1.applyForce(correction);
                    p2.applyForce(correction.mul(-1));
                }
            }

            // 充氣壓力 - 向上推
            for (const point of this.points) {
                if (!point.fixed) {
                    point.applyForce(new Vector2(0, -pressure));
                }
            }

            // 形狀恢復
            for (const point of this.points) {
                if (!point.fixed) {
                    const toRest = point.restPosition.sub(point.position);
                    point.applyForce(toRest.mul(stiffness * 0.5));
                }
            }
        }

        // 更新塔樓約束
        this.updateTowers(stiffness, pressure);
    }

    updateTowers(stiffness, pressure) {
        for (const tower of this.towers) {
            const points = tower.points;

            for (let i = 0; i < points.length - 1; i++) {
                const layer = points[i];
                const nextLayer = points[i + 1];

                if (layer.left && layer.right) {
                    // 保持寬度
                    const leftRight = layer.right.position.sub(layer.left.position);
                    const currentWidth = leftRight.length();
                    const targetWidth = 40 * (1 - i * 0.02);

                    if (currentWidth > 0) {
                        const correction = leftRight.normalize().mul((currentWidth - targetWidth) * 0.5 * stiffness);
                        layer.left.applyForce(correction);
                        layer.right.applyForce(correction.mul(-1));
                    }

                    // 向上壓力
                    layer.left.applyForce(new Vector2(0, -pressure * 0.5));
                    layer.right.applyForce(new Vector2(0, -pressure * 0.5));
                }

                if (layer.top) {
                    layer.top.applyForce(new Vector2(0, -pressure));
                }
            }
        }
    }

    bounce(x, y, strength) {
        for (const point of this.points) {
            const dist = Vector2.dist(point.position, new Vector2(x, y));
            if (dist < 100) {
                const factor = 1 - dist / 100;
                point.applyForce(new Vector2(0, -strength * factor));
            }
        }

        // 塔樓也彈跳
        for (const tower of this.towers) {
            for (const layer of tower.points) {
                if (layer.left) layer.left.applyForce(new Vector2(0, -strength * 0.3));
                if (layer.right) layer.right.applyForce(new Vector2(0, -strength * 0.3));
                if (layer.top) layer.top.applyForce(new Vector2(0, -strength * 0.5));
            }
        }
    }

    getSurfaceY(x) {
        // 找到對應 x 位置的表面高度
        const cols = 12;
        const colWidth = this.width / cols;
        const startX = this.baseX - this.width / 2;

        const col = Math.floor((x - startX) / colWidth);
        if (col < 0 || col >= cols) return this.baseY;

        const idx = col;
        if (idx >= 0 && idx < this.points.length) {
            return this.points[idx].position.y;
        }
        return this.baseY - this.height;
    }

    draw(ctx) {
        // 繪製城堡陰影
        ctx.beginPath();
        ctx.ellipse(this.baseX, this.baseY + 10, this.width / 2 + 20, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // 繪製城堡主體
        this.drawMainBody(ctx);

        // 繪製塔樓
        this.drawTowers(ctx);

        // 繪製裝飾
        this.drawDecorations(ctx);
    }

    drawMainBody(ctx) {
        const cols = 12;
        const rows = 6;
        const colCount = cols + 1;

        // 漸層
        const gradient = ctx.createLinearGradient(
            this.baseX - this.width / 2, this.baseY - this.height,
            this.baseX + this.width / 2, this.baseY
        );
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.5, '#e91e63');
        gradient.addColorStop(1, '#c2185b');

        // 繪製填充
        ctx.beginPath();

        // 頂部
        for (let col = 0; col <= cols; col++) {
            const p = this.points[col].position;
            if (col === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }

        // 右側
        for (let row = 0; row <= rows; row++) {
            const p = this.points[row * colCount + cols].position;
            ctx.lineTo(p.x, p.y);
        }

        // 底部
        for (let col = cols; col >= 0; col--) {
            const p = this.points[rows * colCount + col].position;
            ctx.lineTo(p.x, p.y);
        }

        // 左側
        for (let row = rows; row >= 0; row--) {
            const p = this.points[row * colCount].position;
            ctx.lineTo(p.x, p.y);
        }

        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 繪製網格線（充氣縫線效果）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        // 水平線
        for (let row = 1; row < rows; row++) {
            ctx.beginPath();
            for (let col = 0; col <= cols; col++) {
                const p = this.points[row * colCount + col].position;
                if (col === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // 垂直線
        for (let col = 1; col < cols; col++) {
            ctx.beginPath();
            for (let row = 0; row <= rows; row++) {
                const p = this.points[row * colCount + col].position;
                if (row === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
            ctx.stroke();
        }

        // 高光
        ctx.beginPath();
        for (let col = 0; col <= cols; col++) {
            const p = this.points[col].position;
            if (col === 0) {
                ctx.moveTo(p.x, p.y + 5);
            } else {
                ctx.lineTo(p.x, p.y + 5);
            }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    drawTowers(ctx) {
        for (const tower of this.towers) {
            const points = tower.points;

            // 塔身漸層
            const gradient = ctx.createLinearGradient(
                points[0].left ? points[0].left.position.x - 20 : 0,
                points[0].left ? points[0].left.position.y : 0,
                points[0].right ? points[0].right.position.x + 20 : 0,
                points[points.length - 2].left ? points[points.length - 2].left.position.y : 0
            );
            gradient.addColorStop(0, '#7c4dff');
            gradient.addColorStop(0.5, '#651fff');
            gradient.addColorStop(1, '#6200ea');

            // 繪製塔身
            ctx.beginPath();

            // 左側
            for (let i = 0; i < points.length - 1; i++) {
                const layer = points[i];
                if (layer.left) {
                    if (i === 0) {
                        ctx.moveTo(layer.left.position.x, layer.left.position.y);
                    } else {
                        ctx.lineTo(layer.left.position.x, layer.left.position.y);
                    }
                }
            }

            // 右側（反向）
            for (let i = points.length - 2; i >= 0; i--) {
                const layer = points[i];
                if (layer.right) {
                    ctx.lineTo(layer.right.position.x, layer.right.position.y);
                }
            }

            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // 塔頂
            if (points[points.length - 1].top) {
                const top = points[points.length - 1].top.position;
                const base = points[0];

                if (base.left && base.right) {
                    ctx.beginPath();
                    ctx.moveTo(base.left.position.x, base.left.position.y);
                    ctx.lineTo(top.x, top.y);
                    ctx.lineTo(base.right.position.x, base.right.position.y);
                    ctx.closePath();

                    const topGradient = ctx.createLinearGradient(
                        base.left.position.x, top.y,
                        base.right.position.x, base.left.position.y
                    );
                    topGradient.addColorStop(0, '#ffeb3b');
                    topGradient.addColorStop(1, '#ffc107');

                    ctx.fillStyle = topGradient;
                    ctx.fill();
                }
            }

            // 塔樓窗戶
            const midLayer = points[Math.floor(points.length / 2)];
            if (midLayer.left && midLayer.right) {
                const centerX = (midLayer.left.position.x + midLayer.right.position.x) / 2;
                const centerY = midLayer.left.position.y;

                ctx.beginPath();
                ctx.arc(centerX, centerY - 10, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#1a237e';
                ctx.fill();
                ctx.strokeStyle = '#ffc107';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    drawDecorations(ctx) {
        // 城門
        const gateX = this.baseX;
        const gateY = this.baseY;
        const gateWidth = 50;
        const gateHeight = 60;

        ctx.beginPath();
        ctx.moveTo(gateX - gateWidth / 2, gateY);
        ctx.lineTo(gateX - gateWidth / 2, gateY - gateHeight + 15);
        ctx.arc(gateX, gateY - gateHeight + 15, gateWidth / 2, Math.PI, 0);
        ctx.lineTo(gateX + gateWidth / 2, gateY);
        ctx.closePath();

        ctx.fillStyle = '#1a237e';
        ctx.fill();
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 旗幟
        const flagX = this.baseX;
        const flagY = this.baseY - this.height - 30;

        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        ctx.lineTo(flagX, flagY - 40);
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 旗面
        const time = Date.now() * 0.003;
        ctx.beginPath();
        ctx.moveTo(flagX, flagY - 40);
        ctx.quadraticCurveTo(flagX + 15 + Math.sin(time) * 5, flagY - 35, flagX + 25, flagY - 30);
        ctx.quadraticCurveTo(flagX + 15 + Math.sin(time + 1) * 5, flagY - 25, flagX, flagY - 20);
        ctx.closePath();

        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
    }

    reset() {
        this.initStructure();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.inflation = 70;
        this.bounce = 80;
        this.gravity = 50;

        this.castle = null;
        this.balls = [];
        this.groundY = 0;

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
        this.groundY = this.height * 0.85;
    }

    init() {
        const centerX = this.width / 2;
        const castleY = this.groundY;

        this.castle = new BouncyCastle(centerX, castleY, 300, 120);
        this.balls = [];
    }

    setupControls() {
        const inflationSlider = document.getElementById('inflation');
        const inflationValue = document.getElementById('inflationValue');
        inflationSlider.addEventListener('input', (e) => {
            this.inflation = parseInt(e.target.value);
            inflationValue.textContent = this.inflation;
        });

        const bounceSlider = document.getElementById('bounce');
        const bounceValue = document.getElementById('bounceValue');
        bounceSlider.addEventListener('input', (e) => {
            this.bounce = parseInt(e.target.value);
            bounceValue.textContent = this.bounce;
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

        document.getElementById('jumpBtn').addEventListener('click', () => {
            this.castle.bounce(this.width / 2, this.groundY - 60, 25);
        });

        document.getElementById('addBallBtn').addEventListener('click', () => {
            this.addBall();
        });
    }

    addBall() {
        const x = this.width / 2 + (Math.random() - 0.5) * 200;
        const y = 50;
        this.balls.push(new BouncyBall(x, y, 15 + Math.random() * 10));
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.init();
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 點擊城堡區域產生彈跳
        if (y > this.groundY - 150 && y < this.groundY) {
            this.castle.bounce(x, y, 20);
        }
    }

    update() {
        this.castle.update(this.inflation, this.bounce, this.gravity);

        const ballGravity = this.gravity * 0.02;
        const bounceStrength = this.bounce * 0.012;

        for (const ball of this.balls) {
            ball.update(ballGravity, 0.99, this.width, this.height, this.groundY);

            // 在城堡上彈跳
            const surfaceY = this.castle.getSurfaceY(ball.position.x);
            if (ball.bounceOnSurface(surfaceY, bounceStrength)) {
                // 城堡也反彈
                this.castle.bounce(ball.position.x, surfaceY, 5);
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景
        this.drawBackground();

        // 繪製城堡
        this.castle.draw(this.ctx);

        // 繪製球
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }
    }

    drawBackground() {
        // 天空
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.groundY);
        skyGradient.addColorStop(0, '#81d4fa');
        skyGradient.addColorStop(1, '#b3e5fc');

        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.width, this.groundY);

        // 雲朵
        this.drawCloud(100, 80, 40);
        this.drawCloud(this.width - 150, 60, 35);
        this.drawCloud(this.width / 2 + 50, 100, 30);

        // 草地
        const grassGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
        grassGradient.addColorStop(0, '#66bb6a');
        grassGradient.addColorStop(1, '#43a047');

        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    }

    drawCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y + size * 0.3, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
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
