# Plan 1: 生成藝術 Generative Art (001-100)

> 程序化生成的視覺藝術作品，透過演算法創造獨特的圖形與動態效果

[返回總覽](./plan.md)

---

## 分類概述

生成藝術是利用數學公式、隨機演算法和程式邏輯創造視覺藝術的領域。這 100 個 toys 涵蓋了分形、粒子系統、流場、幾何圖案等多種程序化藝術形式。

### 子分類

| 子分類 | 編號 | 數量 |
|-------|------|------|
| 分形與碎形 | 001-010 | 10 |
| 粒子系統 | 011-020 | 10 |
| 流場藝術 | 021-030 | 10 |
| 幾何圖案 | 031-040 | 10 |
| 色彩演算 | 041-050 | 10 |
| 噪聲藝術 | 051-060 | 10 |
| 遞迴圖形 | 061-070 | 10 |
| 隨機生成 | 071-080 | 10 |
| 數學視覺化 | 081-090 | 10 |
| 程序紋理 | 091-100 | 10 |

---

## 分形與碎形 Fractals (001-010)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 001 | Fractal Tree 分形樹 | 滑鼠移動控制分支角度，滾輪調整遞迴層數，點擊隨機生成新樹 | Canvas 2D, 遞迴繪圖 | Level 1 | 待開發 |
| 002 | Mandelbrot Explorer 曼德博集合探索器 | 滑鼠拖曳平移，滾輪縮放，點擊設定新中心點，可無限放大探索細節 | Canvas 2D/WebGL, 複數運算 | Level 1 | 待開發 |
| 003 | Julia Set Gallery 茱莉亞集合畫廊 | 拖曳控制 c 參數即時變化圖形，滾輪縮放，可儲存喜愛的參數組合 | WebGL Shader, 複數迭代 | Level 2 | 待開發 |
| 004 | Sierpinski Triangle 謝爾賓斯基三角形 | 點擊添加隨機點，觀察混沌遊戲如何生成分形，可調整頂點數量 | Canvas 2D, 混沌遊戲演算法 | Level 1 | 待開發 |
| 005 | Koch Snowflake 科赫雪花 | 滑動調整迭代次數，觀察曲線如何趨向無限長度，可改變初始形狀 | SVG, 遞迴路徑生成 | Level 1 | 待開發 |
| 006 | Dragon Curve 龍形曲線 | 動畫展示曲線生成過程，可暫停/播放/倒轉，調整生成速度 | Canvas 2D, L-System | Level 1 | 待開發 |
| 007 | Barnsley Fern 巴恩斯利蕨 | 即時顯示 IFS 迭代過程，可調整四個仿射變換的機率權重 | Canvas 2D, IFS 演算法 | Level 1 | 待開發 |
| 008 | Burning Ship 燃燒船分形 | 類似曼德博但使用絕對值，拖曳縮放探索獨特的船形結構 | WebGL Shader | Level 2 | 待開發 |
| 009 | Fractal Clock 分形時鐘 | 時鐘指針由分形樹枝構成，即時顯示時間，分形隨時間緩慢演化 | Canvas 2D, Date API | Level 1 | 待開發 |
| 010 | 3D Mandelbulb 3D 曼德球 | 滑鼠拖曳旋轉 3D 分形，滾輪縮放，可調整 power 參數改變形狀 | WebGL, Ray Marching | Level 2 | 待開發 |

---

## 粒子系統 Particle Systems (011-020)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 011 | Particle Fountain 粒子噴泉 | 滑鼠位置控制噴射方向，點擊改變顏色，滾輪調整粒子數量 | Canvas 2D, 物理運動 | Level 1 | 待開發 |
| 012 | Mouse Trail 滑鼠軌跡 | 移動滑鼠產生絢麗粒子尾巴，可選擇不同風格（煙火、星塵、墨水） | Canvas 2D, 插值運動 | Level 1 | 待開發 |
| 013 | Gravity Points 重力點 | 點擊創建重力中心，粒子被吸引或排斥，可設定正負引力 | Canvas 2D, N-body 模擬 | Level 1 | 待開發 |
| 014 | Particle Text 粒子文字 | 輸入文字轉換為粒子組成，滑鼠靠近粒子會散開再聚合 | Canvas 2D, 文字路徑解析 | Level 1 | 待開發 |
| 015 | Confetti Explosion 彩帶爆炸 | 點擊螢幕任意位置產生彩帶爆炸效果，可選擇形狀和顏色主題 | Canvas 2D, 3D 投影 | Level 1 | 待開發 |
| 016 | Particle Wave 粒子波浪 | 粒子排列成網格，產生波浪動畫，滑鼠移動產生漣漪效果 | Canvas 2D, 正弦波 | Level 1 | 待開發 |
| 017 | Swarm Intelligence 群體智能 | 觀察 boids 演算法，粒子自動群聚飛行，可調整分離/對齊/聚集參數 | Canvas 2D, Boids 演算法 | Level 1 | 待開發 |
| 018 | Particle Image 粒子圖像 | 上傳圖片轉換為粒子，滑鼠互動讓粒子散開，放開後復原 | Canvas 2D, 圖像採樣 | Level 1 | 待開發 |
| 019 | Galaxy Simulation 銀河模擬 | 模擬螺旋星系，可調整旋臂數量、星星密度，點擊產生超新星爆炸 | WebGL, 大量粒子渲染 | Level 2 | 待開發 |
| 020 | Particle Music 粒子音樂 | 粒子碰撞邊界或彼此時產生音符，創造隨機音樂，可調整音階 | Canvas 2D, Web Audio | Level 1 | 待開發 |

---

## 流場藝術 Flow Fields (021-030)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 021 | Perlin Flow 柏林流場 | 粒子沿著 Perlin 噪聲流場移動，產生如絲綢般的軌跡藝術 | Canvas 2D, Perlin Noise | Level 1 | 待開發 |
| 022 | Magnetic Field 磁場視覺化 | 模擬磁鐵周圍的磁力線，可拖曳磁極位置，觀察場線變化 | Canvas 2D, 向量場 | Level 1 | 待開發 |
| 023 | Wind Map 風場地圖 | 粒子模擬風的流動，可調整風速風向，產生動態天氣效果 | Canvas 2D, 向量場插值 | Level 1 | 待開發 |
| 024 | Curl Noise 捲曲噪聲 | 使用 curl noise 產生無發散流場，粒子永不相交的優雅運動 | WebGL, GLSL Shader | Level 2 | 待開發 |
| 025 | Flow Painting 流場繪畫 | 在畫布上繪製流場方向，粒子依照繪製路徑流動 | Canvas 2D, 自訂向量場 | Level 1 | 待開發 |
| 026 | Vortex Field 漩渦場 | 點擊創建順時針或逆時針漩渦，粒子被捲入螺旋運動 | Canvas 2D, 極座標 | Level 1 | 待開發 |
| 027 | Electric Field 電場模擬 | 放置正負電荷，觀察電力線分布，可測量任一點的場強 | SVG/Canvas, 庫侖定律 | Level 1 | 待開發 |
| 028 | Flow Typography 流動文字 | 文字沿著流場路徑排列，產生動態書法效果 | Canvas 2D, 文字路徑 | Level 1 | 待開發 |
| 029 | Gradient Flow 梯度流 | 粒子沿著顏色梯度方向流動，可繪製自訂梯度場 | Canvas 2D, 梯度計算 | Level 1 | 待開發 |
| 030 | Audio Flow 音訊流場 | 麥克風輸入控制流場強度，音量影響粒子速度和密度 | Canvas 2D, Web Audio | Level 1 | 待開發 |

---

## 幾何圖案 Geometric Patterns (031-040)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 031 | Sacred Geometry 神聖幾何 | 互動式生命之花、梅塔特隆立方等神聖幾何圖形，可調整複雜度 | SVG, 幾何計算 | Level 1 | 待開發 |
| 032 | Islamic Patterns 伊斯蘭圖案 | 生成傳統伊斯蘭幾何圖案，可調整對稱性、顏色、複雜度 | SVG, 對稱群 | Level 1 | 待開發 |
| 033 | Kaleidoscope 萬花筒 | 即時鏡像反射效果，滑鼠繪製自動產生對稱圖案 | Canvas 2D, 鏡像變換 | Level 1 | 待開發 |
| 034 | Spirograph 螺旋圖形儀 | 模擬螺旋繪圖玩具，調整齒輪半徑比例產生不同花紋 | Canvas 2D, 參數方程 | Level 1 | 待開發 |
| 035 | Tessellation 鑲嵌圖案 | 選擇基本形狀，自動生成無縫鑲嵌圖案，可旋轉、縮放 | SVG, 平面群 | Level 1 | 待開發 |
| 036 | Op Art Generator 歐普藝術生成器 | 產生視覺錯覺幾何圖案，調整參數創造動態視覺效果 | Canvas 2D, 莫列波紋 | Level 1 | 待開發 |
| 037 | Penrose Tiling 彭羅斯鑲嵌 | 非週期性鋪磚，點擊添加新磚塊，探索準晶體結構 | Canvas 2D, 遞迴細分 | Level 1 | 待開發 |
| 038 | Celtic Knots 凱爾特結 | 互動式編織結繪製，自動計算交叉上下關係 | SVG, 路徑計算 | Level 1 | 待開發 |
| 039 | Guilloche Patterns 機刻圖案 | 鈔票上的精細幾何圖案，調整參數生成防偽圖紋 | SVG, 參數曲線 | Level 1 | 待開發 |
| 040 | Geometric Morph 幾何變形 | 一個幾何圖形平滑過渡到另一個，可設定起點終點形狀 | Canvas 2D, 頂點插值 | Level 1 | 待開發 |

---

## 色彩演算 Color Algorithms (041-050)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 041 | Color Harmony 色彩和諧 | 選擇一個顏色，自動生成互補、類比、三角等配色方案 | Canvas 2D, HSL 色彩空間 | Level 1 | 待開發 |
| 042 | Gradient Generator 漸層生成器 | 多點漸層編輯，支援線性、放射、錐形漸層，可匯出 CSS | Canvas 2D, 漸層插值 | Level 1 | 待開發 |
| 043 | Color Blindness Simulator 色盲模擬器 | 上傳圖片模擬不同類型色盲視角，了解無障礙設計 | Canvas 2D, 色彩矩陣 | Level 1 | 待開發 |
| 044 | Palette Extractor 調色盤萃取 | 從上傳的圖片中萃取主要顏色，生成調色盤 | Canvas 2D, K-means 聚類 | Level 1 | 待開發 |
| 045 | Color Space Explorer 色彩空間探索 | 3D 視覺化 RGB、HSL、LAB 等色彩空間，理解顏色關係 | WebGL, 3D 座標系 | Level 2 | 待開發 |
| 046 | Mood Colors 情緒色彩 | 選擇情緒，生成對應的色彩組合，學習色彩心理學 | Canvas 2D, 色彩理論 | Level 1 | 待開發 |
| 047 | Color Mixing 色彩混合 | 模擬顏料混合（減色法）和光線混合（加色法） | Canvas 2D, 色彩混合模式 | Level 1 | 待開發 |
| 048 | Chromatic Aberration 色差效果 | 模擬鏡頭色差效果，可調整偏移量和方向 | WebGL Shader | Level 2 | 待開發 |
| 049 | Color Sorting 顏色排序 | 打亂的顏色方塊，拖曳排列成彩虹序列，計時挑戰 | DOM/Canvas, 拖放 API | Level 1 | 待開發 |
| 050 | Synesthesia 聯覺體驗 | 鍵盤彈奏音符，每個音符對應特定顏色視覺效果 | Canvas 2D, Web Audio | Level 1 | 待開發 |

---

## 噪聲藝術 Noise Art (051-060)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 051 | Perlin Landscape 柏林地景 | 即時生成連綿山脈地形，滑鼠控制視角，可調整地形參數 | Canvas 2D, Perlin Noise | Level 1 | 待開發 |
| 052 | Simplex Clouds 單純雲朵 | 程序化雲朵生成，隨風飄動的動態天空效果 | WebGL Shader, Simplex Noise | Level 2 | 待開發 |
| 053 | Noise Terrain 噪聲地形 | 3D 視角的噪聲地形，可飛行探索，即時生成無限世界 | WebGL, 地形生成 | Level 2 | 待開發 |
| 054 | Marble Texture 大理石紋理 | 程序化生成大理石紋理，可調整紋路、顏色、亂度 | WebGL Shader | Level 2 | 待開發 |
| 055 | Wood Grain 木紋生成 | 程序化年輪木紋，可調整密度、曲折、顏色 | Canvas 2D, 擾動函數 | Level 1 | 待開發 |
| 056 | Noise Warp 噪聲扭曲 | 上傳圖片用噪聲場扭曲，產生迷幻視覺效果 | WebGL Shader | Level 2 | 待開發 |
| 057 | Cellular Noise 細胞噪聲 | Worley noise 視覺化，產生細胞、氣泡、石頭紋理 | WebGL Shader | Level 2 | 待開發 |
| 058 | Noise Music 噪聲音樂 | 將噪聲值轉換為音符序列，視覺化的隨機音樂生成 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 059 | Domain Warping 域扭曲 | 將噪聲作為輸入餵給另一個噪聲，產生複雜有機形態 | WebGL Shader | Level 2 | 待開發 |
| 060 | Noise Comparison 噪聲比較 | 並排比較 Perlin、Simplex、Worley 等不同噪聲演算法 | Canvas 2D/WebGL | Level 1 | 待開發 |

---

## 遞迴圖形 Recursive Graphics (061-070)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 061 | Recursive Squares 遞迴方形 | 方形內部不斷分割成更小方形，可調整分割規則和深度 | Canvas 2D, 遞迴 | Level 1 | 待開發 |
| 062 | Droste Effect 德羅斯特效應 | 圖片中包含自己的無限遞迴效果，可上傳自訂圖片 | WebGL Shader | Level 2 | 待開發 |
| 063 | L-System Garden L系統花園 | 使用 L-System 語法生成植物，可編輯規則即時預覽 | Canvas 2D, 字串重寫 | Level 1 | 待開發 |
| 064 | Apollonian Gasket 阿波羅墊片 | 圓形遞迴填充，點擊任一圓繼續細分，無限深入 | Canvas 2D, 反演幾何 | Level 1 | 待開發 |
| 065 | Recursive Tree Art 遞迴樹藝術 | 每個樹枝都是縮小的整棵樹，可調整縮放比和角度 | Canvas 2D, 遞迴繪圖 | Level 1 | 待開發 |
| 066 | Hilbert Curve 希爾伯特曲線 | 動畫展示空間填充曲線的生成過程，可調整階數 | Canvas 2D, 遞迴路徑 | Level 1 | 待開發 |
| 067 | Menger Sponge 門格海綿 | 3D 遞迴立方體移除，可旋轉查看，調整遞迴層數 | WebGL, 3D 遞迴 | Level 2 | 待開發 |
| 068 | Fractal Tree Customizer 分形樹定制器 | 完整的分形樹編輯器，可調整所有參數並儲存/載入配置 | Canvas 2D | Level 1 | 待開發 |
| 069 | Recursive Circles 遞迴圓形 | 圓形遞迴排列，產生曼陀羅般的對稱圖案 | SVG, 遞迴生成 | Level 1 | 待開發 |
| 070 | Code Visualization 程式碼視覺化 | 輸入遞迴程式碼，視覺化其執行過程和呼叫堆疊 | Canvas 2D, 程式解析 | Level 1 | 待開發 |

---

## 隨機生成 Random Generation (071-080)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 071 | Random Walker 隨機漫步 | 粒子隨機行走留下軌跡，可選擇不同行走規則 | Canvas 2D, 隨機數 | Level 1 | 待開發 |
| 072 | Generative Faces 生成人臉 | 隨機生成卡通臉孔，可鎖定喜歡的特徵繼續變化其他 | SVG, 參數化繪圖 | Level 1 | 待開發 |
| 073 | Random City 隨機城市 | 程序化生成城市天際線，可調整建築密度和風格 | Canvas 2D, 隨機規則 | Level 1 | 待開發 |
| 074 | Abstract Generator 抽象畫生成器 | 一鍵生成隨機抽象藝術，可調整風格傾向（幾何/有機） | Canvas 2D | Level 1 | 待開發 |
| 075 | Name Generator 名字生成器 | 生成隨機幻想名字，可選類型（精靈、矮人、太空等） | DOM, 馬可夫鏈 | Level 1 | 待開發 |
| 076 | Procedural Planet 程序星球 | 隨機生成行星紋理，可旋轉查看，調整氣候類型 | WebGL, 球面噪聲 | Level 2 | 待開發 |
| 077 | Random Melody 隨機旋律 | 基於音樂理論規則生成隨機旋律，可選調性和風格 | Web Audio, 音樂理論 | Level 1 | 待開發 |
| 078 | Blob Generator Blob 生成器 | 隨機有機形狀生成，可調整圓滑度、複雜度，匯出 SVG | SVG, 貝茲曲線 | Level 1 | 待開發 |
| 079 | Random Gradient 隨機漸層 | 每次生成獨特漸層組合，可複製 CSS 代碼使用 | Canvas 2D, CSS 生成 | Level 1 | 待開發 |
| 080 | Seed Art 種子藝術 | 輸入任意文字作為種子，生成確定性隨機藝術 | Canvas 2D, 種子隨機 | Level 1 | 待開發 |

---

## 數學視覺化 Mathematical Visualization (081-090)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 081 | Fourier Drawing 傅立葉繪圖 | 用旋轉圓組合繪製任意形狀，視覺化傅立葉級數 | Canvas 2D, FFT | Level 1 | 待開發 |
| 082 | Prime Spiral 質數螺旋 | 烏拉姆螺旋視覺化，展示質數的神秘規律 | Canvas 2D, 質數演算法 | Level 1 | 待開發 |
| 083 | Pi Visualization 圓周率視覺化 | 多種方式視覺化 π 的數字，探索是否有規律 | Canvas 2D, 數學常數 | Level 1 | 待開發 |
| 084 | Golden Ratio 黃金比例 | 互動式黃金比例探索，螺旋、矩形、自然界實例 | SVG, 數學繪圖 | Level 1 | 待開發 |
| 085 | Complex Functions 複數函數 | 視覺化複數函數映射，輸入區域變換後的結果 | WebGL, 複數運算 | Level 2 | 待開發 |
| 086 | Lorenz Attractor 洛倫茲吸引子 | 3D 混沌系統視覺化，可調整參數觀察蝴蝶效應 | WebGL, 微分方程 | Level 2 | 待開發 |
| 087 | Fibonacci Spiral 費波那契螺旋 | 動態展示費波那契數列與黃金螺旋的關係 | Canvas 2D, 數列 | Level 1 | 待開發 |
| 088 | Sine Wave Composer 正弦波合成器 | 疊加多個正弦波，視覺化波的疊加原理 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 089 | Hyperbolic Geometry 雙曲幾何 | 探索龐加萊圓盤模型，雙曲空間中的直線和圓 | Canvas 2D, 雙曲函數 | Level 1 | 待開發 |
| 090 | Chaos Game 混沌遊戲 | 可自訂頂點數和規則，探索不同分形的形成 | Canvas 2D, 迭代函數 | Level 1 | 待開發 |

---

## 程序紋理 Procedural Textures (091-100)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 091 | Brick Pattern 磚牆紋理 | 程序化磚牆圖案，可調整尺寸、顏色、磨損效果 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 092 | Fabric Weave 布料編織 | 模擬不同編織圖案（斜紋、緞紋、提花） | Canvas 2D, 像素圖案 | Level 1 | 待開發 |
| 093 | Metal Texture 金屬材質 | 程序化生成拉絲金屬、鏽蝕等金屬表面紋理 | WebGL Shader | Level 2 | 待開發 |
| 094 | Leather Texture 皮革紋理 | 程序化皮革紋理，可調整紋理密度和顏色 | WebGL Shader | Level 2 | 待開發 |
| 095 | Water Caustics 水波焦散 | 模擬陽光穿透水面的光影效果 | WebGL Shader | Level 2 | 待開發 |
| 096 | Tile Pattern 磁磚圖案 | 可編輯的無縫磁磚圖案編輯器 | Canvas 2D, 平鋪 | Level 1 | 待開發 |
| 097 | Paper Texture 紙張紋理 | 程序化紙張纖維紋理，可調整粗糙度 | Canvas 2D, 噪聲 | Level 1 | 待開發 |
| 098 | Camouflage 迷彩圖案 | 生成不同風格迷彩圖案（森林、沙漠、數位） | Canvas 2D, 泰森多邊形 | Level 1 | 待開發 |
| 099 | Terrain Texture 地形紋理 | 從高度圖生成地形紋理（草地、岩石、雪） | WebGL Shader | Level 2 | 待開發 |
| 100 | Texture Combiner 紋理合成器 | 混合多個程序紋理，創建複合材質效果 | WebGL, 多通道 | Level 2 | 待開發 |

---

## 進度統計

| 子分類 | 待開發 | 開發中 | 已完成 | 已測試 |
|-------|-------|-------|-------|-------|
| 分形與碎形 | 10 | 0 | 0 | 0 |
| 粒子系統 | 10 | 0 | 0 | 0 |
| 流場藝術 | 10 | 0 | 0 | 0 |
| 幾何圖案 | 10 | 0 | 0 | 0 |
| 色彩演算 | 10 | 0 | 0 | 0 |
| 噪聲藝術 | 10 | 0 | 0 | 0 |
| 遞迴圖形 | 10 | 0 | 0 | 0 |
| 隨機生成 | 10 | 0 | 0 | 0 |
| 數學視覺化 | 10 | 0 | 0 | 0 |
| 程序紋理 | 10 | 0 | 0 | 0 |
| **總計** | **100** | **0** | **0** | **0** |

---

[返回總覽](./plan.md) | [下一章：物理模擬](./plan2.md)
