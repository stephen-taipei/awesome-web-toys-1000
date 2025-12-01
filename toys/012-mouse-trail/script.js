/**
 * Mouse Trail 滑鼠軌跡
 *
 * 移動滑鼠產生絢麗粒子尾巴
 * - 多種風格：煙火、星塵、墨水、霓虹、火焰、魔法
 * - 插值運動確保軌跡平滑
 * - 可調整密度、長度、大小
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        MAX_PARTICLES: 5000,
        INTERPOLATION_STEPS: 5,  // 插值點數量
        DEFAULT_DENSITY: 3,
        DEFAULT_LIFE: 1000,  // 毫秒
        DEFAULT_SIZE_MULT: 1
    };

    // 風格定義
    const STYLES = {
        firework: {
            name: '煙火',
            colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'],
            particleCount: 3,
            sizeRange: [2, 6],
            speedRange: [1, 4],
            gravity: 0.05,
            fade: true,
            glow: true,
            shape: 'circle'
        },
        stardust: {
            name: '星塵',
            colors: ['#fff9c4', '#fff59d', '#ffee58', '#fdd835', '#fbc02d'],
            particleCount: 2,
            sizeRange: [1, 4],
            speedRange: [0.5, 2],
            gravity: -0.02,  // 向上飄
            fade: true,
            glow: true,
            shape: 'star'
        },
        ink: {
            name: '墨水',
            colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560'],
            particleCount: 4,
            sizeRange: [4, 12],
            speedRange: [0.3, 1.5],
            gravity: 0.02,
            fade: true,
            glow: false,
            shape: 'circle'
        },
        neon: {
            name: '霓虹',
            colors: ['#00ff87', '#60efff', '#ff00ff', '#ffff00', '#ff6600'],
            particleCount: 2,
            sizeRange: [2, 5],
            speedRange: [0.5, 2],
            gravity: 0,
            fade: true,
            glow: true,
            shape: 'circle'
        },
        fire: {
            name: '火焰',
            colors: ['#ff0000', '#ff4500', '#ff8c00', '#ffd700', '#ffff00'],
            particleCount: 4,
            sizeRange: [3, 8],
            speedRange: [1, 3],
            gravity: -0.08,  // 向上飄
            fade: true,
            glow: true,
            shape: 'circle'
        },
        magic: {
            name: '魔法',
            colors: ['#9b59b6', '#8e44ad', '#3498db', '#1abc9c', '#e74c3c', '#f39c12'],
            particleCount: 3,
            sizeRange: [2, 6],
            speedRange: [1, 3],
            gravity: 0,
            fade: true,
            glow: true,
            shape: 'sparkle'
        }
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
        currentStyle: 'firework',
        density: CONFIG.DEFAULT_DENSITY,
        lifeMult: 1,
        sizeMult: CONFIG.DEFAULT_SIZE_MULT,

        // 特效
        trailEnabled: true,
        spinEnabled: true,

        // 滑鼠追蹤
        mouseX: 0,
        mouseY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        isMouseDown: false,

        // 動畫
        animationId: null,
        lastTime: 0
    };

    // ==================== 粒子類別 ====================

    class Particle {
        constructor(x, y, style) {
            this.x = x;
            this.y = y;

            const styleConfig = STYLES[style];

            // 隨機選擇顏色
            this.color = styleConfig.colors[Math.floor(Math.random() * styleConfig.colors.length)];

            // 隨機大小
            const [minSize, maxSize] = styleConfig.sizeRange;
            this.size = (minSize + Math.random() * (maxSize - minSize)) * state.sizeMult;
            this.originalSize = this.size;

            // 隨機速度和方向
            const [minSpeed, maxSpeed] = styleConfig.speedRange;
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;

            // 物理屬性
            this.gravity = styleConfig.gravity;
            this.fade = styleConfig.fade;
            this.glow = styleConfig.glow;
            this.shape = styleConfig.shape;

            // 生命週期
            this.life = CONFIG.DEFAULT_LIFE * state.lifeMult;
            this.maxLife = this.life;
            this.alpha = 1;

            // 旋轉
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        }

        update(dt) {
            // 更新位置
            this.x += this.vx;
            this.y += this.vy;

            // 應用重力
            this.vy += this.gravity;

            // 旋轉
            if (state.spinEnabled) {
                this.rotation += this.rotationSpeed;
            }

            // 減少生命值
            this.life -= dt;

            // 計算透明度和大小
            const lifeRatio = this.life / this.maxLife;
            this.alpha = this.fade ? lifeRatio : 1;
            this.size = this.originalSize * (0.3 + 0.7 * lifeRatio);

            return this.life > 0;
        }

        draw(ctx) {
            if (this.alpha <= 0) return;

            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // 發光效果
            if (this.glow) {
                ctx.shadowColor = this.color;
                ctx.shadowBlur = this.size * 2;
            }

            ctx.fillStyle = this.color;

            switch (this.shape) {
                case 'star':
                    this.drawStar(ctx, this.size);
                    break;
                case 'sparkle':
                    this.drawSparkle(ctx, this.size);
                    break;
                default:
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
            }

            ctx.restore();
        }

        drawStar(ctx, size) {
            const spikes = 5;
            const outerRadius = size;
            const innerRadius = size * 0.4;

            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }

        drawSparkle(ctx, size) {
            // 四角星芒
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const outerX = Math.cos(angle) * size;
                const outerY = Math.sin(angle) * size;
                const innerAngle = angle + Math.PI / 4;
                const innerX = Math.cos(innerAngle) * size * 0.3;
                const innerY = Math.sin(innerAngle) * size * 0.3;

                if (i === 0) {
                    ctx.moveTo(outerX, outerY);
                } else {
                    ctx.lineTo(outerX, outerY);
                }
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
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

        // 初始化滑鼠位置到畫面中央
        state.mouseX = state.width / 2;
        state.mouseY = state.height / 2;
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', resizeCanvas);

        // 滑鼠移動
        state.canvas.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        });

        state.canvas.addEventListener('mouseenter', (e) => {
            state.lastMouseX = e.clientX;
            state.lastMouseY = e.clientY;
        });

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
                state.lastMouseX = state.mouseX;
                state.lastMouseY = state.mouseY;
            }
        }, { passive: true });

        // 風格按鈕
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentStyle = btn.dataset.style;
            });
        });

        // 密度滑桿
        document.getElementById('density-slider').addEventListener('input', (e) => {
            state.density = parseInt(e.target.value, 10);
            document.getElementById('density-display').textContent = state.density;
        });

        // 軌跡長度滑桿
        document.getElementById('length-slider').addEventListener('input', (e) => {
            state.lifeMult = parseFloat(e.target.value);
            document.getElementById('length-display').textContent = state.lifeMult.toFixed(1);
        });

        // 粒子大小滑桿
        document.getElementById('size-slider').addEventListener('input', (e) => {
            state.sizeMult = parseFloat(e.target.value);
            document.getElementById('size-display').textContent = state.sizeMult.toFixed(1);
        });

        // 特效切換
        document.getElementById('trail-toggle').addEventListener('change', (e) => {
            state.trailEnabled = e.target.checked;
        });

        document.getElementById('spin-toggle').addEventListener('change', (e) => {
            state.spinEnabled = e.target.checked;
        });

        // 清除按鈕
        document.getElementById('clear-btn').addEventListener('click', () => {
            state.particles = [];
            state.ctx.fillStyle = '#050508';
            state.ctx.fillRect(0, 0, state.width, state.height);
        });
    }

    // ==================== 粒子發射 ====================

    function emitParticles() {
        const dx = state.mouseX - state.lastMouseX;
        const dy = state.mouseY - state.lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 只有在滑鼠移動時才發射粒子
        if (distance < 1) return;

        // 計算插值點數量（根據移動距離）
        const steps = Math.min(Math.ceil(distance / 5), CONFIG.INTERPOLATION_STEPS);

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = state.lastMouseX + dx * t;
            const y = state.lastMouseY + dy * t;

            // 根據密度發射粒子
            const styleConfig = STYLES[state.currentStyle];
            const count = styleConfig.particleCount * state.density;

            for (let j = 0; j < count; j++) {
                if (state.particles.length < CONFIG.MAX_PARTICLES) {
                    state.particles.push(new Particle(x, y, state.currentStyle));
                }
            }
        }

        // 更新上一次位置
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
    }

    // ==================== 渲染 ====================

    function render(dt) {
        const ctx = state.ctx;

        // 清除或拖尾效果
        if (state.trailEnabled) {
            ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
            ctx.fillRect(0, 0, state.width, state.height);
        } else {
            ctx.fillStyle = '#050508';
            ctx.fillRect(0, 0, state.width, state.height);
        }

        // 發射新粒子
        emitParticles();

        // 更新和繪製粒子
        state.particles = state.particles.filter(particle => {
            const alive = particle.update(dt);
            if (alive) {
                particle.draw(ctx);
            }
            return alive;
        });

        // 繪製滑鼠游標
        drawCursor(ctx);

        // 更新統計
        document.getElementById('particle-display').textContent = state.particles.length.toLocaleString();
    }

    /**
     * 繪製自訂游標
     */
    function drawCursor(ctx) {
        const style = STYLES[state.currentStyle];
        const color = style.colors[0];

        ctx.save();
        ctx.globalAlpha = 0.8;

        // 外圈
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(state.mouseX, state.mouseY, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 中心點
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(state.mouseX, state.mouseY, 3, 0, Math.PI * 2);
        ctx.fill();

        // 發光
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(state.mouseX, state.mouseY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==================== 動畫迴圈 ====================

    function animate(currentTime) {
        const dt = currentTime - state.lastTime || 16.67;
        state.lastTime = currentTime;

        render(dt);

        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
