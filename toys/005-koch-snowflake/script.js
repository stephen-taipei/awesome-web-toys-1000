/**
 * Koch Snowflake 科赫雪花
 *
 * 經典分形曲線生成器
 * - 觀察簡單規則創造無限複雜的圖案
 * - 可調整迭代次數
 * - 支援多種初始形狀
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        SVG_SIZE: 800,
        CENTER_X: 400,
        CENTER_Y: 420,
        DEFAULT_RADIUS: 280,
        MAX_ITERATION: 7,
        DEFAULT_ITERATION: 0
    };

    // 初始形狀定義
    const SHAPES = {
        triangle: {
            name: '三角形',
            vertices: 3,
            startAngle: -Math.PI / 2  // 頂點朝上
        },
        square: {
            name: '正方形',
            vertices: 4,
            startAngle: -Math.PI / 4  // 角朝上
        },
        hexagon: {
            name: '六邊形',
            vertices: 6,
            startAngle: 0
        },
        line: {
            name: '單線段',
            vertices: 2,
            startAngle: 0
        }
    };

    // ==================== 全域狀態 ====================

    const state = {
        iteration: CONFIG.DEFAULT_ITERATION,
        shape: 'triangle',
        fill: false,
        animate: true,
        points: []
    };

    // ==================== 初始化 ====================

    function init() {
        bindEvents();
        generateKoch();
        updateDisplay();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        // 迭代滑桿
        const iterSlider = document.getElementById('iteration-slider');
        iterSlider.addEventListener('input', (e) => {
            state.iteration = parseInt(e.target.value, 10);
            generateKoch();
            updateDisplay();
            updateQuickButtons();
        });

        // 形狀按鈕
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.shape = btn.dataset.shape;
                generateKoch();
                updateDisplay();
            });
        });

        // 填充開關
        document.getElementById('fill-toggle').addEventListener('change', (e) => {
            state.fill = e.target.checked;
            updatePathStyle();
        });

        // 動畫開關
        document.getElementById('animate-toggle').addEventListener('change', (e) => {
            state.animate = e.target.checked;
            const path = document.getElementById('koch-path');
            path.style.transition = state.animate ? 'd 0.5s ease-in-out, fill 0.3s ease' : 'none';
        });

        // 快速迭代按鈕
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.iteration = parseInt(btn.dataset.iteration, 10);
                document.getElementById('iteration-slider').value = state.iteration;
                generateKoch();
                updateDisplay();
                updateQuickButtons();
            });
        });

        // 鍵盤控制
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
                if (state.iteration < CONFIG.MAX_ITERATION) {
                    state.iteration++;
                    document.getElementById('iteration-slider').value = state.iteration;
                    generateKoch();
                    updateDisplay();
                    updateQuickButtons();
                }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
                if (state.iteration > 0) {
                    state.iteration--;
                    document.getElementById('iteration-slider').value = state.iteration;
                    generateKoch();
                    updateDisplay();
                    updateQuickButtons();
                }
            }
        });
    }

    // ==================== 科赫曲線生成 ====================

    /**
     * 生成科赫雪花
     */
    function generateKoch() {
        // 獲取初始形狀的頂點
        const initialPoints = getInitialPoints();

        // 對每條邊應用科赫曲線
        state.points = [];

        for (let i = 0; i < initialPoints.length; i++) {
            const start = initialPoints[i];
            const end = initialPoints[(i + 1) % initialPoints.length];

            // 如果是單線段，只處理一條邊
            if (state.shape === 'line' && i > 0) break;

            const edgePoints = kochCurve(start, end, state.iteration);
            state.points.push(...edgePoints);
        }

        // 更新 SVG 路徑
        updatePath();
    }

    /**
     * 獲取初始形狀的頂點
     */
    function getInitialPoints() {
        const shape = SHAPES[state.shape];
        const points = [];

        if (state.shape === 'line') {
            // 單線段
            return [
                { x: CONFIG.CENTER_X - CONFIG.DEFAULT_RADIUS, y: CONFIG.CENTER_Y },
                { x: CONFIG.CENTER_X + CONFIG.DEFAULT_RADIUS, y: CONFIG.CENTER_Y }
            ];
        }

        // 正多邊形
        for (let i = 0; i < shape.vertices; i++) {
            const angle = shape.startAngle + (2 * Math.PI * i) / shape.vertices;
            points.push({
                x: CONFIG.CENTER_X + CONFIG.DEFAULT_RADIUS * Math.cos(angle),
                y: CONFIG.CENTER_Y + CONFIG.DEFAULT_RADIUS * Math.sin(angle)
            });
        }

        return points;
    }

    /**
     * 科赫曲線遞迴生成
     *
     * @param {Object} p1 - 起點 {x, y}
     * @param {Object} p2 - 終點 {x, y}
     * @param {number} depth - 迭代深度
     * @returns {Array} 點陣列
     */
    function kochCurve(p1, p2, depth) {
        if (depth === 0) {
            return [p1];
        }

        // 計算三等分點
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        // A: 起點
        const a = p1;

        // B: 1/3 處
        const b = {
            x: p1.x + dx / 3,
            y: p1.y + dy / 3
        };

        // C: 三角形頂點（向外突出）
        // 從 B 點出發，旋轉 -60 度（逆時針），長度為 1/3
        const angle = Math.atan2(dy, dx) - Math.PI / 3;
        const len = Math.sqrt(dx * dx + dy * dy) / 3;
        const c = {
            x: b.x + len * Math.cos(angle),
            y: b.y + len * Math.sin(angle)
        };

        // D: 2/3 處
        const d = {
            x: p1.x + 2 * dx / 3,
            y: p1.y + 2 * dy / 3
        };

        // E: 終點
        const e = p2;

        // 遞迴處理四條子線段
        return [
            ...kochCurve(a, b, depth - 1),
            ...kochCurve(b, c, depth - 1),
            ...kochCurve(c, d, depth - 1),
            ...kochCurve(d, e, depth - 1)
        ];
    }

    /**
     * 更新 SVG 路徑
     */
    function updatePath() {
        if (state.points.length === 0) return;

        // 構建 SVG path 字串
        let d = `M ${state.points[0].x} ${state.points[0].y}`;

        for (let i = 1; i < state.points.length; i++) {
            d += ` L ${state.points[i].x} ${state.points[i].y}`;
        }

        // 閉合路徑（除了單線段）
        if (state.shape !== 'line') {
            d += ' Z';
        }

        const path = document.getElementById('koch-path');
        path.setAttribute('d', d);

        updatePathStyle();
    }

    /**
     * 更新路徑樣式
     */
    function updatePathStyle() {
        const path = document.getElementById('koch-path');

        if (state.fill && state.shape !== 'line') {
            path.setAttribute('fill', 'rgba(96, 165, 250, 0.15)');
        } else {
            path.setAttribute('fill', 'none');
        }

        // 根據迭代次數調整線條粗細
        const strokeWidth = Math.max(0.5, 2 - state.iteration * 0.2);
        path.setAttribute('stroke-width', strokeWidth);
    }

    // ==================== UI 更新 ====================

    /**
     * 更新顯示
     */
    function updateDisplay() {
        // 迭代次數
        document.getElementById('iteration-display').textContent = state.iteration;

        // 計算統計數據
        const shape = SHAPES[state.shape];
        const initialEdges = state.shape === 'line' ? 1 : shape.vertices;

        // 每次迭代邊數乘以 4
        const edges = initialEdges * Math.pow(4, state.iteration);

        // 周長比例：每次迭代乘以 4/3
        const perimeterRatio = Math.pow(4 / 3, state.iteration);

        // 頂點數
        const vertices = state.points.length;

        document.getElementById('edges-display').textContent = formatNumber(edges);
        document.getElementById('perimeter-display').textContent = perimeterRatio.toFixed(2) + 'x';
        document.getElementById('vertices-display').textContent = formatNumber(vertices);
    }

    /**
     * 更新快速按鈕狀態
     */
    function updateQuickButtons() {
        document.querySelectorAll('.quick-btn').forEach(btn => {
            const iter = parseInt(btn.dataset.iteration, 10);
            btn.classList.toggle('active', iter === state.iteration);
        });
    }

    /**
     * 格式化數字
     */
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
