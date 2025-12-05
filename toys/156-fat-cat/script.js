/**
 * 156 - 胖胖貓
 * Fat Cat
 *
 * 軟體物理的卡通貓咪，可戳和拖曳
 * 包含可愛的表情反應和軟綿綿的身體
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
    lerp(v, t) { return this.add(v.sub(this).mul(t)); }
    dist(v) { return this.sub(v).length(); }
}

// 軟體質點
class SoftPoint {
    constructor(x, y, restX, restY) {
        this.position = new Vector2(x, y);
        this.restPosition = new Vector2(restX, restY);
        this.velocity = new Vector2();
        this.isPinned = false;
    }

    update(recovery, damping, gravity) {
        if (this.isPinned) return;

        // 重力
        this.velocity.y += gravity * 0.01;

        // 回復力
        const toRest = this.restPosition.sub(this.position);
        this.velocity = this.velocity.add(toRest.mul(recovery * 0.002));

        // 阻尼
        this.velocity = this.velocity.mul(damping);

        // 更新位置
        this.position = this.position.add(this.velocity);
    }
}

// 胖貓類別
class FatCat {
    constructor(x, y, size, colorScheme) {
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.colorScheme = colorScheme;

        // 身體各部位的軟體點
        this.bodyPoints = [];
        this.headPoints = [];
        this.earPoints = { left: [], right: [] };
        this.tailPoints = [];

        // 表情狀態
        this.expression = 'normal'; // normal, happy, surprised, sleepy
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.mood = 1; // 0-1, 影響表情

        this.createCat();
    }

    createCat() {
        // 身體 - 橢圓形
        const bodyWidth = this.size * 1.2;
        const bodyHeight = this.size * 0.9;
        const bodyY = this.centerY + this.size * 0.3;
        const numBodyPoints = 20;

        for (let i = 0; i < numBodyPoints; i++) {
            const angle = (i / numBodyPoints) * Math.PI * 2;
            const rx = bodyWidth * (1 + Math.sin(angle) * 0.1);
            const ry = bodyHeight;
            const px = this.centerX + Math.cos(angle) * rx;
            const py = bodyY + Math.sin(angle) * ry;
            this.bodyPoints.push(new SoftPoint(px, py, px, py));
        }

        // 頭部 - 圓形
        const headY = this.centerY - this.size * 0.4;
        const headRadius = this.size * 0.7;
        const numHeadPoints = 16;

        for (let i = 0; i < numHeadPoints; i++) {
            const angle = (i / numHeadPoints) * Math.PI * 2;
            const px = this.centerX + Math.cos(angle) * headRadius;
            const py = headY + Math.sin(angle) * headRadius * 0.9;
            this.headPoints.push(new SoftPoint(px, py, px, py));
        }

        // 耳朵
        const earSize = this.size * 0.25;
        const earY = headY - headRadius * 0.6;

        // 左耳
        for (let i = 0; i < 3; i++) {
            const t = i / 2;
            const px = this.centerX - headRadius * 0.5 + t * earSize * 0.3;
            const py = earY - (1 - Math.abs(t - 0.5) * 2) * earSize;
            this.earPoints.left.push(new SoftPoint(px, py, px, py));
        }

        // 右耳
        for (let i = 0; i < 3; i++) {
            const t = i / 2;
            const px = this.centerX + headRadius * 0.5 - t * earSize * 0.3;
            const py = earY - (1 - Math.abs(t - 0.5) * 2) * earSize;
            this.earPoints.right.push(new SoftPoint(px, py, px, py));
        }

        // 尾巴
        const tailStartX = this.centerX + bodyWidth * 0.9;
        const tailStartY = bodyY;
        const tailLength = this.size * 0.8;
        const numTailPoints = 8;

        for (let i = 0; i < numTailPoints; i++) {
            const t = i / (numTailPoints - 1);
            const px = tailStartX + t * tailLength * 0.5;
            const py = tailStartY - t * tailLength * 0.8 + Math.sin(t * Math.PI) * this.size * 0.2;
            this.tailPoints.push(new SoftPoint(px, py, px, py));
        }
    }

    getAllPoints() {
        return [
            ...this.bodyPoints,
            ...this.headPoints,
            ...this.earPoints.left,
            ...this.earPoints.right,
            ...this.tailPoints
        ];
    }

    poke(pos, radius, strength) {
        const allPoints = this.getAllPoints();
        let poked = false;

        for (const p of allPoints) {
            const dist = p.position.dist(pos);
            if (dist < radius) {
                const dir = p.position.sub(pos).normalize();
                const force = dir.mul(strength * (1 - dist / radius));
                p.velocity = p.velocity.add(force);
                poked = true;
            }
        }

        if (poked) {
            this.expression = 'surprised';
            setTimeout(() => { this.expression = 'normal'; }, 500);
        }

        return poked;
    }

    drag(pos, prevPos) {
        const allPoints = this.getAllPoints();
        const dragRadius = this.size * 0.5;

        for (const p of allPoints) {
            const dist = p.position.dist(prevPos);
            if (dist < dragRadius) {
                const delta = pos.sub(prevPos);
                const factor = 1 - dist / dragRadius;
                p.position = p.position.add(delta.mul(factor * 0.5));
                p.velocity = p.velocity.add(delta.mul(factor * 0.1));
            }
        }
    }

    update(params, bounds) {
        const { softness, bounce, gravity } = params;
        const recovery = softness / 100;
        const damping = 0.9 + bounce * 0.001;

        // 更新所有點
        const allPoints = this.getAllPoints();
        for (const p of allPoints) {
            p.update(recovery, damping, gravity);
        }

        // 維持形狀
        this.maintainShape(recovery);

        // 邊界處理
        this.handleBounds(bounds, bounce / 100);

        // 眨眼計時
        this.blinkTimer += 0.016;
        if (this.blinkTimer > 2.5 + Math.random() * 2) {
            this.isBlinking = true;
            setTimeout(() => { this.isBlinking = false; }, 150);
            this.blinkTimer = 0;
        }
    }

    maintainShape(stiffness) {
        // 身體形狀維持
        this.maintainRingShape(this.bodyPoints, stiffness);

        // 頭部形狀維持
        this.maintainRingShape(this.headPoints, stiffness);

        // 尾巴連接
        for (let i = 1; i < this.tailPoints.length; i++) {
            const p1 = this.tailPoints[i - 1];
            const p2 = this.tailPoints[i];
            const diff = p2.position.sub(p1.position);
            const dist = diff.length();
            const targetDist = this.size * 0.12;

            if (dist > 0) {
                const delta = (dist - targetDist) / dist * 0.3;
                const correction = diff.mul(delta);
                p1.position = p1.position.add(correction);
                p2.position = p2.position.sub(correction);
            }
        }
    }

    maintainRingShape(points, stiffness) {
        // 相鄰點約束
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            const p1 = points[i];
            const p2 = points[j];

            const diff = p2.position.sub(p1.position);
            const dist = diff.length();
            const restDist = p2.restPosition.sub(p1.restPosition).length();

            if (dist > 0) {
                const delta = (dist - restDist) / dist * stiffness * 0.3;
                const correction = diff.mul(delta);
                p1.position = p1.position.add(correction);
                p2.position = p2.position.sub(correction);
            }
        }
    }

    handleBounds(bounds, bounce) {
        const allPoints = this.getAllPoints();
        const groundY = bounds.height - 30;

        for (const p of allPoints) {
            if (p.position.y > groundY) {
                p.position.y = groundY;
                p.velocity.y *= -bounce;
                p.velocity.x *= 0.9;
            }

            if (p.position.x < 30) {
                p.position.x = 30;
                p.velocity.x *= -bounce;
            }
            if (p.position.x > bounds.width - 30) {
                p.position.x = bounds.width - 30;
                p.velocity.x *= -bounce;
            }
        }
    }

    getBodyCenter() {
        let cx = 0, cy = 0;
        for (const p of this.bodyPoints) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.bodyPoints.length, cy / this.bodyPoints.length);
    }

    getHeadCenter() {
        let cx = 0, cy = 0;
        for (const p of this.headPoints) {
            cx += p.position.x;
            cy += p.position.y;
        }
        return new Vector2(cx / this.headPoints.length, cy / this.headPoints.length);
    }

    draw(ctx, time) {
        // 繪製陰影
        const bodyCenter = this.getBodyCenter();
        ctx.beginPath();
        ctx.ellipse(bodyCenter.x, ctx.canvas.height / window.devicePixelRatio - 20,
            this.size * 0.8, 15, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fill();

        // 繪製尾巴
        this.drawTail(ctx);

        // 繪製身體
        this.drawBody(ctx);

        // 繪製頭部
        this.drawHead(ctx, time);

        // 繪製耳朵
        this.drawEars(ctx);

        // 繪製臉部
        this.drawFace(ctx, time);
    }

    drawBody(ctx) {
        ctx.beginPath();
        const first = this.bodyPoints[0];
        ctx.moveTo(first.position.x, first.position.y);

        for (let i = 0; i < this.bodyPoints.length; i++) {
            const p1 = this.bodyPoints[i];
            const p2 = this.bodyPoints[(i + 1) % this.bodyPoints.length];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        // 漸層
        const center = this.getBodyCenter();
        const gradient = ctx.createRadialGradient(
            center.x - this.size * 0.3, center.y - this.size * 0.3, 0,
            center.x, center.y, this.size * 1.3
        );
        gradient.addColorStop(0, this.colorScheme.light);
        gradient.addColorStop(0.5, this.colorScheme.main);
        gradient.addColorStop(1, this.colorScheme.dark);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 肚皮
        ctx.beginPath();
        ctx.ellipse(center.x, center.y + this.size * 0.2,
            this.size * 0.5, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.colorScheme.belly;
        ctx.fill();
    }

    drawHead(ctx, time) {
        ctx.beginPath();
        const first = this.headPoints[0];
        ctx.moveTo(first.position.x, first.position.y);

        for (let i = 0; i < this.headPoints.length; i++) {
            const p1 = this.headPoints[i];
            const p2 = this.headPoints[(i + 1) % this.headPoints.length];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }
        ctx.closePath();

        const center = this.getHeadCenter();
        const gradient = ctx.createRadialGradient(
            center.x - this.size * 0.2, center.y - this.size * 0.2, 0,
            center.x, center.y, this.size * 0.8
        );
        gradient.addColorStop(0, this.colorScheme.light);
        gradient.addColorStop(0.6, this.colorScheme.main);
        gradient.addColorStop(1, this.colorScheme.dark);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawEars(ctx) {
        // 左耳
        ctx.beginPath();
        const leftBase = this.headPoints[Math.floor(this.headPoints.length * 0.1)];
        ctx.moveTo(leftBase.position.x, leftBase.position.y);
        for (const p of this.earPoints.left) {
            ctx.lineTo(p.position.x, p.position.y);
        }
        ctx.closePath();
        ctx.fillStyle = this.colorScheme.main;
        ctx.fill();
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 左耳內部
        ctx.beginPath();
        ctx.moveTo(this.earPoints.left[0].position.x + 5, this.earPoints.left[0].position.y + 5);
        ctx.lineTo(this.earPoints.left[1].position.x, this.earPoints.left[1].position.y + 8);
        ctx.lineTo(this.earPoints.left[2].position.x - 5, this.earPoints.left[2].position.y + 5);
        ctx.closePath();
        ctx.fillStyle = this.colorScheme.earInner;
        ctx.fill();

        // 右耳
        ctx.beginPath();
        const rightBase = this.headPoints[Math.floor(this.headPoints.length * 0.9)];
        ctx.moveTo(rightBase.position.x, rightBase.position.y);
        for (const p of this.earPoints.right) {
            ctx.lineTo(p.position.x, p.position.y);
        }
        ctx.closePath();
        ctx.fillStyle = this.colorScheme.main;
        ctx.fill();
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 右耳內部
        ctx.beginPath();
        ctx.moveTo(this.earPoints.right[0].position.x - 5, this.earPoints.right[0].position.y + 5);
        ctx.lineTo(this.earPoints.right[1].position.x, this.earPoints.right[1].position.y + 8);
        ctx.lineTo(this.earPoints.right[2].position.x + 5, this.earPoints.right[2].position.y + 5);
        ctx.closePath();
        ctx.fillStyle = this.colorScheme.earInner;
        ctx.fill();
    }

    drawTail(ctx) {
        if (this.tailPoints.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.tailPoints[0].position.x, this.tailPoints[0].position.y);

        for (let i = 1; i < this.tailPoints.length; i++) {
            const p = this.tailPoints[i];
            ctx.lineTo(p.position.x, p.position.y);
        }

        ctx.strokeStyle = this.colorScheme.main;
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawFace(ctx, time) {
        const center = this.getHeadCenter();
        const eyeOffsetX = this.size * 0.2;
        const eyeOffsetY = -this.size * 0.05;
        const eyeRadius = this.size * 0.1;

        // 眼睛
        for (let side = -1; side <= 1; side += 2) {
            const ex = center.x + eyeOffsetX * side;
            const ey = center.y + eyeOffsetY;

            // 眼白
            ctx.beginPath();
            if (this.isBlinking || this.expression === 'sleepy') {
                ctx.ellipse(ex, ey, eyeRadius, eyeRadius * 0.1, 0, 0, Math.PI * 2);
            } else {
                ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
            }
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = this.colorScheme.outline;
            ctx.lineWidth = 1;
            ctx.stroke();

            // 瞳孔
            if (!this.isBlinking && this.expression !== 'sleepy') {
                const pupilSize = this.expression === 'surprised' ? eyeRadius * 0.7 : eyeRadius * 0.5;
                ctx.beginPath();
                ctx.arc(ex, ey + 2, pupilSize, 0, Math.PI * 2);
                ctx.fillStyle = '#333';
                ctx.fill();

                // 高光
                ctx.beginPath();
                ctx.arc(ex - 2, ey, pupilSize * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
        }

        // 鼻子
        const noseY = center.y + this.size * 0.15;
        ctx.beginPath();
        ctx.moveTo(center.x, noseY - 5);
        ctx.lineTo(center.x - 6, noseY + 5);
        ctx.lineTo(center.x + 6, noseY + 5);
        ctx.closePath();
        ctx.fillStyle = '#ff9999';
        ctx.fill();

        // 嘴巴
        const mouthY = noseY + 8;
        ctx.beginPath();
        if (this.expression === 'happy') {
            ctx.arc(center.x, mouthY, this.size * 0.1, 0.1 * Math.PI, 0.9 * Math.PI);
        } else if (this.expression === 'surprised') {
            ctx.ellipse(center.x, mouthY + 5, 8, 12, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ff9999';
            ctx.fill();
        } else {
            // 貓咪 w 嘴
            ctx.moveTo(center.x - 10, mouthY);
            ctx.quadraticCurveTo(center.x - 5, mouthY + 8, center.x, mouthY);
            ctx.quadraticCurveTo(center.x + 5, mouthY + 8, center.x + 10, mouthY);
        }
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 鬍鬚
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 1;
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 3; i++) {
                const angle = (i - 1) * 0.15 + (side > 0 ? 0 : Math.PI);
                const startX = center.x + side * this.size * 0.25;
                const startY = noseY + 5 + i * 5;
                const endX = startX + side * this.size * 0.35;
                const endY = startY + (i - 1) * 5;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }

        // 腮紅
        ctx.beginPath();
        ctx.ellipse(center.x - this.size * 0.35, center.y + this.size * 0.1,
            this.size * 0.08, this.size * 0.05, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 180, 180, 0.5)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(center.x + this.size * 0.35, center.y + this.size * 0.1,
            this.size * 0.08, this.size * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    reset() {
        this.createCat();
        this.expression = 'normal';
    }
}

// 主應用程式
class FatCatApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.params = {
            softness: 60,
            bounce: 50,
            gravity: 40
        };

        this.colorSchemes = [
            {
                name: 'orange',
                light: '#ffcc80',
                main: '#ff9800',
                dark: '#e65100',
                outline: '#5d4037',
                belly: '#fff8e1',
                earInner: '#ffab91'
            },
            {
                name: 'gray',
                light: '#bdbdbd',
                main: '#757575',
                dark: '#424242',
                outline: '#212121',
                belly: '#eeeeee',
                earInner: '#ff8a80'
            },
            {
                name: 'white',
                light: '#ffffff',
                main: '#f5f5f5',
                dark: '#e0e0e0',
                outline: '#9e9e9e',
                belly: '#ffffff',
                earInner: '#ffab91'
            },
            {
                name: 'black',
                light: '#616161',
                main: '#424242',
                dark: '#212121',
                outline: '#000000',
                belly: '#757575',
                earInner: '#ff8a80'
            },
            {
                name: 'calico',
                light: '#ffcc80',
                main: '#ff9800',
                dark: '#5d4037',
                outline: '#3e2723',
                belly: '#fff8e1',
                earInner: '#ffab91'
            }
        ];

        this.currentColorIndex = 0;
        this.cat = null;
        this.time = 0;
        this.mousePos = new Vector2();
        this.prevMousePos = new Vector2();
        this.isPressed = false;

        this.resize();
        this.createCat();
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

    createCat() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        const size = Math.min(this.bounds.width, this.bounds.height) * 0.18;
        this.cat = new FatCat(x, y, size, this.colorSchemes[this.currentColorIndex]);
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isPressed = true;
            this.updateMousePos(e);
            this.prevMousePos = new Vector2(this.mousePos.x, this.mousePos.y);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            this.prevMousePos = new Vector2(this.mousePos.x, this.mousePos.y);
            this.updateMousePos(e);

            if (this.isPressed) {
                this.cat.drag(this.mousePos, this.prevMousePos);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPressed = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPressed = false;
        });

        this.canvas.addEventListener('click', (e) => {
            this.updateMousePos(e);
            this.cat.poke(this.mousePos, this.cat.size * 0.5, 8);
        });

        // 觸控
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isPressed = true;
            this.updateTouchPos(e);
            this.prevMousePos = new Vector2(this.mousePos.x, this.mousePos.y);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.prevMousePos = new Vector2(this.mousePos.x, this.mousePos.y);
            this.updateTouchPos(e);

            if (this.isPressed) {
                this.cat.drag(this.mousePos, this.prevMousePos);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isPressed = false;
            this.cat.poke(this.mousePos, this.cat.size * 0.5, 5);
        });

        window.addEventListener('resize', () => {
            this.resize();
            this.createCat();
        });

        // 控制項
        document.getElementById('softness').addEventListener('input', (e) => {
            this.params.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = e.target.value;
        });

        document.getElementById('bounce').addEventListener('input', (e) => {
            this.params.bounce = parseInt(e.target.value);
            document.getElementById('bounceValue').textContent = e.target.value;
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.params.gravity = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.cat.reset();
        });

        document.getElementById('pokeBtn').addEventListener('click', () => {
            const center = this.cat.getBodyCenter();
            this.cat.poke(center, this.cat.size, 10);
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colorSchemes.length;
            this.cat.colorScheme = this.colorSchemes[this.currentColorIndex];
        });
    }

    updateMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
    }

    updateTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
    }

    update() {
        this.cat.update(this.params, this.bounds);
    }

    draw() {
        // 背景
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        bgGradient.addColorStop(0, '#fff8e1');
        bgGradient.addColorStop(0.5, '#ffecb3');
        bgGradient.addColorStop(1, '#ffe082');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 地板
        this.ctx.fillStyle = '#d7ccc8';
        this.ctx.fillRect(0, this.bounds.height - 30, this.bounds.width, 30);

        // 地板紋理
        this.ctx.strokeStyle = '#bcaaa4';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.bounds.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.bounds.height - 30);
            this.ctx.lineTo(x, this.bounds.height);
            this.ctx.stroke();
        }

        // 繪製貓咪
        this.cat.draw(this.ctx, this.time);
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
    new FatCatApp();
});
