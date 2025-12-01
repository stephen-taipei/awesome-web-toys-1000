# Plan 2: 物理模擬 Physics Simulation (101-200)

> 真實物理現象的互動模擬，從重力到流體，從碰撞到布料

[返回總覽](./plan.md)

---

## 分類概述

物理模擬是透過數學模型重現真實世界物理現象的互動體驗。這 100 個 toys 涵蓋重力、流體、碰撞、彈性、布料等各種物理效果，讓使用者直觀感受物理定律的運作。

### 子分類

| 子分類 | 編號 | 數量 |
|-------|------|------|
| 重力模擬 | 101-110 | 10 |
| 流體動力 | 111-120 | 10 |
| 碰撞偵測 | 121-130 | 10 |
| 彈性物理 | 131-140 | 10 |
| 布料模擬 | 141-150 | 10 |
| 軟體物理 | 151-160 | 10 |
| 剛體動力 | 161-170 | 10 |
| 電磁模擬 | 171-180 | 10 |
| 波動物理 | 181-190 | 10 |
| 氣體動力 | 191-200 | 10 |

---

## 重力模擬 Gravity Simulation (101-110)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 101 | Gravity Sandbox 重力沙盒 | 點擊放置星球，觀察軌道運動，可調整質量和初速度 | Canvas 2D, 萬有引力 | Level 1 | 待開發 |
| 102 | Orbital Mechanics 軌道力學 | 發射衛星進入軌道，學習開普勒定律，可設定目標軌道 | Canvas 2D, 二體問題 | Level 1 | 待開發 |
| 103 | Three Body Problem 三體問題 | 觀察三個天體的混沌運動，微調初始條件看不同結果 | Canvas 2D, N體模擬 | Level 1 | 待開發 |
| 104 | Black Hole 黑洞模擬 | 粒子被黑洞吸引扭曲，視覺化重力透鏡效果 | WebGL Shader, 廣義相對論 | Level 2 | 待開發 |
| 105 | Pendulum Lab 擺錘實驗室 | 單擺、雙擺、多擺實驗，觀察週期與混沌現象 | Canvas 2D, 擺動方程 | Level 1 | 待開發 |
| 106 | Projectile Motion 拋體運動 | 調整角度和力道發射物體，觀察拋物線軌跡 | Canvas 2D, 運動方程 | Level 1 | 待開發 |
| 107 | Falling Objects 落體實驗 | 比較真空和有空氣阻力的落體運動，驗證伽利略 | Canvas 2D, 空氣阻力 | Level 1 | 待開發 |
| 108 | Gravity Well 重力井 | 橡皮布模型視覺化重力場彎曲時空的概念 | WebGL, 3D 網格變形 | Level 2 | 待開發 |
| 109 | Lunar Lander 登月小艇 | 控制推進器安全降落月球表面，燃料有限 | Canvas 2D, 推力物理 | Level 1 | 待開發 |
| 110 | Solar System 太陽系模型 | 可縮放的太陽系模擬，可加速時間觀察行星運行 | Canvas 2D/WebGL | Level 1 | 待開發 |

---

## 流體動力 Fluid Dynamics (111-120)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 111 | Fluid Simulation 流體模擬 | 滑鼠拖曳攪動流體，觀察渦流和擴散效果 | WebGL, Navier-Stokes | Level 2 | 待開發 |
| 112 | Ink Drop 墨滴擴散 | 點擊滴入彩色墨水，觀察混合擴散效果 | WebGL, 對流擴散 | Level 2 | 待開發 |
| 113 | Smoke Simulation 煙霧模擬 | 產生煙霧並用滑鼠吹動，調整密度和消散速度 | WebGL, 流體求解器 | Level 2 | 待開發 |
| 114 | Water Ripple 水波漣漪 | 點擊水面產生漣漪，多波互相干涉 | Canvas 2D, 波動方程 | Level 1 | 待開發 |
| 115 | Lava Lamp 熔岩燈 | 模擬熔岩燈中蠟球的上升下降運動 | Canvas 2D/WebGL, 浮力 | Level 1 | 待開發 |
| 116 | Pouring Water 倒水模擬 | 傾斜容器倒出液體，液體流動和飛濺效果 | WebGL, SPH | Level 3 | 待開發 |
| 117 | Blood Flow 血流模擬 | 模擬血管中的血液流動，可縮放觀察細胞 | Canvas 2D, 層流 | Level 1 | 待開發 |
| 118 | Ocean Waves 海浪模擬 | 3D 海洋波浪，可調整風速和浪高 | WebGL, FFT 海洋 | Level 2 | 待開發 |
| 119 | Viscosity 黏度比較 | 比較不同黏度液體（水、蜂蜜、岩漿）的流動特性 | Canvas 2D, 黏度係數 | Level 1 | 待開發 |
| 120 | Pressure Waves 壓力波 | 視覺化流體中的壓力波傳播，如音爆效果 | WebGL | Level 2 | 待開發 |

---

## 碰撞偵測 Collision Detection (121-130)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 121 | Ball Pit 球池 | 大量圓球互相碰撞，可搖晃螢幕（使用陀螺儀） | Canvas 2D, 圓形碰撞 | Level 1 | 待開發 |
| 122 | Billiards 撞球模擬 | 完整撞球遊戲物理，摩擦、旋轉、碰撞反彈 | Canvas 2D, 動量守恆 | Level 1 | 待開發 |
| 123 | Newton's Cradle 牛頓擺 | 經典動量演示器，可調整球數和初始擺動 | Canvas 2D, 彈性碰撞 | Level 1 | 待開發 |
| 124 | Breakout Physics 打磚塊物理 | 打磚塊遊戲但專注於真實的碰撞物理效果 | Canvas 2D, AABB 碰撞 | Level 1 | 待開發 |
| 125 | Polygon Collision 多邊形碰撞 | 任意凸多邊形的碰撞偵測與反應視覺化 | Canvas 2D, SAT 演算法 | Level 1 | 待開發 |
| 126 | Marble Run 彈珠軌道 | 設計軌道讓彈珠滾動，包含彈簧、翹板等機關 | Canvas 2D/Matter.js | Level 1 | 待開發 |
| 127 | Domino Effect 多米諾骨牌 | 排列骨牌然後推倒第一張，觀察連鎖反應 | Canvas 2D, 剛體鏈 | Level 1 | 待開發 |
| 128 | Pinball Machine 彈珠台 | 可玩的彈珠台遊戲，包含彈簧、擋板、得分 | Canvas 2D, 複合碰撞 | Level 1 | 待開發 |
| 129 | Particle Collider 粒子對撞 | 模擬高能粒子對撞，產生新粒子的效果 | Canvas 2D, 粒子物理 | Level 1 | 待開發 |
| 130 | Continuous Collision 連續碰撞 | 演示高速物體的連續碰撞偵測，防止穿透 | Canvas 2D, CCD | Level 1 | 待開發 |

---

## 彈性物理 Elastic Physics (131-140)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 131 | Spring System 彈簧系統 | 連接多個彈簧和質點，拖曳觀察振動傳播 | Canvas 2D, 虎克定律 | Level 1 | 待開發 |
| 132 | Slingshot 彈弓 | 拉動彈弓發射物體，彈性勢能轉換為動能 | Canvas 2D, 彈性位能 | Level 1 | 待開發 |
| 133 | Rubber Band 橡皮筋 | 兩端固定的橡皮筋，拖曳中間觀察形變 | Canvas 2D, 彈性變形 | Level 1 | 待開發 |
| 134 | Bouncing Ball 彈跳球 | 調整彈性係數觀察不同材質球的彈跳行為 | Canvas 2D, 恢復係數 | Level 1 | 待開發 |
| 135 | Trampoline 彈跳床 | 物體在彈跳床上反覆彈跳，可調整彈性 | Canvas 2D, 彈簧網 | Level 1 | 待開發 |
| 136 | Jelly Cube 果凍方塊 | 軟 Q 果凍的彈性形變，拖曳和碰撞後晃動 | Canvas 2D, 質點彈簧 | Level 1 | 待開發 |
| 137 | Stress Strain 應力應變 | 視覺化材料的應力應變曲線，彈性極限與塑性 | Canvas 2D, 材料力學 | Level 1 | 待開發 |
| 138 | Resonance 共振現象 | 調整振動頻率找到共振點，橋樑共振演示 | Canvas 2D, 諧振 | Level 1 | 待開發 |
| 139 | Elastic Collision 彈性碰撞 | 完美彈性碰撞的能量與動量守恆視覺化 | Canvas 2D, 守恆定律 | Level 1 | 待開發 |
| 140 | Bungee Jump 高空彈跳 | 模擬彈力繩的非線性彈性行為 | Canvas 2D, 非線性彈簧 | Level 1 | 待開發 |

---

## 布料模擬 Cloth Simulation (141-150)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 141 | Cloth Physics 布料物理 | 拖曳布料角落或放開讓其自然垂落 | Canvas 2D, Verlet 積分 | Level 1 | 待開發 |
| 142 | Flag Wave 旗幟飄揚 | 風中飄動的旗幟，可調整風速和方向 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 143 | Curtain 窗簾模擬 | 可拉開拉上的窗簾，自然皺褶效果 | Canvas 2D | Level 1 | 待開發 |
| 144 | Rope Swing 繩索擺盪 | 繩索物理模擬，可抓住繩索擺盪 | Canvas 2D, 繩索約束 | Level 1 | 待開發 |
| 145 | Tear Cloth 撕裂布料 | 用力拖曳可撕裂布料，布料會分離 | Canvas 2D, 約束斷裂 | Level 1 | 待開發 |
| 146 | Spider Web 蜘蛛網 | 蜘蛛網物理，昆蟲碰撞造成振動 | Canvas 2D, 網狀約束 | Level 1 | 待開發 |
| 147 | Hammock 吊床 | 可坐的吊床物理，物體重量造成下垂 | Canvas 2D | Level 1 | 待開發 |
| 148 | Cape Physics 披風物理 | 隨角色移動飄動的披風效果 | Canvas 2D | Level 1 | 待開發 |
| 149 | Net Catching 網子捕捉 | 拋出網子捕捉物體，網子包覆物體 | Canvas 2D | Level 1 | 待開發 |
| 150 | 3D Cloth 3D 布料 | 3D 空間中的布料模擬，可旋轉視角 | WebGL, 3D 約束 | Level 2 | 待開發 |

---

## 軟體物理 Soft Body Physics (151-160)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 151 | Blob 軟體球 | 可拖曳擠壓的軟 Q 球體，碰撞後變形恢復 | Canvas 2D, 壓力軟體 | Level 1 | 待開發 |
| 152 | Slime 史萊姆 | 黏呼呼的史萊姆物理，可拉伸分離再融合 | Canvas 2D, 軟體動力 | Level 1 | 待開發 |
| 153 | Jelly Monster 果凍怪物 | 可控制的果凍角色，跳躍和移動時形變 | Canvas 2D | Level 1 | 待開發 |
| 154 | Water Balloon 水球 | 裝滿水的氣球物理，搖晃和碰撞的行為 | Canvas 2D | Level 1 | 待開發 |
| 155 | Stress Ball 減壓球 | 擠壓減壓球，球體變形後慢慢恢復 | Canvas 2D, 應力鬆弛 | Level 1 | 待開發 |
| 156 | Fat Cat 胖胖貓 | 軟體物理的卡通貓咪，可戳和拖曳 | Canvas 2D | Level 1 | 待開發 |
| 157 | Dough 麵團 | 可揉捏的麵團，保留形變歷史 | Canvas 2D, 塑性變形 | Level 1 | 待開發 |
| 158 | Tire 輪胎物理 | 充氣輪胎碰撞和滾動的行為模擬 | Canvas 2D | Level 1 | 待開發 |
| 159 | Muscle Flex 肌肉收縮 | 模擬肌肉收縮放鬆，拉動骨骼運動 | Canvas 2D, 生物力學 | Level 1 | 待開發 |
| 160 | Amoeba 變形蟲 | 自主運動的變形蟲模擬，偽足運動 | Canvas 2D | Level 1 | 待開發 |

---

## 剛體動力 Rigid Body Dynamics (161-170)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 161 | Box Stacking 堆疊方塊 | 堆疊方塊並觀察穩定性，可增加震動 | Canvas 2D/Matter.js | Level 1 | 待開發 |
| 162 | Angry Birds Clone 憤怒鳥 | 彈弓發射物體摧毀建築物的物理模擬 | Canvas 2D, 剛體物理 | Level 1 | 待開發 |
| 163 | Ragdoll 布娃娃物理 | 可拖曳的布娃娃人偶，關節約束 | Canvas 2D, 鉸鏈約束 | Level 1 | 待開發 |
| 164 | Car Physics 車輛物理 | 簡單車輛物理，加速、煞車、過彎 | Canvas 2D | Level 1 | 待開發 |
| 165 | Jenga Tower 疊疊樂 | 抽取積木的疊疊樂遊戲物理 | Canvas 2D/3D | Level 1 | 待開發 |
| 166 | Gear System 齒輪系統 | 連動齒輪組，調整齒數改變傳動比 | Canvas 2D, 齒輪約束 | Level 1 | 待開發 |
| 167 | Wrecking Ball 破壞球 | 擺動的破壞球撞擊建築物 | Canvas 2D | Level 1 | 待開發 |
| 168 | See Saw 蹺蹺板 | 蹺蹺板平衡物理，放置物體尋找平衡 | Canvas 2D, 力矩 | Level 1 | 待開發 |
| 169 | Spinning Top 陀螺儀 | 旋轉陀螺的進動和章動模擬 | WebGL, 角動量 | Level 2 | 待開發 |
| 170 | Bridge Builder 橋樑建造 | 建造橋樑結構承受載重，結構力學 | Canvas 2D, 結構分析 | Level 1 | 待開發 |

---

## 電磁模擬 Electromagnetic Simulation (171-180)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 171 | Electric Charges 電荷互動 | 放置正負電荷，觀察電力線和運動 | Canvas 2D, 庫侖定律 | Level 1 | 待開發 |
| 172 | Magnet Simulation 磁鐵模擬 | 模擬磁鐵相吸相斥，磁力線視覺化 | Canvas 2D, 磁場 | Level 1 | 待開發 |
| 173 | Compass 指南針 | 虛擬指南針受磁場影響，可放置磁鐵干擾 | Canvas 2D | Level 1 | 待開發 |
| 174 | Electromagnetic Wave 電磁波 | 電場磁場交互產生波的視覺化 | WebGL, 3D 波動 | Level 2 | 待開發 |
| 175 | Electric Motor 電動機 | 簡化電動機模型，電流在磁場中受力 | Canvas 2D, 勞倫茲力 | Level 1 | 待開發 |
| 176 | Van de Graaff 范德格拉夫 | 靜電產生器模擬，頭髮豎起效果 | Canvas 2D | Level 1 | 待開發 |
| 177 | Lightning 閃電模擬 | 程序化閃電生成，可調整分支參數 | Canvas 2D | Level 1 | 待開發 |
| 178 | Cathode Ray 陰極射線管 | 電子束受電磁場偏轉的模擬 | Canvas 2D | Level 1 | 待開發 |
| 179 | Faraday Cage 法拉第籠 | 視覺化電磁屏蔽效果 | Canvas 2D | Level 1 | 待開發 |
| 180 | Electromagnetic Spectrum 電磁頻譜 | 互動式電磁波頻譜探索 | SVG/Canvas | Level 1 | 待開發 |

---

## 波動物理 Wave Physics (181-190)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 181 | Wave Interference 波的干涉 | 兩波源產生干涉圖案，調整頻率和相位 | Canvas 2D, 波動疊加 | Level 1 | 待開發 |
| 182 | Doppler Effect 都卜勒效應 | 移動波源的頻率變化視覺化 | Canvas 2D, 頻率偏移 | Level 1 | 待開發 |
| 183 | Standing Wave 駐波 | 弦上駐波形成，調整頻率找到諧波 | Canvas 2D | Level 1 | 待開發 |
| 184 | Slinky Wave 彈簧波 | 模擬彈簧玩具上的縱波和橫波傳播 | Canvas 2D | Level 1 | 待開發 |
| 185 | Diffraction 繞射模擬 | 波通過狹縫的繞射圖案視覺化 | Canvas 2D, 惠更斯原理 | Level 1 | 待開發 |
| 186 | Seismic Waves 地震波 | 模擬 P 波和 S 波在地層中傳播 | Canvas 2D | Level 1 | 待開發 |
| 187 | Sound Visualization 聲波視覺化 | 麥克風輸入即時視覺化聲波波形 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 188 | String Vibration 弦振動 | 撥動琴弦產生的振動和諧波分析 | Canvas 2D | Level 1 | 待開發 |
| 189 | Refraction 折射 | 光波穿過不同介質的折射行為 | Canvas 2D, 斯涅爾定律 | Level 1 | 待開發 |
| 190 | Wave Equation 波動方程 | 視覺化 1D 和 2D 波動方程的解 | Canvas 2D/WebGL | Level 1 | 待開發 |

---

## 氣體動力 Gas Dynamics (191-200)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 191 | Ideal Gas 理想氣體 | PVT 關係模擬，調整活塞觀察壓力變化 | Canvas 2D, 氣體定律 | Level 1 | 待開發 |
| 192 | Brownian Motion 布朗運動 | 觀察小粒子被分子碰撞的隨機運動 | Canvas 2D | Level 1 | 待開發 |
| 193 | Gas Diffusion 氣體擴散 | 兩種顏色氣體混合擴散的過程 | Canvas 2D | Level 1 | 待開發 |
| 194 | Heat Conduction 熱傳導 | 熱能在物體中傳導的視覺化 | Canvas 2D, 熱方程 | Level 1 | 待開發 |
| 195 | Convection 對流 | 加熱流體產生對流循環的視覺化 | Canvas 2D | Level 1 | 待開發 |
| 196 | Balloon Inflation 氣球充氣 | 對氣球充氣，觀察壓力和體積變化 | Canvas 2D | Level 1 | 待開發 |
| 197 | Vacuum Chamber 真空室 | 抽取空氣觀察各種現象（氣球膨脹等） | Canvas 2D | Level 1 | 待開發 |
| 198 | Entropy 熵增原理 | 視覺化系統趨向無序的過程 | Canvas 2D | Level 1 | 待開發 |
| 199 | Rocket Propulsion 火箭推進 | 氣體噴射產生推力的火箭物理 | Canvas 2D | Level 1 | 待開發 |
| 200 | Bernoulli Effect 白努利效應 | 飛機機翼升力的原理視覺化 | Canvas 2D | Level 1 | 待開發 |

---

## 進度統計

| 子分類 | 待開發 | 開發中 | 已完成 | 已測試 |
|-------|-------|-------|-------|-------|
| 重力模擬 | 10 | 0 | 0 | 0 |
| 流體動力 | 10 | 0 | 0 | 0 |
| 碰撞偵測 | 10 | 0 | 0 | 0 |
| 彈性物理 | 10 | 0 | 0 | 0 |
| 布料模擬 | 10 | 0 | 0 | 0 |
| 軟體物理 | 10 | 0 | 0 | 0 |
| 剛體動力 | 10 | 0 | 0 | 0 |
| 電磁模擬 | 10 | 0 | 0 | 0 |
| 波動物理 | 10 | 0 | 0 | 0 |
| 氣體動力 | 10 | 0 | 0 | 0 |
| **總計** | **100** | **0** | **0** | **0** |

---

[上一章：生成藝術](./plan1.md) | [返回總覽](./plan.md) | [下一章：音樂視覺](./plan3.md)
