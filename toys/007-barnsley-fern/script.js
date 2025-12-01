/**
 * Barnsley Fern 巴恩斯利蕨
 *
 * 使用 IFS（迭代函數系統）生成蕨類分形
 * - 即時顯示迭代過程
 * - 可調整四個仿射變換的機率權重
 * - 多種蕨類預設和顏色主題
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_SPEED: 1000,
        MIN_SPEED: 100,
        MAX_SPEED: 5000
    };

    // IFS 仿射變換係數
    // 每個變換: [a, b, c, d, e, f] 對應 x' = ax + by + e, y' = cx + dy + f
    const PRESETS = {
        classic: {
            name: '經典蕨',
            transforms: [
                { coef: [0, 0, 0, 0.16, 0, 0], prob: 1 },           // f1: 莖幹
                { coef: [0.85, 0.04, -0.04, 0.85, 0, 1.6], prob: 85 },  // f2: 主葉
                { coef: [0.2, -0.26, 0.23, 0.22, 0, 1.6], prob: 7 },    // f3: 左葉
                { coef: [-0.15, 0.28, 0.26, 0.24, 0, 0.44], prob: 7 }   // f4: 右葉
            ]
        },
        cyclosorus: {
            name: '蹄蓋蕨',
            transforms: [
                { coef: [0, 0, 0, 0.25, 0, -0.4], prob: 2 },
                { coef: [0.95, 0.005, -0.005, 0.93, -0.002, 0.5], prob: 84 },
                { coef: [0.035, -0.2, 0.16, 0.04, -0.09, 0.02], prob: 7 },
                { coef: [-0.04, 0.2, 0.16, 0.04, 0.083, 0.12], prob: 7 }
            ]
        },
        modified: {
            name: '變形蕨',
            transforms: [
                { coef: [0, 0, 0, 0.2, 0, -0.12], prob: 1 },
                { coef: [0.845, 0.035, -0.035, 0.82, 0, 1.6], prob: 85 },
                { coef: [0.18, -0.312, 0.312, 0.255, 0, 0.9], prob: 7 },
                { coef: [-0.18, 0.312, 0.312, 0.255, 0, 0.34], prob: 7 }
            ]
        },
        fishbone: {
            name: '魚骨蕨',
            transforms: [
                { coef: [0, 0, 0, 0.25, 0, -0.14], prob: 2 },
                { coef: [0.85, 0.02, -0.02, 0.83, 0, 1.0], prob: 84 },
                { coef: [0.09, -0.28, 0.3, 0.11, 0, 0.6], prob: 7 },
                { coef: [-0.09, 0.28, 0.3, 0.09, 0, 0.7], prob: 7 }
            ]
        }
    };

    // 顏色主題
    const COLOR_THEMES = {
        green: {
            base: [34, 197, 94],
            light: [134, 239, 172]
        },
        autumn: {
            base: [245, 158, 11],
            light: [252, 211, 77]
        },
        purple: {
            base: [139, 92, 246],
            light: [196, 181, 253]
        },
        rainbow: null  // 使用 HSL
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // IFS 參數
        currentPreset: 'classic',
        transforms: [],
        probabilities: [1, 85, 7, 7],

        // 當前點
        x: 0,
        y: 0,

        // 繪製參數
        speed: CONFIG.DEFAULT_SPEED,
        colorTheme: 'green',

        // 動畫控制
        isPlaying: true,
        animationId: null,

        // 統計
        pointCount: 0,

        // 縮放和偏移（用於座標轉換）
        scale: 0,
        offsetX: 0,
        offsetY: 0
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        loadPreset('classic');
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

        // 計算縮放和偏移
        // 蕨的座標範圍大約是 x: [-2.5, 2.5], y: [0, 10]
        state.scale = Math.min(state.width / 6, state.height / 11);
        state.offsetX = state.width / 2;
        state.offsetY = state.height - 20;

        // 重新開始
        reset();
    }

    /**
     * 載入預設配置
     */
    function loadPreset(presetName) {
        state.currentPreset = presetName;
        const preset = PRESETS[presetName];

        state.transforms = preset.transforms.map(t => ({...t, coef: [...t.coef]}));
        state.probabilities = preset.transforms.map(t => t.prob);

        // 更新 UI
        updateProbabilitySliders();
        reset();
    }

    /**
     * 更新機率滑桿
     */
    function updateProbabilitySliders() {
        document.querySelectorAll('.prob-slider').forEach((slider, index) => {
            slider.value = state.probabilities[index];
            document.getElementById(`prob-${index}`).textContent = state.probabilities[index] + '%';
        });
    }

    /**
     * 重置畫布和狀態
     */
    function reset() {
        // 清除畫布
        state.ctx.fillStyle = '#0a1210';
        state.ctx.fillRect(0, 0, state.width, state.height);

        // 重置點
        state.x = 0;
        state.y = 0;
        state.pointCount = 0;

        updateDisplay();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', debounce(resizeCanvas, 200));

        // 速度滑桿
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            state.speed = parseInt(e.target.value, 10);
            document.getElementById('speed-display').textContent = state.speed;
        });

        // 機率滑桿
        document.querySelectorAll('.prob-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.transform, 10);
                state.probabilities[index] = parseInt(e.target.value, 10);
                document.getElementById(`prob-${index}`).textContent = state.probabilities[index] + '%';

                // 清除預設選中
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            });
        });

        // 預設按鈕
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                loadPreset(btn.dataset.preset);
            });
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
                reset();
            });
        });

        // 播放/暫停
        document.getElementById('play-btn').addEventListener('click', togglePlay);

        // 重置
        document.getElementById('reset-btn').addEventListener('click', reset);

        // 鍵盤
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyR') {
                reset();
            }
        });
    }

    /**
     * 切換播放/暫停
     */
    function togglePlay() {
        state.isPlaying = !state.isPlaying;
        updatePlayButton();
    }

    /**
     * 更新播放按鈕
     */
    function updatePlayButton() {
        const btn = document.getElementById('play-btn');
        if (state.isPlaying) {
            btn.classList.add('playing');
            btn.querySelector('.icon').textContent = '⏸';
            btn.querySelector('.text').textContent = '暫停';
        } else {
            btn.classList.remove('playing');
            btn.querySelector('.icon').textContent = '▶';
            btn.querySelector('.text').textContent = '播放';
        }
    }

    // ==================== IFS 核心 ====================

    /**
     * 執行一次 IFS 迭代
     */
    function ifsStep() {
        // 根據機率選擇變換
        const totalProb = state.probabilities.reduce((a, b) => a + b, 0);
        let rand = Math.random() * totalProb;
        let transformIndex = 0;

        for (let i = 0; i < state.probabilities.length; i++) {
            rand -= state.probabilities[i];
            if (rand <= 0) {
                transformIndex = i;
                break;
            }
        }

        // 應用仿射變換
        const [a, b, c, d, e, f] = state.transforms[transformIndex].coef;
        const newX = a * state.x + b * state.y + e;
        const newY = c * state.x + d * state.y + f;

        state.x = newX;
        state.y = newY;

        return transformIndex;
    }

    /**
     * 將 IFS 座標轉換為螢幕座標
     */
    function toScreenCoords(x, y) {
        return {
            screenX: state.offsetX + x * state.scale,
            screenY: state.offsetY - y * state.scale
        };
    }

    /**
     * 繪製點
     */
    function drawPoint(transformIndex) {
        const { screenX, screenY } = toScreenCoords(state.x, state.y);

        // 檢查是否在畫布內
        if (screenX < 0 || screenX > state.width || screenY < 0 || screenY > state.height) {
            return;
        }

        // 獲取顏色
        const color = getPointColor(transformIndex, state.y);

        state.ctx.fillStyle = color;
        state.ctx.fillRect(screenX, screenY, 1.5, 1.5);
    }

    /**
     * 獲取點的顏色
     */
    function getPointColor(transformIndex, y) {
        // y 範圍大約 0-10，用於漸層
        const t = Math.min(1, Math.max(0, y / 10));

        if (state.colorTheme === 'rainbow') {
            // 彩虹模式：根據高度變化色相
            const hue = t * 120 + 80;  // 80-200（黃綠到藍）
            return `hsl(${hue}, 70%, ${50 + t * 20}%)`;
        }

        const theme = COLOR_THEMES[state.colorTheme];
        if (!theme) return '#4ade80';

        // 線性插值
        const r = Math.round(theme.base[0] + (theme.light[0] - theme.base[0]) * t);
        const g = Math.round(theme.base[1] + (theme.light[1] - theme.base[1]) * t);
        const b = Math.round(theme.base[2] + (theme.light[2] - theme.base[2]) * t);

        // 根據變換添加輕微變化
        const variation = transformIndex * 10;

        return `rgb(${Math.min(255, r + variation)}, ${g}, ${Math.min(255, b + variation)})`;
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        if (state.isPlaying) {
            // 每幀繪製多個點
            for (let i = 0; i < state.speed; i++) {
                const transformIndex = ifsStep();

                // 跳過前幾個點（讓系統穩定）
                if (state.pointCount > 20) {
                    drawPoint(transformIndex);
                }

                state.pointCount++;
            }

            updateDisplay();
        }

        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        let pointStr;
        if (state.pointCount >= 1000000) {
            pointStr = (state.pointCount / 1000000).toFixed(2) + 'M';
        } else if (state.pointCount >= 1000) {
            pointStr = (state.pointCount / 1000).toFixed(1) + 'K';
        } else {
            pointStr = state.pointCount.toString();
        }

        document.getElementById('points-display').textContent = pointStr;
    }

    // ==================== 工具函數 ====================

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
