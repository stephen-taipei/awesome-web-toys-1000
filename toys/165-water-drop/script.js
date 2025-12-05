/**
 * 水滴 - Water Drop
 * 表面張力模擬
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

// 水滴粒子
class DropPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.velocity = new Vector2();
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

// 水滴
class WaterDrop {
    constructor(x, y, radius) {
        this.center = new Vector2(x, y);
        this.baseRadius = radius;
        this.points = [];
        this.numPoints = 24;
        this.velocity = new Vector2();

        this.initPoints();
    }

    initPoints() {
        this.points = [];

        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2;
            const x = this.center.x + Math.cos(angle) * this.baseRadius;
            const y = this.center.y + Math.sin(angle) * this.baseRadius;
            this.points.push(new DropPoint(x, y));
        }
    }

    update(tension, viscosity, gravity, groundY) {
        const tensionForce = tension * 0.004;
        const damping = viscosity * 0.01;
        const grav = gravity * 0.015;

        // 整體重力
        this.velocity.y += grav;
        this.velocity = this.velocity.mul(0.99);

        // 更新中心
        this.center = this.center.add(this.velocity);

        // 地面碰撞
        if (this.center.y + this.baseRadius > groundY) {
            this.center.y = groundY - this.baseRadius;
            this.velocity.y *= -0.3;
            this.velocity.x *= 0.95;

            // 撞擊變形
            for (const point of this.points) {
                if (point.position.y > groundY - 5) {
                    point.applyForce(new Vector2(
                        (Math.random() - 0.5) * 5,
                        -Math.abs(this.velocity.y) * 0.5
                    ));
                }
            }
        }

        // 更新每個點
        for (const point of this.points) {
            point.update(damping);
        }

        // 約束迭代
        for (let iter = 0; iter < 4; iter++) {
            // 表面張力 - 保持等距
            const targetDist = (2 * Math.PI * this.baseRadius) / this.numPoints;

            for (let i = 0; i < this.points.length; i++) {
                const p1 = this.points[i];
                const p2 = this.points[(i + 1) % this.points.length];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();

                if (dist > 0) {
                    const correction = diff.mul((dist - targetDist) / dist * tensionForce);
                    p1.applyForce(correction);
                    p2.applyForce(correction.mul(-1));
                }
            }

            // 向圓心收縮（表面張力）
            for (const point of this.points) {
                const toCenter = this.center.sub(point.position);
                const dist = toCenter.length();
                const targetRadius = this.baseRadius;

                const correction = toCenter.normalize().mul((dist - targetRadius) * tensionForce * 0.5);
                point.applyForce(correction.mul(-1));
            }

            // 地面約束
            for (const point of this.points) {
                if (point.position.y > groundY) {
                    point.position.y = groundY;
                }
            }
        }

        // 更新中心（根據點的平均位置）
        let cx = 0, cy = 0;
        for (const point of this.points) {
            cx += point.position.x;
            cy += point.position.y;
        }
        this.center = new Vector2(cx / this.points.length, cy / this.points.length);
    }

    drop() {
        this.velocity.y = 8;
    }

    push(x, y, strength) {
        const pushPos = new Vector2(x, y);
        const dist = Vector2.dist(pushPos, this.center);

        if (dist < this.baseRadius * 2) {
            const dir = this.center.sub(pushPos).normalize();
            this.velocity = this.velocity.add(dir.mul(strength * 0.15));

            // 局部變形
            for (const point of this.points) {
                const pointDist = Vector2.dist(pushPos, point.position);
                if (pointDist < this.baseRadius) {
                    const factor = 1 - pointDist / this.baseRadius;
                    point.applyForce(dir.mul(strength * factor * 0.4));
                }
            }
        }
    }

    canMerge(other) {
        const dist = Vector2.dist(this.center, other.center);
        return dist < this.baseRadius + other.baseRadius;
    }

    draw(ctx) {
        // 繪製陰影
        ctx.beginPath();
        ctx.ellipse(
            this.center.x,
            this.center.y + this.baseRadius + 10,
            this.baseRadius * 0.8,
            this.baseRadius * 0.2,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fill();

        // 繪製水滴主體
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

        // 水滴漸層
        const gradient = ctx.createRadialGradient(
            this.center.x - this.baseRadius * 0.3,
            this.center.y - this.baseRadius * 0.3,
            0,
            this.center.x,
            this.center.y,
            this.baseRadius * 1.2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.2, 'rgba(129, 212, 250, 0.8)');
        gradient.addColorStop(0.6, 'rgba(41, 182, 246, 0.7)');
        gradient.addColorStop(1, 'rgba(3, 169, 244, 0.6)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // 邊緣
        ctx.strokeStyle = 'rgba(129, 212, 250, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 高光
        this.drawHighlight(ctx);
    }

    drawHighlight(ctx) {
        const hlX = this.center.x - this.baseRadius * 0.35;
        const hlY = this.center.y - this.baseRadius * 0.35;

        const hlGradient = ctx.createRadialGradient(
            hlX, hlY, 0,
            hlX, hlY, this.baseRadius * 0.4
        );
        hlGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        hlGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        hlGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(hlX, hlY, this.baseRadius * 0.25, this.baseRadius * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fillStyle = hlGradient;
        ctx.fill();

        // 小高光
        ctx.beginPath();
        ctx.arc(hlX + this.baseRadius * 0.2, hlY + this.baseRadius * 0.15, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }

    reset(x, y) {
        this.center = new Vector2(x, y);
        this.velocity = new Vector2();
        this.initPoints();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.tension = 70;
        this.viscosity = 92;
        this.gravity = 50;

        this.drops = [];
        this.groundY = 0;
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
        this.groundY = this.height - 50;
    }

    init() {
        this.drops = [
            new WaterDrop(this.width / 2, this.height / 2, 60)
        ];
    }

    setupControls() {
        const tensionSlider = document.getElementById('tension');
        const tensionValue = document.getElementById('tensionValue');
        tensionSlider.addEventListener('input', (e) => {
            this.tension = parseInt(e.target.value);
            tensionValue.textContent = this.tension;
        });

        const viscositySlider = document.getElementById('viscosity');
        const viscosityValue = document.getElementById('viscosityValue');
        viscositySlider.addEventListener('input', (e) => {
            this.viscosity = parseInt(e.target.value);
            viscosityValue.textContent = this.viscosity;
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

        document.getElementById('dropBtn').addEventListener('click', () => {
            for (const drop of this.drops) {
                drop.center.y = 80;
                drop.drop();
            }
        });

        document.getElementById('mergeBtn').addEventListener('click', () => {
            this.addDrop();
        });
    }

    addDrop() {
        const x = this.width / 2 + (Math.random() - 0.5) * 150;
        const y = 100;
        const radius = 30 + Math.random() * 30;
        this.drops.push(new WaterDrop(x, y, radius));
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

        if (this.isDragging) {
            for (const drop of this.drops) {
                drop.push(pos.x, pos.y, 8);
            }
        }

        this.lastPointerPos = pos;
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    update() {
        // 更新每個水滴
        for (const drop of this.drops) {
            drop.update(this.tension, this.viscosity, this.gravity, this.groundY);
        }

        // 水滴合併
        this.mergeDrops();

        // 邊界處理
        for (const drop of this.drops) {
            if (drop.center.x < drop.baseRadius) {
                drop.center.x = drop.baseRadius;
                drop.velocity.x *= -0.5;
            }
            if (drop.center.x > this.width - drop.baseRadius) {
                drop.center.x = this.width - drop.baseRadius;
                drop.velocity.x *= -0.5;
            }
        }
    }

    mergeDrops() {
        for (let i = 0; i < this.drops.length; i++) {
            for (let j = i + 1; j < this.drops.length; j++) {
                if (this.drops[i].canMerge(this.drops[j])) {
                    // 合併成更大的水滴
                    const d1 = this.drops[i];
                    const d2 = this.drops[j];

                    const totalArea = Math.PI * d1.baseRadius * d1.baseRadius +
                                     Math.PI * d2.baseRadius * d2.baseRadius;
                    const newRadius = Math.sqrt(totalArea / Math.PI);

                    const newX = (d1.center.x + d2.center.x) / 2;
                    const newY = (d1.center.y + d2.center.y) / 2;

                    const newDrop = new WaterDrop(newX, newY, newRadius);
                    newDrop.velocity = d1.velocity.add(d2.velocity).mul(0.5);

                    this.drops.splice(j, 1);
                    this.drops.splice(i, 1);
                    this.drops.push(newDrop);

                    return; // 一次只合併一對
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景
        this.drawBackground();

        // 繪製水滴
        for (const drop of this.drops) {
            drop.draw(this.ctx);
        }
    }

    drawBackground() {
        // 金屬表面漸層
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#37474f');
        gradient.addColorStop(0.5, '#455a64');
        gradient.addColorStop(1, '#546e7a');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 表面紋理
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        for (let y = 0; y < this.height; y += 3) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // 地面線
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.width, this.groundY);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 反射效果
        const reflectionGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
        reflectionGradient.addColorStop(0, 'rgba(129, 212, 250, 0.1)');
        reflectionGradient.addColorStop(1, 'rgba(129, 212, 250, 0)');

        this.ctx.fillStyle = reflectionGradient;
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
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
