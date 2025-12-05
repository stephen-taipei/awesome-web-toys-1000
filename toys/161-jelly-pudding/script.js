/**
 * 果凍布丁 - Jelly Pudding
 * Q彈軟體物理模擬
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

// 布丁粒子
class PuddingPoint {
    constructor(x, y, isEdge = false) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.isEdge = isEdge;
        this.isBottom = false;
    }

    update(gravity, damping) {
        // Verlet integration
        const vel = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = this.position.clone();
        this.position = this.position.add(vel).add(new Vector2(0, gravity));
    }

    applyForce(force) {
        this.position = this.position.add(force);
    }

    constrainToPlate(plateY, plateRadius, centerX) {
        // 底部約束
        if (this.position.y > plateY) {
            this.position.y = plateY;
            this.isBottom = true;
        } else {
            this.isBottom = false;
        }

        // 盤子邊緣約束
        const distFromCenter = this.position.x - centerX;
        if (Math.abs(distFromCenter) > plateRadius * 0.9) {
            this.position.x = centerX + Math.sign(distFromCenter) * plateRadius * 0.9;
        }
    }
}

// 布丁軟體
class Pudding {
    constructor(x, y, width, height) {
        this.centerX = x;
        this.centerY = y;
        this.width = width;
        this.height = height;

        this.points = [];
        this.links = [];
        this.layers = 8;  // 垂直層數
        this.segments = 16; // 每層節點數

        this.initPoints();
        this.initLinks();
    }

    initPoints() {
        this.points = [];

        // 從上到下建立層
        for (let layer = 0; layer < this.layers; layer++) {
            const layerRatio = layer / (this.layers - 1);
            const y = this.centerY - this.height / 2 + layerRatio * this.height;

            // 布丁形狀 - 上窄下寬
            const widthAtLayer = this.width * (0.6 + layerRatio * 0.4);

            // 頂部有個小圓頂
            if (layer === 0) {
                // 中心點
                this.points.push(new PuddingPoint(this.centerX, y - 10, false));
            }

            for (let seg = 0; seg < this.segments; seg++) {
                const angle = (seg / this.segments) * Math.PI * 2;
                const radius = widthAtLayer / 2;

                const px = this.centerX + Math.cos(angle) * radius;
                const py = y;

                const point = new PuddingPoint(px, py, true);
                if (layer === this.layers - 1) {
                    point.isBottom = true;
                }
                this.points.push(point);
            }
        }
    }

    initLinks() {
        this.links = [];

        // 同層連結
        for (let layer = 0; layer < this.layers; layer++) {
            const startIdx = layer === 0 ? 1 : 1 + layer * this.segments;

            for (let seg = 0; seg < this.segments; seg++) {
                const idx1 = startIdx + seg;
                const idx2 = startIdx + (seg + 1) % this.segments;

                if (idx1 < this.points.length && idx2 < this.points.length) {
                    const dist = Vector2.dist(
                        this.points[idx1].position,
                        this.points[idx2].position
                    );
                    this.links.push({
                        a: idx1,
                        b: idx2,
                        restLength: dist
                    });
                }
            }
        }

        // 層間連結
        for (let layer = 0; layer < this.layers - 1; layer++) {
            const startIdx1 = layer === 0 ? 1 : 1 + layer * this.segments;
            const startIdx2 = 1 + (layer + 1) * this.segments;

            for (let seg = 0; seg < this.segments; seg++) {
                const idx1 = startIdx1 + seg;
                const idx2 = startIdx2 + seg;

                if (idx1 < this.points.length && idx2 < this.points.length) {
                    const dist = Vector2.dist(
                        this.points[idx1].position,
                        this.points[idx2].position
                    );
                    this.links.push({
                        a: idx1,
                        b: idx2,
                        restLength: dist
                    });

                    // 交叉連結
                    const idx3 = startIdx2 + (seg + 1) % this.segments;
                    if (idx3 < this.points.length) {
                        const dist2 = Vector2.dist(
                            this.points[idx1].position,
                            this.points[idx3].position
                        );
                        this.links.push({
                            a: idx1,
                            b: idx3,
                            restLength: dist2
                        });
                    }
                }
            }
        }

        // 頂部中心連結
        if (this.points.length > 0) {
            for (let seg = 0; seg < this.segments; seg++) {
                const idx = 1 + seg;
                if (idx < this.points.length) {
                    const dist = Vector2.dist(
                        this.points[0].position,
                        this.points[idx].position
                    );
                    this.links.push({
                        a: 0,
                        b: idx,
                        restLength: dist
                    });
                }
            }
        }
    }

    update(jiggle, viscosity, gravity, plateY, plateRadius) {
        const grav = gravity * 0.015;
        const damp = viscosity * 0.01;
        const stiffness = jiggle * 0.003;

        // 更新粒子位置
        for (const point of this.points) {
            point.update(grav, damp);
        }

        // 約束迭代
        for (let iter = 0; iter < 5; iter++) {
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

            // 盤子約束
            for (const point of this.points) {
                point.constrainToPlate(plateY, plateRadius, this.centerX);
            }
        }

        // 形狀恢復力
        for (const point of this.points) {
            const toRest = point.restPosition.sub(point.position);
            point.applyForce(toRest.mul(stiffness * 0.3));
        }
    }

    poke(x, y, strength) {
        for (const point of this.points) {
            const dist = Vector2.dist(point.position, new Vector2(x, y));
            if (dist < 80) {
                const factor = 1 - dist / 80;
                const dir = point.position.sub(new Vector2(x, y)).normalize();
                point.applyForce(dir.mul(strength * factor));
            }
        }
    }

    shake(strength) {
        for (const point of this.points) {
            const force = new Vector2(
                (Math.random() - 0.5) * strength,
                (Math.random() - 0.5) * strength
            );
            point.applyForce(force);
        }
    }

    draw(ctx) {
        // 繪製布丁陰影
        this.drawShadow(ctx);

        // 繪製布丁主體
        this.drawBody(ctx);

        // 繪製焦糖醬
        this.drawCaramel(ctx);

        // 繪製高光
        this.drawHighlight(ctx);
    }

    drawShadow(ctx) {
        // 找到底部點
        const bottomPoints = this.points.filter(p => p.isBottom || p.position.y > this.centerY + this.height * 0.3);

        if (bottomPoints.length < 3) return;

        ctx.beginPath();
        const sorted = bottomPoints.sort((a, b) => a.position.x - b.position.x);

        ctx.ellipse(
            this.centerX,
            this.centerY + this.height / 2 + 10,
            this.width / 2 + 20,
            15,
            0, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();
    }

    drawBody(ctx) {
        // 使用漸層繪製布丁主體
        const gradient = ctx.createLinearGradient(
            this.centerX, this.centerY - this.height / 2,
            this.centerX, this.centerY + this.height / 2
        );
        gradient.addColorStop(0, '#fff8e1');
        gradient.addColorStop(0.3, '#ffecb3');
        gradient.addColorStop(0.6, '#ffe082');
        gradient.addColorStop(1, '#ffd54f');

        // 繪製每一層
        for (let layer = 0; layer < this.layers - 1; layer++) {
            const startIdx1 = layer === 0 ? 1 : 1 + layer * this.segments;
            const startIdx2 = 1 + (layer + 1) * this.segments;

            ctx.beginPath();

            // 上層
            for (let seg = 0; seg <= this.segments; seg++) {
                const idx = startIdx1 + (seg % this.segments);
                if (idx < this.points.length) {
                    const p = this.points[idx].position;
                    if (seg === 0) {
                        ctx.moveTo(p.x, p.y);
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                }
            }

            // 下層（反向）
            for (let seg = this.segments; seg >= 0; seg--) {
                const idx = startIdx2 + (seg % this.segments);
                if (idx < this.points.length) {
                    const p = this.points[idx].position;
                    ctx.lineTo(p.x, p.y);
                }
            }

            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // 繪製頂部圓頂
        if (this.points.length > 0) {
            const topCenter = this.points[0];
            ctx.beginPath();

            for (let seg = 0; seg <= this.segments; seg++) {
                const idx = 1 + (seg % this.segments);
                if (idx < this.points.length) {
                    const p = this.points[idx].position;
                    if (seg === 0) {
                        ctx.moveTo(p.x, p.y);
                    } else {
                        // 使用貝塞爾曲線創造圓頂效果
                        const prev = this.points[1 + ((seg - 1) % this.segments)].position;
                        const cp = topCenter.position;
                        ctx.quadraticCurveTo(
                            (prev.x + p.x) / 2,
                            cp.y - 5,
                            p.x, p.y
                        );
                    }
                }
            }

            ctx.closePath();
            ctx.fillStyle = '#fffde7';
            ctx.fill();
        }

        // 繪製輪廓
        ctx.beginPath();
        const bottomStartIdx = 1 + (this.layers - 1) * this.segments;
        for (let seg = 0; seg <= this.segments; seg++) {
            const idx = bottomStartIdx + (seg % this.segments);
            if (idx < this.points.length) {
                const p = this.points[idx].position;
                if (seg === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }
        }
        ctx.strokeStyle = 'rgba(255, 160, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawCaramel(ctx) {
        // 在布丁頂部繪製焦糖醬
        if (this.points.length < this.segments + 1) return;

        const topCenter = this.points[0].position;

        // 焦糖醬的流動形狀
        ctx.beginPath();

        for (let seg = 0; seg <= this.segments; seg++) {
            const idx = 1 + (seg % this.segments);
            if (idx < this.points.length) {
                const p = this.points[idx].position;
                const angle = (seg / this.segments) * Math.PI * 2;

                // 隨機流動效果
                const drip = Math.sin(angle * 3 + Date.now() * 0.001) * 10;
                const r = 0.7 + Math.sin(angle * 5) * 0.1;

                const x = topCenter.x + (p.x - topCenter.x) * r;
                const y = topCenter.y + drip + 5;

                if (seg === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }

        ctx.closePath();

        const caramelGradient = ctx.createRadialGradient(
            topCenter.x, topCenter.y, 0,
            topCenter.x, topCenter.y, this.width / 2
        );
        caramelGradient.addColorStop(0, '#8b4513');
        caramelGradient.addColorStop(0.5, '#a0522d');
        caramelGradient.addColorStop(1, '#cd853f');

        ctx.fillStyle = caramelGradient;
        ctx.fill();
    }

    drawHighlight(ctx) {
        // 頂部高光
        if (this.points.length === 0) return;

        const topCenter = this.points[0].position;

        const highlightGradient = ctx.createRadialGradient(
            topCenter.x - 15, topCenter.y - 5, 0,
            topCenter.x, topCenter.y, 30
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.ellipse(topCenter.x - 10, topCenter.y, 20, 15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = highlightGradient;
        ctx.fill();
    }

    reset() {
        this.initPoints();
    }
}

// 盤子
class Plate {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
    }

    shake(strength) {
        this.targetOffsetX = (Math.random() - 0.5) * strength;
        this.targetOffsetY = (Math.random() - 0.5) * strength * 0.5;
    }

    update() {
        this.offsetX += (this.targetOffsetX - this.offsetX) * 0.1;
        this.offsetY += (this.targetOffsetY - this.offsetY) * 0.1;

        this.targetOffsetX *= 0.95;
        this.targetOffsetY *= 0.95;
    }

    draw(ctx) {
        const x = this.x + this.offsetX;
        const y = this.y + this.offsetY;

        // 盤子陰影
        ctx.beginPath();
        ctx.ellipse(x, y + 15, this.radius + 10, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();

        // 盤子主體
        const plateGradient = ctx.createRadialGradient(
            x - this.radius * 0.3, y - 10, 0,
            x, y, this.radius
        );
        plateGradient.addColorStop(0, '#ffffff');
        plateGradient.addColorStop(0.7, '#f5f5f5');
        plateGradient.addColorStop(1, '#e0e0e0');

        ctx.beginPath();
        ctx.ellipse(x, y, this.radius, this.radius * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = plateGradient;
        ctx.fill();

        // 盤子邊緣
        ctx.strokeStyle = '#bdbdbd';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 內圈裝飾
        ctx.beginPath();
        ctx.ellipse(x, y, this.radius * 0.85, this.radius * 0.21, 0, 0, Math.PI * 2);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.jiggle = 70;
        this.viscosity = 92;
        this.gravity = 50;

        this.pudding = null;
        this.plate = null;
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
    }

    init() {
        const centerX = this.width / 2;
        const plateY = this.height * 0.75;
        const plateRadius = 150;

        this.plate = new Plate(centerX, plateY, plateRadius);
        this.pudding = new Pudding(centerX, plateY - 80, 120, 100);
    }

    setupControls() {
        // Q彈度滑桿
        const jiggleSlider = document.getElementById('jiggle');
        const jiggleValue = document.getElementById('jiggleValue');
        jiggleSlider.addEventListener('input', (e) => {
            this.jiggle = parseInt(e.target.value);
            jiggleValue.textContent = this.jiggle;
        });

        // 黏稠度滑桿
        const viscositySlider = document.getElementById('viscosity');
        const viscosityValue = document.getElementById('viscosityValue');
        viscositySlider.addEventListener('input', (e) => {
            this.viscosity = parseInt(e.target.value);
            viscosityValue.textContent = this.viscosity;
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
            this.init();
        });

        document.getElementById('pokeBtn').addEventListener('click', () => {
            this.pudding.poke(this.width / 2, this.height * 0.5, 15);
        });

        document.getElementById('shakeBtn').addEventListener('click', () => {
            this.plate.shake(40);
            this.pudding.shake(20);
        });
    }

    setupEvents() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.handlePointerUp());

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
        this.isDragging = true;
        const pos = this.getPointerPos(e);
        this.pudding.poke(pos.x, pos.y, 10);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        const pos = this.getPointerPos(e);
        this.pudding.poke(pos.x, pos.y, 5);
    }

    handlePointerUp() {
        this.isDragging = false;
    }

    update() {
        this.plate.update();

        const plateY = this.plate.y + this.plate.offsetY - 10;
        const plateRadius = this.plate.radius;

        // 更新布丁位置（跟隨盤子搖晃）
        this.pudding.centerX = this.plate.x + this.plate.offsetX;

        this.pudding.update(
            this.jiggle,
            this.viscosity,
            this.gravity,
            plateY,
            plateRadius
        );
    }

    draw() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 繪製背景
        this.drawBackground();

        // 繪製盤子
        this.plate.draw(this.ctx);

        // 繪製布丁
        this.pudding.draw(this.ctx);
    }

    drawBackground() {
        // 桌面漸層
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#efebe9');
        bgGradient.addColorStop(1, '#d7ccc8');

        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 桌布圖案
        this.ctx.strokeStyle = 'rgba(188, 170, 164, 0.3)';
        this.ctx.lineWidth = 1;

        const spacing = 40;
        for (let x = 0; x < this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
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
