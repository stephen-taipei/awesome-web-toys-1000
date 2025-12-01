# Plan 9: 自然模擬 Nature Simulation (801-900)

> 天氣、植物、動物、生態、天體、自然現象的互動模擬

[返回總覽](./plan.md)

---

## 分類概述

自然模擬是透過程式重現大自然奧妙的領域。這 100 個 toys 涵蓋天氣系統、植物生長、動物行為、生態系統、天體運動等各種自然現象的互動模擬。

### 子分類

| 子分類 | 編號 | 數量 |
|-------|------|------|
| 天氣系統 | 801-810 | 10 |
| 植物生長 | 811-820 | 10 |
| 動物行為 | 821-830 | 10 |
| 生態系統 | 831-840 | 10 |
| 地質現象 | 841-850 | 10 |
| 天體運動 | 851-860 | 10 |
| 水體模擬 | 861-870 | 10 |
| 火焰煙霧 | 871-880 | 10 |
| 季節變化 | 881-890 | 10 |
| 自然現象 | 891-900 | 10 |

---

## 天氣系統 Weather Systems (801-810)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 801 | Rain Simulation 雨天模擬 | 不同強度的降雨效果，含積水漣漪 | Canvas 2D | Level 1 | 待開發 |
| 802 | Snow Fall 降雪效果 | 飄落的雪花，可調整風向密度 | Canvas 2D | Level 1 | 待開發 |
| 803 | Cloud Formation 雲朵形成 | 動態雲朵生成和移動 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 804 | Lightning Storm 雷暴 | 隨機閃電和雷聲效果 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 805 | Fog Effect 霧氣效果 | 瀰漫的霧氣視覺效果 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 806 | Rainbow 彩虹 | 雨後彩虹的形成和顯示 | Canvas 2D | Level 1 | 待開發 |
| 807 | Weather Widget 天氣小工具 | 動態顯示各種天氣狀態 | Canvas 2D/SVG | Level 1 | 待開發 |
| 808 | Wind Visualization 風場視覺化 | 風向和風速的粒子視覺化 | Canvas 2D | Level 1 | 待開發 |
| 809 | Tornado 龍捲風 | 龍捲風漩渦效果 | Canvas 2D/WebGL | Level 2 | 待開發 |
| 810 | Weather Cycle 天氣循環 | 一天中天氣變化的模擬 | Canvas 2D | Level 1 | 待開發 |

---

## 植物生長 Plant Growth (811-820)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 811 | Growing Tree 生長的樹 | 點擊讓樹木從種子長成大樹 | Canvas 2D, L-System | Level 1 | 待開發 |
| 812 | Flower Bloom 花朵綻放 | 花朵從花苞到盛開的動畫 | Canvas 2D/SVG | Level 1 | 待開發 |
| 813 | Grass Field 草原 | 隨風搖曳的草原效果 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 814 | Vine Growth 藤蔓生長 | 攀爬延伸的藤蔓植物 | Canvas 2D | Level 1 | 待開發 |
| 815 | Seed Dispersal 種子傳播 | 蒲公英種子隨風飄散 | Canvas 2D | Level 1 | 待開發 |
| 816 | Forest Generator 森林生成 | 程序化生成森林場景 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 817 | Leaf Fall 落葉 | 秋天樹葉飄落效果 | Canvas 2D | Level 1 | 待開發 |
| 818 | Moss Growth 苔蘚生長 | 緩慢蔓延的苔蘚模擬 | Canvas 2D | Level 1 | 待開發 |
| 819 | Bonsai 盆栽 | 互動式盆栽修剪養成 | Canvas 2D | Level 1 | 待開發 |
| 820 | Phototropism 向光性 | 植物向光源彎曲生長 | Canvas 2D | Level 1 | 待開發 |

---

## 動物行為 Animal Behavior (821-830)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 821 | Boids Flocking 鳥群 | 經典 Boids 群聚演算法 | Canvas 2D | Level 1 | 待開發 |
| 822 | Fish School 魚群 | 水中魚群的游動行為 | Canvas 2D | Level 1 | 待開發 |
| 823 | Ant Colony 螞蟻群落 | 螞蟻覓食和費洛蒙路徑 | Canvas 2D | Level 1 | 待開發 |
| 824 | Bee Swarm 蜂群 | 蜜蜂採蜜和回巢行為 | Canvas 2D | Level 1 | 待開發 |
| 825 | Butterfly 蝴蝶 | 蝴蝶飛舞的自然軌跡 | Canvas 2D | Level 1 | 待開發 |
| 826 | Predator Prey 掠食者與獵物 | 追逐和逃跑的行為模擬 | Canvas 2D | Level 1 | 待開發 |
| 827 | Bird Migration 鳥類遷徙 | V 字形飛行編隊 | Canvas 2D | Level 1 | 待開發 |
| 828 | Spider Web 蜘蛛結網 | 蜘蛛織網過程動畫 | Canvas 2D | Level 1 | 待開發 |
| 829 | Fireflies 螢火蟲 | 夜晚閃爍的螢火蟲同步 | Canvas 2D | Level 1 | 待開發 |
| 830 | Aquarium 水族箱 | 互動式虛擬水族箱 | Canvas 2D/WebGL | Level 1 | 待開發 |

---

## 生態系統 Ecosystems (831-840)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 831 | Game of Life 生命遊戲 | 康威生命遊戲的互動版本 | Canvas 2D | Level 1 | 待開發 |
| 832 | Terrarium 生態瓶 | 封閉生態系統模擬 | Canvas 2D | Level 1 | 待開發 |
| 833 | Food Chain 食物鏈 | 生態食物鏈平衡模擬 | Canvas 2D | Level 1 | 待開發 |
| 834 | Evolution Sim 演化模擬 | 簡化的演化過程模擬 | Canvas 2D | Level 1 | 待開發 |
| 835 | Pond Life 池塘生態 | 池塘中的微型生態系統 | Canvas 2D | Level 1 | 待開發 |
| 836 | Coral Reef 珊瑚礁 | 珊瑚礁生態視覺化 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 837 | Savanna 草原生態 | 非洲草原生態模擬 | Canvas 2D | Level 1 | 待開發 |
| 838 | Rainforest 雨林 | 熱帶雨林的分層生態 | Canvas 2D | Level 1 | 待開發 |
| 839 | Population Dynamics 族群動態 | Lotka-Volterra 方程視覺化 | Canvas 2D | Level 1 | 待開發 |
| 840 | Microbiome 微生物群 | 微生物世界模擬 | Canvas 2D | Level 1 | 待開發 |

---

## 地質現象 Geological Phenomena (841-850)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 841 | Earthquake 地震模擬 | 地震波傳播視覺化 | Canvas 2D | Level 1 | 待開發 |
| 842 | Volcano 火山爆發 | 火山噴發和岩漿流動 | Canvas 2D | Level 1 | 待開發 |
| 843 | Erosion 侵蝕作用 | 水流和風力侵蝕地形 | Canvas 2D | Level 1 | 待開發 |
| 844 | Plate Tectonics 板塊運動 | 地殼板塊移動模擬 | Canvas 2D | Level 1 | 待開發 |
| 845 | Cave Formation 洞穴形成 | 鐘乳石和石筍的形成 | Canvas 2D | Level 1 | 待開發 |
| 846 | Crystal Growth 晶體生長 | 結晶過程的模擬 | Canvas 2D | Level 1 | 待開發 |
| 847 | Landslide 山崩 | 土石流和山崩模擬 | Canvas 2D | Level 1 | 待開發 |
| 848 | Geyser 間歇泉 | 間歇泉噴發週期 | Canvas 2D | Level 1 | 待開發 |
| 849 | Fossil Formation 化石形成 | 化石形成過程動畫 | Canvas 2D | Level 1 | 待開發 |
| 850 | Sand Dunes 沙丘 | 風力形成沙丘的模擬 | Canvas 2D | Level 1 | 待開發 |

---

## 天體運動 Celestial Motion (851-860)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 851 | Moon Phases 月相 | 月球公轉和月相變化 | Canvas 2D | Level 1 | 待開發 |
| 852 | Solar Eclipse 日蝕 | 日蝕過程的模擬 | Canvas 2D | Level 1 | 待開發 |
| 853 | Star Map 星圖 | 互動式夜空星座圖 | Canvas 2D | Level 1 | 待開發 |
| 854 | Asteroid Belt 小行星帶 | 太陽系小行星帶模擬 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 855 | Comet Trail 彗星尾巴 | 彗星接近太陽的尾巴變化 | Canvas 2D | Level 1 | 待開發 |
| 856 | Meteor Shower 流星雨 | 流星雨視覺效果 | Canvas 2D | Level 1 | 待開發 |
| 857 | Sunrise Sunset 日出日落 | 太陽升降的天空變化 | Canvas 2D | Level 1 | 待開發 |
| 858 | Aurora 極光 | 北極光的視覺效果 | Canvas 2D/WebGL | Level 2 | 待開發 |
| 859 | Galaxy Rotation 銀河旋轉 | 螺旋星系的旋轉模擬 | Canvas 2D/WebGL | Level 2 | 待開發 |
| 860 | Satellite Orbit 衛星軌道 | 人造衛星的軌道追蹤 | Canvas 2D | Level 1 | 待開發 |

---

## 水體模擬 Water Simulation (861-870)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 861 | Water Surface 水面 | 互動式水面漣漪效果 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 862 | Waterfall 瀑布 | 瀑布水流效果 | Canvas 2D | Level 1 | 待開發 |
| 863 | River Flow 河流 | 蜿蜒流動的河流 | Canvas 2D | Level 1 | 待開發 |
| 864 | Wave Pool 波浪池 | 可調整的水波模擬 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 865 | Droplet 水滴 | 水滴落下和飛濺效果 | Canvas 2D | Level 1 | 待開發 |
| 866 | Underwater 水下世界 | 水下視覺效果（焦散、氣泡） | WebGL | Level 2 | 待開發 |
| 867 | Tide 潮汐 | 海岸潮汐漲退模擬 | Canvas 2D | Level 1 | 待開發 |
| 868 | Whirlpool 漩渦 | 水中漩渦效果 | Canvas 2D | Level 1 | 待開發 |
| 869 | Ice Melting 冰融化 | 冰塊融化成水的過程 | Canvas 2D | Level 1 | 待開發 |
| 870 | Steam 蒸氣 | 水蒸發產生蒸氣效果 | Canvas 2D | Level 1 | 待開發 |

---

## 火焰煙霧 Fire & Smoke (871-880)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 871 | Campfire 營火 | 互動式營火效果 | Canvas 2D | Level 1 | 待開發 |
| 872 | Candle Flame 蠟燭 | 搖曳的蠟燭火焰 | Canvas 2D | Level 1 | 待開發 |
| 873 | Forest Fire 森林大火 | 火勢蔓延模擬 | Canvas 2D | Level 1 | 待開發 |
| 874 | Smoke Plume 煙柱 | 上升的煙霧效果 | Canvas 2D/WebGL | Level 1 | 待開發 |
| 875 | Explosion 爆炸效果 | 各種爆炸視覺效果 | Canvas 2D | Level 1 | 待開發 |
| 876 | Fireworks 煙火 | 節慶煙火效果 | Canvas 2D | Level 1 | 待開發 |
| 877 | Match Lighting 點火柴 | 火柴點燃的過程 | Canvas 2D | Level 1 | 待開發 |
| 878 | Volcanic Ash 火山灰 | 火山灰飄落效果 | Canvas 2D | Level 1 | 待開發 |
| 879 | Torch 火把 | 搖曳的火把效果 | Canvas 2D | Level 1 | 待開發 |
| 880 | Ember 餘燼 | 飄散的火星餘燼 | Canvas 2D | Level 1 | 待開發 |

---

## 季節變化 Seasonal Changes (881-890)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 881 | Four Seasons 四季更迭 | 場景在四季間變化 | Canvas 2D | Level 1 | 待開發 |
| 882 | Spring Bloom 春暖花開 | 春天花朵盛開場景 | Canvas 2D | Level 1 | 待開發 |
| 883 | Summer Heat 夏日炎炎 | 熱浪和陽光效果 | Canvas 2D | Level 1 | 待開發 |
| 884 | Autumn Leaves 秋葉繽紛 | 紅葉和落葉效果 | Canvas 2D | Level 1 | 待開發 |
| 885 | Winter Snow 冬雪紛飛 | 積雪和冰霜效果 | Canvas 2D | Level 1 | 待開發 |
| 886 | Cherry Blossom 櫻花 | 櫻花飄落場景 | Canvas 2D | Level 1 | 待開發 |
| 887 | Harvest 豐收 | 秋收場景動畫 | Canvas 2D | Level 1 | 待開發 |
| 888 | Frozen Lake 冰封湖面 | 湖面結冰過程 | Canvas 2D | Level 1 | 待開發 |
| 889 | Thaw 解凍 | 冰雪消融的春天 | Canvas 2D | Level 1 | 待開發 |
| 890 | Day Length 日照長度 | 不同季節的日照變化 | Canvas 2D | Level 1 | 待開發 |

---

## 自然現象 Natural Phenomena (891-900)

| 編號 | 名稱 | 玩法說明 | 技術重點 | 瀏覽器需求 | 進度 |
|-----|------|---------|---------|-----------|------|
| 891 | Northern Lights 北極光 | 絢麗的極光效果 | Canvas 2D/WebGL | Level 2 | 待開發 |
| 892 | Mirage 海市蜃樓 | 熱空氣造成的蜃景效果 | Canvas 2D | Level 1 | 待開發 |
| 893 | Halo 暈 | 太陽或月亮周圍的光暈 | Canvas 2D | Level 1 | 待開發 |
| 894 | Phosphorescence 磷光 | 海洋生物發光效果 | Canvas 2D | Level 1 | 待開發 |
| 895 | Static Electricity 靜電 | 頭髮靜電豎起效果 | Canvas 2D | Level 1 | 待開發 |
| 896 | Frost Pattern 霜花圖案 | 玻璃上的霜花形成 | Canvas 2D | Level 1 | 待開發 |
| 897 | Sand Storm 沙塵暴 | 沙塵暴視覺效果 | Canvas 2D | Level 1 | 待開發 |
| 898 | Dew Drops 露珠 | 清晨露珠形成 | Canvas 2D | Level 1 | 待開發 |
| 899 | Sound of Nature 自然之聲 | 結合視覺的自然音景 | Canvas 2D, Web Audio | Level 1 | 待開發 |
| 900 | Nature Cycle 自然循環 | 水循環、碳循環等視覺化 | Canvas 2D/SVG | Level 1 | 待開發 |

---

## 進度統計

| 子分類 | 待開發 | 開發中 | 已完成 | 已測試 |
|-------|-------|-------|-------|-------|
| 天氣系統 | 10 | 0 | 0 | 0 |
| 植物生長 | 10 | 0 | 0 | 0 |
| 動物行為 | 10 | 0 | 0 | 0 |
| 生態系統 | 10 | 0 | 0 | 0 |
| 地質現象 | 10 | 0 | 0 | 0 |
| 天體運動 | 10 | 0 | 0 | 0 |
| 水體模擬 | 10 | 0 | 0 | 0 |
| 火焰煙霧 | 10 | 0 | 0 | 0 |
| 季節變化 | 10 | 0 | 0 | 0 |
| 自然現象 | 10 | 0 | 0 | 0 |
| **總計** | **100** | **0** | **0** | **0** |

---

[上一章：繪圖創作](./plan8.md) | [返回總覽](./plan.md) | [下一章：實驗創新](./plan10.md)
