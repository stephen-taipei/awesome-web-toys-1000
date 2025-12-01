/**
 * Fractal Clock 分形時鐘
 *
 * 時鐘指針由分形樹枝構成
 * - 時針、分針、秒針各為一棵分形樹
 * - 即時顯示時間
 * - 分形可隨時間緩慢演化
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_DEPTH: 6,
        DEFAULT_ANGLE: 25,
        DEFAULT_SCALE: 0.7,
        CLOCK_RADIUS_RATIO: 0.38,  // 時鐘半徑佔畫面的比例
        HOUR_LENGTH_RATIO: 0.5,    // 時針長度比例
        MINUTE_LENGTH_RATIO: 0.7,  // 分針長度比例
        SECOND_LENGTH_RATIO: 0.8   // 秒針長度比例
    };

    // 顏色主題
    const COLOR_THEMES = {
        classic: {
            hour: { base: '#6366f1', tip: '#a5b4fc' },
            minute: { base: '#818cf8', tip: '#c7d2fe' },
            second: { base: '#f472b6', tip: '#fbcfe8' },
            ticks: '#4338ca',
            center: '#6366f1'
        },
        neon: {
            hour: { base: '#06b6d4', tip: '#67e8f9' },
            minute: { base: '#a3e635', tip: '#d9f99d' },
            second: { base: '#f472b6', tip: '#fbcfe8' },
            ticks: '#0891b2',
            center: '#06b6d4'
        },
        nature: {
            hour: { base: '#78350f', tip: '#a16207' },
            minute: { base: '#166534', tip: '#22c55e' },
            second: { base: '#86efac', tip: '#bbf7d0' },
            ticks: '#14532d',
            center: '#166534'
        },
        sunset: {
            hour: { base: '#dc2626', tip: '#f87171' },
            minute: { base: '#f97316', tip: '#fdba74' },
            second: { base: '#fcd34d', tip: '#fef08a' },
            ticks: '#9a3412',
            center: '#ea580c'
        }
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,
        centerX: 0,
        centerY: 0,
        clockRadius: 0,

        // 分形參數
        depth: CONFIG.DEFAULT_DEPTH,
        branchAngle: CONFIG.DEFAULT_ANGLE,
        scaleFactor: CONFIG.DEFAULT_SCALE,

        // 顏色主題
        colorTheme: 'classic',

        // 選項
        evolving: true,
        showTicks: true,

        // 動畫
        animationId: null,
        evolveOffset: 0,

        // 統計
        branchCount: 0
    };

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

        // 計算時鐘中心和半徑
        state.centerX = state.width / 2;
        state.centerY = state.height / 2;
        state.clockRadius = Math.min(state.width, state.height) * CONFIG.CLOCK_RADIUS_RATIO;
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', debounce(resizeCanvas, 200));

        // 深度滑桿
        document.getElementById('depth-slider').addEventListener('input', (e) => {
            state.depth = parseInt(e.target.value, 10);
            document.getElementById('depth-display').textContent = state.depth;
        });

        // 角度滑桿
        document.getElementById('angle-slider').addEventListener('input', (e) => {
            state.branchAngle = parseInt(e.target.value, 10);
            document.getElementById('angle-display').textContent = state.branchAngle;
        });

        // 縮放比例滑桿
        document.getElementById('scale-slider').addEventListener('input', (e) => {
            state.scaleFactor = parseFloat(e.target.value);
            document.getElementById('scale-display').textContent = state.scaleFactor.toFixed(2);
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
            });
        });

        // 演化切換
        document.getElementById('evolve-toggle').addEventListener('change', (e) => {
            state.evolving = e.target.checked;
        });

        // 刻度切換
        document.getElementById('ticks-toggle').addEventListener('change', (e) => {
            state.showTicks = e.target.checked;
        });
    }

    // ==================== 繪製 ====================

    /**
     * 清除畫布
     */
    function clearCanvas() {
        state.ctx.fillStyle = '#0a0a12';
        state.ctx.fillRect(0, 0, state.width, state.height);
    }

    /**
     * 繪製時鐘刻度
     */
    function drawClockFace() {
        const ctx = state.ctx;
        const theme = COLOR_THEMES[state.colorTheme];

        // 繪製外圈
        ctx.beginPath();
        ctx.arc(state.centerX, state.centerY, state.clockRadius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!state.showTicks) return;

        // 繪製刻度
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const isHour = i % 5 === 0;

            const innerRadius = state.clockRadius - (isHour ? 20 : 10);
            const outerRadius = state.clockRadius;

            const x1 = state.centerX + Math.cos(angle) * innerRadius;
            const y1 = state.centerY + Math.sin(angle) * innerRadius;
            const x2 = state.centerX + Math.cos(angle) * outerRadius;
            const y2 = state.centerY + Math.sin(angle) * outerRadius;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = theme.ticks;
            ctx.lineWidth = isHour ? 3 : 1;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // 繪製中心點
        ctx.beginPath();
        ctx.arc(state.centerX, state.centerY, 8, 0, Math.PI * 2);
        ctx.fillStyle = theme.center;
        ctx.fill();
    }

    /**
     * 繪製分形樹枝（遞迴）
     */
    function drawFractalBranch(x, y, length, angle, depth, lineWidth, colors, evolveAmount) {
        if (depth <= 0 || length < 1) return;

        state.branchCount++;

        const ctx = state.ctx;

        // 計算終點
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        // 計算顏色漸層
        const t = 1 - depth / state.depth;
        const color = lerpColor(colors.base, colors.tip, t);

        // 繪製分支
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 計算演化後的分支角度
        const evolvedAngle = state.branchAngle + evolveAmount;
        const angleRad = (evolvedAngle * Math.PI) / 180;

        // 計算下一層參數
        const nextLength = length * state.scaleFactor;
        const nextWidth = Math.max(0.5, lineWidth * 0.7);

        // 遞迴繪製左右分支
        drawFractalBranch(
            endX, endY,
            nextLength,
            angle - angleRad,
            depth - 1,
            nextWidth,
            colors,
            evolveAmount
        );

        drawFractalBranch(
            endX, endY,
            nextLength,
            angle + angleRad,
            depth - 1,
            nextWidth,
            colors,
            evolveAmount
        );
    }

    /**
     * 繪製時鐘指針（分形樹）
     */
    function drawClockHand(angle, length, baseWidth, colors, depth, evolveAmount) {
        // 從中心開始繪製
        const startX = state.centerX;
        const startY = state.centerY;

        // 角度轉換（12 點鐘方向為 0）
        const radAngle = angle - Math.PI / 2;

        // 繪製主幹
        const mainEndX = startX + Math.cos(radAngle) * length * 0.3;
        const mainEndY = startY + Math.sin(radAngle) * length * 0.3;

        state.ctx.beginPath();
        state.ctx.moveTo(startX, startY);
        state.ctx.lineTo(mainEndX, mainEndY);
        state.ctx.strokeStyle = colors.base;
        state.ctx.lineWidth = baseWidth;
        state.ctx.lineCap = 'round';
        state.ctx.stroke();

        // 從主幹末端開始分形
        drawFractalBranch(
            mainEndX, mainEndY,
            length * 0.7,
            radAngle,
            depth,
            baseWidth * 0.8,
            colors,
            evolveAmount
        );
    }

    /**
     * 繪製整個時鐘
     */
    function drawClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        // 計算精確角度（帶平滑過渡）
        const secondAngle = ((seconds + milliseconds / 1000) / 60) * Math.PI * 2;
        const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2;
        const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2;

        // 更新數位時間
        updateDigitalTime(hours, minutes, seconds);

        // 清除畫布
        clearCanvas();

        // 重置分支計數
        state.branchCount = 0;

        // 計算演化偏移（如果啟用）
        let evolveAmount = 0;
        if (state.evolving) {
            state.evolveOffset += 0.01;
            evolveAmount = Math.sin(state.evolveOffset) * 5;
        }

        // 繪製時鐘面
        drawClockFace();

        const theme = COLOR_THEMES[state.colorTheme];

        // 繪製時針（最粗，深度較淺）
        drawClockHand(
            hourAngle,
            state.clockRadius * CONFIG.HOUR_LENGTH_RATIO,
            6,
            theme.hour,
            Math.max(2, state.depth - 2),
            evolveAmount
        );

        // 繪製分針
        drawClockHand(
            minuteAngle,
            state.clockRadius * CONFIG.MINUTE_LENGTH_RATIO,
            4,
            theme.minute,
            Math.max(2, state.depth - 1),
            evolveAmount * 1.2
        );

        // 繪製秒針（最細，深度最深）
        drawClockHand(
            secondAngle,
            state.clockRadius * CONFIG.SECOND_LENGTH_RATIO,
            2,
            theme.second,
            state.depth,
            evolveAmount * 1.5
        );

        // 更新統計
        updateStats();
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        drawClock();
        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== UI 更新 ====================

    function updateDigitalTime(hours, minutes, seconds) {
        const h = String(hours || 12).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        document.getElementById('time-display').textContent = `${h}:${m}:${s}`;
    }

    function updateStats() {
        let branchStr;
        if (state.branchCount >= 1000) {
            branchStr = (state.branchCount / 1000).toFixed(1) + 'K';
        } else {
            branchStr = state.branchCount.toString();
        }
        document.getElementById('branch-display').textContent = branchStr;
    }

    // ==================== 工具函數 ====================

    /**
     * 顏色線性插值
     */
    function lerpColor(color1, color2, t) {
        // 解析 hex 顏色
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
