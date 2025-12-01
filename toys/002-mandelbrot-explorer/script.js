/**
 * Mandelbrot Explorer 曼德博集合探索器
 *
 * 互動式曼德博分形探索器
 * - 拖曳平移視角
 * - 滾輪縮放探索
 * - 點擊設定新中心
 * - 多種配色方案
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        INITIAL_CENTER_X: -0.5,     // 初始中心 X
        INITIAL_CENTER_Y: 0,         // 初始中心 Y
        INITIAL_ZOOM: 1,             // 初始縮放
        MIN_ZOOM: 0.5,               // 最小縮放
        MAX_ZOOM: 1e14,              // 最大縮放（JavaScript 精度限制）
        ZOOM_SPEED: 1.5,             // 縮放速度
        DEFAULT_MAX_ITER: 100,       // 預設最大迭代次數
        ESCAPE_RADIUS: 4,            // 逃逸半徑的平方
        CHUNK_SIZE: 50,              // 分塊渲染的大小
        RENDER_DELAY: 10             // 分塊渲染間隔 (ms)
    };

    // ==================== 配色方案 ====================

    const PALETTES = {
        classic: (t) => {
            // 經典藍黃漸層
            const r = Math.floor(9 * (1 - t) * t * t * t * 255);
            const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
            const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
            return [r, g, b];
        },
        fire: (t) => {
            // 火焰配色
            const r = Math.floor(Math.min(255, t * 3 * 255));
            const g = Math.floor(Math.max(0, Math.min(255, (t - 0.33) * 3 * 255)));
            const b = Math.floor(Math.max(0, Math.min(255, (t - 0.66) * 3 * 255)));
            return [r, g, b];
        },
        ocean: (t) => {
            // 海洋配色
            const r = Math.floor(t * t * 100);
            const g = Math.floor(t * 180);
            const b = Math.floor(100 + t * 155);
            return [r, g, b];
        },
        rainbow: (t) => {
            // 彩虹配色 (HSL 轉 RGB)
            const h = t * 360;
            const s = 1;
            const l = 0.5;
            return hslToRgb(h, s, l);
        },
        grayscale: (t) => {
            // 灰階
            const v = Math.floor(t * 255);
            return [v, v, v];
        }
    };

    /**
     * HSL 轉 RGB
     */
    function hslToRgb(h, s, l) {
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;

        if (h < 60) { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }

        return [
            Math.floor((r + m) * 255),
            Math.floor((g + m) * 255),
            Math.floor((b + m) * 255)
        ];
    }

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,

        // 視角參數
        centerX: CONFIG.INITIAL_CENTER_X,
        centerY: CONFIG.INITIAL_CENTER_Y,
        zoom: CONFIG.INITIAL_ZOOM,

        // 渲染參數
        maxIterations: CONFIG.DEFAULT_MAX_ITER,
        currentPalette: 'classic',

        // 互動狀態
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragStartCenterX: 0,
        dragStartCenterY: 0,

        // 觸控狀態
        lastTouchDist: 0,
        lastTouchCenter: { x: 0, y: 0 },

        // 渲染控制
        renderQueue: [],
        isRendering: false,
        needsRender: false,
        imageData: null,

        // 效能
        lastRenderTime: 0
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.ctx = state.canvas.getContext('2d');

        resizeCanvas();
        bindEvents();
        render();
    }

    /**
     * 調整畫布尺寸
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        state.width = window.innerWidth;
        state.height = window.innerHeight;

        // 設定實際像素尺寸
        state.canvas.width = state.width * dpr;
        state.canvas.height = state.height * dpr;

        // 設定 CSS 尺寸
        state.canvas.style.width = state.width + 'px';
        state.canvas.style.height = state.height + 'px';

        // 縮放上下文
        state.ctx.scale(dpr, dpr);

        // 創建 ImageData
        state.imageData = state.ctx.createImageData(state.width, state.height);

        // 重新渲染
        if (state.ctx) {
            scheduleRender();
        }
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        // 視窗大小變化
        window.addEventListener('resize', debounce(resizeCanvas, 200));

        // 滑鼠事件
        state.canvas.addEventListener('mousedown', handleMouseDown);
        state.canvas.addEventListener('mousemove', handleMouseMove);
        state.canvas.addEventListener('mouseup', handleMouseUp);
        state.canvas.addEventListener('mouseleave', handleMouseUp);
        state.canvas.addEventListener('wheel', handleWheel, { passive: false });
        state.canvas.addEventListener('click', handleClick);

        // 觸控事件
        state.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        state.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        state.canvas.addEventListener('touchend', handleTouchEnd);

        // 鍵盤事件
        window.addEventListener('keydown', handleKeyDown);

        // 配色方案按鈕
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentPalette = btn.dataset.palette;
                scheduleRender();
            });
        });

        // 迭代次數滑桿
        const iterSlider = document.getElementById('iter-slider');
        iterSlider.addEventListener('input', (e) => {
            state.maxIterations = parseInt(e.target.value, 10);
            updateDisplay();
            scheduleRender();
        });
    }

    // ==================== 滑鼠事件處理 ====================

    function handleMouseDown(e) {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragStartCenterX = state.centerX;
        state.dragStartCenterY = state.centerY;
        state.canvas.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        // 更新游標座標顯示
        updateCursorInfo(e.clientX, e.clientY);

        if (!state.isDragging) return;

        // 計算拖曳距離（以複數平面單位）
        const scale = getScale();
        const dx = (e.clientX - state.dragStartX) * scale;
        const dy = (e.clientY - state.dragStartY) * scale;

        state.centerX = state.dragStartCenterX - dx;
        state.centerY = state.dragStartCenterY - dy;

        updateDisplay();
        scheduleRender();
    }

    function handleMouseUp() {
        state.isDragging = false;
        state.canvas.style.cursor = 'grab';
    }

    function handleWheel(e) {
        e.preventDefault();

        // 計算滑鼠位置對應的複數座標
        const mouseComplex = screenToComplex(e.clientX, e.clientY);

        // 計算縮放方向
        const zoomFactor = e.deltaY < 0 ? CONFIG.ZOOM_SPEED : 1 / CONFIG.ZOOM_SPEED;
        const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, state.zoom * zoomFactor));

        // 調整中心點使滑鼠位置保持不變
        const zoomRatio = newZoom / state.zoom;
        state.centerX = mouseComplex.x - (mouseComplex.x - state.centerX) / zoomRatio;
        state.centerY = mouseComplex.y - (mouseComplex.y - state.centerY) / zoomRatio;
        state.zoom = newZoom;

        updateDisplay();
        scheduleRender();
    }

    function handleClick(e) {
        if (state.isDragging) return;

        // 點擊設定新中心
        const complex = screenToComplex(e.clientX, e.clientY);
        state.centerX = complex.x;
        state.centerY = complex.y;
        state.zoom *= 2; // 同時放大

        if (state.zoom > CONFIG.MAX_ZOOM) {
            state.zoom = CONFIG.MAX_ZOOM;
        }

        updateDisplay();
        scheduleRender();
    }

    // ==================== 觸控事件處理 ====================

    function handleTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            // 單指：開始拖曳
            state.isDragging = true;
            state.dragStartX = e.touches[0].clientX;
            state.dragStartY = e.touches[0].clientY;
            state.dragStartCenterX = state.centerX;
            state.dragStartCenterY = state.centerY;
        } else if (e.touches.length === 2) {
            // 雙指：準備縮放
            state.isDragging = false;
            state.lastTouchDist = getTouchDistance(e.touches);
            state.lastTouchCenter = getTouchCenter(e.touches);
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && state.isDragging) {
            // 單指拖曳
            const scale = getScale();
            const dx = (e.touches[0].clientX - state.dragStartX) * scale;
            const dy = (e.touches[0].clientY - state.dragStartY) * scale;

            state.centerX = state.dragStartCenterX - dx;
            state.centerY = state.dragStartCenterY - dy;

            updateDisplay();
            scheduleRender();
        } else if (e.touches.length === 2) {
            // 雙指縮放
            const newDist = getTouchDistance(e.touches);
            const newCenter = getTouchCenter(e.touches);

            if (state.lastTouchDist > 0) {
                const zoomFactor = newDist / state.lastTouchDist;
                const centerComplex = screenToComplex(newCenter.x, newCenter.y);

                const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, state.zoom * zoomFactor));
                const zoomRatio = newZoom / state.zoom;

                state.centerX = centerComplex.x - (centerComplex.x - state.centerX) / zoomRatio;
                state.centerY = centerComplex.y - (centerComplex.y - state.centerY) / zoomRatio;
                state.zoom = newZoom;

                updateDisplay();
                scheduleRender();
            }

            state.lastTouchDist = newDist;
            state.lastTouchCenter = newCenter;
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length === 0) {
            state.isDragging = false;
            state.lastTouchDist = 0;
        } else if (e.touches.length === 1) {
            // 恢復單指拖曳
            state.isDragging = true;
            state.dragStartX = e.touches[0].clientX;
            state.dragStartY = e.touches[0].clientY;
            state.dragStartCenterX = state.centerX;
            state.dragStartCenterY = state.centerY;
        }
    }

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    }

    // ==================== 鍵盤事件處理 ====================

    function handleKeyDown(e) {
        if (e.key === 'r' || e.key === 'R') {
            // 重置視角
            state.centerX = CONFIG.INITIAL_CENTER_X;
            state.centerY = CONFIG.INITIAL_CENTER_Y;
            state.zoom = CONFIG.INITIAL_ZOOM;
            updateDisplay();
            scheduleRender();
        }
    }

    // ==================== 座標轉換 ====================

    /**
     * 獲取當前縮放比例（每像素對應的複數平面單位）
     */
    function getScale() {
        return 3 / (Math.min(state.width, state.height) * state.zoom);
    }

    /**
     * 螢幕座標轉換為複數平面座標
     */
    function screenToComplex(screenX, screenY) {
        const scale = getScale();
        return {
            x: state.centerX + (screenX - state.width / 2) * scale,
            y: state.centerY + (screenY - state.height / 2) * scale
        };
    }

    // ==================== 渲染核心 ====================

    /**
     * 排程渲染（防止過於頻繁）
     */
    function scheduleRender() {
        state.needsRender = true;

        if (!state.isRendering) {
            render();
        }
    }

    /**
     * 主渲染函數
     */
    function render() {
        state.isRendering = true;
        state.needsRender = false;

        showLoading(true);

        const startTime = performance.now();
        const width = state.width;
        const height = state.height;
        const data = state.imageData.data;
        const palette = PALETTES[state.currentPalette];

        const scale = getScale();
        const startX = state.centerX - (width / 2) * scale;
        const startY = state.centerY - (height / 2) * scale;

        // 分塊渲染以保持響應性
        let currentY = 0;

        function renderChunk() {
            const chunkEndY = Math.min(currentY + CONFIG.CHUNK_SIZE, height);

            for (let py = currentY; py < chunkEndY; py++) {
                const cy = startY + py * scale;

                for (let px = 0; px < width; px++) {
                    const cx = startX + px * scale;

                    // 曼德博集合迭代
                    const iter = mandelbrotIteration(cx, cy, state.maxIterations);

                    // 計算顏色
                    const idx = (py * width + px) * 4;

                    if (iter === state.maxIterations) {
                        // 屬於集合：黑色
                        data[idx] = 0;
                        data[idx + 1] = 0;
                        data[idx + 2] = 0;
                        data[idx + 3] = 255;
                    } else {
                        // 不屬於集合：根據迭代次數著色
                        // 使用平滑著色避免明顯的色帶
                        const smoothIter = iter + 1 - Math.log2(Math.log2(iter + 1));
                        const t = (smoothIter % 50) / 50;
                        const [r, g, b] = palette(t);
                        data[idx] = r;
                        data[idx + 1] = g;
                        data[idx + 2] = b;
                        data[idx + 3] = 255;
                    }
                }
            }

            currentY = chunkEndY;

            if (currentY < height) {
                // 繼續渲染下一塊
                setTimeout(renderChunk, CONFIG.RENDER_DELAY);
            } else {
                // 渲染完成
                state.ctx.putImageData(state.imageData, 0, 0);
                state.lastRenderTime = performance.now() - startTime;
                showLoading(false);

                state.isRendering = false;

                // 如果渲染期間有新的請求，繼續渲染
                if (state.needsRender) {
                    render();
                }
            }
        }

        renderChunk();
    }

    /**
     * 曼德博集合迭代計算
     *
     * @param {number} cx - 複數實部 (c 的實部)
     * @param {number} cy - 複數虛部 (c 的虛部)
     * @param {number} maxIter - 最大迭代次數
     * @returns {number} 逃逸所需的迭代次數
     */
    function mandelbrotIteration(cx, cy, maxIter) {
        let zx = 0;
        let zy = 0;
        let zx2 = 0;
        let zy2 = 0;
        let iter = 0;

        // z(n+1) = z(n)^2 + c
        // 展開複數運算：
        // zx' = zx^2 - zy^2 + cx
        // zy' = 2 * zx * zy + cy

        while (zx2 + zy2 < CONFIG.ESCAPE_RADIUS && iter < maxIter) {
            zy = 2 * zx * zy + cy;
            zx = zx2 - zy2 + cx;
            zx2 = zx * zx;
            zy2 = zy * zy;
            iter++;
        }

        return iter;
    }

    // ==================== UI 更新 ====================

    /**
     * 更新顯示資訊
     */
    function updateDisplay() {
        // 格式化中心座標
        const realStr = state.centerX >= 0 ? state.centerX.toFixed(10) : state.centerX.toFixed(10);
        const imagStr = state.centerY >= 0 ? '+' + state.centerY.toFixed(10) : state.centerY.toFixed(10);
        document.getElementById('center-display').textContent = `${realStr}${imagStr}i`;

        // 格式化縮放倍率
        let zoomStr;
        if (state.zoom >= 1e9) {
            zoomStr = state.zoom.toExponential(2) + 'x';
        } else if (state.zoom >= 1000) {
            zoomStr = (state.zoom / 1000).toFixed(1) + 'Kx';
        } else {
            zoomStr = state.zoom.toFixed(1) + 'x';
        }
        document.getElementById('zoom-display').textContent = zoomStr;

        // 迭代次數
        document.getElementById('iter-display').textContent = state.maxIterations;
    }

    /**
     * 更新游標座標資訊
     */
    function updateCursorInfo(screenX, screenY) {
        const complex = screenToComplex(screenX, screenY);
        const realStr = complex.x.toFixed(10);
        const imagStr = complex.y >= 0 ? '+' + complex.y.toFixed(10) : complex.y.toFixed(10);

        const cursorInfo = document.getElementById('cursor-info');
        document.getElementById('cursor-pos').textContent = `${realStr}${imagStr}i`;
        cursorInfo.classList.add('visible');

        // 滑鼠離開後隱藏
        clearTimeout(state.cursorTimeout);
        state.cursorTimeout = setTimeout(() => {
            cursorInfo.classList.remove('visible');
        }, 2000);
    }

    /**
     * 顯示/隱藏載入指示器
     */
    function showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('visible');
        } else {
            loading.classList.remove('visible');
        }
    }

    // ==================== 工具函數 ====================

    /**
     * 防抖函數
     */
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
