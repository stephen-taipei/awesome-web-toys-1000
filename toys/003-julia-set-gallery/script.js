/**
 * Julia Set Gallery 茱莉亞集合畫廊
 *
 * 互動式茱莉亞集合探索器
 * - 拖曳控制 c 參數即時變化
 * - WebGL Shader 高效能渲染
 * - 預設經典圖案畫廊
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        INITIAL_C_REAL: -0.7,
        INITIAL_C_IMAG: 0.27015,
        INITIAL_ZOOM: 1,
        MIN_ZOOM: 0.5,
        MAX_ZOOM: 1e6,
        ZOOM_SPEED: 1.4,
        MAX_ITERATIONS: 200,
        // 曼德博預覽範圍
        MANDELBROT_X_MIN: -2.5,
        MANDELBROT_X_MAX: 1.0,
        MANDELBROT_Y_MIN: -1.2,
        MANDELBROT_Y_MAX: 1.2
    };

    // ==================== 全域狀態 ====================

    const state = {
        // 主畫布
        canvas: null,
        gl: null,
        program: null,

        // 曼德博預覽
        previewCanvas: null,
        previewGl: null,
        previewProgram: null,

        // 視角參數
        centerX: 0,
        centerY: 0,
        zoom: CONFIG.INITIAL_ZOOM,

        // c 參數
        cReal: CONFIG.INITIAL_C_REAL,
        cImag: CONFIG.INITIAL_C_IMAG,

        // 渲染參數
        maxIterations: CONFIG.MAX_ITERATIONS,
        currentPalette: 0,

        // 互動狀態
        isDraggingC: false,
        isDraggingCanvas: false,
        dragStartX: 0,
        dragStartY: 0,
        dragStartCenterX: 0,
        dragStartCenterY: 0,

        // 觸控
        lastTouchDist: 0
    };

    // ==================== 初始化 ====================

    function init() {
        // 初始化主畫布
        state.canvas = document.getElementById('canvas');
        state.gl = state.canvas.getContext('webgl') || state.canvas.getContext('experimental-webgl');

        if (!state.gl) {
            alert('您的瀏覽器不支援 WebGL，請使用現代瀏覽器');
            return;
        }

        // 初始化曼德博預覽
        state.previewCanvas = document.getElementById('mandelbrot-preview');
        state.previewGl = state.previewCanvas.getContext('webgl') || state.previewCanvas.getContext('experimental-webgl');

        // 編譯 Shader
        state.program = createProgram(state.gl, 'vertex-shader', 'fragment-shader');
        state.previewProgram = createProgram(state.previewGl, 'vertex-shader', 'mandelbrot-shader');

        // 設定頂點緩衝（全螢幕四邊形）
        setupVertexBuffer(state.gl);
        setupVertexBuffer(state.previewGl);

        // 調整畫布大小
        resizeCanvas();

        // 綁定事件
        bindEvents();

        // 初始渲染
        renderMandelbrotPreview();
        updateCMarker();
        render();
    }

    /**
     * 創建 WebGL 程式
     */
    function createProgram(gl, vertexShaderId, fragmentShaderId) {
        const vertexSource = document.getElementById(vertexShaderId).textContent;
        const fragmentSource = document.getElementById(fragmentShaderId).textContent;

        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    /**
     * 編譯 Shader
     */
    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * 設定頂點緩衝
     */
    function setupVertexBuffer(gl) {
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    /**
     * 調整畫布尺寸
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;

        // 主畫布
        state.canvas.width = window.innerWidth * dpr;
        state.canvas.height = window.innerHeight * dpr;
        state.canvas.style.width = window.innerWidth + 'px';
        state.canvas.style.height = window.innerHeight + 'px';
        state.gl.viewport(0, 0, state.canvas.width, state.canvas.height);

        // 預覽畫布
        const previewRect = state.previewCanvas.getBoundingClientRect();
        state.previewCanvas.width = previewRect.width * dpr;
        state.previewCanvas.height = previewRect.height * dpr;
        state.previewGl.viewport(0, 0, state.previewCanvas.width, state.previewCanvas.height);

        render();
        renderMandelbrotPreview();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', debounce(resizeCanvas, 200));

        // c 參數選擇器事件
        state.previewCanvas.addEventListener('mousedown', handleCPickerMouseDown);
        state.previewCanvas.addEventListener('mousemove', handleCPickerMouseMove);
        state.previewCanvas.addEventListener('mouseup', handleCPickerMouseUp);
        state.previewCanvas.addEventListener('mouseleave', handleCPickerMouseUp);
        state.previewCanvas.addEventListener('touchstart', handleCPickerTouchStart, { passive: false });
        state.previewCanvas.addEventListener('touchmove', handleCPickerTouchMove, { passive: false });
        state.previewCanvas.addEventListener('touchend', handleCPickerTouchEnd);

        // 主畫布事件
        state.canvas.addEventListener('mousedown', handleCanvasMouseDown);
        state.canvas.addEventListener('mousemove', handleCanvasMouseMove);
        state.canvas.addEventListener('mouseup', handleCanvasMouseUp);
        state.canvas.addEventListener('mouseleave', handleCanvasMouseUp);
        state.canvas.addEventListener('wheel', handleWheel, { passive: false });
        state.canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
        state.canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
        state.canvas.addEventListener('touchend', handleCanvasTouchEnd);

        // 鍵盤
        window.addEventListener('keydown', handleKeyDown);

        // 畫廊按鈕
        document.querySelectorAll('.gallery-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.gallery-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.cReal = parseFloat(btn.dataset.cr);
                state.cImag = parseFloat(btn.dataset.ci);
                updateCMarker();
                updateDisplay();
                render();
            });
        });

        // 配色方案按鈕
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.currentPalette = parseInt(btn.dataset.palette, 10);
                render();
            });
        });
    }

    // ==================== c 參數選擇器事件 ====================

    function handleCPickerMouseDown(e) {
        state.isDraggingC = true;
        document.getElementById('c-marker').classList.add('dragging');
        updateCFromEvent(e);
    }

    function handleCPickerMouseMove(e) {
        if (!state.isDraggingC) return;
        updateCFromEvent(e);
    }

    function handleCPickerMouseUp() {
        state.isDraggingC = false;
        document.getElementById('c-marker').classList.remove('dragging');
    }

    function handleCPickerTouchStart(e) {
        e.preventDefault();
        state.isDraggingC = true;
        document.getElementById('c-marker').classList.add('dragging');
        updateCFromEvent(e.touches[0]);
    }

    function handleCPickerTouchMove(e) {
        e.preventDefault();
        if (!state.isDraggingC) return;
        updateCFromEvent(e.touches[0]);
    }

    function handleCPickerTouchEnd() {
        state.isDraggingC = false;
        document.getElementById('c-marker').classList.remove('dragging');
    }

    function updateCFromEvent(e) {
        const rect = state.previewCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1 - (e.clientY - rect.top) / rect.height; // Y 軸反轉

        // 映射到曼德博座標範圍
        state.cReal = CONFIG.MANDELBROT_X_MIN + x * (CONFIG.MANDELBROT_X_MAX - CONFIG.MANDELBROT_X_MIN);
        state.cImag = CONFIG.MANDELBROT_Y_MIN + y * (CONFIG.MANDELBROT_Y_MAX - CONFIG.MANDELBROT_Y_MIN);

        // 清除畫廊選中狀態
        document.querySelectorAll('.gallery-item').forEach(b => b.classList.remove('active'));

        updateCMarker();
        updateDisplay();
        render();
    }

    function updateCMarker() {
        const marker = document.getElementById('c-marker');
        const rect = state.previewCanvas.getBoundingClientRect();

        // 從 c 值計算螢幕位置
        const x = (state.cReal - CONFIG.MANDELBROT_X_MIN) / (CONFIG.MANDELBROT_X_MAX - CONFIG.MANDELBROT_X_MIN);
        const y = 1 - (state.cImag - CONFIG.MANDELBROT_Y_MIN) / (CONFIG.MANDELBROT_Y_MAX - CONFIG.MANDELBROT_Y_MIN);

        marker.style.left = (12 + x * rect.width) + 'px';
        marker.style.top = (12 + y * rect.height) + 'px';
    }

    // ==================== 主畫布事件 ====================

    function handleCanvasMouseDown(e) {
        state.isDraggingCanvas = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragStartCenterX = state.centerX;
        state.dragStartCenterY = state.centerY;
        state.canvas.style.cursor = 'grabbing';
    }

    function handleCanvasMouseMove(e) {
        if (!state.isDraggingCanvas) return;

        const scale = getScale();
        const dx = (e.clientX - state.dragStartX) * scale;
        const dy = (e.clientY - state.dragStartY) * scale;

        state.centerX = state.dragStartCenterX - dx;
        state.centerY = state.dragStartCenterY + dy; // Y 軸反轉

        updateDisplay();
        render();
    }

    function handleCanvasMouseUp() {
        state.isDraggingCanvas = false;
        state.canvas.style.cursor = 'grab';
    }

    function handleWheel(e) {
        e.preventDefault();

        const rect = state.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 計算滑鼠位置對應的複數座標
        const scale = getScale();
        const aspect = rect.width / rect.height;
        const mouseComplex = {
            x: state.centerX + (mouseX / rect.width - 0.5) * scale * 3 * aspect,
            y: state.centerY - (mouseY / rect.height - 0.5) * scale * 3
        };

        // 縮放
        const zoomFactor = e.deltaY < 0 ? CONFIG.ZOOM_SPEED : 1 / CONFIG.ZOOM_SPEED;
        const newZoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, state.zoom * zoomFactor));

        // 調整中心點
        const zoomRatio = newZoom / state.zoom;
        state.centerX = mouseComplex.x - (mouseComplex.x - state.centerX) / zoomRatio;
        state.centerY = mouseComplex.y - (mouseComplex.y - state.centerY) / zoomRatio;
        state.zoom = newZoom;

        updateDisplay();
        render();
    }

    // 觸控事件
    function handleCanvasTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 1) {
            state.isDraggingCanvas = true;
            state.dragStartX = e.touches[0].clientX;
            state.dragStartY = e.touches[0].clientY;
            state.dragStartCenterX = state.centerX;
            state.dragStartCenterY = state.centerY;
        } else if (e.touches.length === 2) {
            state.isDraggingCanvas = false;
            state.lastTouchDist = getTouchDistance(e.touches);
        }
    }

    function handleCanvasTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && state.isDraggingCanvas) {
            const scale = getScale();
            const dx = (e.touches[0].clientX - state.dragStartX) * scale;
            const dy = (e.touches[0].clientY - state.dragStartY) * scale;

            state.centerX = state.dragStartCenterX - dx;
            state.centerY = state.dragStartCenterY + dy;

            updateDisplay();
            render();
        } else if (e.touches.length === 2) {
            const newDist = getTouchDistance(e.touches);

            if (state.lastTouchDist > 0) {
                const zoomFactor = newDist / state.lastTouchDist;
                state.zoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, state.zoom * zoomFactor));
                updateDisplay();
                render();
            }

            state.lastTouchDist = newDist;
        }
    }

    function handleCanvasTouchEnd(e) {
        if (e.touches.length === 0) {
            state.isDraggingCanvas = false;
            state.lastTouchDist = 0;
        }
    }

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // ==================== 鍵盤事件 ====================

    function handleKeyDown(e) {
        if (e.key === 'r' || e.key === 'R') {
            // 重置視角
            state.centerX = 0;
            state.centerY = 0;
            state.zoom = CONFIG.INITIAL_ZOOM;
            updateDisplay();
            render();
        }
    }

    // ==================== 渲染 ====================

    function render() {
        const gl = state.gl;
        const program = state.program;

        gl.useProgram(program);

        // 設定頂點屬性
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // 設定 uniform 變數
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), state.canvas.width, state.canvas.height);
        gl.uniform2f(gl.getUniformLocation(program, 'u_center'), state.centerX, state.centerY);
        gl.uniform1f(gl.getUniformLocation(program, 'u_zoom'), state.zoom);
        gl.uniform2f(gl.getUniformLocation(program, 'u_c'), state.cReal, state.cImag);
        gl.uniform1i(gl.getUniformLocation(program, 'u_maxIter'), state.maxIterations);
        gl.uniform1i(gl.getUniformLocation(program, 'u_palette'), state.currentPalette);

        // 繪製
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function renderMandelbrotPreview() {
        const gl = state.previewGl;
        const program = state.previewProgram;

        gl.useProgram(program);

        // 設定頂點屬性
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // 設定 uniform 變數
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), state.previewCanvas.width, state.previewCanvas.height);

        // 繪製
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        // c 值顯示
        const realStr = state.cReal.toFixed(4);
        const imagStr = state.cImag >= 0 ? '+' + state.cImag.toFixed(4) : state.cImag.toFixed(4);
        document.getElementById('c-display').textContent = `${realStr}${imagStr}i`;

        // 縮放倍率
        let zoomStr;
        if (state.zoom >= 1e6) {
            zoomStr = state.zoom.toExponential(1) + 'x';
        } else if (state.zoom >= 1000) {
            zoomStr = (state.zoom / 1000).toFixed(1) + 'Kx';
        } else {
            zoomStr = state.zoom.toFixed(1) + 'x';
        }
        document.getElementById('zoom-display').textContent = zoomStr;
    }

    // ==================== 工具函數 ====================

    function getScale() {
        return 1 / state.zoom;
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
