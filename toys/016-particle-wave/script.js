/**
 * Particle Wave 粒子波浪
 *
 * 粒子排列成網格產生波浪動畫
 * - 正弦波驅動高度變化
 * - 滑鼠移動產生漣漪效果
 * - 多種波浪模式
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_DENSITY: 30,
        DEFAULT_AMPLITUDE: 30,
        DEFAULT_FREQUENCY: 0.03,
        DEFAULT_SPEED: 0.05,
        RIPPLE_STRENGTH: 50,
        RIPPLE_DECAY: 0.95,
        LINE_DISTANCE: 50
    };

    // 顏色主題
    const COLOR_THEMES = {
        ocean: {
            low: { r: 12, g: 74, b: 110 },
            high: { r: 125, g: 211, b: 252 }
        },
        sunset: {
            low: { r: 124, g: 45, b: 18 },
            high: { r: 252, g: 211, b: 77 }
        },
        aurora: {
            low: { r: 22, g: 101, b: 52 },
            high: { r: 192, g: 132, b: 252 }
        },
        mono: {
            low: { r: 30, g: 41, b: 59 },
            high: { r: 226, g: 232, b: 240 }
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
        density: CONFIG.DEFAULT_DENSITY,
        amplitude: CONFIG.DEFAULT_AMPLITUDE,
        frequency: CONFIG.DEFAULT_FREQUENCY,
        speed: CONFIG.DEFAULT_SPEED,

        // 模式與顏色
        waveMode: 'horizontal',  // horizontal, radial, diagonal
        colorTheme: 'ocean',

        // 特效
        rippleEnabled: true,
        linesEnabled: false,
        heightColorEnabled: true,

        // 滑鼠與漣漪
        mouseX: -1000,
        mouseY: -1000,
        ripples: [],

        // 動畫
        animationId: null,
        time: 0
    };

    // ==================== 粒子類別 ====================

    class Particle {
        constructor(x, y, gridX, gridY) {
            this.baseX = x;
            this.baseY = y;
            this.x = x;
            this.y = y;
            this.z = 0;  // 高度
            this.gridX = gridX;
            this.gridY = gridY;
        }

        update(time) {
            // 計算波浪高度
            let waveHeight = 0;

            switch (state.waveMode) {
                case 'horizontal':
                    waveHeight = Math.sin(this.baseX * state.frequency + time) * state.amplitude;
                    break;

                case 'radial':
                    const centerX = state.width / 2;
                    const centerY = state.height / 2;
                    const distFromCenter = Math.sqrt(
                        Math.pow(this.baseX - centerX, 2) +
                        Math.pow(this.baseY - centerY, 2)
                    );
                    waveHeight = Math.sin(distFromCenter * state.frequency * 0.5 - time) * state.amplitude;
                    break;

                case 'diagonal':
                    waveHeight = Math.sin((this.baseX + this.baseY) * state.frequency * 0.7 + time) * state.amplitude;
                    break;
            }

            // 添加漣漪效果
            if (state.rippleEnabled) {
                for (const ripple of state.ripples) {
                    const dx = this.baseX - ripple.x;
                    const dy = this.baseY - ripple.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const rippleWave = Math.sin(dist * 0.1 - ripple.phase) * ripple.strength;
                    const falloff = Math.max(0, 1 - dist / 300);
                    waveHeight += rippleWave * falloff;
                }
            }

            this.z = waveHeight;
            this.y = this.baseY + this.z * 0.5;  // Y 方向偏移（俯視角度）
        }

        draw(ctx) {
            // 根據高度計算顏色
            let color;
            if (state.heightColorEnabled) {
                const theme = COLOR_THEMES[state.colorTheme];
                const t = (this.z + state.amplitude) / (state.amplitude * 2);
                color = lerpColor(theme.low, theme.high, t);
            } else {
                const theme = COLOR_THEMES[state.colorTheme];
                color = lerpColor(theme.low, theme.high, 0.5);
            }

            // 根據高度計算大小
            const baseSize = state.width / state.density / 4;
            const size = baseSize * (0.5 + (this.z + state.amplitude) / (state.amplitude * 4));

            // 繪製粒子
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(1, size), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==================== 漣漪類別 ====================

    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.strength = CONFIG.RIPPLE_STRENGTH;
            this.phase = 0;
        }

        update() {
            this.phase += 0.2;
            this.strength *= CONFIG.RIPPLE_DECAY;
            return this.strength > 0.5;
        }
    }

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        createParticleGrid();
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
     * 創建粒子網格
     */
    function createParticleGrid() {
        state.particles = [];

        const cols = state.density;
        const rows = Math.floor(state.density * (state.height / state.width));

        const cellWidth = state.width / cols;
        const cellHeight = state.height / rows;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = cellWidth * (i + 0.5);
                const y = cellHeight * (j + 0.5);
                state.particles.push(new Particle(x, y, i, j));
            }
        }

        updateStats();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticleGrid();
        });

        // 滑鼠移動產生漣漪
        state.canvas.addEventListener('mousemove', (e) => {
            state.mouseX = e.clientX;
            state.mouseY = e.clientY;

            if (state.rippleEnabled) {
                // 每隔一段距離產生漣漪
                const lastRipple = state.ripples[state.ripples.length - 1];
                if (!lastRipple ||
                    Math.abs(e.clientX - lastRipple.x) > 30 ||
                    Math.abs(e.clientY - lastRipple.y) > 30) {
                    state.ripples.push(new Ripple(e.clientX, e.clientY));
                }
            }
        });

        state.canvas.addEventListener('mouseleave', () => {
            state.mouseX = -1000;
            state.mouseY = -1000;
        });

        // 觸控支援
        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                state.mouseX = touch.clientX;
                state.mouseY = touch.clientY;

                if (state.rippleEnabled) {
                    state.ripples.push(new Ripple(touch.clientX, touch.clientY));
                }
            }
        }, { passive: false });

        // 網格密度滑桿
        document.getElementById('density-slider').addEventListener('input', (e) => {
            state.density = parseInt(e.target.value, 10);
            document.getElementById('density-display').textContent = state.density;
            createParticleGrid();
        });

        // 波浪振幅滑桿
        document.getElementById('amplitude-slider').addEventListener('input', (e) => {
            state.amplitude = parseInt(e.target.value, 10);
            document.getElementById('amplitude-display').textContent = state.amplitude;
        });

        // 波浪頻率滑桿
        document.getElementById('frequency-slider').addEventListener('input', (e) => {
            state.frequency = parseFloat(e.target.value);
            document.getElementById('frequency-display').textContent = state.frequency.toFixed(3);
        });

        // 波浪速度滑桿
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            state.speed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = state.speed.toFixed(2);
        });

        // 模式按鈕
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.waveMode = btn.dataset.mode;
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
        document.getElementById('ripple-toggle').addEventListener('change', (e) => {
            state.rippleEnabled = e.target.checked;
            if (!state.rippleEnabled) {
                state.ripples = [];
            }
        });

        document.getElementById('lines-toggle').addEventListener('change', (e) => {
            state.linesEnabled = e.target.checked;
        });

        document.getElementById('height-color-toggle').addEventListener('change', (e) => {
            state.heightColorEnabled = e.target.checked;
        });
    }

    // ==================== 渲染 ====================

    function render() {
        const ctx = state.ctx;

        // 清除畫布
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, state.width, state.height);

        // 更新時間
        state.time += state.speed;

        // 更新漣漪
        state.ripples = state.ripples.filter(ripple => ripple.update());

        // 更新粒子
        for (const particle of state.particles) {
            particle.update(state.time);
        }

        // 繪製連線（如果啟用）
        if (state.linesEnabled) {
            drawLines(ctx);
        }

        // 繪製粒子（按 Y 排序以獲得深度效果）
        const sortedParticles = [...state.particles].sort((a, b) => a.y - b.y);
        for (const particle of sortedParticles) {
            particle.draw(ctx);
        }
    }

    /**
     * 繪製粒子之間的連線
     */
    function drawLines(ctx) {
        const theme = COLOR_THEMES[state.colorTheme];
        const midColor = lerpColor(theme.low, theme.high, 0.5);

        ctx.strokeStyle = `rgba(${midColor.r}, ${midColor.g}, ${midColor.b}, 0.15)`;
        ctx.lineWidth = 0.5;

        // 只連接相鄰的粒子
        for (const particle of state.particles) {
            // 找到右邊和下面的相鄰粒子
            for (const other of state.particles) {
                if (other === particle) continue;

                const dx = Math.abs(other.gridX - particle.gridX);
                const dy = Math.abs(other.gridY - particle.gridY);

                // 只連接直接相鄰的粒子
                if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
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

    // ==================== 工具函數 ====================

    function lerpColor(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

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
