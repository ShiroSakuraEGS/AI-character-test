# 🎀 晴琉 (Haru) - 沉浸式可愛小男生 AI Agent 聊天室

> **專案網址**：[https://github.com/ShiroSakuraEGS/AI-character-test](https://github.com/ShiroSakuraEGS/AI-character-test)  
> 結合 **二次元全螢幕角色動態背景**、**下 1/3 半透明極簡視覺小說對話框**、**自適應 RWD 手機版** 與 **GitHub Pages 純靜態部署相容** 的可愛小男生 AI 伴侶。

---

## 🌟 嶄新介面特色 (Immersive Visual Novel UI)

### 1. 🎬 全螢幕角色動態背景 (滿版置中)
- 晴琉的身影化為全螢幕背景（`object-fit: cover`、`100dvh`），在手機直立螢幕與電腦螢幕上皆具備視覺小說（Galgame / Live2D）的臨場陪伴感。
- **視訊狀態機**：
  - 待機狀態：`assets/待機.mp4` ⇄ `assets/待機2.mp4` 平滑無縫輪播。
  - 生圖聯動：晴琉畫完圖後，自動切換至 `assets/有點累.mp4` 連續播放 **精確 3 次** 進入軟趴趴充電模式。

### 2. 💬 下 1/3 簡約半透明對話框
- 疊加於角色背景影片下方約 1/3 處，採用精緻毛玻璃光澤（`backdrop-filter: blur(16px)`）。
- **極簡專注設計**：畫面上僅聚焦顯示 **晴琉的最新對白（含動作括號高亮與生圖預覽）** 以及 **主人的輸入框**，告別雜亂的對話串堆疊。
- 若晴琉有繪圖，會以精緻卡片顯示縮圖，點擊即可開啟全螢幕大圖燈箱預覽。

### 3. ⚙️ 全浮動極簡控制按鈕（預設隱藏所有雜訊）
- 頂部角落提供極簡浮動控制群：
  - `🌸 話題`：一鍵呼出/收合常用橫向快捷提問膠囊（打招呼、畫黑粉貓耳外套、畫哥特正裝、會不會累）。
  - `📜 歷史`：側邊滑出歷史對話抽屜，可回顧所有聊過的對話紀錄，支援 Markdown 備份與清空。
  - `⚙️ 設定`：側邊滑出核心設定面板，支援模型切換、API Key 安全儲存於本機 `localStorage`。
  - `🐙 GitHub`：一鍵前往本開源專案倉庫。

### 4. 🌐 GitHub Pages 純靜態零後端相容
- 前端自帶直接調用引擎，即使在沒有 Python 後端的 GitHub Pages 靜態環境下，也能純靠瀏覽器直接連線 Google Gemini REST API / Groq API 與 Pollinations 動漫生圖！

---

## 🚀 部署至 GitHub Pages 教學 (3 步驟)

1. **推送程式碼至 GitHub 倉庫**：
   ```bash
   git add .
   git commit -m "feat: 升級全螢幕角色背景影片與下1/3極簡半透明對話框"
   git push origin main
   ```
2. **開啟 GitHub Pages 功能**：
   - 前往 GitHub 倉庫頁面：`Settings` ➔ 左側選單點擊 `Pages`。
   - 在 **Branch** 選擇 `main` 分支與 `/(root)` 目錄，點擊 **Save**。
3. **完成發布**：
   - 瀏覽器造訪專屬公開網址：`https://ShiroSakuraEGS.github.io/AI-character-test/`
   - 點擊右上角「⚙️ 設定」貼上 Google Gemini API Key 即可開始暢聊！

---

## 💻 本地端運行教學 (Local Server)

```bash
# 安裝依賴
pip install -r requirements.txt

# 啟動伺服器 (或直接雙擊 run.bat)
python app.py
```
- 本機造訪：`http://127.0.0.1:8501`

---

## 📁 檔案結構

```text
├── assets/
│   ├── 待機.mp4          # 全螢幕背景待機視訊 1
│   ├── 待機2.mp4         # 全螢幕背景待機視訊 2
│   └── 有點累.mp4        # 生圖後疲倦累累視訊 (播放 3 次)
├── index.html            # 沉浸式視覺小說風介面 (下 1/3 半透明對話框)
├── app.js                # 純前端雙模推理引擎 (支援 Gemini/Groq 直連與狀態機)
├── app.py                # 本地輕量 HTTP 伺服器
├── agent_core.py         # Python 後端 Agent 處理管線
├── requirements.txt      # Python 相依套件
├── run.bat               # Windows 一鍵啟動批次檔
├── system_prompt.md      # 晴琉角色性格與三段式台詞規範
├── 可愛小男生獨創image_prompt知識庫.md
└── 地雷系與哥特美學研究.md
```
