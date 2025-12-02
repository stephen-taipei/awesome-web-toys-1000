/**
 * Particle Text 粒子文字
 *
 * 輸入文字轉換為粒子組成
 * - 文字路徑解析為像素點
 * - 滑鼠靠近粒子會散開
 * - 移開後粒子聚合回原位
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_TEXT: 'HELLO',
        DEFAULT_DENSITY: 3,
        DEFAULT_SIZE: 2,
        DEFAULT_RADIUS: 100,
        DEFAULT_SPRING: 0.1,
        FRICTION: 0.95,
        FONT_SIZE: 200,
        LINE_DISTANCE: 30  // 連線最大距離
    };

    // 顏色主題
    const COLOR_THEMES = {
        gradient: ['#ec4899', '#8b5cf6', '#06b6d4'],
        neon: ['#00ff87', '#60efff', '#ff00ff'],
        fire: ['#fcd34d', '#f97316', '#dc2626'],
        mono: ['#e5e7eb', '#9ca3af', '#6b7280']
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
        text: CONFIG.DEFAULT_TEXT,
        density: CONFIG.DEFAULT_DENSITY,
        particleSize: CONFIG.DEFAULT_SIZE,
        mouseRadius: CONFIG.DEFAULT_RADIUS,
        springForce: CONFIG.DEFAULT_SPRING,

        // 顏色主題
        colorTheme: 'gradient',

        // 特效
        linesEnabled: false,
        attractMode: false,

        // 滑鼠位置
        mouseX: -1000,
        mouseY: -1000,

        // 動畫
        animationId: null
    };

    // ==================== 粒子類別 ====================

    class Particle {
        constructor(x, y, color) {
            // 目標位置（文字的位置）
            this.targetX = x;
            this.targetY = y;

            // 當前位置（隨機初始化）
            this.x = Math.random() * state.width;
            this.y = Math.random() * state.height;

            // 速度
            this.vx = 0;
            this.vy = 0;

            // 顏色
            this.color = color;

            // 大小
            this.size = state.particleSize;
        }

        update() {
            const dx = state.mouseX - this.x;
            const dy = state.mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // 滑鼠互動
            if (dist < state.mouseRadius) {
                const force = (state.mouseRadius - dist) / state.mouseRadius;
                const angle = Math.atan2(dy, dx);

                if (state.attractMode) {
                    // 吸引模式
                    this.vx += Math.cos(angle) * force * 2;
                    this.vy += Math.sin(angle) * force * 2;
                } else {
                    // 排斥模式（預設）
                    this.vx -= Math.cos(angle) * force * 5;
                    this.vy -= Math.sin(angle) * force * 5;
                }
            }

            // 回到目標位置的彈簧力
            const targetDx = this.targetX - this.x;
            const targetDy = this.targetY - this.y;

            this.vx += targetDx * state.springForce;
            this.vy += targetDy * state.springForce;

            // 摩擦力
            this.vx *= CONFIG.FRICTION;
            this.vy *= CONFIG.FRICTION;

            // 更新位置
            this.x += this.vx;
            this.y += this.vy;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        createParticlesFromText(state.text);
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
     * 從文字創建粒子
     */
    function createParticlesFromText(text) {
        state.particles = [];

        if (!text || text.trim() === '') {
            updateStats();
            return;
        }

        // 創建離屏 canvas 來渲染文字
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        // 設定字體
        const fontSize = Math.min(CONFIG.FONT_SIZE, state.width / text.length * 1.2);
        offCtx.font = `bold ${fontSize}px Arial, sans-serif`;

        // 測量文字尺寸
        const metrics = offCtx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = fontSize;

        // 設定離屏畫布大小
        offCanvas.width = textWidth + 20;
        offCanvas.height = textHeight + 20;

        // 重新設定字體（因為 canvas 大小改變會重置）
        offCtx.font = `bold ${fontSize}px Arial, sans-serif`;
        offCtx.fillStyle = '#ffffff';
        offCtx.textBaseline = 'top';
        offCtx.fillText(text, 10, 10);

        // 獲取像素資料
        const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const pixels = imageData.data;

        // 計算文字在主畫布的位置（置中）
        const offsetX = (state.width - textWidth) / 2;
        const offsetY = (state.height - textHeight) / 2;

        // 採樣間隔
        const gap = 7 - state.density;  // density 越高，gap 越小

        // 獲取顏色主題
        const colors = COLOR_THEMES[state.colorTheme];

        // 遍歷像素
        for (let y = 0; y < offCanvas.height; y += gap) {
            for (let x = 0; x < offCanvas.width; x += gap) {
                const index = (y * offCanvas.width + x) * 4;
                const alpha = pixels[index + 3];

                // 只有不透明的像素才創建粒子
                if (alpha > 128) {
                    // 根據位置選擇顏色
                    const colorIndex = Math.floor((x / offCanvas.width) * colors.length);
                    const color = colors[Math.min(colorIndex, colors.length - 1)];

                    state.particles.push(new Particle(
                        offsetX + x,
                        offsetY + y,
                        color
                    ));
                }
            }
        }

        updateStats();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticlesFromText(state.text);
        });

        // 滑鼠移動
        state.canvas.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;
        });

        state.canvas.addEventListener('mouseleave', () => {
            state.mouseX = -1000;
            state.mouseY = -1000;
        });

        // 觸控支援
        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                state.mouseX = e.touches[0].clientX;
                state.mouseY = e.touches[0].clientY;
            }
        }, { passive: false });

        state.canvas.addEventListener('touchend', () => {
            state.mouseX = -1000;
            state.mouseY = -1000;
        });

        // 文字輸入
        const textInput = document.getElementById('text-input');
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyText();
            }
        });

        // 套用按鈕
        document.getElementById('apply-btn').addEventListener('click', applyText);

        // 密度滑桿
        document.getElementById('density-slider').addEventListener('input', (e) => {
            state.density = parseInt(e.target.value, 10);
            document.getElementById('density-display').textContent = state.density;
            createParticlesFromText(state.text);
        });

        // 粒子大小滑桿
        document.getElementById('size-slider').addEventListener('input', (e) => {
            state.particleSize = parseFloat(e.target.value);
            document.getElementById('size-display').textContent = state.particleSize;
            // 更新現有粒子大小
            state.particles.forEach(p => p.size = state.particleSize);
        });

        // 影響半徑滑桿
        document.getElementById('radius-slider').addEventListener('input', (e) => {
            state.mouseRadius = parseInt(e.target.value, 10);
            document.getElementById('radius-display').textContent = state.mouseRadius;
        });

        // 回彈力度滑桿
        document.getElementById('spring-slider').addEventListener('input', (e) => {
            state.springForce = parseFloat(e.target.value);
            document.getElementById('spring-display').textContent = state.springForce.toFixed(2);
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
                createParticlesFromText(state.text);
            });
        });

        // 特效切換
        document.getElementById('lines-toggle').addEventListener('change', (e) => {
            state.linesEnabled = e.target.checked;
        });

        document.getElementById('attract-toggle').addEventListener('change', (e) => {
            state.attractMode = e.target.checked;
        });
    }

    /**
     * 套用文字
     */
    function applyText() {
        const input = document.getElementById('text-input');
        state.text = input.value.toUpperCase().trim();
        createParticlesFromText(state.text);
    }

    // ==================== 渲染 ====================

    function render() {
        const ctx = state.ctx;

        // 清除畫布
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, state.width, state.height);

        // 繪製連線（如果啟用）
        if (state.linesEnabled) {
            drawLines(ctx);
        }

        // 繪製滑鼠影響範圍
        if (state.mouseX > 0 && state.mouseY > 0) {
            ctx.beginPath();
            ctx.arc(state.mouseX, state.mouseY, state.mouseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // 更新和繪製粒子
        for (const particle of state.particles) {
            particle.update();
            particle.draw(ctx);
        }
    }

    /**
     * 繪製粒子之間的連線
     */
    function drawLines(ctx) {
        const maxDist = CONFIG.LINE_DISTANCE;

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < state.particles.length; i++) {
            for (let j = i + 1; j < state.particles.length; j++) {
                const p1 = state.particles[i];
                const p2 = state.particles[j];

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = 1 - dist / maxDist;
                    ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.15})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        render();
        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== 統計更新 ====================

    function updateStats() {
        document.getElementById('particle-display').textContent = state.particles.length.toLocaleString();
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
