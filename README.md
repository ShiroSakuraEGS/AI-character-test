# 🎀 晴琉 (Haru) - 可愛小男生 AI Agent 聊天室 (GitHub & RWD 優化版)

> **專案網址**：[https://github.com/ShiroSakuraEGS/AI-character-test](https://github.com/ShiroSakuraEGS/AI-character-test)  
> 一個融合 **二次元日系地雷哥特美學**、**動態視訊狀態機**、**自適應 RWD 手機版** 與 **GitHub Pages 純靜態部署相容** 的可愛小男生 AI Agent 伴侶。

---

## 🌟 核心特色

### 1. 📱 旗艦級 RWD 手機版自適應體驗
- **動態 `100dvh` 適配**：徹底解決行動裝置 Safari / Chrome 軟鍵盤彈出與底部工具列遮擋問題。
- **可折疊視訊窗 / 懸浮膠囊**：
  - 電腦端：左側沉浸式劇院級 9:16 直向角色動態展示。
  - 手機端：頂部緊湊精緻小窗，支援「一鍵折疊收起」為迷你發光膠囊徽章，釋放 100% 畫面空間專注於對話與圖片。
- **橫向滑動快捷標籤（Quick Prompt Chips）**：點擊一鍵發送「打個招呼」、「畫黑粉貓耳外套」、「畫哥特正裝」等互動。

### 2. 🌐 GitHub Pages 純靜態部署（零後端，開箱即用）
- **雙模式自適應架構**：
  - **GitHub Pages 模式**：純瀏覽器端 JavaScript 直連 Google Gemini REST API / Groq API，並使用 Pollinations FLUX 免金鑰動漫生圖。
  - **本地 Python 伺服器模式**：執行 `app.py` 即可在本地建立 `/api/chat` 管線。
- **隱私第一**：使用者輸入的 API Key 僅加密/儲存於使用者個人的瀏覽器 `localStorage`，絕不上傳第三方伺服器。

### 3. 📹 角色視訊聯動狀態機 (專利級體驗)
- **待機模式**：`assets/待機.mp4` ⇄ `assets/待機2.mp4` 平滑無縫輪播。
- **生圖聯動**：當晴琉完成畫圖任務後，自動切換至 `assets/有點累.mp4` 連續播放 **精確 3 次**，並具備倒數進度徽章（1/3 ➔ 2/3 ➔ 3/3），播放完畢後自動恢復待機！

### 4. 🛡️ 防彈級 JSON 解析與 Reasoning Shield
- 遵守 Google Gemma 4 & Gemini SOP 標準：
  - 自動清除 `<think>...</think>`、`<thought>...</thought>`、`Thinking Process:` 等模型思考噪訊。
  - 自動修補末尾 Trailing Comma 與補全截斷括號，確保前端絕不崩潰。

### 5. 🎨 獨創地雷哥特美學生圖知識庫
- 內建二次元地雷系少年提示詞庫（黑粉狼尾碎髮、淚袋萌眼、oversized 貓耳連帽外套、哥特十字架束帶）。

---

## 🚀 部署至 GitHub Pages 教學 (3 步驟搞定)

1. **推送程式碼至 GitHub 倉庫**：
   ```bash
   git add .
   git commit -m "feat: 升級 RWD 手機版與 GitHub Pages 純前端支援"
   git push -u origin main
   ```
2. **開啟 GitHub Pages 功能**：
   - 前往 GitHub 倉庫頁面：`Settings` ➔ 左側選單點擊 `Pages`。
   - 在 **Build and deployment** 下的 **Branch**，選擇 `main` 分支與 `/(root)` 目錄。
   - 點擊 **Save**。
3. **完成發布**：
   - 數分鐘後，GitHub 會生成您的專屬公開網址：  
     `https://ShiroSakuraEGS.github.io/AI-character-test/`
   - 手機或電腦直接打開該網址，在右上角「⚙️ 設定」貼上您的 Google Gemini API Key，即可隨時隨地與晴琉聊天！

---

## 💻 本地端運行教學 (Local Server)

如果您希望在自己的電腦上運行 Python 本機伺服器：

### 1. 安裝必要套件
```bash
pip install -r requirements.txt
```

### 2. 啟動伺服器
- **Windows 一鍵啟動**：雙擊點擊 `run.bat`。
- **命令列啟動**：
  ```bash
  python app.py
  ```

### 3. 開啟瀏覽器
- 本地電腦造訪：`http://127.0.0.1:8501`
- 手機同 Wi-Fi 區域網路造訪：`http://[電腦區域IP]:8501`

---

## 📁 檔案結構

```text
├── assets/
│   ├── 待機.mp4          # 待機視訊 1
│   ├── 待機2.mp4         # 待機視訊 2
│   └── 有點累.mp4        # 生圖後疲倦累累視訊 (播放 3 次)
├── index.html            # 現代化 RWD 聊天介面 (含 GitHub Dark 風格與折疊視訊)
├── app.js                # 純前端雙模推理引擎 (支援 Gemini/Groq 直連與狀態機)
├── app.py                # 本地輕量 HTTP 伺服器 (提供本地 /api/chat)
├── agent_core.py         # Python 後端 Agent 處理管線
├── requirements.txt      # Python 相依套件
├── run.bat               # Windows 一鍵啟動批次檔
├── system_prompt.md      # 晴琉角色性格與三段式台詞規範
├── 可愛小男生獨創image_prompt知識庫.md
└── 地雷系與哥特美學研究.md
```

---

## 🤝 授權與社群

- 專案倉庫：[ShiroSakuraEGS/AI-character-test](https://github.com/ShiroSakuraEGS/AI-character-test)
- 歡迎提交 Issue 與 Pull Request 一起讓晴琉變得更可愛！🖤🎀

