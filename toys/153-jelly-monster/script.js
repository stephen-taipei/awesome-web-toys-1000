/**
 * 153 - 果凍怪物
 * Jelly Monster
 *
 * 可控制的果凍角色，跳躍和移動時會產生彈性形變
 * 使用軟體物理模擬實現 Q 彈的視覺效果
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
    dot(v) { return this.x * v.x + this.y * v.y; }
    lerp(v, t) { return this.add(v.sub(this).mul(t)); }
}

// 果凍怪物質點
class JellyPoint {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.prevPosition = new Vector2(x, y);
        this.acceleration = new Vector2();
        this.radius = 8;
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    update(damping) {
        const velocity = this.position.sub(this.prevPosition).mul(damping);
        this.prevPosition = new Vector2(this.position.x, this.position.y);
        this.position = this.position.add(velocity).add(this.acceleration.mul(0.5));
        this.acceleration = new Vector2();
    }
}

// 果凍怪物類別
class JellyMonster {
    constructor(x, y, colorScheme) {
        this.baseX = x;
        this.baseY = y;
        this.radius = 60;
        this.numPoints = 16;
        this.colorScheme = colorScheme;

        this.points = [];
        this.restLengths = [];
        this.centerRestLengths = [];

        this.velocity = new Vector2();
        this.isGrounded = false;
        this.moveDirection = 0;
        this.squashAmount = 0;

        // 表情狀態
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.expression = 'normal'; // normal, happy, surprised

        this.createBody(x, y);
    }

    createBody(x, y) {
        this.points = [];

        // 中心點
        const center = new JellyPoint(x, y);
        this.points.push(center);

        // 外圈點
        for (let i = 0; i < this.numPoints; i++) {
            const angle = (i / this.numPoints) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * this.radius;
            const py = y + Math.sin(angle) * this.radius;
            this.points.push(new JellyPoint(px, py));
        }

        // 計算靜止長度
        this.restLengths = [];
        this.centerRestLengths = [];

        const outer = this.points.slice(1);
        for (let i = 0; i < outer.length; i++) {
            const j = (i + 1) % outer.length;
            this.restLengths.push(outer[i].position.sub(outer[j].position).length());
            this.centerRestLengths.push(center.position.sub(outer[i].position).length());
        }
    }

    getCenter() {
        return this.points[0].position;
    }

    applyMovement(direction, jumpPower) {
        this.moveDirection = direction;

        // 水平移動力
        if (direction !== 0) {
            const moveForce = new Vector2(direction * 0.8, 0);
            for (const p of this.points) {
                p.applyForce(moveForce);
            }
        }
    }

    jump(power) {
        if (this.isGrounded) {
            const jumpForce = new Vector2(0, -power * 0.15);
            for (const p of this.points) {
                p.applyForce(jumpForce);
            }
            this.isGrounded = false;
            this.expression = 'surprised';
            setTimeout(() => { this.expression = 'normal'; }, 300);

            // 跳躍時的壓縮效果
            this.squashAmount = 0.3;
        }
    }

    jumpToward(targetX, targetY, power) {
        const center = this.getCenter();
        const dir = new Vector2(targetX - center.x, targetY - center.y).normalize();
        const force = dir.mul(power * 0.1);

        if (this.isGrounded || center.y < targetY) {
            for (const p of this.points) {
                p.applyForce(force);
            }
            this.isGrounded = false;
            this.expression = 'happy';
            setTimeout(() => { this.expression = 'normal'; }, 500);
        }
    }

    update(params, bounds) {
        const { bounce, softness, gravity } = params;
        const damping = 0.96;
        const stiffness = softness / 100;

        // 重力
        const gravityForce = new Vector2(0, gravity * 0.02);
        for (const p of this.points) {
            p.applyForce(gravityForce);
        }

        // 更新質點
        for (const p of this.points) {
            p.update(damping);
        }

        // 約束求解
        this.satisfyConstraints(stiffness);

        // 壓力維持形狀
        this.applyPressure();

        // 邊界碰撞
        this.handleBounds(bounds, bounce / 100);

        // 壓縮效果衰減
        this.squashAmount *= 0.9;

        // 眨眼計時
        this.blinkTimer += 0.016;
        if (this.blinkTimer > 3 + Math.random() * 2) {
            this.isBlinking = true;
            setTimeout(() => { this.isBlinking = false; }, 150);
            this.blinkTimer = 0;
        }
    }

    satisfyConstraints(stiffness) {
        const iterations = 4;
        const center = this.points[0];
        const outer = this.points.slice(1);

        for (let iter = 0; iter < iterations; iter++) {
            // 外圈相鄰約束
            for (let i = 0; i < outer.length; i++) {
                const j = (i + 1) % outer.length;
                const p1 = outer[i];
                const p2 = outer[j];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const restLen = this.restLengths[i];

                if (dist > 0) {
                    const delta = (dist - restLen) / dist * 0.5 * stiffness;
                    const correction = diff.mul(delta);
                    p1.position = p1.position.add(correction);
                    p2.position = p2.position.sub(correction);
                }
            }

            // 中心到外圈約束
            for (let i = 0; i < outer.length; i++) {
                const p = outer[i];
                const diff = p.position.sub(center.position);
                const dist = diff.length();
                const restLen = this.centerRestLengths[i];

                if (dist > 0) {
                    const delta = (dist - restLen) / dist * 0.3;
                    const correction = diff.mul(delta);
                    center.position = center.position.add(correction.mul(0.2));
                    p.position = p.position.sub(correction.mul(0.8));
                }
            }

            // 對角約束（保持圓形）
            for (let i = 0; i < outer.length / 2; i++) {
                const j = i + outer.length / 2;
                const p1 = outer[i];
                const p2 = outer[Math.floor(j)];

                const diff = p2.position.sub(p1.position);
                const dist = diff.length();
                const targetDist = this.radius * 2;

                if (dist > 0) {
                    const delta = (dist - targetDist) / dist * 0.1;
                    const correction = diff.mul(delta);
                    p1.position = p1.position.add(correction);
                    p2.position = p2.position.sub(correction);
                }
            }
        }
    }

    applyPressure() {
        const center = this.points[0];
        const outer = this.points.slice(1);

        // 計算當前面積
        let area = 0;
        for (let i = 0; i < outer.length; i++) {
            const j = (i + 1) % outer.length;
            area += outer[i].position.x * outer[j].position.y;
            area -= outer[j].position.x * outer[i].position.y;
        }
        area = Math.abs(area) / 2;

        const targetArea = Math.PI * this.radius * this.radius;
        const pressureStrength = (targetArea - area) / targetArea * 0.5;

        // 對外圈施加向外的壓力
        for (const p of outer) {
            const toOut = p.position.sub(center.position).normalize();
            p.applyForce(toOut.mul(pressureStrength));
        }
    }

    handleBounds(bounds, bounce) {
        const groundY = bounds.height - 20;
        let wasGrounded = this.isGrounded;
        this.isGrounded = false;

        for (const p of this.points) {
            // 地面
            if (p.position.y > groundY - p.radius) {
                p.position.y = groundY - p.radius;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
                p.prevPosition.x = p.position.x - (p.position.x - p.prevPosition.x) * 0.1;
                this.isGrounded = true;

                // 落地時的壓縮
                if (!wasGrounded && Math.abs(vy) > 2) {
                    this.squashAmount = Math.min(0.4, Math.abs(vy) * 0.05);
                    this.expression = 'surprised';
                    setTimeout(() => { this.expression = 'normal'; }, 200);
                }
            }

            // 天花板
            if (p.position.y < p.radius + 10) {
                p.position.y = p.radius + 10;
                const vy = p.position.y - p.prevPosition.y;
                p.prevPosition.y = p.position.y + vy * bounce;
            }

            // 左右牆壁
            if (p.position.x < p.radius + 10) {
                p.position.x = p.radius + 10;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
            if (p.position.x > bounds.width - p.radius - 10) {
                p.position.x = bounds.width - p.radius - 10;
                const vx = p.position.x - p.prevPosition.x;
                p.prevPosition.x = p.position.x + vx * bounce;
            }
        }
    }

    draw(ctx, time) {
        const center = this.getCenter();
        const outer = this.points.slice(1);

        // 繪製陰影
        ctx.beginPath();
        ctx.ellipse(center.x, ctx.canvas.height / window.devicePixelRatio - 15,
            this.radius * 0.8, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // 繪製身體
        ctx.beginPath();
        const firstMid = outer[outer.length - 1].position.lerp(outer[0].position, 0.5);
        ctx.moveTo(firstMid.x, firstMid.y);

        for (let i = 0; i < outer.length; i++) {
            const p1 = outer[i];
            const p2 = outer[(i + 1) % outer.length];
            const mid = p1.position.lerp(p2.position, 0.5);
            ctx.quadraticCurveTo(p1.position.x, p1.position.y, mid.x, mid.y);
        }

        ctx.closePath();

        // 漸層填充
        const gradient = ctx.createRadialGradient(
            center.x - this.radius * 0.3,
            center.y - this.radius * 0.3,
            0,
            center.x,
            center.y,
            this.radius * 1.5
        );

        const hueShift = Math.sin(time) * 5;
        gradient.addColorStop(0, this.colorScheme.highlight);
        gradient.addColorStop(0.4, this.colorScheme.light);
        gradient.addColorStop(0.7, this.colorScheme.main);
        gradient.addColorStop(1, this.colorScheme.dark);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 外輪廓
        ctx.strokeStyle = this.colorScheme.outline;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 高光
        ctx.beginPath();
        ctx.ellipse(
            center.x - this.radius * 0.3,
            center.y - this.radius * 0.35,
            this.radius * 0.25,
            this.radius * 0.15,
            -Math.PI / 4,
            0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 繪製臉部
        this.drawFace(ctx, center, time);
    }

    drawFace(ctx, center, time) {
        const eyeOffsetX = this.radius * 0.3;
        const eyeOffsetY = -this.radius * 0.1;
        const eyeRadius = this.radius * 0.18;

        // 眼睛
        for (let side = -1; side <= 1; side += 2) {
            const ex = center.x + eyeOffsetX * side;
            const ey = center.y + eyeOffsetY;

            // 眼白
            ctx.beginPath();
            if (this.isBlinking) {
                ctx.ellipse(ex, ey, eyeRadius, eyeRadius * 0.1, 0, 0, Math.PI * 2);
            } else {
                ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
            }
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 瞳孔
            if (!this.isBlinking) {
                const pupilOffsetX = this.moveDirection * 3;
                const pupilRadius = eyeRadius * 0.55;

                ctx.beginPath();
                ctx.arc(ex + pupilOffsetX, ey + 2, pupilRadius, 0, Math.PI * 2);
                ctx.fillStyle = '#333';
                ctx.fill();

                // 瞳孔高光
                ctx.beginPath();
                ctx.arc(ex + pupilOffsetX - 2, ey, pupilRadius * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            }
        }

        // 嘴巴
        const mouthY = center.y + this.radius * 0.35;
        ctx.beginPath();

        if (this.expression === 'happy') {
            ctx.arc(center.x, mouthY - 5, this.radius * 0.25, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (this.expression === 'surprised') {
            ctx.ellipse(center.x, mouthY, this.radius * 0.12, this.radius * 0.18, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
        } else {
            // 微笑
            ctx.arc(center.x, mouthY - 8, this.radius * 0.2, 0.15 * Math.PI, 0.85 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // 腮紅
        ctx.beginPath();
        ctx.ellipse(center.x - this.radius * 0.5, center.y + this.radius * 0.15,
            this.radius * 0.12, this.radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(center.x + this.radius * 0.5, center.y + this.radius * 0.15,
            this.radius * 0.12, this.radius * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    reset(x, y) {
        this.createBody(x, y);
        this.isGrounded = false;
        this.expression = 'normal';
    }
}

// 平台類別
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#4a4a8a');
        gradient.addColorStop(1, '#2a2a5a');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#6a6aaa';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// 主應用程式
class JellyMonsterApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.params = {
            bounce: 70,
            softness: 50,
            jumpPower: 120,
            gravity: 50
        };

        this.colorSchemes = [
            {
                highlight: 'rgba(200, 255, 255, 0.9)',
                light: 'rgba(100, 255, 220, 0.85)',
                main: 'rgba(0, 220, 180, 0.8)',
                dark: 'rgba(0, 150, 130, 0.75)',
                outline: 'rgba(0, 100, 90, 0.6)'
            },
            {
                highlight: 'rgba(255, 200, 255, 0.9)',
                light: 'rgba(255, 150, 220, 0.85)',
                main: 'rgba(220, 100, 180, 0.8)',
                dark: 'rgba(180, 60, 140, 0.75)',
                outline: 'rgba(120, 40, 100, 0.6)'
            },
            {
                highlight: 'rgba(255, 255, 200, 0.9)',
                light: 'rgba(255, 220, 100, 0.85)',
                main: 'rgba(255, 180, 50, 0.8)',
                dark: 'rgba(220, 140, 20, 0.75)',
                outline: 'rgba(180, 100, 0, 0.6)'
            },
            {
                highlight: 'rgba(200, 220, 255, 0.9)',
                light: 'rgba(100, 180, 255, 0.85)',
                main: 'rgba(50, 130, 220, 0.8)',
                dark: 'rgba(30, 90, 180, 0.75)',
                outline: 'rgba(20, 60, 140, 0.6)'
            }
        ];

        this.currentColorIndex = 0;
        this.monster = null;
        this.platforms = [];
        this.keys = {};
        this.time = 0;

        this.resize();
        this.createMonster();
        this.createPlatforms();
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

    createMonster() {
        const x = this.bounds.width / 2;
        const y = this.bounds.height / 2;
        this.monster = new JellyMonster(x, y, this.colorSchemes[this.currentColorIndex]);
    }

    createPlatforms() {
        this.platforms = [
            new Platform(50, this.bounds.height - 150, 150, 20),
            new Platform(this.bounds.width - 200, this.bounds.height - 200, 150, 20),
            new Platform(this.bounds.width / 2 - 75, this.bounds.height - 280, 150, 20)
        ];
    }

    setupEventListeners() {
        // 鍵盤事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.monster.jump(this.params.jumpPower);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // 滑鼠點擊
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.monster.jumpToward(x, y, this.params.jumpPower);
        });

        // 觸控
        let touchStartX = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;

            if (Math.abs(deltaX) > 20) {
                this.monster.applyMovement(deltaX > 0 ? 1 : -1, this.params.jumpPower);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.changedTouches.length > 0) {
                this.monster.jump(this.params.jumpPower);
            }
        });

        // 視窗大小調整
        window.addEventListener('resize', () => {
            this.resize();
            this.createPlatforms();
        });

        // 控制項
        document.getElementById('bounce').addEventListener('input', (e) => {
            this.params.bounce = parseInt(e.target.value);
            document.getElementById('bounceValue').textContent = e.target.value;
        });

        document.getElementById('softness').addEventListener('input', (e) => {
            this.params.softness = parseInt(e.target.value);
            document.getElementById('softnessValue').textContent = e.target.value;
        });

        document.getElementById('jumpPower').addEventListener('input', (e) => {
            this.params.jumpPower = parseInt(e.target.value);
            document.getElementById('jumpPowerValue').textContent = e.target.value;
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.monster.reset(this.bounds.width / 2, this.bounds.height / 3);
        });

        document.getElementById('colorBtn').addEventListener('click', () => {
            this.currentColorIndex = (this.currentColorIndex + 1) % this.colorSchemes.length;
            this.monster.colorScheme = this.colorSchemes[this.currentColorIndex];
        });
    }

    handleInput() {
        let direction = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) direction -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) direction += 1;

        this.monster.applyMovement(direction, this.params.jumpPower);
    }

    update() {
        this.handleInput();
        this.monster.update(this.params, this.bounds);

        // 平台碰撞
        for (const platform of this.platforms) {
            this.handlePlatformCollision(platform);
        }
    }

    handlePlatformCollision(platform) {
        for (const p of this.monster.points) {
            if (p.position.x > platform.x &&
                p.position.x < platform.x + platform.width &&
                p.position.y > platform.y - p.radius &&
                p.position.y < platform.y + platform.height + p.radius) {

                // 從上方落下
                if (p.prevPosition.y < platform.y) {
                    p.position.y = platform.y - p.radius;
                    const vy = p.position.y - p.prevPosition.y;
                    p.prevPosition.y = p.position.y + vy * 0.5;
                    this.monster.isGrounded = true;
                }
            }
        }
    }

    draw() {
        // 背景
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.bounds.height);
        bgGradient.addColorStop(0, '#0a0a2e');
        bgGradient.addColorStop(0.5, '#1a1a4e');
        bgGradient.addColorStop(1, '#2a2a6e');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

        // 星星背景
        this.drawStars();

        // 地面
        const groundGradient = this.ctx.createLinearGradient(
            0, this.bounds.height - 40,
            0, this.bounds.height
        );
        groundGradient.addColorStop(0, '#3a3a7a');
        groundGradient.addColorStop(1, '#2a2a5a');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.bounds.height - 20, this.bounds.width, 20);

        // 平台
        for (const platform of this.platforms) {
            platform.draw(this.ctx);
        }

        // 果凍怪物
        this.monster.draw(this.ctx, this.time);
    }

    drawStars() {
        const starCount = 50;
        for (let i = 0; i < starCount; i++) {
            const x = (i * 137.5) % this.bounds.width;
            const y = (i * 97.3) % (this.bounds.height * 0.6);
            const size = 1 + (i % 3);
            const alpha = 0.3 + Math.sin(this.time * 2 + i) * 0.2;

            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();
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
    new JellyMonsterApp();
});
