# Plan 6: 3D 體驗 3D Experiences (501-600)

> 三維空間的互動探索，幾何、場景、光影、材質、粒子

[返回總覽](./plan.md)

---

## 分類概述

3D 體驗是利用 WebGL/WebGPU 技術在瀏覽器中創造沉浸式三維互動的領域。這 100 個 toys 涵蓋幾何探索、場景漫遊、光影效果、材質展示等多種 3D 視覺體驗。

### 子分類

| 子分類 | 編號 | 數量 |
|-------|------|------|
| 幾何探索 | 501-510 | 10 |
| 場景漫遊 | 511-520 | 10 |
| 物件操控 | 521-530 | 10 |
| 光影效果 | 531-540 | 10 |
| 材質展示 | 541-550 | 10 |
| 粒子 3D | 551-560 | 10 |
| 地形生成 | 561-570 | 10 |
| 建築視覺 | 571-580 | 10 |
| 抽象 3D | 581-590 | 10 |
| VR/AR 預備 | 591-600 | 10 |

---

## 幾何探索 Geometric Exploration (501-510)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 501 | Platonic Solids 柏拉圖多面體 | 互動探索五種正多面體，可旋轉、分解 | WebGL, Three.js | Level 2 | 待開發 |
| 502 | Polyhedra Gallery 多面體展覽 | 各種多面體的 3D 展示和資訊 | WebGL | Level 2 | 待開發 |
| 503 | Möbius Strip 莫比烏斯帶 | 探索單面曲面的奇妙性質 | WebGL | Level 2 | 待開發 |
| 504 | Klein Bottle 克萊因瓶 | 4D 物體在 3D 空間的投影 | WebGL | Level 2 | 待開發 |
| 505 | Torus Knot 環面紐結 | 各種參數的環面紐結形狀 | WebGL, Three.js | Level 2 | 待開發 |
| 506 | Geodesic Dome 測地線圓頂 | 可調整細分層級的測地圓頂 | WebGL | Level 2 | 待開發 |
| 507 | Hypercube 超立方體 | 四維立方體的 3D 投影旋轉 | WebGL | Level 2 | 待開發 |
| 508 | Minimal Surface 極小曲面 | 肥皂泡形成的極小曲面視覺化 | WebGL | Level 2 | 待開發 |
| 509 | Boolean Operations 布林運算 | 3D 幾何的交集、聯集、差集 | WebGL, CSG | Level 2 | 待開發 |
| 510 | Parametric Shapes 參數形狀 | 用數學公式定義 3D 形狀 | WebGL | Level 2 | 待開發 |

---

## 場景漫遊 Scene Navigation (511-520)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 511 | First Person Camera 第一人稱視角 | WASD 控制在 3D 環境中移動 | WebGL, 相機控制 | Level 2 | 待開發 |
| 512 | Orbit Controls 軌道控制 | 滑鼠拖曳繞物體旋轉查看 | WebGL, OrbitControls | Level 2 | 待開發 |
| 513 | Fly Through 飛行穿越 | 自由飛行穿越 3D 空間 | WebGL | Level 2 | 待開發 |
| 514 | Virtual Gallery 虛擬畫廊 | 可行走的 3D 藝術展覽空間 | WebGL | Level 2 | 待開發 |
| 515 | Mini Map 3D 3D 迷你地圖 | 主視角加俯視小地圖導航 | WebGL | Level 2 | 待開發 |
| 516 | Teleport 傳送移動 | 點擊傳送到指定位置 | WebGL | Level 2 | 待開發 |
| 517 | Path Following 路徑跟隨 | 相機沿預設路徑自動移動 | WebGL, 曲線插值 | Level 2 | 待開發 |
| 518 | Multi Camera 多相機切換 | 在不同視角間切換查看 | WebGL | Level 2 | 待開發 |
| 519 | Zoom Transition 縮放過渡 | 點擊物體平滑放大過渡 | WebGL, 動畫 | Level 2 | 待開發 |
| 520 | Compass Navigation 羅盤導航 | 3D 羅盤指引方向 | WebGL | Level 2 | 待開發 |

---

## 物件操控 Object Manipulation (521-530)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 521 | Transform Controls 變換控制 | 移動、旋轉、縮放 3D 物件 | WebGL, TransformControls | Level 2 | 待開發 |
| 522 | Drag and Drop 3D 3D 拖放 | 拖曳物件放置到場景中 | WebGL, Raycaster | Level 2 | 待開發 |
| 523 | Object Picker 物件選取 | 點擊選取並高亮 3D 物件 | WebGL, Raycasting | Level 2 | 待開發 |
| 524 | Snap Grid 格點吸附 | 物件移動自動對齊格點 | WebGL | Level 2 | 待開發 |
| 525 | Clone Tool 複製工具 | 快速複製 3D 物件 | WebGL | Level 2 | 待開發 |
| 526 | Group Objects 群組物件 | 多選並群組物件一起操作 | WebGL | Level 2 | 待開發 |
| 527 | Align Tools 對齊工具 | 物件對齊和分布功能 | WebGL | Level 2 | 待開發 |
| 528 | Pivot Point 軸心點 | 改變物件的旋轉軸心 | WebGL | Level 2 | 待開發 |
| 529 | Undo Redo 3D 復原重做 | 3D 編輯的歷史記錄 | WebGL | Level 2 | 待開發 |
| 530 | Multi Touch 3D 多點觸控 3D | 觸控手勢操控 3D 物件 | WebGL, 觸控事件 | Level 2 | 待開發 |

---

## 光影效果 Lighting Effects (531-540)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 531 | Light Types 光源類型 | 比較點光源、平行光、聚光燈 | WebGL | Level 2 | 待開發 |
| 532 | Shadow Mapping 陰影映射 | 即時陰影效果展示 | WebGL, Shadow Map | Level 2 | 待開發 |
| 533 | Ambient Occlusion 環境遮蔽 | SSAO 效果視覺化 | WebGL, 後處理 | Level 2 | 待開發 |
| 534 | Global Illumination 全域光照 | 模擬光線多次反射效果 | WebGL/WebGPU | Level 3 | 待開發 |
| 535 | Volumetric Light 體積光 | 上帝光線效果 | WebGL | Level 2 | 待開發 |
| 536 | Light Painting 光繪 | 移動光源繪製軌跡 | WebGL | Level 2 | 待開發 |
| 537 | Day Night Cycle 日夜循環 | 太陽位置變化的光影效果 | WebGL | Level 2 | 待開發 |
| 538 | Neon Glow 霓虹光暈 | 發光物體的光暈效果 | WebGL, Bloom | Level 2 | 待開發 |
| 539 | Caustics 焦散效果 | 水面或玻璃產生的光紋 | WebGL | Level 2 | 待開發 |
| 540 | HDR Lighting HDR 光照 | 高動態範圍環境光照 | WebGL, 環境貼圖 | Level 2 | 待開發 |

---

## 材質展示 Material Showcase (541-550)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 541 | PBR Materials PBR 材質 | 物理渲染材質展示和調整 | WebGL, PBR | Level 2 | 待開發 |
| 542 | Material Editor 材質編輯器 | 調整各種材質參數即時預覽 | WebGL | Level 2 | 待開發 |
| 543 | Texture Mapping 貼圖映射 | UV 映射和貼圖效果展示 | WebGL | Level 2 | 待開發 |
| 544 | Normal Maps 法線貼圖 | 法線貼圖的凹凸效果 | WebGL | Level 2 | 待開發 |
| 545 | Reflection 反射效果 | 鏡面反射和環境映射 | WebGL, 立方體貼圖 | Level 2 | 待開發 |
| 546 | Refraction 折射效果 | 玻璃和水的折射效果 | WebGL | Level 2 | 待開發 |
| 547 | Subsurface Scattering 次表面散射 | 皮膚、蠟燭等半透明材質 | WebGL | Level 2 | 待開發 |
| 548 | Iridescence 虹彩效果 | 薄膜干涉的彩虹效果 | WebGL Shader | Level 2 | 待開發 |
| 549 | Procedural Materials 程序材質 | 純 Shader 生成的材質 | WebGL Shader | Level 2 | 待開發 |
| 550 | Material Comparison 材質比較 | 不同材質球並排比較 | WebGL | Level 2 | 待開發 |

---

## 粒子 3D 3D Particles (551-560)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 551 | Particle Galaxy 粒子銀河 | 大量粒子形成旋轉銀河 | WebGL, 實例化 | Level 2 | 待開發 |
| 552 | 3D Particle Fountain 3D 粒子噴泉 | 三維空間中的粒子噴泉 | WebGL | Level 2 | 待開發 |
| 553 | Particle Attractor 粒子吸引子 | 點擊創建吸引或排斥粒子的點 | WebGL | Level 2 | 待開發 |
| 554 | Particle Morphing 粒子變形 | 粒子在不同 3D 形狀間過渡 | WebGL, 形狀插值 | Level 2 | 待開發 |
| 555 | Particle Trail 3D 3D 粒子軌跡 | 3D 空間中的粒子拖尾效果 | WebGL | Level 2 | 待開發 |
| 556 | GPU Particles GPU 粒子 | 使用 GPU 運算的大量粒子 | WebGL/WebGPU | Level 2 | 待開發 |
| 557 | Particle Physics 3D 3D 粒子物理 | 帶有碰撞的 3D 粒子系統 | WebGL | Level 2 | 待開發 |
| 558 | Point Cloud 點雲 | 載入和顯示 3D 點雲數據 | WebGL | Level 2 | 待開發 |
| 559 | Sprite Particles 精靈粒子 | 使用貼圖的 3D 粒子效果 | WebGL | Level 2 | 待開發 |
| 560 | Particle Editor 粒子編輯器 | 可視化編輯 3D 粒子系統 | WebGL | Level 2 | 待開發 |

---

## 地形生成 Terrain Generation (561-570)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 561 | Heightmap Terrain 高度圖地形 | 從高度圖生成 3D 地形 | WebGL | Level 2 | 待開發 |
| 562 | Procedural Terrain 程序地形 | 使用噪聲生成無限地形 | WebGL, Noise | Level 2 | 待開發 |
| 563 | Terrain Painter 地形繪製 | 實時繪製地形高低起伏 | WebGL | Level 2 | 待開發 |
| 564 | LOD Terrain LOD 地形 | 距離越遠細節越少的地形 | WebGL, LOD | Level 2 | 待開發 |
| 565 | Voxel Terrain 體素地形 | Minecraft 風格的方塊地形 | WebGL | Level 2 | 待開發 |
| 566 | Erosion Simulation 侵蝕模擬 | 模擬水流侵蝕地形 | WebGL/WebGPU | Level 3 | 待開發 |
| 567 | Biome Generation 生態區生成 | 自動生成不同生態區域 | WebGL | Level 2 | 待開發 |
| 568 | Cave System 洞穴系統 | 3D 洞穴結構生成 | WebGL | Level 2 | 待開發 |
| 569 | Island Generator 島嶼生成器 | 程序化生成海島 | WebGL | Level 2 | 待開發 |
| 570 | Terrain Texturing 地形貼圖 | 依高度坡度自動混合紋理 | WebGL | Level 2 | 待開發 |

---

## 建築視覺 Architectural Visualization (571-580)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 571 | Room Viewer 房間瀏覽 | 3D 室內空間瀏覽 | WebGL | Level 2 | 待開發 |
| 572 | Floor Plan 3D 3D 平面圖 | 從 2D 平面圖生成 3D 模型 | WebGL | Level 2 | 待開發 |
| 573 | Furniture Placer 傢俱配置 | 拖放傢俱到房間中 | WebGL | Level 2 | 待開發 |
| 574 | Building Generator 建築生成 | 程序化生成建築外觀 | WebGL | Level 2 | 待開發 |
| 575 | City Block 城市街區 | 程序化城市街區生成 | WebGL | Level 2 | 待開發 |
| 576 | Structure Explode 結構分解 | 建築結構層層分解展示 | WebGL, 動畫 | Level 2 | 待開發 |
| 577 | Day Lighting Analysis 日照分析 | 分析建築不同時間的採光 | WebGL | Level 2 | 待開發 |
| 578 | Material Swapper 材質切換 | 快速切換建築表面材質 | WebGL | Level 2 | 待開發 |
| 579 | Dimension Tool 尺寸標註 | 3D 空間中的尺寸測量 | WebGL | Level 2 | 待開發 |
| 580 | Section View 剖面視圖 | 建築剖面切割視圖 | WebGL, Clipping | Level 2 | 待開發 |

---

## 抽象 3D Abstract 3D (581-590)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 581 | Shader Art 著色器藝術 | 純 Shader 創造的抽象視覺 | WebGL Shader | Level 2 | 待開發 |
| 582 | Raymarching 光線步進 | SDF 光線步進渲染抽象形狀 | WebGL Shader | Level 2 | 待開發 |
| 583 | Feedback Loop 回饋循環 | 渲染結果回饋產生無限效果 | WebGL, Framebuffer | Level 2 | 待開發 |
| 584 | Morphing Geometry 變形幾何 | 幾何體間平滑變形過渡 | WebGL | Level 2 | 待開發 |
| 585 | Noise Sculpture 噪聲雕塑 | 噪聲函數定義的 3D 形態 | WebGL Shader | Level 2 | 待開發 |
| 586 | Wireframe World 線框世界 | 純線框的抽象空間 | WebGL | Level 2 | 待開發 |
| 587 | Deformation 形變效果 | 各種頂點形變效果 | WebGL Shader | Level 2 | 待開發 |
| 588 | Infinite Zoom 無限縮放 | 不斷放大進入更小世界 | WebGL | Level 2 | 待開發 |
| 589 | Glitch 3D 3D 故障藝術 | 故障風格的 3D 視覺效果 | WebGL Shader | Level 2 | 待開發 |
| 590 | Hypnotic Spiral 催眠螺旋 | 3D 螺旋隧道視覺體驗 | WebGL | Level 2 | 待開發 |

---

## VR/AR 預備 VR/AR Ready (591-600)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 591 | VR Viewer VR 瀏覽器 | 支援 VR 頭顯的 3D 瀏覽 | WebXR | Level 3 | 待開發 |
| 592 | 360 Photo 360 照片 | 全景照片瀏覽器 | WebGL, 球面貼圖 | Level 2 | 待開發 |
| 593 | 360 Video 360 影片 | 全景影片播放器 | WebGL, Video | Level 2 | 待開發 |
| 594 | Hand Tracking 手部追蹤 | VR 手部追蹤互動 | WebXR | Level 3 | 待開發 |
| 595 | AR Marker AR 標記 | 識別圖案放置 3D 模型 | WebXR, AR | Level 3 | 待開發 |
| 596 | Stereoscopic 立體視覺 | 紅藍 3D 或並排立體 | WebGL | Level 2 | 待開發 |
| 597 | Room Scale 房間規模 | 可在房間中行走的 VR 體驗 | WebXR | Level 3 | 待開發 |
| 598 | Controller Input VR 控制器 | VR 控制器輸入處理 | WebXR | Level 3 | 待開發 |
| 599 | Spatial UI 空間介面 | 3D 空間中的 UI 介面 | WebGL/WebXR | Level 2 | 待開發 |
| 600 | Mixed Reality 混合實境 | AR 與真實環境融合 | WebXR | Level 3 | 待開發 |

---

## 進度統計

| 子分類 | 待開發 | 開發中 | 已完成 | 已測試 |
|-------|-------|-------|-------|-------|
| 幾何探索 | 10 | 0 | 0 | 0 |
| 場景漫遊 | 10 | 0 | 0 | 0 |
| 物件操控 | 10 | 0 | 0 | 0 |
| 光影效果 | 10 | 0 | 0 | 0 |
| 材質展示 | 10 | 0 | 0 | 0 |
| 粒子 3D | 10 | 0 | 0 | 0 |
| 地形生成 | 10 | 0 | 0 | 0 |
| 建築視覺 | 10 | 0 | 0 | 0 |
| 抽象 3D | 10 | 0 | 0 | 0 |
| VR/AR 預備 | 10 | 0 | 0 | 0 |
| **總計** | **100** | **0** | **0** | **0** |

---

[上一章：數據視覺](./plan5.md) | [返回總覽](./plan.md) | [下一章：動畫特效](./plan7.md)
