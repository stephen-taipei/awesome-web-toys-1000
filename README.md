# Awesome Web Toys 1000

> 生成藝術、模擬、音訊視覺化、動畫、遊戲與瀏覽器實驗的獨立互動作品集。

## 目前狀態

2026-09-24 盤點：現有 **1,005 個子項目頁面**，涵蓋 **1,000 個數字編號**。#996 至 #1000 各保留兩個不同主題，完整 `NNN-slug` 是穩定識別，不應依數字刪除或覆寫。

檔案存在數量不代表每項互動、裝置或瀏覽器都已驗收。已修復缺失、測試覆蓋與待改善項目列於 [稽核紀錄](docs/audit-2026-09-24.md)。原始分類與擴充規劃保留在 `plan.md` 和 `plan1.md` 至 `plan10.md`，規劃內容不能當成現行完成進度。

## 本機啟動

```sh
python3 -m http.server 8000
```

透過本機伺服器開啟主頁或 `toys/<slug>/index.html`。目前子項目採原生瀏覽器 API 與獨立 HTML、CSS、JavaScript，沒有 runtime 套件安裝、build 步驟、後端或資料庫依賴。

正式部署使用 HTTPS。麥克風、字型存取、多螢幕、WebGL 與 WebCodecs 等功能仍取決於瀏覽器能力、硬體與使用者授權。拒絕麥克風權限後可重試，提供示範模式的項目也可改用示範模式。

## 實際專案結構

```text
awesome-web-toys-1000/
├── index.html                 # 既有主頁，維持原設計
├── toys/                      # 1,005 個獨立子項目
│   ├── 001-fractal-tree/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── ...
├── scripts/audit.py            # 語法、本地資源與 sitemap 檢查
├── tests/                     # 啟動、互動、資源生命週期回歸測試
├── docs/audit-2026-09-24.md     # 稽核紀錄
├── sitemap.xml
└── .github/workflows/web-toys-quality.yml
```

## 子項目範例

[分形樹](toys/001-fractal-tree/index.html) · [俄羅斯方塊](toys/292-tetris/index.html) · [下鑽圖表](toys/483-drill-down/index.html) · [WebCodecs](toys/999-web-codecs/index.html)

## 執行品質檢查

需要 Node.js 22 以上與 Python 3.10 以上。Playwright 僅供開發測試使用。

```sh
python3 scripts/audit.py
python3 -m unittest discover -s tests -p 'test_*.py'
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/browser.py --suite all
```

預設瀏覽器測試使用 HTTP 與專案子路徑，輸出至 `audit-evidence/`。受網路限制的環境可用 `--inline` 載入相同 HTML、CSS、JavaScript，此模式不驗證 HTTP 部署。

`--suite regressions` 執行針對性案例，`--suite smoke` 掃描所有子項目啟動。測試以合成串流與 API doubles 驗證裝置生命週期，不要求真實麥克風或字型存取權限。啟動測試不等同全功能、跨瀏覽器或效能驗收。

## 貢獻原則

維持子項目可獨立開啟，保留既有 slug。修改功能時補上相應回歸案例，更新 sitemap 與文件。麥克風串流、AudioContext、VideoFrame、動畫與監聽器必須有明確的清理路徑，處理拒絕授權及延遲回呼。外部或裝置中介資料應以文字節點呈現。

主頁的 body 與樣式有基準雜湊測試。未取得主頁改版需求前，保持既有設計。若修改子項目，仍應驗證鍵盤操作、觸控與響應式呈現。

## 授權狀態

原 README 宣告 MIT，但 repository 尚未包含獨立 `LICENSE` 檔。維護者應確認著作權與完整授權文字後補齊。本次稽核不代為變更授權或推定第三方內容權利。

問題回報與改進建議請使用 repository Issues 或 Pull Requests。
