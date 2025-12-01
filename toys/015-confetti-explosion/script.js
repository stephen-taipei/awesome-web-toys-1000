/**
 * Confetti Explosion 彩帶爆炸
 *
 * 點擊螢幕產生彩帶爆炸效果
 * - 3D 旋轉與投影
 * - 多種形狀（長方形、圓形、星形）
 * - 物理模擬（重力、空氣阻力）
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_COUNT: 100,
        DEFAULT_POWER: 15,
        DEFAULT_GRAVITY: 0.3,
        MAX_PARTICLES: 2000,
        DRAG_COEFFICIENT: 0.02,
        GROUND_BOUNCE: 0.3
    };

    // 顏色主題
    const COLOR_THEMES = {
        party: ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
        gold: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309'],
        pastel: ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8'],
        neon: ['#ff00ff', '#ff00aa', '#aa00ff', '#00ffff', '#00ff00', '#ffff00', '#ff6600']
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 彩帶陣列
        confetti: [],

        // 參數設定
        count: CONFIG.DEFAULT_COUNT,
        power: CONFIG.DEFAULT_POWER,
        gravity: CONFIG.DEFAULT_GRAVITY,

        // 形狀與顏色
        shape: 'mixed',  // mixed, rect, circle, star
        colorTheme: 'party',

        // 特效
        rotateEnabled: true,
        dragEnabled: true,

        // 動畫
        animationId: null,
        hasClicked: false
    };

    // ==================== 彩帶類別 ====================

    class Confetti {
        constructor(x, y, shape) {
            this.x = x;
            this.y = y;

            // 隨機速度（向上發射，帶有擴散）
            const angle = Math.random() * Math.PI * 2;
            const speed = state.power * (0.5 + Math.random() * 0.5);
            this.vx = Math.cos(angle) * speed * 0.7;
            this.vy = -Math.abs(Math.sin(angle) * speed) - state.power * 0.5;

            // 形狀
            this.shape = shape;

            // 大小
            if (shape === 'rect') {
                this.width = 8 + Math.random() * 8;
                this.height = 4 + Math.random() * 4;
            } else {
                this.size = 4 + Math.random() * 6;
            }

            // 顏色
            const colors = COLOR_THEMES[state.colorTheme];
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // 3D 旋轉角度
            this.rotationX = Math.random() * Math.PI * 2;
            this.rotationY = Math.random() * Math.PI * 2;
            this.rotationZ = Math.random() * Math.PI * 2;

            // 旋轉速度
            this.rotationSpeedX = (Math.random() - 0.5) * 0.2;
            this.rotationSpeedY = (Math.random() - 0.5) * 0.2;
            this.rotationSpeedZ = (Math.random() - 0.5) * 0.15;

            // 搖擺（模擬空氣中的飄動）
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = 0.05 + Math.random() * 0.05;

            // 生命週期
            this.life = 1;
            this.fadeSpeed = 0.001 + Math.random() * 0.002;
        }

        update() {
            // 應用重力
            this.vy += state.gravity;

            // 空氣阻力
            if (state.dragEnabled) {
                this.vx *= (1 - CONFIG.DRAG_COEFFICIENT);
                this.vy *= (1 - CONFIG.DRAG_COEFFICIENT * 0.5);

                // 搖擺效果
                this.wobble += this.wobbleSpeed;
                this.vx += Math.sin(this.wobble) * 0.3;
            }

            // 更新位置
            this.x += this.vx;
            this.y += this.vy;

            // 3D 旋轉
            if (state.rotateEnabled) {
                this.rotationX += this.rotationSpeedX;
                this.rotationY += this.rotationSpeedY;
                this.rotationZ += this.rotationSpeedZ;
            }

            // 地面碰撞
            if (this.y > state.height - 10) {
                this.y = state.height - 10;
                this.vy *= -CONFIG.GROUND_BOUNCE;
                this.vx *= 0.8;

                // 減緩旋轉
                this.rotationSpeedX *= 0.8;
                this.rotationSpeedY *= 0.8;
                this.rotationSpeedZ *= 0.8;
            }

            // 邊界處理
            if (this.x < -50 || this.x > state.width + 50) {
                this.life = 0;
            }

            // 生命衰減（落地後加速消失）
            if (this.y >= state.height - 15) {
                this.life -= this.fadeSpeed * 3;
            }

            return this.life > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // 3D 投影效果
            const scaleX = Math.cos(this.rotationY);
            const scaleY = Math.cos(this.rotationX);
            ctx.scale(scaleX || 0.1, scaleY || 0.1);
            ctx.rotate(this.rotationZ);

            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;

            switch (this.shape) {
                case 'rect':
                    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                    break;

                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'star':
                    this.drawStar(ctx, this.size);
                    break;
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
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        bindEvents();
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
    }

    /**
     * 產生爆炸
     */
    function explode(x, y) {
        // 隱藏提示
        if (!state.hasClicked) {
            state.hasClicked = true;
            document.getElementById('click-hint').classList.add('hidden');
        }

        // 決定形狀
        const shapes = state.shape === 'mixed'
            ? ['rect', 'rect', 'rect', 'circle', 'star']  // 長方形較多
            : [state.shape];

        // 產生彩帶
        for (let i = 0; i < state.count; i++) {
            if (state.confetti.length >= CONFIG.MAX_PARTICLES) break;

            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            state.confetti.push(new Confetti(x, y, shape));
        }
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', resizeCanvas);

        // 點擊爆炸
        state.canvas.addEventListener('click', (e) => {
            explode(e.clientX, e.clientY);
        });

        // 觸控支援
        state.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                explode(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: false });

        // 爆炸數量滑桿
        document.getElementById('count-slider').addEventListener('input', (e) => {
            state.count = parseInt(e.target.value, 10);
            document.getElementById('count-display').textContent = state.count;
        });

        // 爆炸力度滑桿
        document.getElementById('power-slider').addEventListener('input', (e) => {
            state.power = parseInt(e.target.value, 10);
            document.getElementById('power-display').textContent = state.power;
        });

        // 重力滑桿
        document.getElementById('gravity-slider').addEventListener('input', (e) => {
            state.gravity = parseFloat(e.target.value);
            document.getElementById('gravity-display').textContent = state.gravity.toFixed(2);
        });

        // 形狀按鈕
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.shape = btn.dataset.shape;
            });
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
            });
        });

        // 特效切換
        document.getElementById('rotate-toggle').addEventListener('change', (e) => {
            state.rotateEnabled = e.target.checked;
        });

        document.getElementById('drag-toggle').addEventListener('change', (e) => {
            state.dragEnabled = e.target.checked;
        });

        // 中央爆發按鈕
        document.getElementById('burst-btn').addEventListener('click', () => {
            explode(state.width / 2, state.height / 2);
        });

        // 清除按鈕
        document.getElementById('clear-btn').addEventListener('click', () => {
            state.confetti = [];
        });
    }

    // ==================== 渲染 ====================

    function render() {
        const ctx = state.ctx;

        // 清除畫布
        ctx.fillStyle = '#0f0f17';
        ctx.fillRect(0, 0, state.width, state.height);

        // 更新和繪製彩帶
        state.confetti = state.confetti.filter(c => {
            const alive = c.update();
            if (alive) {
                c.draw(ctx);
            }
            return alive;
        });

        // 更新統計
        document.getElementById('particle-display').textContent = state.confetti.length;
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        render();
        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
