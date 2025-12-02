/**
 * Dragon Curve 龍形曲線
 *
 * 使用折紙演算法生成龍形曲線
 * - 動畫展示繪製過程
 * - 播放/暫停/倒轉控制
 * - 可調整速度和顏色
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_ITERATION: 10,
        MAX_ITERATION: 17,
        MIN_ITERATION: 1,
        DEFAULT_SPEED: 1,
        SEGMENT_LENGTH: 10,
        LINE_WIDTH: 2
    };

    // 顏色主題
    const COLOR_THEMES = {
        gradient: {
            start: [167, 139, 250],  // 紫
            end: [244, 114, 182]      // 粉
        },
        rainbow: null,  // 彩虹使用 HSL
        fire: {
            start: [255, 69, 0],     // 橙紅
            end: [255, 215, 0]        // 金黃
        },
        ice: {
            start: [0, 191, 255],    // 深藍
            end: [224, 255, 255]      // 淺藍
        }
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 曲線參數
        iteration: CONFIG.DEFAULT_ITERATION,
        turns: [],           // 轉向序列（true=右轉，false=左轉）
        points: [],          // 所有頂點

        // 動畫控制
        isPlaying: false,
        isReversing: false,
        currentSegment: 0,
        speed: CONFIG.DEFAULT_SPEED,  // 1 = 正常速度
        animationId: null,
        lastFrameTime: 0,

        // 顏色
        colorTheme: 'gradient'
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        bindEvents();
        generateDragonCurve();
        drawFullCurve();
        updateDisplay();
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

    // ==================== 龍形曲線生成 ====================

    /**
     * 生成龍形曲線的轉向序列
     *
     * 折紙演算法：
     * 1. 初始序列：R（右轉）
     * 2. 每次迭代：原序列 + R + 原序列逆序並翻轉
     */
    function generateDragonCurve() {
        // 生成轉向序列
        state.turns = [true];  // true = 右轉 90°

        for (let i = 1; i < state.iteration; i++) {
            const newTurns = [...state.turns, true];
            // 將原序列逆序並翻轉方向
            for (let j = state.turns.length - 1; j >= 0; j--) {
                newTurns.push(!state.turns[j]);
            }
            state.turns = newTurns;
        }

        // 根據轉向序列計算所有頂點
        calculatePoints();
    }

    /**
     * 計算所有頂點座標
     */
    function calculatePoints() {
        state.points = [];

        // 計算適當的線段長度
        const totalSegments = state.turns.length + 1;
        const estimatedSize = Math.sqrt(totalSegments) * CONFIG.SEGMENT_LENGTH;
        const scale = Math.min(state.width, state.height) * 0.8 / estimatedSize;
        const segmentLength = CONFIG.SEGMENT_LENGTH * scale;

        // 起點（先計算整體邊界再調整）
        let x = 0;
        let y = 0;
        let direction = 0;  // 0=右, 1=下, 2=左, 3=上

        // 先收集所有點計算邊界
        const tempPoints = [{x, y}];

        for (const turn of state.turns) {
            // 根據方向移動
            switch (direction) {
                case 0: x += segmentLength; break;  // 右
                case 1: y += segmentLength; break;  // 下
                case 2: x -= segmentLength; break;  // 左
                case 3: y -= segmentLength; break;  // 上
            }
            tempPoints.push({x, y});

            // 轉向
            direction = turn
                ? (direction + 1) % 4   // 右轉
                : (direction + 3) % 4;  // 左轉
        }

        // 計算邊界
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const p of tempPoints) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }

        // 計算偏移使曲線居中
        const offsetX = state.width / 2 - (minX + maxX) / 2;
        const offsetY = state.height / 2 - (minY + maxY) / 2;

        // 應用偏移
        state.points = tempPoints.map(p => ({
            x: p.x + offsetX,
            y: p.y + offsetY
        }));
    }

    // ==================== 繪製 ====================

    /**
     * 清除畫布
     */
    function clearCanvas() {
        state.ctx.fillStyle = '#0d0d1a';
        state.ctx.fillRect(0, 0, state.width, state.height);
    }

    /**
     * 繪製完整曲線
     */
    function drawFullCurve() {
        clearCanvas();

        const ctx = state.ctx;
        const total = state.points.length - 1;

        ctx.lineWidth = CONFIG.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < total; i++) {
            ctx.beginPath();
            ctx.moveTo(state.points[i].x, state.points[i].y);
            ctx.lineTo(state.points[i + 1].x, state.points[i + 1].y);
            ctx.strokeStyle = getSegmentColor(i, total);
            ctx.stroke();
        }

        state.currentSegment = total;
        updateProgress();
    }

    /**
     * 繪製到指定線段
     */
    function drawToSegment(segmentIndex) {
        clearCanvas();

        const ctx = state.ctx;
        const total = state.points.length - 1;
        const drawCount = Math.min(segmentIndex, total);

        ctx.lineWidth = CONFIG.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < drawCount; i++) {
            ctx.beginPath();
            ctx.moveTo(state.points[i].x, state.points[i].y);
            ctx.lineTo(state.points[i + 1].x, state.points[i + 1].y);
            ctx.strokeStyle = getSegmentColor(i, total);
            ctx.stroke();
        }
    }

    /**
     * 獲取線段顏色
     */
    function getSegmentColor(index, total) {
        const t = index / total;

        if (state.colorTheme === 'rainbow') {
            // 彩虹色
            const hue = t * 360;
            return `hsl(${hue}, 80%, 60%)`;
        }

        const theme = COLOR_THEMES[state.colorTheme];
        if (!theme) return '#a78bfa';

        // 線性插值
        const r = Math.round(theme.start[0] + (theme.end[0] - theme.start[0]) * t);
        const g = Math.round(theme.start[1] + (theme.end[1] - theme.start[1]) * t);
        const b = Math.round(theme.start[2] + (theme.end[2] - theme.start[2]) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // ==================== 動畫控制 ====================

    /**
     * 開始/繼續播放
     */
    function play() {
        if (state.isPlaying) return;

        state.isPlaying = true;
        state.isReversing = false;
        state.lastFrameTime = performance.now();

        updatePlayButton();
        animate();
    }

    /**
     * 暫停
     */
    function pause() {
        state.isPlaying = false;
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
            state.animationId = null;
        }
        updatePlayButton();
    }

    /**
     * 切換播放/暫停
     */
    function togglePlay() {
        if (state.isPlaying) {
            pause();
        } else {
            // 如果已經播放完畢，從頭開始
            const total = state.points.length - 1;
            if (state.currentSegment >= total && !state.isReversing) {
                state.currentSegment = 0;
            }
            if (state.currentSegment <= 0 && state.isReversing) {
                state.currentSegment = total;
            }
            play();
        }
    }

    /**
     * 倒轉播放
     */
    function reverse() {
        state.isReversing = true;
        if (!state.isPlaying) {
            state.isPlaying = true;
            state.lastFrameTime = performance.now();
            updatePlayButton();
            animate();
        }
    }

    /**
     * 重新開始
     */
    function restart() {
        pause();
        state.currentSegment = 0;
        state.isReversing = false;
        clearCanvas();
        updateProgress();
    }

    /**
     * 動畫迴圈
     */
    function animate(currentTime) {
        if (!state.isPlaying) return;

        const deltaTime = currentTime - state.lastFrameTime;
        const total = state.points.length - 1;

        // 根據速度計算每幀繪製的線段數
        let segmentsPerFrame;
        if (state.speed === 0) {
            // 即時模式
            segmentsPerFrame = total;
        } else {
            // 基礎速度：每秒 100 個線段
            segmentsPerFrame = Math.max(1, Math.round(100 * state.speed * deltaTime / 1000));
        }

        if (state.isReversing) {
            state.currentSegment = Math.max(0, state.currentSegment - segmentsPerFrame);
        } else {
            state.currentSegment = Math.min(total, state.currentSegment + segmentsPerFrame);
        }

        drawToSegment(state.currentSegment);
        updateProgress();

        state.lastFrameTime = currentTime;

        // 檢查是否完成
        if ((state.isReversing && state.currentSegment <= 0) ||
            (!state.isReversing && state.currentSegment >= total)) {
            pause();
            return;
        }

        state.animationId = requestAnimationFrame(animate);
    }

    /**
     * 更新播放按鈕狀態
     */
    function updatePlayButton() {
        const btn = document.getElementById('play-btn');
        btn.classList.toggle('playing', state.isPlaying);
    }

    /**
     * 更新進度顯示
     */
    function updateProgress() {
        const total = state.points.length - 1;
        const percent = (state.currentSegment / total) * 100;

        document.getElementById('progress-fill').style.width = percent + '%';
        document.getElementById('current-segment').textContent = state.currentSegment;
        document.getElementById('total-segments').textContent = total;
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            generateDragonCurve();
            if (state.isPlaying) {
                drawToSegment(state.currentSegment);
            } else {
                drawFullCurve();
            }
        });

        // 迭代滑桿
        document.getElementById('iteration-slider').addEventListener('input', (e) => {
            state.iteration = parseInt(e.target.value, 10);
            document.getElementById('iteration-display').textContent = state.iteration;

            pause();
            generateDragonCurve();
            drawFullCurve();
            updateDisplay();
        });

        // 速度按鈕
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.speed = parseFloat(btn.dataset.speed);
            });
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;

                if (state.isPlaying) {
                    drawToSegment(state.currentSegment);
                } else {
                    drawFullCurve();
                }
            });
        });

        // 播放控制
        document.getElementById('play-btn').addEventListener('click', togglePlay);
        document.getElementById('restart-btn').addEventListener('click', restart);
        document.getElementById('reverse-btn').addEventListener('click', reverse);

        // 鍵盤控制
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyR') {
                restart();
            }
        });
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        const total = state.points.length - 1;

        // 線段數
        document.getElementById('segments-display').textContent = formatNumber(total);

        // 總長度（相對值）
        document.getElementById('length-display').textContent = formatNumber(total) + ' 單位';

        // 進度
        document.getElementById('total-segments').textContent = total;
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
