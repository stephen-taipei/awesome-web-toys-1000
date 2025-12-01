# Plan 3: 音樂視覺 Audio Visual (201-300)

> 聲音與視覺的完美結合，音樂生成、頻譜視覺化、互動樂器

[返回總覽](./plan.md)

---

## 分類概述

音樂視覺是探索聲音與視覺藝術交匯點的領域。這 100 個 toys 涵蓋音樂生成器、頻譜視覺化、樂器模擬、音效合成等多種音訊互動體驗，讓使用者透過視覺感受音樂的美妙。

### 子分類

| 子分類 | 編號 | 數量 |
|-------|------|------|
| 音樂生成器 | 201-210 | 10 |
| 節奏互動 | 211-220 | 10 |
| 頻譜視覺化 | 221-230 | 10 |
| 音效合成 | 231-240 | 10 |
| 樂器模擬 | 241-250 | 10 |
| 音訊反應 | 251-260 | 10 |
| 環境音效 | 261-270 | 10 |
| 音樂遊戲 | 271-280 | 10 |
| 聲音藝術 | 281-290 | 10 |
| 音訊實驗 | 291-300 | 10 |

---

## 音樂生成器 Music Generators (201-210)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 201 | Ambient Generator 環境音樂產生器 | 自動生成放鬆環境音樂，可調整情緒、密度、調性 | Web Audio, Tone.js | Level 1 | 待開發 |
| 202 | Chord Progression 和弦進行 | 選擇和弦自動編曲，學習音樂理論同時創作 | Web Audio, 音樂理論 | Level 1 | 待開發 |
| 203 | Melody Machine 旋律機器 | 基於音階和節奏規則自動生成旋律 | Web Audio | Level 1 | 待開發 |
| 204 | Beat Maker 節拍製作器 | 方格式節拍編輯器，拖放創作鼓點 | Web Audio, 步進音序器 | Level 1 | 待開發 |
| 205 | Music Box 音樂盒 | 旋轉音樂盒，撥動突起產生音符 | Web Audio, 3D/Canvas | Level 1 | 待開發 |
| 206 | Generative Bach 生成巴哈 | 基於巴洛克音樂規則自動作曲 | Web Audio, 對位法 | Level 1 | 待開發 |
| 207 | Jazz Improvisation 爵士即興 | AI 風格的爵士即興演奏生成 | Web Audio, 馬可夫鏈 | Level 1 | 待開發 |
| 208 | Binaural Beats 雙耳節拍 | 產生雙耳節拍，調整頻率差異達到放鬆效果 | Web Audio, 立體聲 | Level 1 | 待開發 |
| 209 | Algorithmic Composer 演算法作曲 | 使用各種演算法（細胞自動機等）產生音樂 | Web Audio | Level 1 | 待開發 |
| 210 | Endless Music 無盡音樂 | 永不重複的程序化背景音樂串流 | Web Audio | Level 1 | 待開發 |

---

## 節奏互動 Rhythm Interaction (211-220)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 211 | Tap Tempo 拍子節拍器 | 點擊偵測 BPM，自動同步節拍器 | Web Audio, 時間分析 | Level 1 | 待開發 |
| 212 | Drum Circle 鼓圈 | 多軌鼓聲循環，點擊切換開關節拍 | Web Audio | Level 1 | 待開發 |
| 213 | Polyrhythm 複節奏 | 視覺化不同節拍的疊加（3:4, 5:7 等） | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 214 | Body Percussion 身體打擊樂 | 使用攝影機偵測動作觸發打擊音效 | Web Audio, MediaDevices | Level 2 | 待開發 |
| 215 | Step Sequencer 步進音序器 | 16 步音序器，可編輯多軌音色 | Web Audio | Level 1 | 待開發 |
| 216 | Rhythm Training 節奏訓練 | 聽節奏模式然後重複打擊，訓練節奏感 | Web Audio | Level 1 | 待開發 |
| 217 | Groove Machine 律動機器 | 調整搖擺感、加速感等微時序參數 | Web Audio | Level 1 | 待開發 |
| 218 | Metronome Plus 進階節拍器 | 可變拍號、重音、分拍的專業節拍器 | Web Audio | Level 1 | 待開發 |
| 219 | Rhythm Visualizer 節奏視覺化 | 以不同幾何圖形視覺化複雜節奏 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 220 | Clap Along 一起拍手 | 跟著音樂拍手，評分同步準確度 | Web Audio | Level 1 | 待開發 |

---

## 頻譜視覺化 Spectrum Visualization (221-230)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 221 | Audio Spectrum 音訊頻譜 | 即時顯示音訊頻譜條狀圖，支援麥克風或音檔 | Canvas 2D, AnalyserNode | Level 1 | 待開發 |
| 222 | Circular Spectrum 圓形頻譜 | 頻譜以圓形放射狀顯示 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 223 | 3D Spectrum 3D 頻譜 | 頻譜在 3D 空間中呈現，可旋轉視角 | WebGL, Web Audio | Level 2 | 待開發 |
| 224 | Waveform Display 波形顯示 | 即時繪製音訊波形，示波器風格 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 225 | Spectrogram 頻譜圖 | 隨時間滾動的頻譜熱力圖 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 226 | Music Particles 音樂粒子 | 粒子系統隨音樂頻譜跳動 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 227 | Frequency Bars 頻率柱 | 大型 LED 風格的頻譜顯示 | Canvas 2D/DOM | Level 1 | 待開發 |
| 228 | Audio Landscape 音訊地景 | 頻譜轉換為 3D 地形即時變化 | WebGL, Web Audio | Level 2 | 待開發 |
| 229 | Kaleidoscope Audio 音訊萬花筒 | 頻譜驅動的萬花筒視覺效果 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 230 | Note Detection 音高偵測 | 即時偵測並顯示演奏的音符 | Web Audio, FFT | Level 1 | 待開發 |

---

## 音效合成 Sound Synthesis (231-240)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 231 | Oscillator Lab 振盪器實驗室 | 探索基本波形（正弦、方波、鋸齒、三角） | Web Audio, OscillatorNode | Level 1 | 待開發 |
| 232 | ADSR Envelope ADSR 包絡 | 視覺化並調整 Attack-Decay-Sustain-Release | Web Audio | Level 1 | 待開發 |
| 233 | Filter Playground 濾波器遊樂場 | 低通、高通、帶通濾波器即時調整 | Web Audio, BiquadFilter | Level 1 | 待開發 |
| 234 | FM Synthesis FM 合成 | 頻率調變合成器，創造金屬音色 | Web Audio | Level 1 | 待開發 |
| 235 | Additive Synth 加法合成 | 疊加諧波組合音色，視覺化傅立葉 | Web Audio | Level 1 | 待開發 |
| 236 | Subtractive Synth 減法合成 | 經典減法合成器架構 | Web Audio, Tone.js | Level 1 | 待開發 |
| 237 | Granular Synth 顆粒合成 | 將聲音切成微小顆粒重組 | Web Audio, AudioBuffer | Level 2 | 待開發 |
| 238 | Vocoder 聲碼器 | 用音樂調變語音，機器人聲音效果 | Web Audio, FFT | Level 2 | 待開發 |
| 239 | Noise Generator 噪音產生器 | 白噪、粉紅噪、棕噪等噪音類型 | Web Audio | Level 1 | 待開發 |
| 240 | Modular Synth 模組合成器 | 可視化連接模組的合成器 | Web Audio, 節點圖 | Level 2 | 待開發 |

---

## 樂器模擬 Instrument Simulation (241-250)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 241 | Virtual Piano 虛擬鋼琴 | 可用鍵盤或滑鼠彈奏的鋼琴，多種音色 | Web Audio, 採樣 | Level 1 | 待開發 |
| 242 | Drum Kit 爵士鼓組 | 點擊或按鍵演奏完整鼓組 | Web Audio, 採樣 | Level 1 | 待開發 |
| 243 | Electric Guitar 電吉他 | 滑動弦產生聲音，帶失真效果 | Web Audio | Level 1 | 待開發 |
| 244 | Theremin 特雷門琴 | 滑鼠 X/Y 控制音高和音量 | Web Audio, OscillatorNode | Level 1 | 待開發 |
| 245 | Xylophone 木琴 | 點擊彩虹色琴鍵演奏 | Web Audio | Level 1 | 待開發 |
| 246 | Hang Drum 手碟 | 互動式手碟演奏，優美的共鳴音色 | Web Audio | Level 1 | 待開發 |
| 247 | Wind Chimes 風鈴 | 滑鼠模擬風吹動風鈴 | Web Audio, 物理模擬 | Level 1 | 待開發 |
| 248 | Kalimba 卡林巴 | 拇指鋼琴互動模擬 | Web Audio | Level 1 | 待開發 |
| 249 | Steel Drums 鋼鼓 | 加勒比海鋼鼓演奏 | Web Audio | Level 1 | 待開發 |
| 250 | Recorder 直笛 | 用按鍵組合模擬直笛指法 | Web Audio | Level 1 | 待開發 |

---

## 音訊反應 Audio Reactive (251-260)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 251 | Audio Blob 音訊團塊 | 隨音樂節拍脈動的 3D 團塊 | WebGL, Web Audio | Level 2 | 待開發 |
| 252 | Dancing Lines 舞動線條 | 線條隨音樂頻率擺動 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 253 | Beat Circles 節拍圓圈 | 圓圈隨鼓點擴張收縮 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 254 | Color Pulse 色彩脈動 | 背景顏色隨音樂能量變化 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 255 | Geometry Music 幾何音樂 | 幾何圖形隨不同頻段反應 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 256 | Audio Terrain 音訊地形 | 3D 地形高度隨頻譜即時變化 | WebGL, Web Audio | Level 2 | 待開發 |
| 257 | Flower Bloom 花朵綻放 | 花朵隨音樂節奏開合 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 258 | City Lights 城市燈光 | 城市天際線燈光隨音樂閃爍 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 259 | Fireworks Audio 音樂煙火 | 煙火隨音樂高潮爆發 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 260 | VJ Visuals VJ 視覺 | 多種音訊反應視覺可切換 | Canvas 2D/WebGL | Level 1 | 待開發 |

---

## 環境音效 Ambient Sounds (261-270)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 261 | Rain Sounds 雨聲 | 程序化雨聲生成，可調整強度 | Web Audio, 噪音合成 | Level 1 | 待開發 |
| 262 | Forest Ambience 森林氛圍 | 鳥鳴、蟲聲、風聲的自然音景 | Web Audio | Level 1 | 待開發 |
| 263 | Ocean Waves 海浪聲 | 程序化海浪聲，可調整浪高 | Web Audio | Level 1 | 待開發 |
| 264 | Coffee Shop 咖啡廳 | 背景人聲、杯盤聲、咖啡機聲 | Web Audio | Level 1 | 待開發 |
| 265 | Fireplace 壁爐 | 柴火燃燒劈啪聲，搭配視覺效果 | Web Audio, Canvas | Level 1 | 待開發 |
| 266 | Wind Sounds 風聲 | 不同強度風聲生成 | Web Audio, 噪音濾波 | Level 1 | 待開發 |
| 267 | Thunderstorm 雷雨 | 雷聲、雨聲、風聲的組合 | Web Audio | Level 1 | 待開發 |
| 268 | City Noise 城市噪音 | 交通、人群、施工等都市聲景 | Web Audio | Level 1 | 待開發 |
| 269 | Space Ambience 太空氛圍 | 科幻風格的太空船環境音 | Web Audio, 合成音效 | Level 1 | 待開發 |
| 270 | Night Sounds 夜晚聲音 | 蟋蟀、貓頭鷹等夜間生物聲 | Web Audio | Level 1 | 待開發 |

---

## 音樂遊戲 Music Games (271-280)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 271 | Rhythm Game 節奏遊戲 | 按照節拍點擊下落的音符 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 272 | Simon Says 賽乃 | 記憶並重複音色與燈光序列 | Web Audio, DOM | Level 1 | 待開發 |
| 273 | Perfect Pitch 絕對音感測試 | 聽音辨認音高，訓練音感 | Web Audio | Level 1 | 待開發 |
| 274 | Interval Training 音程訓練 | 辨認兩音之間的音程 | Web Audio | Level 1 | 待開發 |
| 275 | Beat Match 節拍配對 | 調整速度讓兩首歌同步 | Web Audio | Level 1 | 待開發 |
| 276 | Musical Memory 音樂記憶 | 記憶並重複越來越長的旋律 | Web Audio | Level 1 | 待開發 |
| 277 | Chord Quiz 和弦測驗 | 聽和弦判斷大調/小調/七和弦等 | Web Audio | Level 1 | 待開發 |
| 278 | Tempo Tap 速度拍擊 | 拍擊測量並維持穩定節奏 | Web Audio | Level 1 | 待開發 |
| 279 | Scale Runner 音階跑者 | 平台遊戲風格爬音階 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 280 | DJ Scratch DJ 刮碟 | 模擬 DJ 刮碟和混音效果 | Web Audio | Level 1 | 待開發 |

---

## 聲音藝術 Sound Art (281-290)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 281 | Sound Painting 聲音繪畫 | 繪畫動作產生對應聲音 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 282 | Voice Morph 聲音變形 | 即時變聲效果（機器人、外星人等） | Web Audio, AudioWorklet | Level 2 | 待開發 |
| 283 | Sound Sculpture 聲音雕塑 | 3D 形狀決定播放的聲音 | WebGL, Web Audio | Level 2 | 待開發 |
| 284 | Sonic Meditation 聲音冥想 | 引導式聲音冥想體驗 | Web Audio | Level 1 | 待開發 |
| 285 | Drone Machine 持續音機器 | 產生緩慢演變的持續音 | Web Audio | Level 1 | 待開發 |
| 286 | Sound Poetry 聲音詩 | 將文字轉換為抽象聲音藝術 | Web Audio, 文字處理 | Level 1 | 待開發 |
| 287 | Echo Chamber 回音室 | 複雜的延遲和回聲效果鏈 | Web Audio | Level 1 | 待開發 |
| 288 | Audio Collage 音訊拼貼 | 組合多個聲音片段創作 | Web Audio | Level 1 | 待開發 |
| 289 | Glitch Audio 故障音訊 | 故意產生數位故障音效 | Web Audio | Level 1 | 待開發 |
| 290 | Soundscape Design 聲景設計 | 設計完整音訊環境場景 | Web Audio | Level 1 | 待開發 |

---

## 音訊實驗 Audio Experiments (291-300)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 291 | Spatial Audio 空間音訊 | 3D 定位音源，戴耳機體驗環繞 | Web Audio, PannerNode | Level 1 | 待開發 |
| 292 | Audio Worklet Demo 音訊工作器 | 展示 AudioWorklet 的低延遲處理 | AudioWorklet | Level 2 | 待開發 |
| 293 | MIDI Controller MIDI 控制器 | 連接 MIDI 設備控制音效 | Web MIDI API | Level 2 | 待開發 |
| 294 | Audio Recording 錄音機 | 錄製並處理麥克風輸入 | MediaRecorder | Level 1 | 待開發 |
| 295 | Convolution Reverb 卷積混響 | 使用真實空間脈衝響應的混響 | Web Audio | Level 2 | 待開發 |
| 296 | Audio Compression 音訊壓縮 | 視覺化動態範圍壓縮效果 | Web Audio, DynamicsCompressor | Level 1 | 待開發 |
| 297 | Pitch Shift 音高偏移 | 即時改變音訊音高不改變速度 | Web Audio | Level 2 | 待開發 |
| 298 | Time Stretch 時間伸縮 | 改變速度不改變音高 | Web Audio | Level 2 | 待開發 |
| 299 | Audio to MIDI 音訊轉 MIDI | 將演奏轉換為 MIDI 音符 | Web Audio, FFT | Level 2 | 待開發 |
| 300 | Web Audio Graph 音訊圖形化 | 視覺化並編輯 Web Audio 節點連接 | Web Audio, 節點編輯器 | Level 2 | 待開發 |

---

## 進度統計

| 子分類 | 待開發 | 開發中 | 已完成 | 已測試 |
|-------|-------|-------|-------|-------|
| 音樂生成器 | 10 | 0 | 0 | 0 |
| 節奏互動 | 10 | 0 | 0 | 0 |
| 頻譜視覺化 | 10 | 0 | 0 | 0 |
| 音效合成 | 10 | 0 | 0 | 0 |
| 樂器模擬 | 10 | 0 | 0 | 0 |
| 音訊反應 | 10 | 0 | 0 | 0 |
| 環境音效 | 10 | 0 | 0 | 0 |
| 音樂遊戲 | 10 | 0 | 0 | 0 |
| 聲音藝術 | 10 | 0 | 0 | 0 |
| 音訊實驗 | 10 | 0 | 0 | 0 |
| **總計** | **100** | **0** | **0** | **0** |

---

[上一章：物理模擬](./plan2.md) | [返回總覽](./plan.md) | [下一章：遊戲益智](./plan4.md)
