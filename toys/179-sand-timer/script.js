/**
 * 沙漏 - Sand Timer
 * 模擬沙漏的沙粒流動效果
 */

class SandGrain {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 1.5 + Math.random() * 1;
        this.color = color;
        this.settled = false;
    }

    update(gravity, friction) {
        if (this.settled) return;

        this.vy += gravity;
        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SandTimer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grains = [];
        this.sandCount = 500;
        this.flowRate = 5;
        this.colorIndex = 0;
        this.isFlipped = false;
        this.flipProgress = 0;
        this.isFlipping = false;

        this.colors = [
            { name: '金沙', base: '#f39c12', light: '#f1c40f', dark: '#d68910' },
            { name: '紅沙', base: '#e74c3c', light: '#ff6b6b', dark: '#c0392b' },
            { name: '藍沙', base: '#3498db', light: '#5dade2', dark: '#2980b9' },
            { name: '綠沙', base: '#27ae60', light: '#2ecc71', dark: '#1e8449' }
        ];

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

        // 沙漏尺寸
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.glassWidth = Math.min(this.width * 0.25, 120);
        this.glassHeight = this.height * 0.35;
        this.neckWidth = 8;
        this.neckHeight = 15;
    }

    init() {
        this.grains = [];
        this.isFlipped = false;
        this.flipProgress = 0;
        this.isFlipping = false;

        // 在上半部創建沙粒
        const colorScheme = this.colors[this.colorIndex];

        for (let i = 0; i < this.sandCount; i++) {
            const grain = this.createGrainInTop();
            if (grain) this.grains.push(grain);
        }
    }

    createGrainInTop() {
        const colorScheme = this.colors[this.colorIndex];
        const colors = [colorScheme.base, colorScheme.light, colorScheme.dark];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // 上半部的範圍
        const topY = this.centerY - this.neckHeight / 2 - this.glassHeight;
        const bottomY = this.centerY - this.neckHeight / 2 - 10;

        // 隨機位置
        const y = bottomY - Math.random() * (this.glassHeight * 0.8);
        const relY = (y - topY) / this.glassHeight;
        const widthAtY = this.glassWidth * (0.3 + relY * 0.7);
        const x = this.centerX + (Math.random() - 0.5) * widthAtY;

        return new SandGrain(x, y, color);
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        this.canvas.addEventListener('click', () => {
            if (!this.isFlipping) {
                this.flip();
            }
        });

        document.getElementById('sandCount').addEventListener('input', (e) => {
            this.sandCount = parseInt(e.target.value);
            document.getElementById('sandCountValue').textContent = this.sandCount;
            this.init();
        });

        document.getElementById('flowRate').addEventListener('input', (e) => {
            this.flowRate = parseInt(e.target.value);
            document.getElementById('flowRateValue').textContent = this.flowRate;
        });

        document.getElementById('sandColor').addEventListener('input', (e) => {
            this.colorIndex = parseInt(e.target.value);
            document.getElementById('sandColorValue').textContent = this.colors[this.colorIndex].name;
            this.updateGrainColors();
        });

        document.getElementById('flipBtn').addEventListener('click', () => {
            if (!this.isFlipping) {
                this.flip();
            }
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.init());
    }

    updateGrainColors() {
        const colorScheme = this.colors[this.colorIndex];
        const colors = [colorScheme.base, colorScheme.light, colorScheme.dark];

        this.grains.forEach(grain => {
            grain.color = colors[Math.floor(Math.random() * colors.length)];
        });
    }

    flip() {
        this.isFlipping = true;
        this.flipProgress = 0;
    }

    getGlassPath(rotation = 0) {
        const cx = this.centerX;
        const cy = this.centerY;
        const w = this.glassWidth;
        const h = this.glassHeight;
        const nw = this.neckWidth;
        const nh = this.neckHeight;

        // 套用旋轉
        const transform = (x, y) => {
            const dx = x - cx;
            const dy = y - cy;
            const cos = Math.cos(rotation);
            const sin = Math.sin(rotation);
            return {
                x: cx + dx * cos - dy * sin,
                y: cy + dx * sin + dy * cos
            };
        };

        return {
            // 上半部
            topLeft: transform(cx - w / 2, cy - nh / 2 - h),
            topRight: transform(cx + w / 2, cy - nh / 2 - h),
            topNeckLeft: transform(cx - nw / 2, cy - nh / 2),
            topNeckRight: transform(cx + nw / 2, cy - nh / 2),
            // 下半部
            bottomNeckLeft: transform(cx - nw / 2, cy + nh / 2),
            bottomNeckRight: transform(cx + nw / 2, cy + nh / 2),
            bottomLeft: transform(cx - w / 2, cy + nh / 2 + h),
            bottomRight: transform(cx + w / 2, cy + nh / 2 + h)
        };
    }

    isInsideGlass(x, y, top = true) {
        const cx = this.centerX;
        const cy = this.centerY;
        const w = this.glassWidth;
        const h = this.glassHeight;
        const nw = this.neckWidth;
        const nh = this.neckHeight;

        if (top) {
            // 上半部 - 倒梯形
            const topY = cy - nh / 2 - h;
            const bottomY = cy - nh / 2;

            if (y < topY || y > bottomY) return false;

            const relY = (y - topY) / h;
            const widthAtY = w * (1 - relY * 0.7) + nw * relY * 0.7;
            return Math.abs(x - cx) < widthAtY / 2;
        } else {
            // 下半部 - 正梯形
            const topY = cy + nh / 2;
            const bottomY = cy + nh / 2 + h;

            if (y < topY || y > bottomY) return false;

            const relY = (y - topY) / h;
            const widthAtY = nw + (w - nw) * relY;
            return Math.abs(x - cx) < widthAtY / 2;
        }
    }

    isInNeck(x, y) {
        const cx = this.centerX;
        const cy = this.centerY;
        const nw = this.neckWidth;
        const nh = this.neckHeight;

        return y >= cy - nh / 2 && y <= cy + nh / 2 && Math.abs(x - cx) < nw / 2;
    }

    update() {
        const gravity = 0.15;
        const friction = 0.98;

        // 處理翻轉動畫
        if (this.isFlipping) {
            this.flipProgress += 0.03;
            if (this.flipProgress >= 1) {
                this.isFlipping = false;
                this.flipProgress = 1;
                this.isFlipped = !this.isFlipped;

                // 重置沙粒狀態
                this.grains.forEach(grain => {
                    grain.settled = false;
                    grain.vy = 0;
                    grain.vx = 0;
                });
            }
        }

        // 沙粒物理
        const rotation = this.isFlipping ? this.flipProgress * Math.PI : (this.isFlipped ? Math.PI : 0);

        this.grains.forEach(grain => {
            if (grain.settled) return;

            // 套用重力（考慮旋轉）
            const gravityX = Math.sin(rotation) * gravity;
            const gravityY = Math.cos(rotation) * gravity;

            grain.vx += gravityX;
            grain.vy += gravityY;
            grain.vx *= friction;
            grain.vy *= friction;

            grain.x += grain.vx;
            grain.y += grain.vy;

            // 邊界碰撞
            this.handleCollision(grain, rotation);
        });

        // 沙粒間的簡單碰撞
        this.handleGrainCollisions();
    }

    handleCollision(grain, rotation) {
        const cx = this.centerX;
        const cy = this.centerY;
        const w = this.glassWidth;
        const h = this.glassHeight;
        const nw = this.neckWidth;
        const nh = this.neckHeight;

        // 根據旋轉判斷哪邊是"下方"
        const isUpsideDown = Math.abs(rotation - Math.PI) < 0.1;

        // 上半部邊界
        const topY = cy - nh / 2 - h;
        const topBottomY = cy - nh / 2;

        if (grain.y < topBottomY && grain.y > topY) {
            const relY = (grain.y - topY) / h;
            const widthAtY = w * (1 - relY * 0.7) + nw * relY * 0.7;
            const halfWidth = widthAtY / 2;

            // 左右牆壁
            if (grain.x < cx - halfWidth + grain.radius) {
                grain.x = cx - halfWidth + grain.radius;
                grain.vx *= -0.3;
            }
            if (grain.x > cx + halfWidth - grain.radius) {
                grain.x = cx + halfWidth - grain.radius;
                grain.vx *= -0.3;
            }

            // 頂部
            if (grain.y < topY + grain.radius) {
                grain.y = topY + grain.radius;
                grain.vy *= -0.3;
            }
        }

        // 頸部
        if (grain.y >= topBottomY && grain.y <= cy + nh / 2) {
            if (grain.x < cx - nw / 2 + grain.radius) {
                grain.x = cx - nw / 2 + grain.radius;
                grain.vx *= -0.3;
            }
            if (grain.x > cx + nw / 2 - grain.radius) {
                grain.x = cx + nw / 2 - grain.radius;
                grain.vx *= -0.3;
            }
        }

        // 下半部邊界
        const bottomTopY = cy + nh / 2;
        const bottomY = cy + nh / 2 + h;

        if (grain.y > bottomTopY && grain.y < bottomY) {
            const relY = (grain.y - bottomTopY) / h;
            const widthAtY = nw + (w - nw) * relY;
            const halfWidth = widthAtY / 2;

            // 左右牆壁
            if (grain.x < cx - halfWidth + grain.radius) {
                grain.x = cx - halfWidth + grain.radius;
                grain.vx *= -0.3;
            }
            if (grain.x > cx + halfWidth - grain.radius) {
                grain.x = cx + halfWidth - grain.radius;
                grain.vx *= -0.3;
            }

            // 底部
            if (grain.y > bottomY - grain.radius) {
                grain.y = bottomY - grain.radius;
                grain.vy *= -0.1;

                if (Math.abs(grain.vy) < 0.5 && Math.abs(grain.vx) < 0.3) {
                    grain.settled = true;
                }
            }
        }

        // 翻轉時，上半部成為底部
        if (isUpsideDown && grain.y < topY + grain.radius * 2) {
            grain.y = topY + grain.radius * 2;
            grain.vy *= -0.1;
            if (Math.abs(grain.vy) < 0.5) {
                grain.settled = true;
            }
        }
    }

    handleGrainCollisions() {
        // 簡化版本 - 只檢查附近的沙粒
        for (let i = 0; i < this.grains.length; i++) {
            const g1 = this.grains[i];
            if (g1.settled) continue;

            for (let j = i + 1; j < this.grains.length; j++) {
                const g2 = this.grains[j];

                const dx = g2.x - g1.x;
                const dy = g2.y - g1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = g1.radius + g2.radius;

                if (dist < minDist && dist > 0) {
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    if (!g1.settled) {
                        g1.x -= nx * overlap * 0.5;
                        g1.y -= ny * overlap * 0.5;
                    }
                    if (!g2.settled) {
                        g2.x += nx * overlap * 0.5;
                        g2.y += ny * overlap * 0.5;
                    }
                }
            }
        }
    }

    draw() {
        const ctx = this.ctx;

        // 清除畫面
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(0, 0, this.width, this.height);

        // 計算當前旋轉
        const rotation = this.isFlipping ? this.flipProgress * Math.PI : (this.isFlipped ? Math.PI : 0);

        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(rotation);
        ctx.translate(-this.centerX, -this.centerY);

        // 繪製沙漏框架（後面）
        this.drawFrame(true);

        // 繪製玻璃背景
        this.drawGlassBackground();

        // 繪製沙粒
        this.grains.forEach(grain => grain.draw(ctx));

        // 繪製玻璃反光
        this.drawGlassReflection();

        // 繪製沙漏框架（前面）
        this.drawFrame(false);

        ctx.restore();
    }

    drawFrame(isBack) {
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY;
        const h = this.glassHeight;
        const nh = this.neckHeight;

        const frameWidth = this.glassWidth + 30;
        const frameHeight = 15;

        if (isBack) {
            // 支架（後面）
            ctx.fillStyle = '#5D4E37';
            ctx.fillRect(cx - 8, cy - nh / 2 - h - frameHeight, 16, h * 2 + nh + frameHeight * 2);
        } else {
            // 上下框
            const frameGradient = ctx.createLinearGradient(cx - frameWidth / 2, 0, cx + frameWidth / 2, 0);
            frameGradient.addColorStop(0, '#8B7355');
            frameGradient.addColorStop(0.3, '#C4A574');
            frameGradient.addColorStop(0.5, '#DEB887');
            frameGradient.addColorStop(0.7, '#C4A574');
            frameGradient.addColorStop(1, '#8B7355');

            ctx.fillStyle = frameGradient;

            // 上框
            ctx.beginPath();
            ctx.roundRect(cx - frameWidth / 2, cy - nh / 2 - h - frameHeight, frameWidth, frameHeight, 4);
            ctx.fill();

            // 下框
            ctx.beginPath();
            ctx.roundRect(cx - frameWidth / 2, cy + nh / 2 + h, frameWidth, frameHeight, 4);
            ctx.fill();

            // 裝飾球
            ctx.fillStyle = '#C4A574';
            ctx.beginPath();
            ctx.arc(cx - frameWidth / 2 + 10, cy - nh / 2 - h - frameHeight / 2, 8, 0, Math.PI * 2);
            ctx.arc(cx + frameWidth / 2 - 10, cy - nh / 2 - h - frameHeight / 2, 8, 0, Math.PI * 2);
            ctx.arc(cx - frameWidth / 2 + 10, cy + nh / 2 + h + frameHeight / 2, 8, 0, Math.PI * 2);
            ctx.arc(cx + frameWidth / 2 - 10, cy + nh / 2 + h + frameHeight / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGlassBackground() {
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY;
        const w = this.glassWidth;
        const h = this.glassHeight;
        const nw = this.neckWidth;
        const nh = this.neckHeight;

        // 玻璃填充
        ctx.fillStyle = 'rgba(200, 220, 240, 0.15)';

        // 上半部
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + nw / 2, cy - nh / 2);
        ctx.lineTo(cx - nw / 2, cy - nh / 2);
        ctx.closePath();
        ctx.fill();

        // 頸部
        ctx.fillRect(cx - nw / 2, cy - nh / 2, nw, nh);

        // 下半部
        ctx.beginPath();
        ctx.moveTo(cx - nw / 2, cy + nh / 2);
        ctx.lineTo(cx + nw / 2, cy + nh / 2);
        ctx.lineTo(cx + w / 2, cy + nh / 2 + h);
        ctx.lineTo(cx - w / 2, cy + nh / 2 + h);
        ctx.closePath();
        ctx.fill();

        // 玻璃輪廓
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;

        // 上半部輪廓
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + nw / 2, cy - nh / 2);
        ctx.moveTo(cx - nw / 2, cy - nh / 2);
        ctx.lineTo(cx - w / 2, cy - nh / 2 - h);
        ctx.stroke();

        // 下半部輪廓
        ctx.beginPath();
        ctx.moveTo(cx - nw / 2, cy + nh / 2);
        ctx.lineTo(cx - w / 2, cy + nh / 2 + h);
        ctx.lineTo(cx + w / 2, cy + nh / 2 + h);
        ctx.lineTo(cx + nw / 2, cy + nh / 2);
        ctx.stroke();
    }

    drawGlassReflection() {
        const ctx = this.ctx;
        const cx = this.centerX;
        const cy = this.centerY;
        const w = this.glassWidth;
        const h = this.glassHeight;
        const nh = this.neckHeight;

        // 上半部反光
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + w / 2, cy - nh / 2 - h);
        ctx.lineTo(cx + w * 0.1, cy - nh / 2);
        ctx.lineTo(cx - w * 0.1, cy - nh / 2);
        ctx.closePath();
        ctx.clip();

        const reflectGradient = ctx.createLinearGradient(cx - w / 2, 0, cx - w / 4, 0);
        reflectGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        reflectGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = reflectGradient;
        ctx.fillRect(cx - w / 2, cy - nh / 2 - h, w / 3, h);
        ctx.restore();

        // 下半部反光
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.1, cy + nh / 2);
        ctx.lineTo(cx + w * 0.1, cy + nh / 2);
        ctx.lineTo(cx + w / 2, cy + nh / 2 + h);
        ctx.lineTo(cx - w / 2, cy + nh / 2 + h);
        ctx.closePath();
        ctx.clip();

        const reflectGradient2 = ctx.createLinearGradient(cx - w / 2, 0, cx - w / 4, 0);
        reflectGradient2.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        reflectGradient2.addColorStop(1, 'transparent');

        ctx.fillStyle = reflectGradient2;
        ctx.fillRect(cx - w / 2, cy + nh / 2, w / 3, h);
        ctx.restore();
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
    new SandTimer(canvas);
});
