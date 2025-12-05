/**
 * 肥皂泡 - Soap Bubble
 * 彩虹薄膜物理模擬
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

// 泡泡上的點
class BubblePoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.baseOffset = new Vector2(x, y); // 相對於中心的偏移
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

// 肥皂泡
class SoapBubble {
    constructor(x, y, radius) {
        this.center = new Vector2(x, y);
        this.baseRadius = radius;
        this.radius = radius;

        this.points = [];
        this.numPoints = 32;

        this.velocity = new Vector2();
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.colorPhase = Math.random() * Math.PI * 2;

        this.popped = false;
        this.popParticles = [];

        this.initPoints();
    }

    initPoints() {
        this.points = [];

        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            const x = this.center.x + Math.cos(angle) * this.radius;
            const y = this.center.y + Math.sin(angle) * this.radius;

            const point = new BubblePoint(x, y);
            point.baseOffset = new Vector2(
                Math.cos(angle) * this.radius,
                Math.sin(angle) * this.radius
            );
            this.points.push(point);
        }
    }

    update(tension, pressure, wind, gravity = 0.02) {
        if (this.popped) {
            this.updatePopParticles();
            return;
        }

        const tensionForce = tension * 0.003;
        const pressureForce = pressure * 0.002;
        const windForce = wind * 0.005;
        const damping = 0.98;

        // 泡泡整體移動
        this.velocity.y += gravity;
        this.velocity.x += (Math.random() - 0.5) * windForce;
        this.velocity = this.velocity.mul(0.99);
        this.center = this.center.add(this.velocity);

        // 晃動動畫
        this.wobblePhase += 0.05;
        this.colorPhase += 0.02;

        // 更新每個點
        for (const point of this.points) {
            point.update(damping);
        }

        // 約束迭代
        for (let iter = 0; iter < 3; iter++) {
            // 表面張力 - 相鄰點保持等距
            for (let i = 0; i < this.points.length; i++) {
                const p1 = this.points[i];
                const p2 = this.points[(i + 1) % this.points.length];

                const targetDist = (2 * Math.PI * this.radius) / this.numPoints;
                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist > 0) {
                    const correction = diff.mul((dist - targetDist) / dist * tensionForce);
                    p1.applyForce(correction);
                    p2.applyForce(correction.mul(-1));
                }
            }

            // 壓力 - 保持圓形
            for (let i = 0; i < this.points.length; i++) {
                const point = this.points[i];
                const toCenter = this.center.sub(point.position);
                const dist = toCenter.length();

                // 理想位置（帶晃動）
                const angle = (i / this.numPoints) * Math.PI * 2;
                const wobble = Math.sin(this.wobblePhase + angle * 3) * 3;
                const targetDist = this.radius + wobble;

                if (dist > 0) {
                    const correction = toCenter.normalize().mul((dist - targetDist) * pressureForce);
                    point.applyForce(correction.mul(-1));
                }
            }
        }

        // 更新中心位置（根據所有點的平均）
        let cx = 0, cy = 0;
        for (const point of this.points) {
            cx += point.position.x;
            cy += point.position.y;
        }
        this.center = new Vector2(cx / this.points.length, cy / this.points.length);
    }

    updatePopParticles() {
        for (const particle of this.popParticles) {
            particle.velocity.y += 0.1;
            particle.velocity = particle.velocity.mul(0.98);
            particle.position = particle.position.add(particle.velocity);
            particle.life -= 0.02;
            particle.size *= 0.97;
        }

        this.popParticles = this.popParticles.filter(p => p.life > 0);
    }

    blow(strength) {
        this.velocity.y -= strength * 0.3;
        this.velocity.x += (Math.random() - 0.5) * strength * 0.2;
    }

    push(x, y, strength) {
        const pushPos = new Vector2(x, y);
        const dist = Vector2.dist(pushPos, this.center);

        if (dist < this.radius * 2) {
            const dir = this.center.sub(pushPos).normalize();
            this.velocity = this.velocity.add(dir.mul(strength * 0.1));

            // 變形
            for (const point of this.points) {
                const pointDist = Vector2.dist(pushPos, point.position);
                if (pointDist < this.radius) {
                    const factor = 1 - pointDist / this.radius;
                    point.applyForce(dir.mul(strength * factor * 0.3));
                }
            }
        }
    }

    pop() {
        if (this.popped) return;

        this.popped = true;
        this.popParticles = [];

        // 創建爆裂粒子
        for (const point of this.points) {
            const dir = point.position.sub(this.center).normalize();

            for (let j = 0; j < 3; j++) {
                this.popParticles.push({
                    position: point.position.clone(),
                    velocity: dir.mul(3 + Math.random() * 5).add(
                        new Vector2((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3)
                    ),
                    size: 3 + Math.random() * 4,
                    life: 1,
                    hue: (this.colorPhase * 180 / Math.PI + j * 30) % 360
                });
            }
        }
    }

    containsPoint(x, y) {
        return Vector2.dist(new Vector2(x, y), this.center) < this.radius;
    }

    draw(ctx) {
        if (this.popped) {
            this.drawPopParticles(ctx);
            return;
        }

        // 繪製陰影
        ctx.beginPath();
        ctx.ellipse(
            this.center.x + 10,
            this.center.y + 15,
            this.radius * 0.9,
            this.radius * 0.4,
            0.2, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();

        // 繪製泡泡主體
        this.drawBubbleBody(ctx);

        // 繪製彩虹效果
        this.drawRainbowEffect(ctx);

        // 繪製高光
        this.drawHighlights(ctx);
    }

    drawBubbleBody(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y);

        for (let i = 1; i <= this.points.length; i++) {
            const curr = this.points[i % this.points.length];
            const prev = this.points[(i - 1) % this.points.length];
            const next = this.points[(i + 1) % this.points.length];

            // 使用貝塞爾曲線平滑
            const cpX = curr.position.x;
            const cpY = curr.position.y;

            ctx.quadraticCurveTo(
                prev.position.x + (curr.position.x - prev.position.x) * 0.5,
                prev.position.y + (curr.position.y - prev.position.y) * 0.5,
                cpX, cpY
            );
        }

        ctx.closePath();

        // 透明填充
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();

        // 邊緣
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawRainbowEffect(ctx) {
        // 彩虹薄膜效果
        const time = this.colorPhase;

        // 多個彩虹條紋
        for (let i = 0; i < 5; i++) {
            const angle = time + i * 0.6;
            const offset = Math.sin(angle) * 20;

            const startX = this.center.x - this.radius + offset;
            const startY = this.center.y - this.radius * 0.5;
            const endX = this.center.x + this.radius + offset;
            const endY = this.center.y + this.radius * 0.5;

            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

            const hue1 = (i * 72 + time * 30) % 360;
            const hue2 = (hue1 + 60) % 360;
            const hue3 = (hue1 + 120) % 360;

            gradient.addColorStop(0, `hsla(${hue1}, 100%, 70%, 0)`);
            gradient.addColorStop(0.3, `hsla(${hue1}, 100%, 70%, 0.15)`);
            gradient.addColorStop(0.5, `hsla(${hue2}, 100%, 70%, 0.2)`);
            gradient.addColorStop(0.7, `hsla(${hue3}, 100%, 70%, 0.15)`);
            gradient.addColorStop(1, `hsla(${hue3}, 100%, 70%, 0)`);

            ctx.save();
            ctx.beginPath();

            // 使用泡泡形狀作為裁剪
            ctx.moveTo(this.points[0].position.x, this.points[0].position.y);
            for (const point of this.points) {
                ctx.lineTo(point.position.x, point.position.y);
            }
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = gradient;
            ctx.fillRect(
                this.center.x - this.radius - 20,
                this.center.y - this.radius - 20,
                this.radius * 2 + 40,
                this.radius * 2 + 40
            );

            ctx.restore();
        }
    }

    drawHighlights(ctx) {
        // 主高光
        const highlightX = this.center.x - this.radius * 0.3;
        const highlightY = this.center.y - this.radius * 0.3;

        const gradient = ctx.createRadialGradient(
            highlightX, highlightY, 0,
            highlightX, highlightY, this.radius * 0.4
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(
            highlightX, highlightY,
            this.radius * 0.25, this.radius * 0.15,
            -0.5, 0, Math.PI * 2
        );
        ctx.fillStyle = gradient;
        ctx.fill();

        // 小高光
        const smallHighlightX = this.center.x + this.radius * 0.2;
        const smallHighlightY = this.center.y + this.radius * 0.3;

        ctx.beginPath();
        ctx.arc(smallHighlightX, smallHighlightY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // 邊緣反光
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius - 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawPopParticles(ctx) {
        for (const particle of this.popParticles) {
            ctx.beginPath();
            ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);

            const alpha = particle.life * 0.8;
            ctx.fillStyle = `hsla(${particle.hue}, 80%, 70%, ${alpha})`;
            ctx.fill();
        }
    }

    reset(x, y) {
        this.center = new Vector2(x, y);
        this.velocity = new Vector2();
        this.popped = false;
        this.popParticles = [];
        this.initPoints();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.tension = 60;
        this.pressure = 70;
        this.wind = 30;

        this.bubble = null;
        this.isDragging = false;
        this.lastPointerPos = null;

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
        this.bubble = new SoapBubble(
            this.width / 2,
            this.height / 2,
            80
        );
    }

    setupControls() {
        const tensionSlider = document.getElementById('tension');
        const tensionValue = document.getElementById('tensionValue');
        tensionSlider.addEventListener('input', (e) => {
            this.tension = parseInt(e.target.value);
            tensionValue.textContent = this.tension;
        });

        const pressureSlider = document.getElementById('pressure');
        const pressureValue = document.getElementById('pressureValue');
        pressureSlider.addEventListener('input', (e) => {
            this.pressure = parseInt(e.target.value);
            pressureValue.textContent = this.pressure;
        });

        const windSlider = document.getElementById('wind');
        const windValue = document.getElementById('windValue');
        windSlider.addEventListener('input', (e) => {
            this.wind = parseInt(e.target.value);
            windValue.textContent = this.wind;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.bubble.reset(this.width / 2, this.height / 2);
        });

        document.getElementById('blowBtn').addEventListener('click', () => {
            this.bubble.blow(15);
        });

        document.getElementById('popBtn').addEventListener('click', () => {
            this.bubble.pop();
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
        this.lastPointerPos = this.getPointerPos(e);
    }

    handlePointerMove(e) {
        const pos = this.getPointerPos(e);

        if (this.isDragging && this.lastPointerPos) {
            this.bubble.push(pos.x, pos.y, 5);
        }

        this.lastPointerPos = pos;
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    update() {
        this.bubble.update(this.tension, this.pressure, this.wind);

        // 邊界處理
        const margin = 100;
        if (this.bubble.center.x < -margin) {
            this.bubble.center.x = this.width + margin;
        }
        if (this.bubble.center.x > this.width + margin) {
            this.bubble.center.x = -margin;
        }
        if (this.bubble.center.y < -margin) {
            this.bubble.center.y = this.height + margin;
        }
        if (this.bubble.center.y > this.height + margin) {
            this.bubble.center.y = -margin;
        }

        // 爆裂後重置
        if (this.bubble.popped && this.bubble.popParticles.length === 0) {
            setTimeout(() => {
                this.bubble.reset(this.width / 2, this.height / 2);
            }, 500);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景
        this.drawBackground();

        // 繪製泡泡
        this.bubble.draw(this.ctx);
    }

    drawBackground() {
        // 天空漸層
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#e1f5fe');
        gradient.addColorStop(0.5, '#b3e5fc');
        gradient.addColorStop(1, '#81d4fa');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 陽光效果
        const sunX = this.width * 0.8;
        const sunY = 80;

        const sunGradient = this.ctx.createRadialGradient(
            sunX, sunY, 0,
            sunX, sunY, 150
        );
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        sunGradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.3)');
        sunGradient.addColorStop(1, 'rgba(255, 255, 150, 0)');

        this.ctx.fillStyle = sunGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 背景小泡泡裝飾
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 10; i++) {
            const x = (i * 137 + Date.now() * 0.01) % this.width;
            const y = (i * 89 + Date.now() * 0.005) % this.height;
            const size = 10 + (i % 5) * 5;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // 小高光
            this.ctx.beginPath();
            this.ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
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
