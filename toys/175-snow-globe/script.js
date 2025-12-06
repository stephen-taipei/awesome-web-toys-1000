/**
 * 雪花球 - Snow Globe
 * 模擬經典雪花球玩具的飄雪效果
 */

class Snowflake {
    constructor(x, y, size, globeRadius, centerX, centerY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.globeRadius = globeRadius;
        this.centerX = centerX;
        this.centerY = centerY;
        this.velocity = { x: 0, y: 0 };
        this.settled = false;
        this.settleY = 0;
        this.opacity = 0.7 + Math.random() * 0.3;
        this.sparkle = Math.random() * Math.PI * 2;
        this.sparkleSpeed = 0.05 + Math.random() * 0.05;
        this.type = Math.floor(Math.random() * 3); // 不同雪花形狀
    }

    shake(intensity) {
        this.settled = false;
        this.velocity.x += (Math.random() - 0.5) * intensity * 10;
        this.velocity.y += (Math.random() - 0.5) * intensity * 10;
    }

    update(gravity, friction, groundY, obstacles) {
        if (this.settled) return;

        // 重力
        this.velocity.y += gravity;

        // 空氣阻力和隨機漂移
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.velocity.x += (Math.random() - 0.5) * 0.1;

        // 更新位置
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // 球體邊界
        const dx = this.x - this.centerX;
        const dy = this.y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.globeRadius - this.size) {
            // 反彈
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = this.velocity.x * nx + this.velocity.y * ny;

            this.velocity.x -= 2 * dot * nx * 0.3;
            this.velocity.y -= 2 * dot * ny * 0.3;

            // 推回球內
            const pushBack = dist - (this.globeRadius - this.size);
            this.x -= nx * pushBack;
            this.y -= ny * pushBack;
        }

        // 地面和障礙物碰撞
        if (this.y > groundY - this.size) {
            this.y = groundY - this.size;
            if (Math.abs(this.velocity.y) < 0.5 && Math.abs(this.velocity.x) < 0.3) {
                this.settled = true;
                this.settleY = this.y;
            } else {
                this.velocity.y *= -0.2;
            }
        }

        // 障礙物碰撞
        obstacles.forEach(obs => {
            if (this.checkObstacleCollision(obs)) {
                this.y = obs.top - this.size;
                if (Math.abs(this.velocity.y) < 0.5) {
                    this.settled = true;
                    this.settleY = this.y;
                } else {
                    this.velocity.y *= -0.2;
                }
            }
        });

        // 閃爍
        this.sparkle += this.sparkleSpeed;
    }

    checkObstacleCollision(obs) {
        return this.x > obs.left && this.x < obs.right &&
               this.y > obs.top - this.size && this.y < obs.top + 5;
    }

    draw(ctx) {
        ctx.save();

        const sparkleAlpha = 0.7 + Math.sin(this.sparkle) * 0.3;
        ctx.globalAlpha = this.opacity * sparkleAlpha;

        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#fff';

        switch (this.type) {
            case 0: // 圓形雪花
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 1: // 星形雪花
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(
                        Math.cos(angle) * this.size * 1.5,
                        Math.sin(angle) * this.size * 1.5
                    );
                }
                ctx.lineWidth = this.size * 0.3;
                ctx.lineCap = 'round';
                ctx.stroke();
                break;

            case 2: // 菱形雪花
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-this.size * 0.7, -this.size * 0.7, this.size * 1.4, this.size * 1.4);
                break;
        }

        ctx.restore();
    }
}

class SnowGlobe {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.snowflakes = [];
        this.snowCount = 200;
        this.snowSize = 4;
        this.scene = 0;
        this.shaking = false;
        this.shakeIntensity = 0;
        this.globeOffset = { x: 0, y: 0 };
        this.isDragging = false;
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

        // 雪球尺寸
        this.globeCenterX = this.width / 2;
        this.globeCenterY = this.height * 0.42;
        this.globeRadius = Math.min(this.width * 0.4, this.height * 0.38);
        this.groundY = this.globeCenterY + this.globeRadius * 0.7;
    }

    init() {
        this.snowflakes = [];

        for (let i = 0; i < this.snowCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.globeRadius * 0.9;
            const x = this.globeCenterX + Math.cos(angle) * dist;
            const y = this.globeCenterY + Math.sin(angle) * dist * 0.8;
            const size = (this.snowSize * 0.5) + Math.random() * (this.snowSize * 0.5);

            this.snowflakes.push(new Snowflake(
                x, y, size,
                this.globeRadius,
                this.globeCenterX,
                this.globeCenterY
            ));
        }
    }

    getObstacles() {
        const obstacles = [];
        const cx = this.globeCenterX;
        const baseY = this.groundY;

        switch (this.scene) {
            case 0: // 雪人
                obstacles.push({ left: cx - 30, right: cx + 30, top: baseY - 70 });
                obstacles.push({ left: cx - 20, right: cx + 20, top: baseY - 100 });
                break;
            case 1: // 聖誕樹
                obstacles.push({ left: cx - 40, right: cx + 40, top: baseY - 30 });
                obstacles.push({ left: cx - 30, right: cx + 30, top: baseY - 70 });
                obstacles.push({ left: cx - 20, right: cx + 20, top: baseY - 100 });
                break;
            case 2: // 小屋
                obstacles.push({ left: cx - 50, right: cx + 50, top: baseY - 60 });
                obstacles.push({ left: cx - 40, right: cx + 40, top: baseY - 85 });
                break;
        }

        return obstacles;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        // 拖曳搖晃
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.lastMousePos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.lastMousePos) {
                const dx = x - this.lastMousePos.x;
                const dy = y - this.lastMousePos.y;
                const intensity = Math.sqrt(dx * dx + dy * dy) * 0.05;

                if (intensity > 0.5) {
                    this.shake(intensity);
                    this.globeOffset.x = dx * 0.2;
                    this.globeOffset.y = dy * 0.1;
                }
            }

            this.lastMousePos = { x, y };
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // 觸控
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.isDragging = true;
            this.lastMousePos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isDragging) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            if (this.lastMousePos) {
                const dx = x - this.lastMousePos.x;
                const dy = y - this.lastMousePos.y;
                const intensity = Math.sqrt(dx * dx + dy * dy) * 0.05;

                if (intensity > 0.5) {
                    this.shake(intensity);
                }
            }

            this.lastMousePos = { x, y };
        });

        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });

        // 控制項
        document.getElementById('snowCount').addEventListener('input', (e) => {
            this.snowCount = parseInt(e.target.value);
            document.getElementById('snowCountValue').textContent = this.snowCount;
            this.init();
        });

        document.getElementById('snowSize').addEventListener('input', (e) => {
            this.snowSize = parseInt(e.target.value);
            document.getElementById('snowSizeValue').textContent = this.snowSize;
            this.init();
        });

        document.getElementById('scene').addEventListener('input', (e) => {
            this.scene = parseInt(e.target.value);
            const labels = ['雪人', '聖誕樹', '小屋'];
            document.getElementById('sceneValue').textContent = labels[this.scene];
        });

        document.getElementById('shakeBtn').addEventListener('click', () => this.shake(2));
        document.getElementById('resetBtn').addEventListener('click', () => this.init());
    }

    shake(intensity = 1) {
        this.shaking = true;
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);

        this.snowflakes.forEach(flake => {
            flake.shake(intensity);
        });
    }

    update() {
        const gravity = 0.03;
        const friction = 0.99;
        const obstacles = this.getObstacles();

        // 搖晃衰減
        if (this.shaking) {
            this.shakeIntensity *= 0.95;
            this.globeOffset.x *= 0.9;
            this.globeOffset.y *= 0.9;

            if (this.shakeIntensity < 0.01) {
                this.shaking = false;
                this.globeOffset = { x: 0, y: 0 };
            }
        }

        // 更新雪花
        this.snowflakes.forEach(flake => {
            flake.update(gravity, friction, this.groundY, obstacles);
        });
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#1e3a5f';
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();
        ctx.translate(this.globeOffset.x, this.globeOffset.y);

        // 繪製底座
        this.drawBase();

        // 繪製雪球玻璃罩（背景）
        this.drawGlobeBackground();

        // 繪製場景
        this.drawScene();

        // 繪製雪花
        this.snowflakes.forEach(flake => flake.draw(ctx));

        // 繪製玻璃反光
        this.drawGlassReflection();

        ctx.restore();
    }

    drawBase() {
        const ctx = this.ctx;
        const baseY = this.globeCenterY + this.globeRadius;
        const baseWidth = this.globeRadius * 1.4;
        const baseHeight = 60;

        // 底座主體
        const baseGradient = ctx.createLinearGradient(
            this.globeCenterX - baseWidth / 2, baseY,
            this.globeCenterX + baseWidth / 2, baseY + baseHeight
        );
        baseGradient.addColorStop(0, '#8B4513');
        baseGradient.addColorStop(0.3, '#A0522D');
        baseGradient.addColorStop(0.7, '#8B4513');
        baseGradient.addColorStop(1, '#654321');

        ctx.beginPath();
        ctx.ellipse(this.globeCenterX, baseY + baseHeight * 0.7, baseWidth / 2, baseHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = baseGradient;
        ctx.fill();

        // 底座頂部
        ctx.beginPath();
        ctx.ellipse(this.globeCenterX, baseY, baseWidth * 0.4, 15, 0, 0, Math.PI * 2);

        const topGradient = ctx.createRadialGradient(
            this.globeCenterX, baseY, 0,
            this.globeCenterX, baseY, baseWidth * 0.4
        );
        topGradient.addColorStop(0, '#CD853F');
        topGradient.addColorStop(1, '#8B4513');

        ctx.fillStyle = topGradient;
        ctx.fill();
    }

    drawGlobeBackground() {
        const ctx = this.ctx;

        // 裁剪區域
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.globeCenterX, this.globeCenterY, this.globeRadius, 0, Math.PI * 2);
        ctx.clip();

        // 天空漸層
        const skyGradient = ctx.createLinearGradient(
            0, this.globeCenterY - this.globeRadius,
            0, this.globeCenterY + this.globeRadius
        );
        skyGradient.addColorStop(0, '#1a365d');
        skyGradient.addColorStop(0.5, '#2c5282');
        skyGradient.addColorStop(1, '#4a90a4');

        ctx.fillStyle = skyGradient;
        ctx.fillRect(
            this.globeCenterX - this.globeRadius,
            this.globeCenterY - this.globeRadius,
            this.globeRadius * 2,
            this.globeRadius * 2
        );

        // 地面（雪地）
        ctx.fillStyle = '#e8f4f8';
        ctx.beginPath();
        ctx.ellipse(this.globeCenterX, this.groundY, this.globeRadius, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // 積雪
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            this.globeCenterX - this.globeRadius,
            this.groundY - 5,
            this.globeRadius * 2,
            this.globeRadius
        );

        ctx.restore();
    }

    drawScene() {
        const ctx = this.ctx;
        const cx = this.globeCenterX;
        const baseY = this.groundY;

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.globeCenterX, this.globeCenterY, this.globeRadius, 0, Math.PI * 2);
        ctx.clip();

        switch (this.scene) {
            case 0: // 雪人
                // 身體
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(cx, baseY - 35, 35, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 2;
                ctx.stroke();

                // 頭
                ctx.beginPath();
                ctx.arc(cx, baseY - 85, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 眼睛
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(cx - 8, baseY - 90, 4, 0, Math.PI * 2);
                ctx.arc(cx + 8, baseY - 90, 4, 0, Math.PI * 2);
                ctx.fill();

                // 鼻子（胡蘿蔔）
                ctx.fillStyle = '#ff6b35';
                ctx.beginPath();
                ctx.moveTo(cx, baseY - 82);
                ctx.lineTo(cx + 15, baseY - 80);
                ctx.lineTo(cx, baseY - 78);
                ctx.fill();

                // 帽子
                ctx.fillStyle = '#333';
                ctx.fillRect(cx - 20, baseY - 120, 40, 8);
                ctx.fillRect(cx - 12, baseY - 145, 24, 25);
                break;

            case 1: // 聖誕樹
                // 樹幹
                ctx.fillStyle = '#654321';
                ctx.fillRect(cx - 10, baseY - 25, 20, 25);

                // 樹葉層
                ctx.fillStyle = '#228B22';
                ctx.beginPath();
                ctx.moveTo(cx, baseY - 120);
                ctx.lineTo(cx - 35, baseY - 60);
                ctx.lineTo(cx + 35, baseY - 60);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(cx, baseY - 100);
                ctx.lineTo(cx - 45, baseY - 35);
                ctx.lineTo(cx + 45, baseY - 35);
                ctx.fill();

                // 星星
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const innerAngle = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
                    const outerR = 12;
                    const innerR = 5;

                    if (i === 0) ctx.moveTo(cx + Math.cos(angle) * outerR, baseY - 130 + Math.sin(angle) * outerR);
                    else ctx.lineTo(cx + Math.cos(angle) * outerR, baseY - 130 + Math.sin(angle) * outerR);
                    ctx.lineTo(cx + Math.cos(innerAngle) * innerR, baseY - 130 + Math.sin(innerAngle) * innerR);
                }
                ctx.fill();

                // 裝飾球
                const ornaments = [
                    { x: cx - 15, y: baseY - 50, color: '#ff0000' },
                    { x: cx + 20, y: baseY - 45, color: '#0000ff' },
                    { x: cx - 5, y: baseY - 75, color: '#ffff00' },
                    { x: cx + 10, y: baseY - 90, color: '#ff00ff' }
                ];

                ornaments.forEach(o => {
                    ctx.fillStyle = o.color;
                    ctx.beginPath();
                    ctx.arc(o.x, o.y, 6, 0, Math.PI * 2);
                    ctx.fill();
                });
                break;

            case 2: // 小屋
                // 屋身
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(cx - 45, baseY - 55, 90, 55);

                // 屋頂
                ctx.fillStyle = '#A52A2A';
                ctx.beginPath();
                ctx.moveTo(cx - 55, baseY - 55);
                ctx.lineTo(cx, baseY - 95);
                ctx.lineTo(cx + 55, baseY - 55);
                ctx.fill();

                // 門
                ctx.fillStyle = '#654321';
                ctx.fillRect(cx - 12, baseY - 40, 24, 40);

                // 窗戶
                ctx.fillStyle = '#FFE4B5';
                ctx.fillRect(cx - 38, baseY - 45, 18, 18);
                ctx.fillRect(cx + 20, baseY - 45, 18, 18);

                // 窗框
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(cx - 38, baseY - 45, 18, 18);
                ctx.strokeRect(cx + 20, baseY - 45, 18, 18);

                // 煙囪
                ctx.fillStyle = '#696969';
                ctx.fillRect(cx + 25, baseY - 90, 15, 25);

                // 煙
                ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
                ctx.beginPath();
                ctx.arc(cx + 32, baseY - 100, 8, 0, Math.PI * 2);
                ctx.arc(cx + 35, baseY - 115, 6, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    drawGlassReflection() {
        const ctx = this.ctx;

        // 主要反光
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.globeCenterX, this.globeCenterY, this.globeRadius, 0, Math.PI * 2);
        ctx.clip();

        const reflectGradient = ctx.createRadialGradient(
            this.globeCenterX - this.globeRadius * 0.4,
            this.globeCenterY - this.globeRadius * 0.4,
            0,
            this.globeCenterX - this.globeRadius * 0.2,
            this.globeCenterY - this.globeRadius * 0.2,
            this.globeRadius * 0.6
        );
        reflectGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        reflectGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = reflectGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.restore();

        // 邊緣光澤
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.globeCenterX, this.globeCenterY, this.globeRadius - 2, -Math.PI * 0.8, -Math.PI * 0.3);
        ctx.stroke();
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
    new SnowGlobe(canvas);
});
