/**
 * 氣球動物 - Balloon Animal
 * 氣球狗物理模擬
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
    clone() { return new Vector2(this.x, this.y); }
    static dist(a, b) { return a.sub(b).length(); }
}

// 氣球節點
class BalloonPoint {
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

// 氣球段
class BalloonSegment {
    constructor(centerX, centerY, width, height, angle, segments = 8) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.points = [];
        this.segments = segments;

        this.initPoints();
    }

    initPoints() {
        this.points = [];
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);

        for (let i = 0; i < this.segments; i++) {
            const t = (i / this.segments) * Math.PI * 2;
            const localX = Math.cos(t) * this.width;
            const localY = Math.sin(t) * this.height;

            const x = this.centerX + localX * cos - localY * sin;
            const y = this.centerY + localX * sin + localY * cos;

            const point = new BalloonPoint(x, y);
            point.restOffset = new Vector2(
                localX * cos - localY * sin,
                localX * sin + localY * cos
            );
            this.points.push(point);
        }
    }

    update(pressure, elasticity, damping) {
        const stiffness = elasticity * 0.004;

        for (const point of this.points) {
            point.update(damping);
        }

        // 形狀約束
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];

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

        // 壓力
        const pressureForce = pressure * 0.002;
        for (const point of this.points) {
            const toCenter = new Vector2(this.centerX, this.centerY).sub(point.position);
            const dist = toCenter.length();
            const targetDist = (this.width + this.height) / 2;

            const correction = toCenter.normalize().mul((dist - targetDist) * pressureForce);
            point.applyForce(correction.mul(-1));
        }
    }

    updateCenter() {
        let cx = 0, cy = 0;
        for (const point of this.points) {
            cx += point.position.x;
            cy += point.position.y;
        }
        this.centerX = cx / this.points.length;
        this.centerY = cy / this.points.length;
    }

    draw(ctx, color) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y);

        for (let i = 0; i < this.points.length; i++) {
            const curr = this.points[i];
            const next = this.points[(i + 1) % this.points.length];
            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;
            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();

        // 漸層
        const gradient = ctx.createRadialGradient(
            this.centerX - this.width * 0.3,
            this.centerY - this.height * 0.3,
            0,
            this.centerX,
            this.centerY,
            Math.max(this.width, this.height) * 1.2
        );
        gradient.addColorStop(0, color.light);
        gradient.addColorStop(0.5, color.main);
        gradient.addColorStop(1, color.dark);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.ellipse(
            this.centerX - this.width * 0.2,
            this.centerY - this.height * 0.2,
            this.width * 0.3,
            this.height * 0.15,
            this.angle - 0.3,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
}

// 氣球狗
class BalloonDog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = new Vector2();

        this.colors = [
            { main: '#e91e63', light: '#ff6090', dark: '#b0003a' },
            { main: '#2196f3', light: '#6ec6ff', dark: '#0069c0' },
            { main: '#4caf50', light: '#80e27e', dark: '#087f23' },
            { main: '#ff9800', light: '#ffc947', dark: '#c66900' },
            { main: '#9c27b0', light: '#d05ce3', dark: '#6a0080' }
        ];
        this.colorIndex = 0;

        this.segments = [];
        this.initSegments();
    }

    get color() {
        return this.colors[this.colorIndex];
    }

    initSegments() {
        this.segments = [];

        // 身體
        this.segments.push(new BalloonSegment(this.x, this.y, 50, 25, 0, 10));

        // 頭
        this.segments.push(new BalloonSegment(this.x - 70, this.y - 10, 30, 25, -0.3, 8));

        // 鼻子
        this.segments.push(new BalloonSegment(this.x - 110, this.y - 5, 20, 15, -0.2, 6));

        // 耳朵
        this.segments.push(new BalloonSegment(this.x - 60, this.y - 45, 12, 20, -0.5, 6));
        this.segments.push(new BalloonSegment(this.x - 80, this.y - 40, 12, 20, -0.8, 6));

        // 前腿
        this.segments.push(new BalloonSegment(this.x - 35, this.y + 45, 12, 25, Math.PI / 2, 6));
        this.segments.push(new BalloonSegment(this.x - 15, this.y + 45, 12, 25, Math.PI / 2, 6));

        // 後腿
        this.segments.push(new BalloonSegment(this.x + 35, this.y + 45, 12, 25, Math.PI / 2, 6));
        this.segments.push(new BalloonSegment(this.x + 55, this.y + 45, 12, 25, Math.PI / 2, 6));

        // 尾巴
        this.segments.push(new BalloonSegment(this.x + 80, this.y - 15, 10, 20, 0.5, 6));
    }

    update(pressure, elasticity, gravity, groundY) {
        const damping = 0.96;
        const grav = gravity * 0.01;

        // 整體重力與移動
        this.velocity.y += grav;
        this.velocity = this.velocity.mul(0.98);

        // 移動所有段
        for (const segment of this.segments) {
            for (const point of segment.points) {
                point.position = point.position.add(this.velocity);
                point.prevPosition = point.prevPosition.add(this.velocity);
            }
            segment.centerX += this.velocity.x;
            segment.centerY += this.velocity.y;
        }

        // 更新每個段
        for (const segment of this.segments) {
            segment.update(pressure, elasticity, damping);
        }

        // 段之間的連結約束
        this.constrainSegments(elasticity);

        // 地面約束
        let onGround = false;
        for (const segment of this.segments) {
            for (const point of segment.points) {
                if (point.position.y > groundY) {
                    point.position.y = groundY;
                    onGround = true;
                }
            }
            segment.updateCenter();
        }

        if (onGround) {
            this.velocity.y *= -0.5;
            this.velocity.x *= 0.9;
        }

        // 更新整體位置
        this.x = this.segments[0].centerX;
        this.y = this.segments[0].centerY;
    }

    constrainSegments(elasticity) {
        const stiffness = elasticity * 0.01;

        // 頭連接身體
        this.connectSegments(0, 1, -50, 0, stiffness);

        // 鼻子連接頭
        this.connectSegments(1, 2, -30, 5, stiffness);

        // 耳朵連接頭
        this.connectSegments(1, 3, 10, -35, stiffness);
        this.connectSegments(1, 4, -10, -30, stiffness);

        // 前腿連接身體
        this.connectSegments(0, 5, -25, 35, stiffness);
        this.connectSegments(0, 6, -5, 35, stiffness);

        // 後腿連接身體
        this.connectSegments(0, 7, 25, 35, stiffness);
        this.connectSegments(0, 8, 45, 35, stiffness);

        // 尾巴連接身體
        this.connectSegments(0, 9, 55, -10, stiffness);
    }

    connectSegments(idx1, idx2, offsetX, offsetY, stiffness) {
        const seg1 = this.segments[idx1];
        const seg2 = this.segments[idx2];

        const targetX = seg1.centerX + offsetX;
        const targetY = seg1.centerY + offsetY;

        const dx = targetX - seg2.centerX;
        const dy = targetY - seg2.centerY;

        for (const point of seg2.points) {
            point.applyForce(new Vector2(dx * stiffness, dy * stiffness));
        }
    }

    bounce() {
        this.velocity.y = -8;
        this.velocity.x = (Math.random() - 0.5) * 4;
    }

    nextColor() {
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
    }

    push(x, y, strength) {
        const dist = Vector2.dist(new Vector2(x, y), new Vector2(this.x, this.y));

        if (dist < 150) {
            const dir = new Vector2(this.x - x, this.y - y).normalize();
            this.velocity = this.velocity.add(dir.mul(strength * 0.12));

            for (const segment of this.segments) {
                for (const point of segment.points) {
                    const pointDist = Vector2.dist(new Vector2(x, y), point.position);
                    if (pointDist < 60) {
                        const factor = 1 - pointDist / 60;
                        point.applyForce(dir.mul(strength * factor * 0.4));
                    }
                }
            }
        }
    }

    draw(ctx) {
        // 陰影
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 80, 80, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();

        // 繪製所有段（從後往前）
        const drawOrder = [9, 3, 4, 7, 8, 5, 6, 0, 1, 2];
        for (const idx of drawOrder) {
            this.segments[idx].draw(ctx, this.color);
        }

        // 繪製眼睛
        this.drawEyes(ctx);
    }

    drawEyes(ctx) {
        const head = this.segments[1];

        // 眼睛
        ctx.beginPath();
        ctx.arc(head.centerX - 5, head.centerY - 8, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#212121';
        ctx.fill();

        // 高光
        ctx.beginPath();
        ctx.arc(head.centerX - 7, head.centerY - 10, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 鼻子點
        const nose = this.segments[2];
        ctx.beginPath();
        ctx.arc(nose.centerX - 10, nose.centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = this.color.dark;
        ctx.fill();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = new Vector2();
        this.initSegments();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.pressure = 70;
        this.elasticity = 60;
        this.gravity = 40;

        this.dog = null;
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
        this.groundY = this.height - 50;
    }

    init() {
        this.dog = new BalloonDog(this.width / 2, this.height / 2 - 30);
    }

    setupControls() {
        document.getElementById('pressure').addEventListener('input', (e) => {
            this.pressure = parseInt(e.target.value);
            document.getElementById('pressureValue').textContent = this.pressure;
        });

        document.getElementById('elasticity').addEventListener('input', (e) => {
            this.elasticity = parseInt(e.target.value);
            document.getElementById('elasticityValue').textContent = this.elasticity;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = this.gravity;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.dog.reset(this.width / 2, this.height / 2 - 30);
        });

        document.getElementById('bounceBtn').addEventListener('click', () => {
            this.dog.bounce();
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.dog.nextColor();
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.isDragging = false);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.isDragging = false);

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.init();
        });
    }

    getPointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    handlePointerDown(e) {
        this.isDragging = true;
        const pos = this.getPointerPos(e);
        this.dog.push(pos.x, pos.y, 10);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        const pos = this.getPointerPos(e);
        this.dog.push(pos.x, pos.y, 6);
    }

    update() {
        this.dog.update(this.pressure, this.elasticity, this.gravity, this.groundY);

        // 邊界
        if (this.dog.x < 100) {
            this.dog.x = 100;
            this.dog.velocity.x *= -0.5;
        }
        if (this.dog.x > this.width - 100) {
            this.dog.x = this.width - 100;
            this.dog.velocity.x *= -0.5;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#e1f5fe');
        gradient.addColorStop(1, '#81d4fa');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 地面
        this.ctx.fillStyle = '#4fc3f7';
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

        this.dog.draw(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => new App());
