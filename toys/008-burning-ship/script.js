/**
 * Burning Ship 燃燒船分形
 *
 * 使用 WebGL Shader 即時渲染燃燒船分形
 * - 滾輪縮放，拖曳平移
 * - 興趣點導覽至著名位置
 * - 多種顏色主題
 *
 * 公式：z(n+1) = (|Re(z)| + i|Im(z)|)² + c
 *
 * @author Awesome Web Toys 1000
 * @version 1.0.0
 */

(function() {
    'use strict';

    // ==================== 常數設定 ====================

    const CONFIG = {
        DEFAULT_CENTER_X: -0.4,
        DEFAULT_CENTER_Y: -0.5,
        DEFAULT_ZOOM: 1.5,
        DEFAULT_MAX_ITER: 256,
        ZOOM_FACTOR: 1.15,
        MIN_ZOOM: 0.5,
        MAX_ZOOM: 100000
    };

    // 興趣點座標
    const POINTS_OF_INTEREST = {
        overview: { x: -0.4, y: -0.5, zoom: 1.5, name: '全景' },
        ship: { x: -1.755, y: -0.03, zoom: 50, name: '船身' },
        antenna: { x: -1.861, y: -0.0003, zoom: 500, name: '天線' },
        spiral: { x: -1.7624, y: -0.0284, zoom: 200, name: '螺旋' },
        miniship: { x: -1.941, y: -0.0071, zoom: 800, name: '迷你船' }
    };

    // 顏色主題 (傳給 shader 的參數)
    const COLOR_THEMES = {
        fire: 0,
        ocean: 1,
        neon: 2,
        grayscale: 3
    };

    // ==================== Shader 源碼 ====================

    const VERTEX_SHADER = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAGMENT_SHADER = `
        precision highp float;

        uniform vec2 u_resolution;
        uniform vec2 u_center;
        uniform float u_zoom;
        uniform int u_maxIter;
        uniform int u_colorTheme;

        // 將迭代次數映射到顏色
        vec3 getColor(float t, int theme) {
            if (theme == 0) {
                // Fire 烈焰
                return vec3(
                    min(1.0, t * 3.0),
                    t * t,
                    t * t * t
                );
            } else if (theme == 1) {
                // Ocean 深海
                return vec3(
                    t * t * t,
                    t * t,
                    min(1.0, t * 2.0)
                );
            } else if (theme == 2) {
                // Neon 霓虹
                float r = 0.5 + 0.5 * sin(t * 6.28318 * 3.0);
                float g = 0.5 + 0.5 * sin(t * 6.28318 * 3.0 + 2.094);
                float b = 0.5 + 0.5 * sin(t * 6.28318 * 3.0 + 4.188);
                return vec3(r, g, b);
            } else {
                // Grayscale 灰階
                return vec3(t);
            }
        }

        void main() {
            // 計算複平面座標
            vec2 uv = gl_FragCoord.xy / u_resolution;
            float aspect = u_resolution.x / u_resolution.y;

            // 以中心點為基準，根據縮放計算範圍
            float range = 3.0 / u_zoom;
            float cx = u_center.x + (uv.x - 0.5) * range * aspect;
            float cy = u_center.y + (uv.y - 0.5) * range;

            // 燃燒船迭代
            // z(n+1) = (|Re(z)| + i|Im(z)|)² + c
            float zx = 0.0;
            float zy = 0.0;
            int iter = 0;

            for (int i = 0; i < 1024; i++) {
                if (i >= u_maxIter) break;

                // 取絕對值（燃燒船的關鍵）
                float ax = abs(zx);
                float ay = abs(zy);

                // 計算 z² + c
                float xtemp = ax * ax - ay * ay + cx;
                zy = 2.0 * ax * ay + cy;
                zx = xtemp;

                // 逃逸判斷
                if (zx * zx + zy * zy > 4.0) break;
                iter++;
            }

            // 著色
            if (iter >= u_maxIter) {
                // 集合內部 - 黑色
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                // 平滑著色
                float smoothIter = float(iter) + 1.0 - log(log(zx * zx + zy * zy)) / log(2.0);
                float t = smoothIter / float(u_maxIter);
                t = sqrt(t);  // gamma 校正使漸層更平滑

                vec3 color = getColor(t, u_colorTheme);
                gl_FragColor = vec4(color, 1.0);
            }
        }
    `;

    // ==================== 全域狀態 ====================

    const state = {
        canvas: null,
        gl: null,
        program: null,

        // 視圖參數
        centerX: CONFIG.DEFAULT_CENTER_X,
        centerY: CONFIG.DEFAULT_CENTER_Y,
        zoom: CONFIG.DEFAULT_ZOOM,
        maxIter: CONFIG.DEFAULT_MAX_ITER,

        // 顏色主題
        colorTheme: 'fire',

        // 拖曳狀態
        isDragging: false,
        lastX: 0,
        lastY: 0,

        // Uniform locations
        uniforms: {}
    };

    // ==================== 初始化 ====================

    function init() {
        state.canvas = document.getElementById('canvas');
        state.gl = state.canvas.getContext('webgl') || state.canvas.getContext('experimental-webgl');

        if (!state.gl) {
            alert('您的瀏覽器不支援 WebGL');
            return;
        }

        initShaders();
        initBuffers();
        resizeCanvas();
        bindEvents();
        render();
    }

    /**
     * 初始化 Shaders
     */
    function initShaders() {
        const gl = state.gl;

        // 編譯 vertex shader
        const vertShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertShader, VERTEX_SHADER);
        gl.compileShader(vertShader);

        if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader error:', gl.getShaderInfoLog(vertShader));
            return;
        }

        // 編譯 fragment shader
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragShader, FRAGMENT_SHADER);
        gl.compileShader(fragShader);

        if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader error:', gl.getShaderInfoLog(fragShader));
            return;
        }

        // 連結程式
        state.program = gl.createProgram();
        gl.attachShader(state.program, vertShader);
        gl.attachShader(state.program, fragShader);
        gl.linkProgram(state.program);

        if (!gl.getProgramParameter(state.program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(state.program));
            return;
        }

        gl.useProgram(state.program);

        // 獲取 uniform locations
        state.uniforms.resolution = gl.getUniformLocation(state.program, 'u_resolution');
        state.uniforms.center = gl.getUniformLocation(state.program, 'u_center');
        state.uniforms.zoom = gl.getUniformLocation(state.program, 'u_zoom');
        state.uniforms.maxIter = gl.getUniformLocation(state.program, 'u_maxIter');
        state.uniforms.colorTheme = gl.getUniformLocation(state.program, 'u_colorTheme');
    }

    /**
     * 初始化頂點緩衝
     */
    function initBuffers() {
        const gl = state.gl;

        // 全螢幕四邊形
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(state.program, 'a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    }

    /**
     * 調整畫布尺寸
     */
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        state.canvas.width = width * dpr;
        state.canvas.height = height * dpr;
        state.canvas.style.width = width + 'px';
        state.canvas.style.height = height + 'px';

        state.gl.viewport(0, 0, state.canvas.width, state.canvas.height);
    }

    // ==================== 渲染 ====================

    function render() {
        const gl = state.gl;

        // 設定 uniforms
        gl.uniform2f(state.uniforms.resolution, state.canvas.width, state.canvas.height);
        gl.uniform2f(state.uniforms.center, state.centerX, state.centerY);
        gl.uniform1f(state.uniforms.zoom, state.zoom);
        gl.uniform1i(state.uniforms.maxIter, state.maxIter);
        gl.uniform1i(state.uniforms.colorTheme, COLOR_THEMES[state.colorTheme]);

        // 繪製
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 更新顯示
        updateDisplay();
    }

    // ==================== 事件綁定 ====================

    function bindEvents() {
        window.addEventListener('resize', () => {
            resizeCanvas();
            render();
        });

        // 滾輪縮放
        state.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = state.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = 1 - (e.clientY - rect.top) / rect.height;  // Y 翻轉

            // 計算滑鼠在複平面的座標
            const aspect = state.canvas.width / state.canvas.height;
            const range = 3.0 / state.zoom;
            const cx = state.centerX + (mouseX - 0.5) * range * aspect;
            const cy = state.centerY + (mouseY - 0.5) * range;

            // 縮放
            if (e.deltaY < 0) {
                state.zoom = Math.min(CONFIG.MAX_ZOOM, state.zoom * CONFIG.ZOOM_FACTOR);
            } else {
                state.zoom = Math.max(CONFIG.MIN_ZOOM, state.zoom / CONFIG.ZOOM_FACTOR);
            }

            // 重新計算中心使滑鼠位置不變
            const newRange = 3.0 / state.zoom;
            state.centerX = cx - (mouseX - 0.5) * newRange * aspect;
            state.centerY = cy - (mouseY - 0.5) * newRange;

            render();
        }, { passive: false });

        // 拖曳平移
        state.canvas.addEventListener('mousedown', (e) => {
            state.isDragging = true;
            state.lastX = e.clientX;
            state.lastY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;

            const dx = e.clientX - state.lastX;
            const dy = e.clientY - state.lastY;

            const aspect = state.canvas.width / state.canvas.height;
            const range = 3.0 / state.zoom;

            state.centerX -= dx / state.canvas.clientWidth * range * aspect;
            state.centerY += dy / state.canvas.clientHeight * range;

            state.lastX = e.clientX;
            state.lastY = e.clientY;

            render();
        });

        window.addEventListener('mouseup', () => {
            state.isDragging = false;
        });

        // 點擊設定中心
        state.canvas.addEventListener('dblclick', (e) => {
            const rect = state.canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = 1 - (e.clientY - rect.top) / rect.height;

            const aspect = state.canvas.width / state.canvas.height;
            const range = 3.0 / state.zoom;

            state.centerX = state.centerX + (mouseX - 0.5) * range * aspect;
            state.centerY = state.centerY + (mouseY - 0.5) * range;

            render();
        });

        // 觸控支援
        let touchStartDist = 0;
        let touchStartZoom = 0;

        state.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state.isDragging = true;
                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                // 雙指縮放
                touchStartDist = getTouchDistance(e.touches);
                touchStartZoom = state.zoom;
            }
        }, { passive: true });

        state.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (e.touches.length === 1 && state.isDragging) {
                const dx = e.touches[0].clientX - state.lastX;
                const dy = e.touches[0].clientY - state.lastY;

                const aspect = state.canvas.width / state.canvas.height;
                const range = 3.0 / state.zoom;

                state.centerX -= dx / state.canvas.clientWidth * range * aspect;
                state.centerY += dy / state.canvas.clientHeight * range;

                state.lastX = e.touches[0].clientX;
                state.lastY = e.touches[0].clientY;

                render();
            } else if (e.touches.length === 2) {
                const dist = getTouchDistance(e.touches);
                const scale = dist / touchStartDist;
                state.zoom = Math.min(CONFIG.MAX_ZOOM, Math.max(CONFIG.MIN_ZOOM, touchStartZoom * scale));
                render();
            }
        }, { passive: false });

        state.canvas.addEventListener('touchend', () => {
            state.isDragging = false;
        });

        // 迭代滑桿
        document.getElementById('iteration-slider').addEventListener('input', (e) => {
            state.maxIter = parseInt(e.target.value, 10);
            document.getElementById('iteration-display').textContent = state.maxIter;
            render();
        });

        // 顏色按鈕
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colorTheme = btn.dataset.color;
                render();
            });
        });

        // 興趣點按鈕
        document.querySelectorAll('.poi-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const poi = POINTS_OF_INTEREST[btn.dataset.poi];
                if (poi) {
                    animateTo(poi.x, poi.y, poi.zoom);
                }
            });
        });

        // 重置按鈕
        document.getElementById('reset-btn').addEventListener('click', reset);

        // 鍵盤控制
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR') {
                reset();
            } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
                state.zoom = Math.min(CONFIG.MAX_ZOOM, state.zoom * CONFIG.ZOOM_FACTOR);
                render();
            } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
                state.zoom = Math.max(CONFIG.MIN_ZOOM, state.zoom / CONFIG.ZOOM_FACTOR);
                render();
            }
        });
    }

    /**
     * 計算兩點觸控距離
     */
    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 平滑動畫到目標位置
     */
    function animateTo(targetX, targetY, targetZoom) {
        const startX = state.centerX;
        const startY = state.centerY;
        const startZoom = state.zoom;
        const duration = 800;
        const startTime = performance.now();

        function easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(1, elapsed / duration);
            const eased = easeInOutCubic(t);

            state.centerX = startX + (targetX - startX) * eased;
            state.centerY = startY + (targetY - startY) * eased;
            // 縮放使用對數插值以獲得平滑效果
            state.zoom = Math.exp(Math.log(startZoom) + (Math.log(targetZoom) - Math.log(startZoom)) * eased);

            render();

            if (t < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * 重置視圖
     */
    function reset() {
        animateTo(CONFIG.DEFAULT_CENTER_X, CONFIG.DEFAULT_CENTER_Y, CONFIG.DEFAULT_ZOOM);
    }

    // ==================== UI 更新 ====================

    function updateDisplay() {
        document.getElementById('center-display').textContent =
            `${state.centerX.toFixed(4)}, ${state.centerY.toFixed(4)}`;

        let zoomStr;
        if (state.zoom >= 1000) {
            zoomStr = (state.zoom / 1000).toFixed(1) + 'K';
        } else {
            zoomStr = state.zoom.toFixed(1);
        }
        document.getElementById('zoom-display').textContent = zoomStr + 'x';
    }

    // ==================== 啟動 ====================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
