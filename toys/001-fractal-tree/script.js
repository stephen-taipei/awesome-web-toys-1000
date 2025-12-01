/**
 * Fractal Tree 分形樹
 *
 * 互動式分形樹生成器
 * - 滑鼠移動控制分支角度
 * - 滾輪調整遞迴深度
 * - 點擊生成新的隨機樹
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        MIN_DEPTH: 3,           // 最小遞迴深度
        MAX_DEPTH: 14,          // 最大遞迴深度
        DEFAULT_DEPTH: 10,      // 預設遞迴深度
        BASE_ANGLE: 25,         // 基礎分支角度 (度)
        LENGTH_RATIO: 0.67,     // 子樹枝長度比例
        WIDTH_RATIO: 0.7,       // 子樹枝寬度比例
        INITIAL_WIDTH: 12,      // 初始樹幹寬度
        SWAY_SPEED: 0.002,      // 自然搖擺速度
        SWAY_AMOUNT: 0.1        // 自然搖擺幅度
    };

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,           // Canvas 元素
        ctx: null,              // 2D 繪圖上下文
        width: 0,               // 畫布寬度
        height: 0,              // 畫布高度
        depth: CONFIG.DEFAULT_DEPTH,  // 當前遞迴深度
        mouseX: 0.5,            // 滑鼠 X 位置 (0-1)
        mouseY: 0.5,            // 滑鼠 Y 位置 (0-1)
        targetAngle: CONFIG.BASE_ANGLE, // 目標角度
        currentAngle: CONFIG.BASE_ANGLE, // 當前角度（用於平滑過渡）
        treeParams: null,       // 當前樹的隨機參數
        time: 0,                // 動畫時間
        animationId: null,      // 動畫 ID
        isTouchDevice: false    // 是否為觸控裝置
    };

    // ==================== 初始化 ====================

    /**
     * 初始化應用程式
     */
    function init() {
        // 取得 Canvas 元素
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        // 偵測觸控裝置
        state.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // 如果是觸控裝置，顯示滑桿
        if (state.isTouchDevice) {
            document.getElementById('depth-slider-container').style.display = 'flex';
        }

        // 設定畫布尺寸
        resizeCanvas();

        // 生成初始樹的參數
        generateTreeParams();

        // 綁定事件
        bindEvents();

        // 開始動畫迴圈
        animate();
    }

    /**
     * 調整畫布尺寸以符合視窗大小
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        // 設定實際像素尺寸（考慮 DPR）
        state.canvas.width = state.width * dpr;
        state.canvas.height = state.height * dpr;

        // 設定 CSS 尺寸
        state.canvas.style.width = state.width + 'px';
        state.canvas.style.height = state.height + 'px';

        // 縮放上下文以符合 DPR
        state.ctx.scale(dpr, dpr);
    }

    /**
     * 生成隨機樹的參數
     */
    function generateTreeParams() {
        state.treeParams = {
            // 左右分支角度的不對稱性
            leftAngleRatio: 0.8 + Math.random() * 0.4,
            rightAngleRatio: 0.8 + Math.random() * 0.4,

            // 樹枝長度的隨機變化
            lengthVariance: 0.9 + Math.random() * 0.2,

            // 顏色主題
            hueBase: Math.random() * 60 + 80,  // 80-140 (綠色系)
            hueVariance: Math.random() * 30,

            // 樹的彎曲方向
            bendDirection: Math.random() > 0.5 ? 1 : -1,
            bendAmount: Math.random() * 0.1
        };
    }

    // ==================== 事件綁定 ====================

    /**
     * 綁定所有互動事件
     */
    function bindEvents() {
        // 視窗大小變化
        window.addEventListener('resize', debounce(resizeCanvas, 100));

        // 滑鼠移動 - 控制角度
        state.canvas.addEventListener('mousemove', handleMouseMove);

        // 滾輪 - 調整深度
        state.canvas.addEventListener('wheel', handleWheel, { passive: false });

        // 點擊 - 生成新樹
        state.canvas.addEventListener('click', handleClick);

        // 觸控事件
        state.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        state.canvas.addEventListener('touchstart', handleTouchStart, { passive: true });

        // 深度滑桿
        const depthSlider = document.getElementById('depth-slider');
        depthSlider.addEventListener('input', (e) => {
            state.depth = parseInt(e.target.value, 10);
            updateDisplay();
        });
    }

    /**
     * 處理滑鼠移動事件
     * @param {MouseEvent} e - 滑鼠事件
     */
    function handleMouseMove(e) {
        // 將滑鼠位置正規化為 0-1 範圍
        state.mouseX = e.clientX / state.width;
        state.mouseY = e.clientY / state.height;

        // 根據滑鼠位置計算目標角度
        // 水平位置影響角度大小 (10° - 50°)
        state.targetAngle = 10 + state.mouseX * 40;

        updateDisplay();
    }

    /**
     * 處理滾輪事件
     * @param {WheelEvent} e - 滾輪事件
     */
    function handleWheel(e) {
        e.preventDefault();

        // 調整深度
        if (e.deltaY < 0) {
            state.depth = Math.min(CONFIG.MAX_DEPTH, state.depth + 1);
        } else {
            state.depth = Math.max(CONFIG.MIN_DEPTH, state.depth - 1);
        }

        // 更新滑桿
        document.getElementById('depth-slider').value = state.depth;
        updateDisplay();
    }

    /**
     * 處理點擊事件 - 生成新樹
     */
    function handleClick() {
        generateTreeParams();
    }

    /**
     * 處理觸控移動
     * @param {TouchEvent} e - 觸控事件
     */
    function handleTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            state.mouseX = touch.clientX / state.width;
            state.mouseY = touch.clientY / state.height;
            state.targetAngle = 10 + state.mouseX * 40;
            updateDisplay();
        }
    }

    /**
     * 處理觸控開始 - 生成新樹
     * @param {TouchEvent} e - 觸控事件
     */
    function handleTouchStart(e) {
        if (e.touches.length === 2) {
            // 雙指觸控時不生成新樹
            return;
        }
    }

    /**
     * 更新顯示的數值
     */
    function updateDisplay() {
        document.getElementById('depth-display').textContent = state.depth;
        document.getElementById('angle-display').textContent = Math.round(state.targetAngle) + '°';
    }

    // ==================== 繪圖核心 ====================

    /**
     * 主動畫迴圈
     */
    function animate() {
        // 更新時間
        state.time += 1;

        // 平滑過渡到目標角度
        state.currentAngle += (state.targetAngle - state.currentAngle) * 0.08;

        // 清除畫布
        clearCanvas();

        // 繪製樹
        drawTree();

        // 繼續動畫
        state.animationId = requestAnimationFrame(animate);
    }

    /**
     * 清除畫布並繪製背景
     */
    function clearCanvas() {
        const ctx = state.ctx;

        // 繪製漸層背景
        const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
        gradient.addColorStop(0, '#0a0a1a');    // 深藍黑
        gradient.addColorStop(0.5, '#0f1525');  // 中間色
        gradient.addColorStop(1, '#1a1a2e');    // 底部稍亮

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, state.width, state.height);

        // 繪製地面
        const groundGradient = ctx.createLinearGradient(
            0, state.height - 50,
            0, state.height
        );
        groundGradient.addColorStop(0, 'rgba(30, 50, 30, 0)');
        groundGradient.addColorStop(1, 'rgba(30, 50, 30, 0.5)');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, state.height - 50, state.width, 50);
    }

    /**
     * 繪製整棵分形樹
     */
    function drawTree() {
        const ctx = state.ctx;
        const params = state.treeParams;

        // 計算樹的起始位置和長度
        const startX = state.width / 2;
        const startY = state.height - 20;

        // 根據畫布大小和深度計算初始樹幹長度
        const baseTrunkLength = Math.min(state.width, state.height) * 0.18;

        // 繪製樹幹
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 開始遞迴繪製
        drawBranch(
            startX,
            startY,
            baseTrunkLength,
            -Math.PI / 2,  // 初始角度 (向上)
            CONFIG.INITIAL_WIDTH,
            state.depth,
            0
        );
    }

    /**
     * 遞迴繪製樹枝
     *
     * @param {number} x - 起始 X 座標
     * @param {number} y - 起始 Y 座標
     * @param {number} length - 樹枝長度
     * @param {number} angle - 樹枝角度 (弧度)
     * @param {number} width - 樹枝寬度
     * @param {number} depth - 剩餘遞迴深度
     * @param {number} branchIndex - 分支索引 (用於變化)
     */
    function drawBranch(x, y, length, angle, width, depth, branchIndex) {
        if (depth <= 0 || length < 2) return;

        const ctx = state.ctx;
        const params = state.treeParams;

        // 計算自然搖擺
        const swayOffset = Math.sin(
            state.time * CONFIG.SWAY_SPEED + branchIndex * 0.5
        ) * CONFIG.SWAY_AMOUNT * (CONFIG.MAX_DEPTH - depth);

        // 加入搖擺到角度
        const swayAngle = angle + swayOffset;

        // 計算終點座標
        const endX = x + Math.cos(swayAngle) * length;
        const endY = y + Math.sin(swayAngle) * length;

        // 計算顏色
        // 深度越淺（靠近根部）顏色越深
        const depthRatio = depth / state.depth;
        const hue = params.hueBase + params.hueVariance * (1 - depthRatio);
        const saturation = 40 + depthRatio * 30;
        const lightness = 15 + depthRatio * 35;

        // 設定樹枝樣式
        ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.lineWidth = width;

        // 繪製樹枝
        ctx.beginPath();
        ctx.moveTo(x, y);

        // 使用貝茲曲線讓樹枝更有機感
        const controlX = (x + endX) / 2 + Math.sin(swayAngle) * length * 0.1;
        const controlY = (y + endY) / 2 + Math.cos(swayAngle) * length * 0.1;
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);

        ctx.stroke();

        // 如果接近樹梢，繪製葉子效果
        if (depth <= 3) {
            drawLeaf(endX, endY, length, swayAngle, depth);
        }

        // 遞迴繪製子樹枝
        const branchAngle = state.currentAngle * (Math.PI / 180);

        // 計算子樹枝參數
        const newLength = length * CONFIG.LENGTH_RATIO * params.lengthVariance;
        const newWidth = Math.max(1, width * CONFIG.WIDTH_RATIO);

        // 左邊分支
        drawBranch(
            endX,
            endY,
            newLength * (0.95 + Math.random() * 0.1),
            swayAngle - branchAngle * params.leftAngleRatio,
            newWidth,
            depth - 1,
            branchIndex * 2
        );

        // 右邊分支
        drawBranch(
            endX,
            endY,
            newLength * (0.95 + Math.random() * 0.1),
            swayAngle + branchAngle * params.rightAngleRatio,
            newWidth,
            depth - 1,
            branchIndex * 2 + 1
        );

        // 有時添加第三個中間分支（較短）
        if (depth > 5 && Math.random() > 0.7) {
            drawBranch(
                endX,
                endY,
                newLength * 0.5,
                swayAngle + (Math.random() - 0.5) * branchAngle * 0.3,
                newWidth * 0.7,
                depth - 2,
                branchIndex * 2 + 2
            );
        }
    }

    /**
     * 繪製葉子效果
     *
     * @param {number} x - 葉子位置 X
     * @param {number} y - 葉子位置 Y
     * @param {number} size - 葉子基礎大小
     * @param {number} angle - 葉子角度
     * @param {number} depth - 當前深度
     */
    function drawLeaf(x, y, size, angle, depth) {
        const ctx = state.ctx;
        const params = state.treeParams;

        // 葉子大小根據深度變化
        const leafSize = size * 0.3 * (4 - depth);

        // 葉子顏色 - 更亮的綠色
        const hue = params.hueBase + 10;
        const saturation = 50 + Math.random() * 20;
        const lightness = 35 + Math.random() * 20;

        // 繪製葉子（橢圓形）
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // 半透明葉子
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;

        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize * 0.6, leafSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ==================== 工具函數 ====================

    /**
     * 防抖函數
     *
     * @param {Function} func - 要防抖的函數
     * @param {number} wait - 等待時間 (ms)
     * @returns {Function} 防抖後的函數
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== 啟動應用 ====================

    // DOM 載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
