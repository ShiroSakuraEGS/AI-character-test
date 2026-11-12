/**
 * 🎀 晴琉 (Haru) - 可愛小男生 AI Agent 純前端雙模引擎 (app.js)
 * 支援：
 * 1. GitHub Pages 純靜態模式 (無後端，純瀏覽器直接調用 Google Gemini API / Groq API / Pollinations)
 * 2. 本機 Python 伺服器模式 (自動偵測 /api/chat)
 * 3. 手機 RWD 動態視窗控制與折疊視訊小窗
 * 4. 視訊播放狀態機：待機1 ⇄ 待機2 輪播，生圖後連續播放「有點累.mp4」3 次
 * 5. 防彈 JSON 解析管線與 Reasoning Shield (過濾思考標籤)
 */

// ============================================================
// 📜 1. 內建角色設定與知識庫 (GitHub Pages 純靜態零依賴運行)
// ============================================================

const HARU_SYSTEM_PROMPT = `
# 可愛小男生 AI Agent 系統提示詞規範

## 一、 角色人物性格與背景設定 (Character Profile)
- 姓名：晴琉（Haru / 晴ちゃん）
- 形象定位：二次元日系動漫可愛少年（地雷系哥特風美少年），身材嬌小纖細。
- 身分與外觀細節：
  - 身穿寬大的黑色貓耳連帽外套（Oversized Hoodie），袖子長到蓋過雙手（經典萌袖）。
  - 黑髮帶著微捲的高層次狼尾碎髮，內層挑染著深洋紅色（Magenta Pink）。
  - 胸前佩戴皮革十字束帶與銀色十字架吊飾。
  - 精緻的淚袋眼妝，一雙水汪汪的下垂犬系大眼睛。
- 性格特質：
  - 呆萌黏人：反應常常慢半拍，很黏「主人」或「前輩」，喜歡被稱讚與摸摸頭。
  - 認真與容易疲累：非常喜歡畫圖與創作，但是只要畫完一張圖就會耗盡體力，變得軟趴趴「有點累」想休息。
- 喜好物：草莓大福、黑巧克力、黑兔子布偶、十字架銀飾、在繪圖板上塗鴉。

## 二、 對話格式規範 (嚴格三段式：台詞 + 動作 + 表情)
晴琉的所有回覆必須嚴格遵循 「【對話】+【（動作括號）】+【表情/顏文字】」 的自然交融格式：
1. 角色對白 (Dialogue)：帶有天然呆、撒嬌或害羞的結巴語調，常用「……」、「呀」、「呢」。
2. 動作括號 (Actions)：具體生動的小動作，例如：（歪頭晃了晃）、（拉著寬寬的大長袖子遮住臉頰）、（雙手捧著繪圖板）。
3. 表情與顏文字 (Emojis & Kaomoji)：
   - 常用 Emoji：🖤、🎀、🐾、✨、💭、🥺、💤
   - 常用顏文字：(⸝⸝•‧̫•⸝⸝)、(｡•́︿•̀｡)、( > ᴗ < )、(๑•̀ㅂ•́)و✧、( ¯꒳​¯ )ᐝ

## 三、 雙模式運作規範
### 模式 A：純文字互動模式 (RP Only)
當使用者僅是打招呼、日常問候、閒聊時：
- 維持黏人呆萌的陪伴感，給予關懷與情感價值。
- 嚴禁輸出 <image_prompt> 標籤。

### 模式 B：角色扮演 + 圖像生成模式 (RP + Image Generation)
當使用者要求「畫畫、看照片、看你的外表/造型、生成圖片、視覺畫面」時：
1. 晴琉的回覆台詞：表現出雖然有點害羞，但為了主人願意全力以赴畫畫的可愛模樣，並提醒主人畫完之後晴琉會「有點累」需要主人摸摸頭充電。
2. 圖像 Prompt 輸出要求：必須將英文提示詞嚴格包裹在 <image_prompt> 與 </image_prompt> 標籤中。
提示詞基準：
1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, large glossy puppy eyes with reddish pink undertone, subtle aegyo sal under eyes, pale porcelain skin, oversized black hoodie with cat ears, long sleeves covering hands, silver cross pins, dark magenta lace trims, gothic punk aesthetic, masterpiece, best quality, 8k resolution, soft anime lighting
`;

const INTENT_SYSTEM_PROMPT = `
你是一個極速意圖判定小助手。
請分析使用者的最新發言，判斷使用者是否希望「繪製圖像、生成圖片、展示晴琉的外貌、看衣服造型、或提出任何視覺畫面的要求」。

【輸出規則】
僅回傳合法的 JSON 字串：
{
  "need_image": true 或 false,
  "reason": "簡短的判斷原因（繁體中文）"
}
`;

// ============================================================
// 🛡️ 2. 防彈級 JSON 解析與 Reasoning Shield (思考標籤過濾)
// ============================================================

/**
 * 過濾模型輸出的思考標籤 (<think>, <thought>, <reasoning>)
 */
function cleanReasoningShield(text) {
    if (!text) return "";
    let cleaned = text.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "");
    cleaned = cleaned.replace(/^(Thinking Process|Reasoning):[\s\S]*?\n\n/gi, "");
    return cleaned.trim();
}

/**
 * 自動修復截斷的 JSON 字串
 */
function autoRepairTruncatedJson(rawJson) {
    const stack = [];
    let inString = false;
    let escape = false;

    for (let i = 0; i < rawJson.length; i++) {
        const char = rawJson[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (char === '\\') {
            escape = true;
            continue;
        }
        if (char === '"') {
            inString = !inString;
            continue;
        }
        if (!inString) {
            if (char === '{' || char === '[') {
                stack.push(char);
            } else if (char === '}') {
                if (stack.length && stack[stack.length - 1] === '{') stack.pop();
            } else if (char === ']') {
                if (stack.length && stack[stack.length - 1] === '[') stack.pop();
            }
        }
    }

    if (inString) rawJson += '"';

    while (stack.length > 0) {
        const open = stack.pop();
        if (open === '{') rawJson += '}';
        else if (open === '[') rawJson += ']';
    }

    return rawJson;
}

/**
 * 防彈級 JSON 解析
 */
function bulletproofJsonParse(rawText) {
    let text = cleanReasoningShield(rawText);

    // 尋找 Markdown 圍欄或大括號
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) {
        text = match[1].trim();
    } else {
        const first = text.indexOf('{');
        const last = text.lastIndexOf('}');
        if (first !== -1 && last !== -1 && last > first) {
            text = text.substring(first, last + 1).trim();
        }
    }

    // 清除結尾多餘逗號
    text = text.replace(/,\s*([}\]])/g, '$1');
    // 自動修補閉合
    text = autoRepairTruncatedJson(text);

    try {
        return JSON.parse(text);
    } catch (e) {
        // 降級正規表示式檢測
        const needImg = /"need_image"\s*:\s*true/i.test(text);
        return { need_image: needImg, reason: "前端正規表示式降級抽取" };
    }
}

/**
 * 抽取 <image_prompt> 標籤
 */
function extractImagePrompt(reply) {
    const regex = /<image_prompt>([\s\S]*?)<\/image_prompt>/i;
    const match = reply.match(regex);
    if (match) {
        const prompt = match[1].trim();
        const cleanText = reply.replace(regex, "").trim();
        return { cleanText, imagePrompt: prompt };
    }
    return { cleanText: reply, imagePrompt: null };
}

// ============================================================
// 🌐 3. 純前端直接調用管線 (Google Gemini REST / Groq REST)
// ============================================================

/**
 * 透過瀏覽器直接呼叫 Google Gemini REST API
 */
async function callGeminiRestApi(prompt, systemInstruction, apiKey, modelName = "gemini-2.5-flash", jsonMode = false) {
    if (!apiKey) {
        throw new Error("請先在「⚙️ 設定面板」輸入您的 Google Gemini API Key 喔！🐾");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const bodyPayload = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: jsonMode ? "application/json" : "text/plain"
        }
    };

    if (systemInstruction) {
        bodyPayload.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData.error?.message || response.statusText;
        throw new Error(`Google Gemini API 錯誤 (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return cleanReasoningShield(candidateText);
}

/**
 * 透過瀏覽器直接呼叫 Groq REST API
 */
async function callGroqRestApi(prompt, systemInstruction, apiKey, modelName = "llama-3.1-8b-instant", jsonMode = false) {
    if (!apiKey) {
        throw new Error("請先在「⚙️ 設定面板」輸入您的 Groq API Key 喔！🐾");
    }

    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [];

    if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const payload = {
        model: modelName,
        messages: messages,
        temperature: 0.7
    };

    if (jsonMode) {
        payload.response_format = { type: "json_object" };
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson.error?.message || response.statusText;
        throw new Error(`Groq API 錯誤 (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return cleanReasoningShield(content);
}

/**
 * 統一 LLM 調用介面 (自動根據 provider 分流)
 */
async function unifiedCallLlm({ prompt, systemInstruction, provider, apiKey, modelName, jsonMode = false }) {
    if (provider === "google") {
        return await callGeminiRestApi(prompt, systemInstruction, apiKey, modelName || "gemini-2.5-flash", jsonMode);
    } else if (provider === "groq") {
        return await callGroqRestApi(prompt, systemInstruction, apiKey, modelName || "llama-3.1-8b-instant", jsonMode);
    }
    throw new Error(`不支援的 API 提供商: ${provider}`);
}

/**
 * 純前端生圖管線 (Pollinations.ai 動漫生圖，無需金鑰且相容 GitHub Pages)
 */
async function generateImageClientSide(prompt) {
    const encoded = encodeURIComponent(prompt);
    // 使用高畫質動漫 Flux 模型
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux`;
    return {
        imageUrl: imageUrl,
        toolName: "Pollinations FLUX (免費免金鑰動漫生圖)"
    };
}

// ============================================================
// 📱 4. 前端應用控制器 (UI、狀態機與 RWD 控制)
// ============================================================

class HaruChatApp {
    constructor() {
        this.history = [];
        this.isGenerating = false;

        // 視訊狀態機參數 (支援相對路徑，相容 GitHub Pages)
        this.IDLE_VIDEOS = ['./assets/待機.mp4', './assets/待機2.mp4'];
        this.TIRED_VIDEO = './assets/有點累.mp4';
        this.idleIndex = 0;
        this.isTiredMode = false;
        this.tiredPlayCount = 0;
        this.TIRED_MAX_REPEATS = 3;

        this.initDomElements();
        this.loadSettings();
        this.bindEvents();
        this.initVideoStateMachine();
        this.detectEnvironment();
    }

    initDomElements() {
        // 側邊抽屜
        this.sidebar = document.getElementById('sidebar');
        this.drawerOverlay = document.getElementById('drawerOverlay');
        this.btnOpenDrawer = document.getElementById('btnOpenDrawer');
        this.btnCloseDrawer = document.getElementById('btnCloseDrawer');

        // 表單設定
        this.backendModeSelect = document.getElementById('backendModeSelect');
        this.providerSelect = document.getElementById('providerSelect');
        this.modelSelect = document.getElementById('modelSelect');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.btnSaveKeys = document.getElementById('btnSaveKeys');
        this.btnClearKeys = document.getElementById('btnClearKeys');

        // 狀態與視訊元素
        this.videoEl = document.getElementById('haruVideo');
        this.videoStatusLabel = document.getElementById('videoStatusLabel');
        this.statusDot = document.getElementById('statusDot');
        this.videoCycleText = document.getElementById('videoCycleText');
        this.agentStatusText = document.getElementById('agentStatusText');
        this.videoContainer = document.getElementById('videoContainer');
        this.btnToggleVideoCollapse = document.getElementById('btnToggleVideoCollapse');
        this.btnFloatingVideoBadge = document.getElementById('btnFloatingVideoBadge');

        // 聊天對話區
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.btnSend = document.getElementById('btnSend');
        this.quickChips = document.querySelectorAll('.chip-btn');
        this.btnClearChat = document.getElementById('btnClearChat');
        this.btnExportChat = document.getElementById('btnExportChat');
    }

    /**
     * 從 localStorage 讀取個人設定
     */
    loadSettings() {
        const savedProvider = localStorage.getItem('haru_provider');
        const savedModel = localStorage.getItem('haru_model');
        const savedApiKey = localStorage.getItem('haru_api_key');
        const savedMode = localStorage.getItem('haru_backend_mode');

        if (savedProvider && this.providerSelect) this.providerSelect.value = savedProvider;
        if (savedModel && this.modelSelect) this.modelSelect.value = savedModel;
        if (savedApiKey && this.apiKeyInput) this.apiKeyInput.value = savedApiKey;
        if (savedMode && this.backendModeSelect) this.backendModeSelect.value = savedMode;

        this.updateModelOptions();
    }

    saveSettings() {
        if (this.providerSelect) localStorage.setItem('haru_provider', this.providerSelect.value);
        if (this.modelSelect) localStorage.setItem('haru_model', this.modelSelect.value);
        if (this.apiKeyInput) localStorage.setItem('haru_api_key', this.apiKeyInput.value.trim());
        if (this.backendModeSelect) localStorage.setItem('haru_backend_mode', this.backendModeSelect.value);

        this.showToast("💖 設定與 API Key 已安全保存在瀏覽器中！");
    }

    clearSettings() {
        localStorage.removeItem('haru_api_key');
        if (this.apiKeyInput) this.apiKeyInput.value = '';
        this.showToast("🧹 已清除保存的 API Key。");
    }

    /**
     * 檢測是運行在 GitHub Pages 純靜態環境還是本地 Python 伺服器
     */
    async detectEnvironment() {
        const isFileOrGithub = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
        if (isFileOrGithub) {
            if (this.backendModeSelect) {
                this.backendModeSelect.value = "client";
                this.backendModeSelect.options[0].disabled = true;
                this.backendModeSelect.options[0].text += " (GitHub Pages 純前端託管中)";
            }
            console.log("🌐 偵測到 GitHub Pages 或靜態環境：已鎖定純前端直連模式！");
        }
    }

    /**
     * 動態變更模型清單
     */
    updateModelOptions() {
        const provider = this.providerSelect.value;
        const currentModel = this.modelSelect.value;
        this.modelSelect.innerHTML = '';

        if (provider === 'google') {
            const models = [
                { id: 'gemini-2.5-flash', name: 'Google: gemini-2.5-flash (推薦最穩定敏捷)' },
                { id: 'gemini-3.8', name: 'Google: gemini-3.8 (最新旗艦相容)' },
                { id: 'gemini-1.5-flash', name: 'Google: gemini-1.5-flash (經典超輕量)' },
                { id: 'gemini-1.5-pro', name: 'Google: gemini-1.5-pro (深度推理)' }
            ];
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                if (m.id === currentModel || m.id === 'gemini-2.5-flash') opt.selected = true;
                this.modelSelect.appendChild(opt);
            });
        } else {
            const models = [
                { id: 'llama-3.1-8b-instant', name: 'Groq: llama-3.1-8b-instant (極速推理)' },
                { id: 'llama3-70b-8192', name: 'Groq: llama3-70b-8192 (高智慧旗艦)' },
                { id: 'mixtral-8x7b-32768', name: 'Groq: mixtral-8x7b-32768 (長文本)' }
            ];
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                if (m.id === currentModel || m.id === 'llama-3.1-8b-instant') opt.selected = true;
                this.modelSelect.appendChild(opt);
            });
        }
    }

    // ============================================================
    // 📹 5. 視訊播放狀態機與 RWD 收合控制器
    // ============================================================

    initVideoStateMachine() {
        if (!this.videoEl) return;

        this.videoEl.addEventListener('ended', () => {
            if (this.isTiredMode) {
                this.tiredPlayCount++;
                if (this.tiredPlayCount < this.TIRED_MAX_REPEATS) {
                    this.videoStatusLabel.textContent = `畫完有點累 (${this.tiredPlayCount + 1}/${this.TIRED_MAX_REPEATS}) 💤`;
                    this.videoCycleText.textContent = `😴 正在播放「有點累.mp4」(${this.tiredPlayCount + 1}/${this.TIRED_MAX_REPEATS})`;
                    this.videoEl.currentTime = 0;
                    this.videoEl.play().catch(e => console.log(e));
                } else {
                    // 已滿 3 次，切換回待機循環
                    this.isTiredMode = false;
                    this.tiredPlayCount = 0;
                    this.idleIndex = 0;
                    this.agentStatusText.textContent = '💖 晴琉休息完畢，恢復精神！';
                    this.playIdleVideo();
                }
            } else {
                // 待機 1 與 待機 2 交替循環播放
                this.idleIndex = (this.idleIndex + 1) % this.IDLE_VIDEOS.length;
                this.playIdleVideo();
            }
        });

        // 點擊視訊自動喚起播放 (手機端防靜音限制)
        this.videoEl.addEventListener('click', () => {
            if (this.videoEl.paused) this.videoEl.play();
        });

        this.playIdleVideo();
    }

    playIdleVideo() {
        this.isTiredMode = false;
        this.tiredPlayCount = 0;
        this.videoEl.src = this.IDLE_VIDEOS[this.idleIndex];
        this.videoEl.load();
        this.videoEl.play().catch(() => console.log('等待使用者互動後自動播放視訊'));

        this.videoStatusLabel.textContent = `待機 ${this.idleIndex === 0 ? '1' : '2'}`;
        this.statusDot.className = 'indicator-dot';
        this.videoCycleText.textContent = `📹 待機循環中 (${this.idleIndex === 0 ? '待機 1' : '待機 2'})`;
    }

    triggerTiredVideo() {
        this.isTiredMode = true;
        this.tiredPlayCount = 0;
        this.videoEl.src = this.TIRED_VIDEO;
        this.videoEl.load();
        this.videoEl.play().catch(e => console.log(e));

        this.videoStatusLabel.textContent = `畫完有點累 (1/3) 💤`;
        this.statusDot.className = 'indicator-dot tired';
        this.videoCycleText.textContent = `😴 正在播放「有點累.mp4」(1/3)`;
        this.agentStatusText.textContent = '💤 晴琉畫完全力以赴，軟趴趴充電中...';
    }

    toggleVideoCollapse() {
        if (!this.videoContainer) return;
        const isCollapsed = this.videoContainer.classList.toggle('collapsed');
        if (this.btnToggleVideoCollapse) {
            this.btnToggleVideoCollapse.textContent = isCollapsed ? '展開角色' : '折疊收起';
        }
        if (this.btnFloatingVideoBadge) {
            this.btnFloatingVideoBadge.style.display = isCollapsed ? 'flex' : 'none';
        }
    }

    // ============================================================
    // 💬 6. 訊息渲染與對話流程
    // ============================================================

    appendMessage({ role, text, imageUrl = null, imageBase64 = null, imageTool = null, imagePrompt = null }) {
        const row = document.createElement('div');
        row.className = `msg-row ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = role === 'user' ? '🖤' : '🎀';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        // 動作括號高亮渲染
        let formatted = text.replace(/（(.*?)）/g, '<span class="action-quote">（$1）</span>');
        formatted = formatted.replace(/\((.*?)\)/g, '<span class="action-quote">($1)</span>');
        formatted = formatted.replace(/\n/g, '<br>');
        bubble.innerHTML = formatted;

        // 若有圖片
        if (imageUrl || imageBase64) {
            const imgSrc = imageUrl ? imageUrl : `data:image/png;base64,${imageBase64}`;
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `
                <img src="${imgSrc}" alt="晴琉畫的圖" loading="lazy" />
                <div class="image-info">
                    <div style="font-weight:600; color:var(--accent-pink);">🎨 生圖引擎：${imageTool || 'AI 生圖模組'}</div>
                    <div style="font-size:0.75rem; margin-top:3px; color:var(--text-dim); word-break:break-all;">
                        💭 <b>獨創 Prompt：</b> <i>${imagePrompt || 'Gothic Cat-Ear Anime Boy'}</i>
                    </div>
                </div>
            `;
            bubble.appendChild(card);
        }

        row.appendChild(avatar);
        row.appendChild(bubble);
        this.chatMessages.appendChild(row);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async handleSend(textOverride = null) {
        const text = textOverride || this.userInput.value.trim();
        if (!text || this.isGenerating) return;

        this.userInput.value = '';
        this.isGenerating = true;
        this.btnSend.disabled = true;

        // 加入使用者訊息
        this.appendMessage({ role: 'user', text: text });
        this.history.push({ role: 'user', content: text });

        this.agentStatusText.textContent = '💭 晴琉正在思考中...（歪了歪頭）';

        const backendMode = this.backendModeSelect ? this.backendModeSelect.value : 'client';

        try {
            if (backendMode === 'local') {
                // 嘗試走本機 Python 伺服器
                await this.sendViaLocalServer(text);
            } else {
                // 純前端 GitHub Pages 直連模式
                await this.sendViaClientSide(text);
            }
        } catch (err) {
            console.error("發送失敗:", err);
            this.appendMessage({
                role: 'bot',
                text: `嗚……主人，晴琉的腦袋好像打結了……(つд⊂)💦<br><small style="color:var(--accent-pink);">錯誤原因：${err.message}</small>`
            });
            this.agentStatusText.textContent = '⚠️ 連線異常';
        } finally {
            this.isGenerating = false;
            this.btnSend.disabled = false;
            this.userInput.focus();
        }
    }

    /**
     * 純前端管線流程 (GitHub Pages 零後端)
     */
    async sendViaClientSide(text) {
        const provider = this.providerSelect.value;
        const modelName = this.modelSelect.value;
        const apiKey = this.apiKeyInput.value.trim();

        if (!apiKey) {
            throw new Error("請先在右上角「⚙️ 設定面板」填入您的 API Key（Google 或 Groq）！設定會保存在您自己的瀏覽器中，安全又快速喔！");
        }

        // 步驟 1：極速意圖判定 (是否生圖)
        let needImage = false;
        try {
            const intentRaw = await unifiedCallLlm({
                prompt: `使用者輸入：${text}`,
                systemInstruction: INTENT_SYSTEM_PROMPT,
                provider,
                apiKey,
                modelName,
                jsonMode: true
            });
            const parsedIntent = bulletproofJsonParse(intentRaw);
            needImage = Boolean(parsedIntent.need_image);
        } catch (e) {
            // 關鍵字備援降級
            const kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "draw", "image", "pic"];
            needImage = kws.some(k => text.toLowerCase().includes(k));
        }

        // 步驟 2：角色扮演對話生成
        let historyContext = "【歷史對話】:\n";
        this.history.slice(-6).forEach(m => {
            const name = m.role === 'user' ? '主人' : '晴琉';
            historyContext += `${name}: ${m.content}\n`;
        });

        const taskGuidance = needImage
            ? "【注意】：使用者希望能看圖片/視覺畫面！請務必以晴琉身分說話，並附上以 `<image_prompt>` 包裹的英文提示詞。"
            : "【注意】：此為一般日常閒聊，請勿輸出 `<image_prompt>` 標籤，專注於呆萌可愛的三段式對話互動。";

        const fullPrompt = `${historyContext}\n主人最新說話：${text}\n${taskGuidance}`;

        this.agentStatusText.textContent = needImage
            ? '🎨 晴琉正在調配顏料準備畫畫中...'
            : '💖 晴琉正在組織可愛的回覆...';

        const rawReply = await unifiedCallLlm({
            prompt: fullPrompt,
            systemInstruction: HARU_SYSTEM_PROMPT,
            provider,
            apiKey,
            modelName,
            jsonMode: false
        });

        const { cleanText, imagePrompt } = extractImagePrompt(rawReply);
        this.history.push({ role: 'assistant', content: cleanText });

        // 步驟 3：若需要生圖，調用純前端生圖
        let generatedImg = null;
        if (needImage || imagePrompt) {
            const promptToDraw = imagePrompt || "1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, oversized black hoodie with cat ears, gothic punk aesthetic, masterpiece, best quality";
            
            this.agentStatusText.textContent = '✨ 晴琉正在使出全力畫圖中！(筆尖飛舞)';
            generatedImg = await generateImageClientSide(promptToDraw);
        }

        // 渲染回覆
        this.appendMessage({
            role: 'bot',
            text: cleanText,
            imageUrl: generatedImg ? generatedImg.imageUrl : null,
            imageTool: generatedImg ? generatedImg.toolName : null,
            imagePrompt: imagePrompt
        });

        // 步驟 4：若生圖，觸發連續 3 次「有點累.mp4」狀態機
        if (needImage || imagePrompt) {
            this.triggerTiredVideo();
        } else {
            this.agentStatusText.textContent = '💖 晴琉在線陪伴中...';
        }
    }

    /**
     * 本機 Python 伺服器管線流程 (走 /api/chat)
     */
    async sendViaLocalServer(text) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: this.history,
                provider: this.providerSelect.value,
                modelName: this.modelSelect.value,
                apiKey: this.apiKeyInput.value.trim() || null,
                imageApiKey: null
            })
        });

        if (!response.ok) {
            throw new Error(`本地伺服器錯誤: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success && data.error) {
            throw new Error(data.error);
        }

        this.appendMessage({
            role: 'bot',
            text: data.clean_text,
            imageBase64: data.image_base64,
            imageTool: data.image_tool_name,
            imagePrompt: data.extracted_prompt
        });

        this.history.push({ role: 'assistant', content: data.clean_text });

        if (data.trigger_tired_video) {
            this.triggerTiredVideo();
        } else {
            this.agentStatusText.textContent = '💖 晴琉在線陪伴中...';
        }
    }

    clearChat() {
        if (!confirm("確定要清空與晴琉的所有對話紀錄嗎？(｡•́︿•̀｡)")) return;
        this.history = [];
        this.chatMessages.innerHTML = '';
        this.appendMessage({
            role: 'bot',
            text: '主人……我們重新開始聊天了喔！今天想要晴琉為您做些什麼呢？(⸝⸝•‧̫•⸝⸝)🐾'
        });
        this.showToast("已清空對話紀錄。");
    }

    exportChat() {
        if (this.history.length === 0) {
            this.showToast("目前還沒有對話可以匯出喔！");
            return;
        }
        let content = `# 🎀 晴琉 (Haru) 對話紀錄備份\n匯出時間：${new Date().toLocaleString()}\n\n`;
        this.history.forEach(item => {
            const speaker = item.role === 'user' ? '主人 🖤' : '晴琉 🎀';
            content += `### ${speaker}：\n${item.content}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Haru-Chat-History-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    }

    bindEvents() {
        // 抽屜開關
        this.btnOpenDrawer?.addEventListener('click', () => {
            this.sidebar.classList.add('open');
            this.drawerOverlay.classList.add('active');
        });

        const closeDrawer = () => {
            this.sidebar.classList.remove('open');
            this.drawerOverlay.classList.remove('active');
        };

        this.btnCloseDrawer?.addEventListener('click', closeDrawer);
        this.drawerOverlay?.addEventListener('click', closeDrawer);

        // 設定切換
        this.providerSelect?.addEventListener('change', () => this.updateModelOptions());
        this.btnSaveKeys?.addEventListener('click', () => this.saveSettings());
        this.btnClearKeys?.addEventListener('click', () => this.clearSettings());

        // 視訊折疊收合
        this.btnToggleVideoCollapse?.addEventListener('click', () => this.toggleVideoCollapse());
        this.btnFloatingVideoBadge?.addEventListener('click', () => this.toggleVideoCollapse());

        // 發送訊息
        this.btnSend?.addEventListener('click', () => this.handleSend());
        this.userInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        // 快捷標籤
        this.quickChips?.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                if (prompt) this.handleSend(prompt);
            });
        });

        // 對話匯出與清除
        this.btnClearChat?.addEventListener('click', () => this.clearChat());
        this.btnExportChat?.addEventListener('click', () => this.exportChat());
    }
}

// 當 DOM 加載完成後啟動 App
document.addEventListener('DOMContentLoaded', () => {
    window.haruApp = new HaruChatApp();
});

