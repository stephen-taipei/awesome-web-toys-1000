/**
 * Sierpinski Triangle 謝爾賓斯基三角形
 *
 * 使用混沌遊戲（Chaos Game）演算法生成分形
 * - 可調整頂點數量（3-6）
 * - 可調整移動比例
 * - 觀察隨機點逐漸形成分形圖案
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_VERTICES: 3,
        DEFAULT_RATIO: 0.5,
        DEFAULT_SPEED: 500,
        MIN_SPEED: 10,
        MAX_SPEED: 2000,
        VERTEX_COLORS: [
            '#f472b6', // 粉紅
            '#a78bfa', // 紫
            '#60a5fa', // 藍
            '#34d399', // 綠
            '#fbbf24', // 黃
            '#fb7185'  // 紅
        ],
        POINT_SIZE: 1,
        VERTEX_MARKER_SIZE: 8
    };

    // 預設配置
    const PRESETS = {
        sierpinski: { vertices: 3, ratio: 0.5, restriction: false },
        square: { vertices: 4, ratio: 0.5, restriction: true },
        pentagon: { vertices: 5, ratio: 0.618, restriction: false },
        hexagon: { vertices: 6, ratio: 0.667, restriction: false }
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 遊戲參數
        numVertices: CONFIG.DEFAULT_VERTICES,
        ratio: CONFIG.DEFAULT_RATIO,
        speed: CONFIG.DEFAULT_SPEED,
        restrictSameVertex: false,

        // 頂點位置
        vertices: [],

        // 當前點位置
        currentX: 0,
        currentY: 0,

        // 上一個選擇的頂點（用於限制）
        lastVertexIndex: -1,

        // 統計
        pointCount: 0,

        // 動畫控制
        isPlaying: true,
        animationId: null,

        // ImageData 用於高效繪圖
        imageData: null
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        bindEvents();
        reset();
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

        // 如果正在執行，需要重置
        if (state.pointCount > 0) {
            reset();
        }
    }

    /**
     * 計算正多邊形頂點位置
     */
    function calculateVertices() {
        state.vertices = [];

        const centerX = state.width / 2;
        const centerY = state.height / 2;
        const radius = Math.min(state.width, state.height) * 0.4;

        // 起始角度（讓三角形頂點朝上）
        const startAngle = -Math.PI / 2;

        for (let i = 0; i < state.numVertices; i++) {
            const angle = startAngle + (2 * Math.PI * i) / state.numVertices;
            state.vertices.push({
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                color: CONFIG.VERTEX_COLORS[i % CONFIG.VERTEX_COLORS.length]
            });
        }
    }

    /**
     * 重置遊戲
     */
    function reset() {
        // 清除畫布
        state.ctx.fillStyle = '#0a0a12';
        state.ctx.fillRect(0, 0, state.width, state.height);

        // 重新計算頂點
        calculateVertices();

        // 繪製頂點標記
        drawVertexMarkers();

        // 隨機起始點
        state.currentX = state.width / 2;
        state.currentY = state.height / 2;

        // 重置統計
        state.pointCount = 0;
        state.lastVertexIndex = -1;

        updateDisplay();
    }

    /**
     * 繪製頂點標記
     */
    function drawVertexMarkers() {
        state.vertices.forEach((vertex, index) => {
            state.ctx.beginPath();
            state.ctx.arc(vertex.x, vertex.y, CONFIG.VERTEX_MARKER_SIZE, 0, Math.PI * 2);
            state.ctx.fillStyle = vertex.color;
            state.ctx.fill();

            // 頂點編號
            state.ctx.fillStyle = '#fff';
            state.ctx.font = 'bold 10px sans-serif';
            state.ctx.textAlign = 'center';
            state.ctx.textBaseline = 'middle';
            state.ctx.fillText((index + 1).toString(), vertex.x, vertex.y);
        });
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', debounce(resizeCanvas, 200));

        // 頂點數量按鈕
        document.querySelectorAll('.vertex-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.vertex-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.numVertices = parseInt(btn.dataset.vertices, 10);

                // 清除預設選中
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));

                reset();
            });
        });

        // 移動比例滑桿
        const ratioSlider = document.getElementById('ratio-slider');
        ratioSlider.addEventListener('input', (e) => {
            state.ratio = parseFloat(e.target.value);
            document.getElementById('ratio-display').textContent = state.ratio.toFixed(2);

            // 清除預設選中
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        });

        // 速度滑桿
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            state.speed = parseInt(e.target.value, 10);
            document.getElementById('speed-display').textContent = state.speed;
        });

        // 限制開關
        const restrictionToggle = document.getElementById('restriction-toggle');
        restrictionToggle.addEventListener('change', (e) => {
            state.restrictSameVertex = e.target.checked;

            // 清除預設選中
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        });

        // 播放/暫停按鈕
        const playBtn = document.getElementById('play-btn');
        playBtn.addEventListener('click', () => {
            state.isPlaying = !state.isPlaying;
            updatePlayButton();
        });

        // 重置按鈕
        document.getElementById('reset-btn').addEventListener('click', reset);

        // 預設圖案按鈕
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const preset = PRESETS[btn.dataset.preset];
                if (preset) {
                    applyPreset(preset);
                }
            });
        });
    }

    /**
     * 應用預設配置
     */
    function applyPreset(preset) {
        // 更新狀態
        state.numVertices = preset.vertices;
        state.ratio = preset.ratio;
        state.restrictSameVertex = preset.restriction;

        // 更新 UI
        document.querySelectorAll('.vertex-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.vertices, 10) === preset.vertices);
        });

        document.getElementById('ratio-slider').value = preset.ratio;
        document.getElementById('ratio-display').textContent = preset.ratio.toFixed(2);

        document.getElementById('restriction-toggle').checked = preset.restriction;

        reset();
    }

    /**
     * 更新播放按鈕狀態
     */
    function updatePlayButton() {
        const playBtn = document.getElementById('play-btn');
        if (state.isPlaying) {
            playBtn.classList.add('playing');
            playBtn.querySelector('.icon').textContent = '⏸';
            playBtn.querySelector('.text').textContent = '暫停';
        } else {
            playBtn.classList.remove('playing');
            playBtn.querySelector('.icon').textContent = '▶';
            playBtn.querySelector('.text').textContent = '播放';
        }
    }

    // ==================== 混沌遊戲核心 ====================

    /**
     * 執行一步混沌遊戲
     */
    function chaosGameStep() {
        // 隨機選擇一個頂點
        let vertexIndex;

        if (state.restrictSameVertex && state.lastVertexIndex >= 0) {
            // 禁止選擇上一個頂點
            do {
                vertexIndex = Math.floor(Math.random() * state.numVertices);
            } while (vertexIndex === state.lastVertexIndex);
        } else {
            vertexIndex = Math.floor(Math.random() * state.numVertices);
        }

        const vertex = state.vertices[vertexIndex];

        // 移動到當前點與頂點之間（根據比例）
        state.currentX = state.currentX + (vertex.x - state.currentX) * state.ratio;
        state.currentY = state.currentY + (vertex.y - state.currentY) * state.ratio;

        // 記錄上一個頂點
        state.lastVertexIndex = vertexIndex;

        return { x: state.currentX, y: state.currentY, color: vertex.color };
    }

    /**
     * 繪製點
     */
    function drawPoint(x, y, color) {
        state.ctx.fillStyle = color;
        state.ctx.fillRect(
            Math.floor(x),
            Math.floor(y),
            CONFIG.POINT_SIZE,
            CONFIG.POINT_SIZE
        );
    }

    // ==================== 動畫迴圈 ====================

    function animate() {
        if (state.isPlaying) {
            // 每幀繪製多個點
            for (let i = 0; i < state.speed; i++) {
                const point = chaosGameStep();
                drawPoint(point.x, point.y, point.color);
                state.pointCount++;
            }

            updateDisplay();
        }

        state.animationId = requestAnimationFrame(animate);
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        // 格式化點數顯示
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
