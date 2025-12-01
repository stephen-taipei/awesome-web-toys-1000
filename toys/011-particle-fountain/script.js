/**
 * Particle Fountain 粒子噴泉
 *
 * 物理模擬的粒子噴泉效果
 * - 滑鼠位置控制噴射方向
 * - 點擊改變顏色主題
 * - 滾輪調整發射速率
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_EMIT_RATE: 50,
        DEFAULT_VELOCITY: 12,
        DEFAULT_GRAVITY: 0.3,
        DEFAULT_SIZE: 3,
        MAX_PARTICLES: 10000,
        PARTICLE_LIFE: 3000  // 毫秒
    };

    // 顏色主題
    const COLOR_THEMES = {
        rainbow: [
            { r: 239, g: 68, b: 68 },    // 紅
            { r: 249, g: 115, b: 22 },   // 橙
            { r: 234, g: 179, b: 8 },    // 黃
            { r: 34, g: 197, b: 94 },    // 綠
            { r: 59, g: 130, b: 246 },   // 藍
            { r: 168, g: 85, b: 247 }    // 紫
        ],
        fire: [
            { r: 253, g: 224, b: 71 },   // 淺黃
            { r: 251, g: 191, b: 36 },   // 金
            { r: 249, g: 115, b: 22 },   // 橙
            { r: 234, g: 88, b: 12 },    // 深橙
            { r: 220, g: 38, b: 38 }     // 紅
        ],
        ocean: [
            { r: 165, g: 243, b: 252 },  // 淺青
            { r: 103, g: 232, b: 249 },  // 青
            { r: 34, g: 211, b: 238 },   // 亮藍
            { r: 6, g: 182, b: 212 },    // 藍
            { r: 2, g: 132, b: 199 }     // 深藍
        ],
        neon: [
            { r: 244, g: 114, b: 182 },  // 粉
            { r: 232, g: 121, b: 249 },  // 紫粉
            { r: 168, g: 85, b: 247 },   // 紫
            { r: 99, g: 102, b: 241 },   // 靛藍
            { r: 6, g: 182, b: 212 }     // 青
        ]
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 粒子陣列
        particles: [],

        // 參數設定
        emitRate: CONFIG.DEFAULT_EMIT_RATE,
        velocity: CONFIG.DEFAULT_VELOCITY,
        gravity: CONFIG.DEFAULT_GRAVITY,
        particleSize: CONFIG.DEFAULT_SIZE,

        // 顏色與模式
        colorTheme: 'rainbow',
        colorIndex: 0,
        mode: 'follow',  // follow, fixed, spread

        // 特效
        trailEnabled: true,
        glowEnabled: true,

        // 滑鼠位置
        mouseX: 0,
        mouseY: 0,

        // 噴泉位置
        fountainX: 0,
        fountainY: 0,

        // FPS 計算
        lastTime: 0,
        frameCount: 0,
        fps: 60,

        // 動畫
        animationId: null
    };

    // ==================== 粒子類別 ====================

    class Particle {
        constructor(x, y, vx, vy, color, size) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.size = size;
            this.life = CONFIG.PARTICLE_LIFE;
            this.maxLife = CONFIG.PARTICLE_LIFE;
            this.alpha = 1;
        }

        update(dt, gravity) {
            // 更新位置
            this.x += this.vx;
            this.y += this.vy;

            // 應用重力
            this.vy += gravity;

            // 減少生命值
            this.life -= dt;
            this.alpha = Math.max(0, this.life / this.maxLife);

            // 粒子縮小
            this.currentSize = this.size * (0.3 + 0.7 * this.alpha);

            return this.life > 0 && this.y < state.height + 50;
        }

        draw(ctx, glow) {
            if (this.alpha <= 0) return;

            ctx.globalAlpha = this.alpha;

            if (glow) {
                // 發光效果
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.currentSize * 2
                );
                gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
                gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.5})`);
                gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentSize * 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // 普通圓形
                ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        bindEvents();
        state.lastTime = performance.now();
        animate();
    }

    /**
     * 調整畫布尺寸
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        state.canvas.width = state.width * dpr;
        state.canvas.height = state.height * dpr;
        state.canvas.style.width = state.width + 'px';
        state.canvas.style.height = state.height + 'px';

        state.ctx.scale(dpr, dpr);

        // 噴泉位置在畫面底部中央
        state.fountainX = state.width / 2;
        state.fountainY = state.height - 20;

        // 初始化滑鼠位置
        state.mouseX = state.width / 2;
        state.mouseY = state.height / 2;
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', resizeCanvas);

        // 滑鼠移動
        state.canvas.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        });

        // 點擊切換顏色
        state.canvas.addEventListener('click', () => {
            const themes = Object.keys(COLOR_THEMES);
            const currentIndex = themes.indexOf(state.colorTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            state.colorTheme = themes[nextIndex];

            // 更新 UI
            document.querySelectorAll('.color-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === state.colorTheme);
            });
        });

        // 滾輪調整發射速率
        state.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                state.emitRate = Math.min(150, state.emitRate + 5);
            } else {
                state.emitRate = Math.max(10, state.emitRate - 5);
            }
            document.getElementById('rate-slider').value = state.emitRate;
            document.getElementById('rate-display').textContent = state.emitRate;
        }, { passive: false });

        // 觸控支援
        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
            }
        }, { passive: false });

        state.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });

        // 發射速率滑桿
        document.getElementById('rate-slider').addEventListener('input', (e) => {
            state.emitRate = parseInt(e.target.value, 10);
            document.getElementById('rate-display').textContent = state.emitRate;
        });

        // 初速度滑桿
        document.getElementById('velocity-slider').addEventListener('input', (e) => {
            state.velocity = parseInt(e.target.value, 10);
            document.getElementById('velocity-display').textContent = state.velocity;
        });

        // 重力滑桿
        document.getElementById('gravity-slider').addEventListener('input', (e) => {
            state.gravity = parseFloat(e.target.value);
            document.getElementById('gravity-display').textContent = state.gravity.toFixed(2);
        });

        // 粒子大小滑桿
        document.getElementById('size-slider').addEventListener('input', (e) => {
            state.particleSize = parseFloat(e.target.value);
            document.getElementById('size-display').textContent = state.particleSize;
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
            });
        });

        // 模式按鈕
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.mode = btn.dataset.mode;
            });
        });

        // 特效切換
        document.getElementById('trail-toggle').addEventListener('change', (e) => {
            state.trailEnabled = e.target.checked;
        });

        document.getElementById('glow-toggle').addEventListener('change', (e) => {
            state.glowEnabled = e.target.checked;
        });
    }

    // ==================== 粒子發射 ====================

    function emitParticles() {
        const colors = COLOR_THEMES[state.colorTheme];

        for (let i = 0; i < state.emitRate; i++) {
            if (state.particles.length >= CONFIG.MAX_PARTICLES) break;

            // 計算發射方向
            let angle, spread;

            switch (state.mode) {
                case 'follow':
                    // 跟隨滑鼠方向
                    const dx = state.mouseX - state.fountainX;
                    const dy = state.mouseY - state.fountainY;
                    angle = Math.atan2(dy, dx);
                    spread = 0.3;
                    break;

                case 'fixed':
                    // 固定向上
                    angle = -Math.PI / 2;
                    spread = 0.2;
                    break;

                case 'spread':
                    // 四散模式
                    angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
                    spread = 0.1;
                    break;

                default:
                    angle = -Math.PI / 2;
                    spread = 0.2;
            }

            // 添加隨機擴散
            angle += (Math.random() - 0.5) * spread * 2;

            // 隨機速度變化
            const speed = state.velocity * (0.8 + Math.random() * 0.4);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // 隨機顏色（從主題中選擇）
            const color = colors[Math.floor(Math.random() * colors.length)];

            // 隨機大小變化
            const size = state.particleSize * (0.7 + Math.random() * 0.6);

            // 噴泉口的位置擴散
            const startX = state.fountainX + (Math.random() - 0.5) * 10;
            const startY = state.fountainY;

            state.particles.push(new Particle(startX, startY, vx, vy, color, size));
        }
    }

    // ==================== 渲染 ====================

    function render(dt) {
        const ctx = state.ctx;

        // 清除或拖尾效果
        if (state.trailEnabled) {
            ctx.fillStyle = 'rgba(5, 10, 16, 0.15)';
            ctx.fillRect(0, 0, state.width, state.height);
        } else {
            ctx.fillStyle = '#050a10';
            ctx.fillRect(0, 0, state.width, state.height);
        }

        // 繪製噴泉底座
        drawFountainBase(ctx);

        // 更新和繪製粒子
        state.particles = state.particles.filter(particle => {
            const alive = particle.update(dt, state.gravity);
            if (alive) {
                particle.draw(ctx, state.glowEnabled);
            }
            return alive;
        });

        // 發射新粒子
        emitParticles();

        // 更新統計
        updateStats(dt);
    }

    /**
     * 繪製噴泉底座
     */
    function drawFountainBase(ctx) {
        const baseWidth = 60;
        const baseHeight = 15;

        // 底座漸層
        const gradient = ctx.createLinearGradient(
            state.fountainX - baseWidth / 2, state.fountainY - baseHeight,
            state.fountainX - baseWidth / 2, state.fountainY
        );
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.1)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(state.fountainX, state.fountainY, baseWidth / 2, baseHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 噴泉口
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.beginPath();
        ctx.ellipse(state.fountainX, state.fountainY - 5, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // ==================== 動畫迴圈 ====================

    function animate(currentTime) {
        const dt = currentTime - state.lastTime || 16.67;
        state.lastTime = currentTime;

        render(dt);

        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 統計更新 ====================

    function updateStats(dt) {
        // 更新 FPS
        state.frameCount++;
        if (state.frameCount >= 30) {
            state.fps = Math.round(1000 / dt);
            state.frameCount = 0;
        }

        // 更新顯示
        document.getElementById('particle-display').textContent = state.particles.length.toLocaleString();
        document.getElementById('fps-display').textContent = state.fps;
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
