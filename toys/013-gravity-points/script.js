/**
 * Gravity Points 重力點
 *
 * N-body 重力模擬系統
 * - 點擊創建重力中心
 * - 粒子被吸引或排斥
 * - 可設定正負引力
 *
 * 物理公式：F = G·m₁·m₂/r²
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_PARTICLE_COUNT: 500,
        MAX_PARTICLES: 3000,
        DEFAULT_STRENGTH: 1,
        DEFAULT_SIZE: 2,
        GRAVITY_CONSTANT: 500,  // 重力常數
        SOFTENING: 50,  // 軟化參數（避免距離過近時力過大）
        MAX_SPEED: 15,  // 最大速度限制
        DAMPING: 0.999  // 阻尼係數
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 粒子與重力點
        particles: [],
        gravityPoints: [],

        // 參數設定
        gravityType: 'attract',  // attract 或 repel
        strength: CONFIG.DEFAULT_STRENGTH,
        particleCount: CONFIG.DEFAULT_PARTICLE_COUNT,
        particleSize: CONFIG.DEFAULT_SIZE,

        // 特效
        trailEnabled: true,
        velocityColorEnabled: true,
        fieldEnabled: false,

        // 動畫
        animationId: null
    };

    // ==================== 粒子類別 ====================

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.mass = 1;
        }

        update(gravityPoints, strength) {
            // 計算所有重力點對粒子的合力
            let ax = 0;
            let ay = 0;

            for (const gp of gravityPoints) {
                const dx = gp.x - this.x;
                const dy = gp.y - this.y;
                const distSq = dx * dx + dy * dy + CONFIG.SOFTENING;
                const dist = Math.sqrt(distSq);

                // F = G * m / r²（簡化版，假設粒子質量為 1）
                const force = (CONFIG.GRAVITY_CONSTANT * gp.mass * strength) / distSq;

                // 根據重力點類型決定方向
                const direction = gp.type === 'attract' ? 1 : -1;

                // 累加加速度
                ax += direction * force * (dx / dist);
                ay += direction * force * (dy / dist);
            }

            // 更新速度
            this.vx += ax;
            this.vy += ay;

            // 速度限制
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > CONFIG.MAX_SPEED) {
                this.vx = (this.vx / speed) * CONFIG.MAX_SPEED;
                this.vy = (this.vy / speed) * CONFIG.MAX_SPEED;
            }

            // 阻尼
            this.vx *= CONFIG.DAMPING;
            this.vy *= CONFIG.DAMPING;

            // 更新位置
            this.x += this.vx;
            this.y += this.vy;

            // 邊界處理（環繞）
            if (this.x < 0) this.x += state.width;
            if (this.x > state.width) this.x -= state.width;
            if (this.y < 0) this.y += state.height;
            if (this.y > state.height) this.y -= state.height;
        }

        draw(ctx, size, velocityColor) {
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            if (velocityColor) {
                // 根據速度著色
                const hue = 240 - (speed / CONFIG.MAX_SPEED) * 240;  // 藍到紅
                const saturation = 70 + (speed / CONFIG.MAX_SPEED) * 30;
                const lightness = 50 + (speed / CONFIG.MAX_SPEED) * 20;
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            } else {
                ctx.fillStyle = 'rgba(147, 197, 253, 0.8)';
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==================== 重力點類別 ====================

    class GravityPoint {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;  // 'attract' 或 'repel'
            this.mass = 10;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        draw(ctx, time) {
            const pulse = 1 + 0.2 * Math.sin(time * 0.003 + this.pulsePhase);
            const baseRadius = 20;
            const radius = baseRadius * pulse;

            // 外圈光暈
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, radius * 2
            );

            if (this.type === 'attract') {
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
                gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
                gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius * 2, 0, Math.PI * 2);
            ctx.fill();

            // 中心圓
            ctx.fillStyle = this.type === 'attract' ? '#3b82f6' : '#ef4444';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // 符號
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.type === 'attract' ? '+' : '−', this.x, this.y);
        }
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        initParticles();
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
     * 初始化粒子
     */
    function initParticles() {
        state.particles = [];
        for (let i = 0; i < state.particleCount; i++) {
            state.particles.push(new Particle(
                Math.random() * state.width,
                Math.random() * state.height
            ));
        }
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
        });

        // 點擊放置重力點
        state.canvas.addEventListener('click', (e) => {
            const rect = state.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            state.gravityPoints.push(new GravityPoint(x, y, state.gravityType));
        });

        // 右鍵刪除最近的重力點
        state.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = state.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 找到最近的重力點
            let minDist = Infinity;
            let minIndex = -1;

            state.gravityPoints.forEach((gp, index) => {
                const dx = gp.x - x;
                const dy = gp.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist && dist < 50) {
                    minDist = dist;
                    minIndex = index;
                }
            });

            if (minIndex !== -1) {
                state.gravityPoints.splice(minIndex, 1);
            }
        });

        // 觸控支援
        state.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const rect = state.canvas.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                state.gravityPoints.push(new GravityPoint(x, y, state.gravityType));
            }
        }, { passive: false });

        // 重力類型按鈕
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.gravityType = btn.dataset.type;
            });
        });

        // 引力強度滑桿
        document.getElementById('strength-slider').addEventListener('input', (e) => {
            state.strength = parseFloat(e.target.value);
            document.getElementById('strength-display').textContent = state.strength.toFixed(1);
        });

        // 粒子數量滑桿
        document.getElementById('particle-count-slider').addEventListener('input', (e) => {
            state.particleCount = parseInt(e.target.value, 10);
            document.getElementById('particle-count-display').textContent = state.particleCount;

            // 調整粒子數量
            while (state.particles.length < state.particleCount) {
                state.particles.push(new Particle(
                    Math.random() * state.width,
                    Math.random() * state.height
                ));
            }
            while (state.particles.length > state.particleCount) {
                state.particles.pop();
            }
        });

        // 粒子大小滑桿
        document.getElementById('size-slider').addEventListener('input', (e) => {
            state.particleSize = parseFloat(e.target.value);
            document.getElementById('size-display').textContent = state.particleSize;
        });

        // 特效切換
        document.getElementById('trail-toggle').addEventListener('change', (e) => {
            state.trailEnabled = e.target.checked;
        });

        document.getElementById('velocity-color-toggle').addEventListener('change', (e) => {
            state.velocityColorEnabled = e.target.checked;
        });

        document.getElementById('field-toggle').addEventListener('change', (e) => {
            state.fieldEnabled = e.target.checked;
        });

        // 清除重力點按鈕
        document.getElementById('clear-points-btn').addEventListener('click', () => {
            state.gravityPoints = [];
        });

        // 重置粒子按鈕
        document.getElementById('reset-btn').addEventListener('click', () => {
            initParticles();
        });
    }

    // ==================== 渲染 ====================

    function render(time) {
        const ctx = state.ctx;

        // 清除或拖尾效果
        if (state.trailEnabled) {
            ctx.fillStyle = 'rgba(2, 2, 8, 0.15)';
            ctx.fillRect(0, 0, state.width, state.height);
        } else {
            ctx.fillStyle = '#020208';
            ctx.fillRect(0, 0, state.width, state.height);
        }

        // 繪製力場視覺化（如果啟用）
        if (state.fieldEnabled && state.gravityPoints.length > 0) {
            drawForceField(ctx);
        }

        // 更新和繪製粒子
        for (const particle of state.particles) {
            particle.update(state.gravityPoints, state.strength);
            particle.draw(ctx, state.particleSize, state.velocityColorEnabled);
        }

        // 繪製重力點
        for (const gp of state.gravityPoints) {
            gp.draw(ctx, time);
        }

        // 更新統計
        document.getElementById('gravity-point-display').textContent = state.gravityPoints.length;
        document.getElementById('particle-display').textContent = state.particles.length;
    }

    /**
     * 繪製力場視覺化
     */
    function drawForceField(ctx) {
        const gridSize = 40;
        const arrowLength = 15;

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1;

        for (let x = gridSize / 2; x < state.width; x += gridSize) {
            for (let y = gridSize / 2; y < state.height; y += gridSize) {
                // 計算該點的合力方向
                let fx = 0;
                let fy = 0;

                for (const gp of state.gravityPoints) {
                    const dx = gp.x - x;
                    const dy = gp.y - y;
                    const distSq = dx * dx + dy * dy + CONFIG.SOFTENING;
                    const dist = Math.sqrt(distSq);
                    const force = (CONFIG.GRAVITY_CONSTANT * gp.mass) / distSq;
                    const direction = gp.type === 'attract' ? 1 : -1;

                    fx += direction * force * (dx / dist);
                    fy += direction * force * (dy / dist);
                }

                // 繪製箭頭
                const forceMag = Math.sqrt(fx * fx + fy * fy);
                if (forceMag > 0.1) {
                    const normalFx = (fx / forceMag) * arrowLength;
                    const normalFy = (fy / forceMag) * arrowLength;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + normalFx, y + normalFy);
                    ctx.stroke();

                    // 箭頭頭部
                    const angle = Math.atan2(normalFy, normalFx);
                    ctx.beginPath();
                    ctx.moveTo(x + normalFx, y + normalFy);
                    ctx.lineTo(
                        x + normalFx - 5 * Math.cos(angle - 0.5),
                        y + normalFy - 5 * Math.sin(angle - 0.5)
                    );
                    ctx.moveTo(x + normalFx, y + normalFy);
                    ctx.lineTo(
                        x + normalFx - 5 * Math.cos(angle + 0.5),
                        y + normalFy - 5 * Math.sin(angle + 0.5)
                    );
                    ctx.stroke();
                }
            }
        }
    }

    // ==================== 動畫迴圈 ====================

    function animate(time) {
        render(time || 0);
        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
