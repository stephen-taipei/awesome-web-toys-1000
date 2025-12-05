/**
 * 152 - 史萊姆
 * Slime Simulation
 *
 * 黏呼呼的史萊姆物理模擬
 * 可拉伸、分離、再融合的軟體動力學
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
    mul(s) { return new Vector2(this.x * s, this.y * s); }
    div(s) { return new Vector2(this.x / s, this.y / s); }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() {
        const len = this.length();
        return len > 0 ? this.div(len) : new Vector2();
    }
    dot(v) { return this.x * v.x + this.y * v.y; }
    dist(v) { return this.sub(v).length(); }
    lerp(v, t) { return this.add(v.sub(this).mul(t)); }
}

// 史萊姆粒子
class SlimeParticle {
    constructor(x, y, id) {
        this.id = id;
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.acceleration = new Vector2();
        this.radius = 12;
        this.mass = 1;
        this.isDragged = false;
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force.div(this.mass));
    }

    update(damping) {
        if (this.isDragged) return;

        this.velocity = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = new Vector2(this.position.x, this.position.y);
        this.position = this.position.add(this.velocity).add(this.acceleration.mul(0.5));
        this.acceleration = new Vector2();
    }
}

// 史萊姆連接
class SlimeLink {
    constructor(p1, p2, restLength) {
        this.p1 = p1;
        this.p2 = p2;
        this.restLength = restLength;
        this.maxStretch = restLength * 2.5;
        this.broken = false;
    }

    satisfy(stiffness) {
        if (this.broken) return;

        const diff = this.p2.position.sub(this.p1.position);
        const dist = diff.length();

        // 如果拉伸過度則斷開
        if (dist > this.maxStretch) {
            this.broken = true;
            return;
        }

        if (dist === 0) return;

        const delta = (dist - this.restLength) / dist;
        const correction = diff.mul(delta * stiffness * 0.5);

        if (!this.p1.isDragged) {
            this.p1.position = this.p1.position.add(correction);
        }
        if (!this.p2.isDragged) {
            this.p2.position = this.p2.position.sub(correction);
        }
    }
}

// 史萊姆主體
class Slime {
    constructor(centerX, centerY, numParticles, radius, colorScheme) {
        this.particles = [];
        this.links = [];
        this.colorScheme = colorScheme;
        this.baseRadius = radius;

        // 建立粒子 - 中心 + 外圈
        const centerParticle = new SlimeParticle(centerX, centerY, 0);
        this.particles.push(centerParticle);

        // 外圈粒子
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.particles.push(new SlimeParticle(x, y, i + 1));
        }

        // 建立連接
        this.createLinks();
    }

    createLinks() {
        this.links = [];
        const center = this.particles[0];
        const outer = this.particles.slice(1);

        // 中心連接到外圈
        for (const p of outer) {
            const dist = center.position.dist(p.position);
            this.links.push(new SlimeLink(center, p, dist));
        }

        // 外圈相鄰連接
        for (let i = 0; i < outer.length; i++) {
            const j = (i + 1) % outer.length;
            const dist = outer[i].position.dist(outer[j].position);
            this.links.push(new SlimeLink(outer[i], outer[j], dist));
        }

        // 跨越連接（增加穩定性）
        for (let i = 0; i < outer.length; i++) {
            const j = (i + 2) % outer.length;
            const dist = outer[i].position.dist(outer[j].position);
            this.links.push(new SlimeLink(outer[i], outer[j], dist));
        }
    }

    update(params, bounds) {
        const { viscosity, elasticity, tension, gravity } = params;
        const damping = viscosity / 100;
        const stiffness = elasticity / 100;

        // 重力
        const gravityForce = new Vector2(0, gravity * 0.015);
        for (const p of this.particles) {
            p.applyForce(gravityForce);
        }

        // 表面張力 - 嘗試維持圓形
        this.applySurfaceTension(tension / 100);

        // 更新粒子
        for (const p of this.particles) {
            p.update(damping);
        }

        // 約束求解
        const iterations = 5;
        for (let i = 0; i < iterations; i++) {
            for (const link of this.links) {
                link.satisfy(stiffness);
            }
        }

        // 邊界處理
        this.handleBounds(bounds);

        // 移除斷開的連接
        this.links = this.links.filter(l => !l.broken);
    }

    applySurfaceTension(strength) {
        const center = this.getCenter();
        const outer = this.particles.slice(1);

        for (const p of outer) {
            const toCenter = center.sub(p.position);
            const dist = toCenter.length();
            const targetDist = this.baseRadius;

            if (dist > 0) {
                const force = toCenter.normalize().mul((dist - targetDist) * strength * 0.1);
                p.applyForce(force);
            }
        }
    }

    getCenter() {
        let cx = 0, cy = 0;
        for (const p of this.particles) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.particles.length, cy / this.particles.length);
    }

    handleBounds(bounds) {
        const bounce = 0.3;
        const friction = 0.9;

        for (const p of this.particles) {
            const r = p.radius;

            if (p.position.y > bounds.height - r) {
                p.position.y = bounds.height - r;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
                p.prevPosition.x = p.position.x - (p.position.x - p.prevPosition.x) * (1 - friction);
            }

            if (p.position.y < r) {
                p.position.y = r;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
            }

            if (p.position.x < r) {
                p.position.x = r;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }

            if (p.position.x > bounds.width - r) {
                p.position.x = bounds.width - r;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
        }
    }

    // 檢查是否分裂
    checkSplit() {
        // 如果外圈連接斷裂太多，可能需要分裂
        const outer = this.particles.slice(1);
        const brokenCount = this.links.filter(l => l.broken).length;
        const totalOuter = outer.length;

        return brokenCount > totalOuter * 0.3;
    }

    // 取得輪廓點
    getOutline() {
        return this.particles.slice(1).map(p => p.position);
    }

    draw(ctx, time) {
        const scheme = this.colorScheme;
        const outline = this.getOutline();

        if (outline.length < 3) return;

        // 繪製主體
        ctx.beginPath();

        // 使用 Catmull-Rom 樣條曲線
        const points = outline;
        const n = points.length;

        ctx.moveTo(
            (points[n - 1].x + points[0].x) / 2,
            (points[n - 1].y + points[0].y) / 2
        );

        for (let i = 0; i < n; i++) {
            const p0 = points[(i - 1 + n) % n];
            const p1 = points[i];
            const p2 = points[(i + 1) % n];
            const p3 = points[(i + 2) % n];

            // 使用貝茲曲線近似 Catmull-Rom
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        ctx.closePath();

        // 漸層填充
        const center = this.getCenter();
        const gradient = ctx.createRadialGradient(
            center.x - this.baseRadius * 0.3,
            center.y - this.baseRadius * 0.3,
            0,
            center.x,
            center.y,
            this.baseRadius * 1.8
        );

        // 動態顏色偏移
        const hueShift = Math.sin(time * 0.5) * 10;

        gradient.addColorStop(0, this.adjustHue(scheme.highlight, hueShift));
        gradient.addColorStop(0.3, this.adjustHue(scheme.light, hueShift));
        gradient.addColorStop(0.6, this.adjustHue(scheme.main, hueShift));
        gradient.addColorStop(1, this.adjustHue(scheme.dark, hueShift));

        ctx.fillStyle = gradient;
        ctx.fill();

        // 外輪廓
        ctx.strokeStyle = scheme.outline;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 高光
        this.drawHighlights(ctx, center);

        // 眼睛（可愛效果）
        this.drawEyes(ctx, center, time);
    }

    adjustHue(color, shift) {
        // 簡單的顏色調整 - 保持原色
        return color;
    }

    drawHighlights(ctx, center) {
        // 主高光
        ctx.beginPath();
        ctx.ellipse(
            center.x - this.baseRadius * 0.35,
            center.y - this.baseRadius * 0.35,
            this.baseRadius * 0.2,
            this.baseRadius * 0.12,
            -Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // 次高光
        ctx.beginPath();
        ctx.arc(
            center.x - this.baseRadius * 0.15,
            center.y - this.baseRadius * 0.2,
            this.baseRadius * 0.08,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
    }

    drawEyes(ctx, center, time) {
        const eyeOffsetX = this.baseRadius * 0.25;
        const eyeOffsetY = -this.baseRadius * 0.1;
        const eyeRadius = this.baseRadius * 0.12;
        const pupilRadius = eyeRadius * 0.5;

        // 眨眼動畫
        const blinkPhase = Math.sin(time * 2);
        const eyeScale = blinkPhase > 0.95 ? 0.1 : 1;

        for (let side = -1; side <= 1; side += 2) {
            const ex = center.x + eyeOffsetX * side;
            const ey = center.y + eyeOffsetY;

            // 眼白
            ctx.beginPath();
            ctx.ellipse(ex, ey, eyeRadius, eyeRadius * eyeScale, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 瞳孔
            if (eyeScale > 0.5) {
                ctx.beginPath();
                ctx.arc(ex + side * 2, ey + 2, pupilRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#333';
                ctx.fill();

                // 瞳孔高光
                ctx.beginPath();
                ctx.arc(ex + side * 2 - 1, ey + 1, pupilRadius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
        }
    }
}

// 主應用程式
class SlimeApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.slimes = [];
        this.draggedParticle = null;
        this.mousePos = new Vector2();
        this.time = 0;

        this.params = {
            viscosity: 60,
            elasticity: 40,
            tension: 50,
            gravity: 40
        };

        this.colorSchemes = [
            {
                name: 'green',
                highlight: 'rgba(200, 255, 150, 0.9)',
                light: 'rgba(127, 255, 0, 0.85)',
                main: 'rgba(50, 205, 50, 0.8)',
                dark: 'rgba(34, 139, 34, 0.75)',
                outline: 'rgba(0, 100, 0, 0.6)'
            },
            {
                name: 'blue',
                highlight: 'rgba(200, 230, 255, 0.9)',
                light: 'rgba(100, 200, 255, 0.85)',
                main: 'rgba(30, 144, 255, 0.8)',
                dark: 'rgba(0, 100, 200, 0.75)',
                outline: 'rgba(0, 50, 150, 0.6)'
            },
            {
                name: 'pink',
                highlight: 'rgba(255, 220, 230, 0.9)',
                light: 'rgba(255, 150, 200, 0.85)',
                main: 'rgba(255, 105, 180, 0.8)',
                dark: 'rgba(219, 80, 140, 0.75)',
                outline: 'rgba(180, 50, 100, 0.6)'
            },
            {
                name: 'purple',
                highlight: 'rgba(230, 200, 255, 0.9)',
                light: 'rgba(180, 130, 255, 0.85)',
                main: 'rgba(138, 43, 226, 0.8)',
                dark: 'rgba(100, 20, 180, 0.75)',
                outline: 'rgba(70, 10, 130, 0.6)'
            },
            {
                name: 'orange',
                highlight: 'rgba(255, 230, 180, 0.9)',
                light: 'rgba(255, 180, 100, 0.85)',
                main: 'rgba(255, 140, 0, 0.8)',
                dark: 'rgba(220, 100, 0, 0.75)',
                outline: 'rgba(180, 70, 0, 0.6)'
            }
        ];

        this.currentColorIndex = 0;

        this.resize();
        this.createInitialSlime();
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

    createInitialSlime() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const radius = Math.min(this.bounds.width, this.bounds.height) * 0.18;
        const slime = new Slime(x, y, 16, radius, this.colorSchemes[this.currentColorIndex]);
        this.slimes.push(slime);
    }

    setupEventListeners() {
        // 滑鼠事件
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());

        // 觸控事件
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onMouseUp());

        // 視窗大小調整
        window.addEventListener('resize', () => this.resize());

        // 控制項
        document.getElementById('viscosity').addEventListener('input', (e) => {
            this.params.viscosity = parseInt(e.target.value);
            document.getElementById('viscosityValue').textContent = e.target.value;
        });

        document.getElementById('elasticity').addEventListener('input', (e) => {
            this.params.elasticity = parseInt(e.target.value);
            document.getElementById('elasticityValue').textContent = e.target.value;
        });

        document.getElementById('tension').addEventListener('input', (e) => {
            this.params.tension = parseInt(e.target.value);
            document.getElementById('tensionValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.params.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.slimes = [];
            this.createInitialSlime();
        });

        document.getElementById('splitBtn').addEventListener('click', () => {
            this.splitSlime();
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.changeColor();
        });
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
        this.findDragTarget();
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );

        if (this.draggedParticle) {
            this.draggedParticle.position = new Vector2(
                this.mousePos.x,
                this.mousePos.y
            );
        }
    }

    onMouseUp() {
        if (this.draggedParticle) {
            this.draggedParticle.isDragged = false;
            this.draggedParticle = null;
        }
    }

    onTouchStart(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos = new Vector2(
            touch.clientX - rect.left,
            touch.clientY - rect.top
        );
        this.findDragTarget();
    }

    onTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos = new Vector2(
            touch.clientX - rect.left,
            touch.clientY - rect.top
        );

        if (this.draggedParticle) {
            this.draggedParticle.position = new Vector2(
                this.mousePos.x,
                this.mousePos.y
            );
        }
    }

    findDragTarget() {
        let closestDist = Infinity;
        let closestParticle = null;

        for (const slime of this.slimes) {
            for (const p of slime.particles) {
                const dist = p.position.dist(this.mousePos);
                if (dist < p.radius * 3 && dist < closestDist) {
                    closestDist = dist;
                    closestParticle = p;
                }
            }
        }

        if (closestParticle) {
            closestParticle.isDragged = true;
            this.draggedParticle = closestParticle;
        }
    }

    splitSlime() {
        if (this.slimes.length === 0) return;

        const slime = this.slimes[0];
        const center = slime.getCenter();
        const radius = slime.baseRadius * 0.6;

        // 移除原始史萊姆
        this.slimes.shift();

        // 建立兩個較小的史萊姆
        const offset = radius * 1.2;
        const newSlime1 = new Slime(
            center.x - offset,
            center.y,
            12,
            radius,
            this.colorSchemes[this.currentColorIndex]
        );
        const newSlime2 = new Slime(
            center.x + offset,
            center.y,
            12,
            radius,
            this.colorSchemes[this.currentColorIndex]
        );

        this.slimes.push(newSlime1, newSlime2);
    }

    changeColor() {
        this.currentColorIndex = (this.currentColorIndex + 1) % this.colorSchemes.length;
        const newScheme = this.colorSchemes[this.currentColorIndex];

        for (const slime of this.slimes) {
            slime.colorScheme = newScheme;
        }
    }

    // 嘗試融合靠近的史萊姆
    tryMergeSlimes() {
        if (this.slimes.length < 2) return;

        for (let i = 0; i < this.slimes.length; i++) {
            for (let j = i + 1; j < this.slimes.length; j++) {
                const s1 = this.slimes[i];
                const s2 = this.slimes[j];
                const c1 = s1.getCenter();
                const c2 = s2.getCenter();
                const dist = c1.dist(c2);

                if (dist < (s1.baseRadius + s2.baseRadius) * 0.8) {
                    // 融合！
                    const newCenter = c1.lerp(c2, 0.5);
                    const newRadius = Math.sqrt(
                        s1.baseRadius * s1.baseRadius +
                        s2.baseRadius * s2.baseRadius
                    );

                    const newSlime = new Slime(
                        newCenter.x,
                        newCenter.y,
                        16,
                        Math.min(newRadius, this.bounds.height * 0.25),
                        this.colorSchemes[this.currentColorIndex]
                    );

                    this.slimes.splice(j, 1);
                    this.slimes.splice(i, 1);
                    this.slimes.push(newSlime);
                    return;
                }
            }
        }
    }

    update() {
        for (const slime of this.slimes) {
            slime.update(this.params, this.bounds);
        }

        // 處理史萊姆之間的碰撞
        this.handleSlimeCollisions();

        // 嘗試融合
        this.tryMergeSlimes();
    }

    handleSlimeCollisions() {
        for (let i = 0; i < this.slimes.length; i++) {
            for (let j = i + 1; j < this.slimes.length; j++) {
                const s1 = this.slimes[i];
                const s2 = this.slimes[j];

                // 粒子間的碰撞檢測
                for (const p1 of s1.particles) {
                    for (const p2 of s2.particles) {
                        const diff = p2.position.sub(p1.position);
                        const dist = diff.length();
                        const minDist = p1.radius + p2.radius;

                        if (dist < minDist && dist > 0) {
                            const overlap = (minDist - dist) / 2;
                            const direction = diff.normalize();

                            if (!p1.isDragged) {
                                p1.position = p1.position.sub(direction.mul(overlap));
                            }
                            if (!p2.isDragged) {
                                p2.position = p2.position.add(direction.mul(overlap));
                            }
                        }
                    }
                }
            }
        }
    }

    draw() {
        // 清除畫布
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        gradient.addColorStop(0, 'rgba(13, 40, 24, 1)');
        gradient.addColorStop(1, 'rgba(5, 26, 13, 1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 繪製地面反光
        const groundGradient = this.ctx.createLinearGradient(
            0, this.bounds.height - 50,
            0, this.bounds.height
        );
        groundGradient.addColorStop(0, 'rgba(127, 255, 0, 0)');
        groundGradient.addColorStop(1, 'rgba(127, 255, 0, 0.1)');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.bounds.height - 50, this.bounds.width, 50);

        // 繪製所有史萊姆
        for (const slime of this.slimes) {
            slime.draw(this.ctx, this.time);
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
    new SlimeApp();
});
