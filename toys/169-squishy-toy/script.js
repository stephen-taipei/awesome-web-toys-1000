/**
 * 捏捏樂 - Squishy Toy
 * 慢回彈玩具物理模擬
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
    lerp(v, t) { return new Vector2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t); }
    clone() { return new Vector2(this.x, this.y); }
    static dist(a, b) { return a.sub(b).length(); }
}

// 捏捏樂點
class SquishyPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.restPosition = new Vector2(x, y);
        this.velocity = new Vector2();
        this.deformation = new Vector2(); // 累積變形
    }

    update(recovery, damping) {
        // 慢回彈：變形逐漸恢復
        this.deformation = this.deformation.mul(1 - recovery);

        // 應用變形到位置
        const targetPos = this.restPosition.add(this.deformation);
        const toTarget = targetPos.sub(this.position);

        this.velocity = this.velocity.add(toTarget.mul(0.1));
        this.velocity = this.velocity.mul(damping);
        this.position = this.position.add(this.velocity);
    }

    applyDeformation(force) {
        this.deformation = this.deformation.add(force);
    }

    reset() {
        this.position = this.restPosition.clone();
        this.deformation = new Vector2();
        this.velocity = new Vector2();
    }
}

// 捏捏樂玩具
class SquishyToy {
    constructor(x, y, shapeType = 0) {
        this.centerX = x;
        this.centerY = y;
        this.shapeType = shapeType;

        this.points = [];
        this.faceElements = [];

        this.colors = {
            cat: { main: '#f8bbd9', light: '#fce4ec', dark: '#f48fb1' },
            bread: { main: '#ffe0b2', light: '#fff3e0', dark: '#ffcc80' },
            star: { main: '#b3e5fc', light: '#e1f5fe', dark: '#81d4fa' }
        };

        this.shapeNames = ['貓咪', '麵包', '星星'];

        this.initShape();
    }

    get color() {
        const colorKeys = ['cat', 'bread', 'star'];
        return this.colors[colorKeys[this.shapeType]];
    }

    initShape() {
        this.points = [];

        switch (this.shapeType) {
            case 0:
                this.createCatShape();
                break;
            case 1:
                this.createBreadShape();
                break;
            case 2:
                this.createStarShape();
                break;
        }
    }

    createCatShape() {
        // 身體（圓形）
        const bodySegments = 20;
        const bodyRadius = 80;

        for (let i = 0; i < bodySegments; i++) {
            const angle = (i / bodySegments) * Math.PI * 2;
            const x = this.centerX + Math.cos(angle) * bodyRadius;
            const y = this.centerY + Math.sin(angle) * bodyRadius;
            this.points.push(new SquishyPoint(x, y));
        }

        // 左耳
        const earPoints = 6;
        const earRadius = 25;
        for (let i = 0; i < earPoints; i++) {
            const angle = (i / earPoints) * Math.PI * 2;
            const x = this.centerX - 55 + Math.cos(angle) * earRadius;
            const y = this.centerY - 70 + Math.sin(angle) * earRadius;
            this.points.push(new SquishyPoint(x, y));
        }

        // 右耳
        for (let i = 0; i < earPoints; i++) {
            const angle = (i / earPoints) * Math.PI * 2;
            const x = this.centerX + 55 + Math.cos(angle) * earRadius;
            const y = this.centerY - 70 + Math.sin(angle) * earRadius;
            this.points.push(new SquishyPoint(x, y));
        }

        this.faceElements = [
            { type: 'eye', x: -25, y: -10 },
            { type: 'eye', x: 25, y: -10 },
            { type: 'nose', x: 0, y: 10 },
            { type: 'mouth', x: 0, y: 25 },
            { type: 'whisker', x: -60, y: 10 },
            { type: 'whisker', x: 60, y: 10 }
        ];
    }

    createBreadShape() {
        // 麵包形狀（橢圓形上方有弧度）
        const segments = 24;

        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const angle = t * Math.PI * 2;

            let x, y;
            if (angle < Math.PI) {
                // 上半部分更高
                const heightMod = 1 + Math.sin(angle) * 0.3;
                x = this.centerX + Math.cos(angle) * 90;
                y = this.centerY + Math.sin(angle) * 70 * heightMod - 20;
            } else {
                x = this.centerX + Math.cos(angle) * 90;
                y = this.centerY + Math.sin(angle) * 50;
            }

            this.points.push(new SquishyPoint(x, y));
        }

        this.faceElements = [
            { type: 'eye', x: -25, y: -20 },
            { type: 'eye', x: 25, y: -20 },
            { type: 'blush', x: -45, y: 5 },
            { type: 'blush', x: 45, y: 5 },
            { type: 'smile', x: 0, y: 15 }
        ];
    }

    createStarShape() {
        // 星星形狀
        const points = 5;
        const outerRadius = 90;
        const innerRadius = 40;

        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;
            this.points.push(new SquishyPoint(x, y));
        }

        this.faceElements = [
            { type: 'eye', x: -20, y: 0 },
            { type: 'eye', x: 20, y: 0 },
            { type: 'smile', x: 0, y: 20 }
        ];
    }

    update(softness, recovery) {
        const recoveryRate = recovery * 0.0005;
        const damping = 0.9;

        for (const point of this.points) {
            point.update(recoveryRate, damping);
        }
    }

    squish(x, y, strength, radius = 80) {
        const squishPos = new Vector2(x, y);

        for (const point of this.points) {
            const dist = Vector2.dist(squishPos, point.restPosition);

            if (dist < radius) {
                const factor = 1 - dist / radius;
                const dir = point.restPosition.sub(squishPos).normalize();

                // 慢回彈變形
                point.applyDeformation(dir.mul(-strength * factor));
            }
        }
    }

    poke(x, y, strength) {
        const pokePos = new Vector2(x, y);

        for (const point of this.points) {
            const dist = Vector2.dist(pokePos, point.restPosition);

            if (dist < 100) {
                const factor = 1 - dist / 100;
                const dir = point.restPosition.sub(pokePos).normalize();
                point.applyDeformation(dir.mul(strength * factor));
            }
        }
    }

    bigSquish() {
        for (const point of this.points) {
            const dir = point.restPosition.sub(new Vector2(this.centerX, this.centerY)).normalize();
            point.applyDeformation(dir.mul(-30));
        }
    }

    draw(ctx) {
        // 陰影
        ctx.beginPath();
        ctx.ellipse(this.centerX, this.centerY + 100, 70, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();

        // 繪製主體
        this.drawBody(ctx);

        // 繪製耳朵（僅貓咪）
        if (this.shapeType === 0) {
            this.drawEars(ctx);
        }

        // 繪製臉部
        this.drawFace(ctx);
    }

    drawBody(ctx) {
        const bodyPoints = this.shapeType === 0 ? 20 : this.points.length;

        ctx.beginPath();
        ctx.moveTo(this.points[0].position.x, this.points[0].position.y);

        for (let i = 0; i < bodyPoints; i++) {
            const curr = this.points[i];
            const next = this.points[(i + 1) % bodyPoints];
            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;
            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();

        // 漸層
        const gradient = ctx.createRadialGradient(
            this.centerX - 30, this.centerY - 30, 0,
            this.centerX, this.centerY, 120
        );
        gradient.addColorStop(0, this.color.light);
        gradient.addColorStop(0.5, this.color.main);
        gradient.addColorStop(1, this.color.dark);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 邊緣
        ctx.strokeStyle = this.color.dark + '40';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.ellipse(
            this.centerX - 25,
            this.centerY - 40,
            25, 15,
            -0.3, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
    }

    drawEars(ctx) {
        // 左耳
        this.drawEar(ctx, 20, 26);

        // 右耳
        this.drawEar(ctx, 26, 32);
    }

    drawEar(ctx, startIdx, endIdx) {
        ctx.beginPath();
        ctx.moveTo(this.points[startIdx].position.x, this.points[startIdx].position.y);

        for (let i = startIdx; i < endIdx; i++) {
            const curr = this.points[i];
            const next = this.points[(i + 1 - startIdx) % (endIdx - startIdx) + startIdx];
            const midX = (curr.position.x + next.position.x) / 2;
            const midY = (curr.position.y + next.position.y) / 2;
            ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
        }

        ctx.closePath();

        const gradient = ctx.createRadialGradient(
            this.points[startIdx].position.x,
            this.points[startIdx].position.y - 10,
            0,
            this.points[startIdx].position.x,
            this.points[startIdx].position.y,
            30
        );
        gradient.addColorStop(0, this.color.light);
        gradient.addColorStop(1, this.color.main);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 內耳
        ctx.beginPath();
        const centerX = this.points.slice(startIdx, endIdx).reduce((sum, p) => sum + p.position.x, 0) / (endIdx - startIdx);
        const centerY = this.points.slice(startIdx, endIdx).reduce((sum, p) => sum + p.position.y, 0) / (endIdx - startIdx);
        ctx.ellipse(centerX, centerY, 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#f48fb1';
        ctx.fill();
    }

    drawFace(ctx) {
        for (const elem of this.faceElements) {
            const x = this.centerX + elem.x;
            const y = this.centerY + elem.y;

            switch (elem.type) {
                case 'eye':
                    // 眼睛
                    ctx.beginPath();
                    ctx.ellipse(x, y, 8, 10, 0, 0, Math.PI * 2);
                    ctx.fillStyle = '#212121';
                    ctx.fill();

                    // 高光
                    ctx.beginPath();
                    ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    break;

                case 'nose':
                    ctx.beginPath();
                    ctx.moveTo(x, y - 5);
                    ctx.lineTo(x - 8, y + 5);
                    ctx.lineTo(x + 8, y + 5);
                    ctx.closePath();
                    ctx.fillStyle = '#f48fb1';
                    ctx.fill();
                    break;

                case 'mouth':
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.quadraticCurveTo(x - 15, y + 15, x - 20, y);
                    ctx.moveTo(x, y);
                    ctx.quadraticCurveTo(x + 15, y + 15, x + 20, y);
                    ctx.strokeStyle = '#c2185b';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;

                case 'whisker':
                    const dir = elem.x > 0 ? 1 : -1;
                    ctx.strokeStyle = '#c2185b';
                    ctx.lineWidth = 1.5;

                    for (let i = -1; i <= 1; i++) {
                        ctx.beginPath();
                        ctx.moveTo(x, y + i * 8);
                        ctx.lineTo(x + dir * 30, y + i * 8 + i * 3);
                        ctx.stroke();
                    }
                    break;

                case 'blush':
                    ctx.beginPath();
                    ctx.ellipse(x, y, 12, 8, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(244, 143, 177, 0.5)';
                    ctx.fill();
                    break;

                case 'smile':
                    ctx.beginPath();
                    ctx.arc(x, y, 15, 0.1 * Math.PI, 0.9 * Math.PI);
                    ctx.strokeStyle = '#8d6e63';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    break;
            }
        }
    }

    reset() {
        for (const point of this.points) {
            point.reset();
        }
    }

    setShape(shapeType) {
        this.shapeType = shapeType;
        this.initShape();
    }
}

// 主應用
class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.softness = 80;
        this.recovery = 30;
        this.shape = 0;

        this.toy = null;
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
        this.toy = new SquishyToy(this.width / 2, this.height / 2, this.shape);
    }

    setupControls() {
        document.getElementById('softness').addEventListener('input', (e) => {
            this.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = this.softness;
        });

        document.getElementById('recovery').addEventListener('input', (e) => {
            this.recovery = parseInt(e.target.value);
            document.getElementById('recoveryValue').textContent = this.recovery;
        });

        const shapeSlider = document.getElementById('shape');
        const shapeValue = document.getElementById('shapeValue');
        const shapeNames = ['貓咪', '麵包', '星星'];

        shapeSlider.addEventListener('input', (e) => {
            this.shape = parseInt(e.target.value);
            shapeValue.textContent = shapeNames[this.shape];
            this.toy.setShape(this.shape);
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.toy.reset();
        });

        document.getElementById('squishBtn').addEventListener('click', () => {
            this.toy.bigSquish();
        });

        document.getElementById('pokeBtn').addEventListener('click', () => {
            this.toy.poke(this.width / 2, this.height / 2, 20);
        });
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', () => this.isDragging = false);
        this.canvas.addEventListener('mouseleave', () => this.isDragging = false);

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
        return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
    }

    handlePointerDown(e) {
        this.isDragging = true;
        this.lastPointerPos = this.getPointerPos(e);
        this.toy.squish(this.lastPointerPos.x, this.lastPointerPos.y, 15);
    }

    handlePointerMove(e) {
        if (!this.isDragging) return;
        const pos = this.getPointerPos(e);
        this.toy.squish(pos.x, pos.y, 8);
        this.lastPointerPos = pos;
    }

    update() {
        this.toy.update(this.softness, this.recovery);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#fff8e1');
        gradient.addColorStop(1, '#ffe082');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 玩具
        this.toy.draw(this.ctx);
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener('load', () => new App());
