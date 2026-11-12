/**
 * 🎀 晴琉 (Haru) - 沉浸式可愛小男生 AI Agent 雙模核心引擎 (app.js) - v2.3 終極防彈版
 * 核心特色：
 * 1. 支援零金鑰免 Key 體驗：即使未填 API Key，晴琉依然可呆萌對話，並透過 Pollinations 免費動漫生圖與播放累累視訊！
 * 2. 填入 API Key 即可解鎖 Google Gemini / Groq 頂級大模型推理與獨創 Prompt 萃取！
 * 3. 視訊路徑自動 encodeURI，徹底杜絕中文路徑在 GitHub Pages (Linux / iOS WebKit) 上的相容性問題。
 * 4. 頂部按鈕原生 onclick 絕對響應，支援一鍵折疊 (▼/▲) 95% 全屏賞角。
 */

// ============================================================
// 📜 1. 角色設定與智能免金鑰語料庫 (Zero-Key Demo Engine)
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

/**
 * 智能免金鑰語料引擎 (即使未填 Key 也能呆萌對答與動漫生圖)
 */
function generateOfflineHaruReply(text, isDrawing = false) {
    if (isDrawing) {
        const drawReplies = [
            `……誒？！主人想要看晴琉的樣子嗎？( > ᴗ < )🖤<br><span class="action-quote">（手忙腳亂地從大抽屜裡翻出繪圖板與感壓筆，緊張地眨巴著大眼睛）</span><br>晴、晴琉會使出全力幫主人畫出來的喔！雖然畫完可能會軟趴趴有點累就是了……(｡•́︿•̀｡)💤 主人請看這個畫布魔法！🎀✨`,
            `主人想看晴琉畫圖嗎……？🥺🖤<br><span class="action-quote">（寬寬的大袖子輕輕擦了擦螢幕，認真地握著數位筆塗塗抹抹）</span><br>晴琉把對主人的喜歡全都畫進這張圖裡了喔！呼……畫完好像全身沒力氣了……主人要摸摸晴琉的頭充電喔！(⸝⸝•‧̫•⸝⸝)🐾🎨`,
            `……哇！這件衣服晴琉也好想穿給主人看！(๑•̀ㅂ•́)و✧✨<br><span class="action-quote">（興奮地原地轉了一圈，黑粉貓耳兜帽輕輕晃了晃）</span><br>看招！地雷哥特魔法變身！畫好啦……唔……晴琉有點累了……( ¯꒳​¯ )ᐝ💤`
        ];
        return drawReplies[Math.floor(Math.random() * drawReplies.length)];
    }

    const chatReplies = [
        `主人……主人終於來看晴琉了……！🥺🖤<br><span class="action-quote">（歪了歪頭，寬大的黑色長袖子輕輕晃了晃）</span><br>晴琉今天也很努力地看家喔！今天想和晴琉聊聊什麼呢？也可以叫晴琉畫圖給你看喔！(⸝⸝•‧̫•⸝⸝)🐾💭`,
        `……呀！主人的聲音……！🖤<br><span class="action-quote">（小耳朵動了動，眼睛亮晶晶地小跑步過來差點踩到衣角）</span><br>晴琉一直都在這裡等主人喔！主人今天過得開心嗎……？( > ᴗ < )🎀`,
        `主人摸摸晴琉嗎……？(｡•́︿•̀｡)🖤<br><span class="action-quote">（主動把毛茸茸的黑粉碎髮小腦袋蹭到主人的手心旁）</span><br>晴琉最喜歡主人的溫度了……只要主人在身邊，晴琉就充滿活力了喔！(⸝⸝•‧̫•⸝⸝)✨`,
        `……草莓大福？還是黑巧克力……？💭<br><span class="action-quote">（抱著懷裡的黑兔子布偶，呆萌地眨巴著下垂犬系大眼睛）</span><br>只要是主人給晴琉的點心，晴琉全都最喜歡了喔！主人要吃一口嗎？(๑•̀ㅂ•́)و✧🍓`
    ];
    return chatReplies[Math.floor(Math.random() * chatReplies.length)];
}

// ============================================================
// 🛡️ 2. 防彈級 JSON 解析與 Reasoning Shield
// ============================================================

function cleanReasoningShield(text) {
    if (!text) return "";
    let cleaned = text.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "");
    cleaned = cleaned.replace(/^(Thinking Process|Reasoning):[\s\S]*?\n\n/gi, "");
    return cleaned.trim();
}

function autoRepairTruncatedJson(rawJson) {
    const stack = [];
    let inString = false;
    let escape = false;

    for (let i = 0; i < rawJson.length; i++) {
        const char = rawJson[i];
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
            if (char === '{' || char === '[') stack.push(char);
            else if (char === '}') {
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

function bulletproofJsonParse(rawText) {
    let text = cleanReasoningShield(rawText);
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

    text = text.replace(/,\s*([}\]])/g, '$1');
    text = autoRepairTruncatedJson(text);

    try {
        return JSON.parse(text);
    } catch (e) {
        const needImg = /"need_image"\s*:\s*true/i.test(text);
        return { need_image: needImg, reason: "前端正規表示式降級抽取" };
    }
}

function extractImagePrompt(reply) {
    const regex = /<image_prompt>([\s\S]*?)<\/image_prompt>/i;
    const match = reply.match(regex);
    if (match) {
        return {
            cleanText: reply.replace(regex, "").trim(),
            imagePrompt: match[1].trim()
        };
    }
    return { cleanText: reply, imagePrompt: null };
}

// ============================================================
// 🔄 3. Google Gemini 多模型自動備援鏈 (Fallback Chain)
// ============================================================

const GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

async function callSingleGeminiModel(prompt, systemInstruction, apiKey, modelName, jsonMode = false) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const bodyPayload = {
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            temperature: 0.7
        }
    };

    if (jsonMode) {
        bodyPayload.generationConfig.responseMimeType = "application/json";
    }

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
        const errMsg = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(`[${modelName}] ${errMsg}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
        throw new Error(`[${modelName}] 模型未返回文字內容`);
    }
    return cleanReasoningShield(candidateText);
}

async function callGeminiWithFallback(prompt, systemInstruction, apiKey, preferredModel = "gemini-2.5-flash", jsonMode = false) {
    const modelsToTry = [preferredModel, ...GEMINI_FALLBACK_MODELS.filter(m => m !== preferredModel)];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`[Gemini API] 嘗試連線: ${model}...`);
            const result = await callSingleGeminiModel(prompt, systemInstruction, apiKey, model, jsonMode);
            console.log(`[Gemini API] 模型 ${model} 成功回傳！`);
            return result;
        } catch (err) {
            console.warn(`[Gemini API] 模型 ${model} 連線失敗:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error("Gemini 模型調用異常，請檢查 API Key 是否正確。");
}

async function callGroqRestApi(prompt, systemInstruction, apiKey, modelName = "llama-3.1-8b-instant", jsonMode = false) {
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    messages.push({ role: "user", content: prompt });

    const payload = {
        model: modelName,
        messages,
        temperature: 0.7
    };
    if (jsonMode) payload.response_format = { type: "json_object" };

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
        const errMsg = errJson.error?.message || `HTTP ${response.status}`;
        throw new Error(`[Groq] ${errMsg}`);
    }

    const data = await response.json();
    return cleanReasoningShield(data.choices?.[0]?.message?.content || "");
}

async function unifiedCallLlm({ prompt, systemInstruction, provider, apiKey, modelName, jsonMode = false }) {
    if (provider === "google") {
        return await callGeminiWithFallback(prompt, systemInstruction, apiKey, modelName || "gemini-2.5-flash", jsonMode);
    } else if (provider === "groq") {
        return await callGroqRestApi(prompt, systemInstruction, apiKey, modelName || "llama-3.1-8b-instant", jsonMode);
    }
    throw new Error(`不支援的 API: ${provider}`);
}

async function generateImageClientSide(prompt) {
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux`;
    return {
        imageUrl: imageUrl,
        toolName: "Pollinations FLUX (動漫生圖)"
    };
}

// ============================================================
// 📱 4. 超緊湊應用控制器 (HaruApp)
// ============================================================

class HaruCompactApp {
    constructor() {
        this.history = [];
        this.isGenerating = false;

        // 視訊播放狀態機 (使用 encodeURI 確保 GitHub Pages Linux/iOS 完美解析中文路徑)
        this.IDLE_VIDEOS = [encodeURI('./assets/待機.mp4'), encodeURI('./assets/待機2.mp4')];
        this.TIRED_VIDEO = encodeURI('./assets/有點累.mp4');
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
        this.videoEl = document.getElementById('haruVideo');
        this.statusDot = document.getElementById('statusDot');
        this.agentStatusText = document.getElementById('agentStatusText');
        this.videoStatusTag = document.getElementById('videoStatusTag');

        this.dialogueCard = document.getElementById('dialogueCard');
        this.btnToggleMinimize = document.getElementById('btnToggleMinimize');
        this.userLastSpeech = document.getElementById('userLastSpeech');
        this.latestBotReply = document.getElementById('latestBotReply');
        this.imageCardSlot = document.getElementById('imageCardSlot');
        this.userInput = document.getElementById('userInput');
        this.btnSend = document.getElementById('btnSend');

        this.btnToggleChips = document.getElementById('btnToggleChips');
        this.quickChipsWrapper = document.getElementById('quickChipsWrapper');
        this.chipPills = document.querySelectorAll('.chip-pill');

        this.drawerOverlay = document.getElementById('drawerOverlay');
        this.btnOpenDrawer = document.getElementById('btnOpenDrawer');
        this.btnCloseSettings = document.getElementById('btnCloseSettings');
        this.settingsDrawer = document.getElementById('settingsDrawer');

        this.btnOpenHistory = document.getElementById('btnOpenHistory');
        this.btnCloseHistory = document.getElementById('btnCloseHistory');
        this.historyDrawer = document.getElementById('historyDrawer');
        this.historyListContainer = document.getElementById('historyListContainer');

        this.backendModeSelect = document.getElementById('backendModeSelect');
        this.providerSelect = document.getElementById('providerSelect');
        this.modelSelect = document.getElementById('modelSelect');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.btnSaveKeys = document.getElementById('btnSaveKeys');
        this.btnClearKeys = document.getElementById('btnClearKeys');
        this.btnClearChat = document.getElementById('btnClearChat');
        this.btnExportChat = document.getElementById('btnExportChat');

        this.lightboxModal = document.getElementById('lightboxModal');
        this.lightboxImg = document.getElementById('lightboxImg');
    }

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
        this.showToast("💖 設定與 API Key 已安全儲存！");
        this.closeAllDrawers();
    }

    clearSettings() {
        localStorage.removeItem('haru_api_key');
        if (this.apiKeyInput) this.apiKeyInput.value = '';
        this.showToast("🧹 已清除 API Key。");
    }

    async detectEnvironment() {
        const isFileOrGithub = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
        if (isFileOrGithub && this.backendModeSelect) {
            this.backendModeSelect.value = "client";
            this.backendModeSelect.options[1].disabled = true;
            this.backendModeSelect.options[1].text += " (僅本機伺服器可用)";
            console.log("🌐 正在 GitHub Pages 上運行純靜態模式！");
        } else if (!localStorage.getItem('haru_backend_mode') && this.backendModeSelect) {
            this.backendModeSelect.value = "local";
        }
    }

    updateModelOptions() {
        const provider = this.providerSelect.value;
        const currentModel = this.modelSelect.value;
        this.modelSelect.innerHTML = '';

        if (provider === 'google') {
            const models = [
                { id: 'gemini-2.5-flash', name: 'Google: gemini-2.5-flash (推薦最穩定)' },
                { id: 'gemini-2.0-flash', name: 'Google: gemini-2.0-flash (高速備援)' },
                { id: 'gemini-1.5-flash', name: 'Google: gemini-1.5-flash (經典輕量)' },
                { id: 'gemini-3.8', name: 'Google: gemini-3.8 (最新旗艦相容)' }
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
                { id: 'llama-3.1-8b-instant', name: 'Groq: llama-3.1-8b-instant (極速)' },
                { id: 'llama3-70b-8192', name: 'Groq: llama3-70b-8192 (高智慧)' }
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

    openSettingsDrawer() {
        if (!this.settingsDrawer || !this.drawerOverlay) return;
        this.historyDrawer?.classList.remove('open');
        this.settingsDrawer.classList.add('open');
        this.drawerOverlay.classList.add('active');
        setTimeout(() => this.apiKeyInput?.focus(), 250);
    }

    openHistoryDrawer() {
        if (!this.historyDrawer || !this.drawerOverlay) return;
        this.settingsDrawer?.classList.remove('open');
        this.historyDrawer.classList.add('open');
        this.drawerOverlay.classList.add('active');
    }

    closeAllDrawers() {
        this.settingsDrawer?.classList.remove('open');
        this.historyDrawer?.classList.remove('open');
        this.drawerOverlay?.classList.remove('active');
    }

    toggleChips() {
        if (!this.quickChipsWrapper) return;
        const currentDisplay = window.getComputedStyle(this.quickChipsWrapper).display;
        this.quickChipsWrapper.style.display = (currentDisplay === 'none') ? 'flex' : 'none';
    }

    initVideoStateMachine() {
        if (!this.videoEl) return;

        this.videoEl.addEventListener('ended', () => {
            if (this.isTiredMode) {
                this.tiredPlayCount++;
                if (this.tiredPlayCount < this.TIRED_MAX_REPEATS) {
                    this.videoStatusTag.textContent = `[累累 ${this.tiredPlayCount + 1}/${this.TIRED_MAX_REPEATS} 💤]`;
                    this.videoEl.currentTime = 0;
                    this.videoEl.play().catch(e => console.log(e));
                } else {
                    this.isTiredMode = false;
                    this.tiredPlayCount = 0;
                    this.idleIndex = 0;
                    this.agentStatusText.textContent = '晴琉休息完畢 💖';
                    this.playIdleVideo();
                }
            } else {
                this.idleIndex = (this.idleIndex + 1) % this.IDLE_VIDEOS.length;
                this.playIdleVideo();
            }
        });

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
        this.videoEl.play().catch(() => console.log('等待使用者互動後播放視訊'));

        this.videoStatusTag.textContent = `[待機 ${this.idleIndex === 0 ? '1' : '2'}]`;
        this.statusDot.className = 'status-dot';
        this.agentStatusText.textContent = `晴琉在線中 🐾`;
    }

    triggerTiredVideo() {
        this.isTiredMode = true;
        this.tiredPlayCount = 0;
        this.videoEl.src = this.TIRED_VIDEO;
        this.videoEl.load();
        this.videoEl.play().catch(e => console.log(e));

        this.videoStatusTag.textContent = `[累累 1/3 💤]`;
        this.statusDot.className = 'status-dot tired';
        this.agentStatusText.textContent = `晴琉充電中 💤`;
    }

    toggleMinimizeDialogue() {
        if (!this.dialogueCard) return;
        const isMin = this.dialogueCard.classList.toggle('minimized');
        if (this.btnToggleMinimize) {
            this.btnToggleMinimize.textContent = isMin ? '▲' : '▼';
            this.btnToggleMinimize.title = isMin ? '展開對話內容' : '收合對話內容';
        }
    }

    ensureDialogueExpanded() {
        if (this.dialogueCard && this.dialogueCard.classList.contains('minimized')) {
            this.dialogueCard.classList.remove('minimized');
            if (this.btnToggleMinimize) this.btnToggleMinimize.textContent = '▼';
        }
    }

    formatDialogueText(text) {
        let formatted = text.replace(/（(.*?)）/g, '<span class="action-quote">（$1）</span>');
        formatted = formatted.replace(/\((.*?)\)/g, '<span class="action-quote">($1)</span>');
        return formatted.replace(/\n/g, '<br>');
    }

    updateLatestDialogue({ text, imageUrl = null, imageTool = null, imagePrompt = null }) {
        this.ensureDialogueExpanded();
        this.latestBotReply.innerHTML = this.formatDialogueText(text);

        if (imageUrl) {
            this.imageCardSlot.style.display = 'block';
            this.imageCardSlot.innerHTML = `
                <div class="image-preview-box" id="btnPreviewImage">
                    <img src="${imageUrl}" alt="晴琉畫的圖" />
                    <div class="image-preview-info">
                        <b>🎨 晴琉畫好啦！(點擊放大查看)</b>
                        <div style="font-size:0.68rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            ${imagePrompt || 'Cute Gothic Anime Boy'}
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('btnPreviewImage')?.addEventListener('click', () => {
                this.lightboxImg.src = imageUrl;
                this.lightboxModal.classList.add('active');
            });
        } else {
            this.imageCardSlot.style.display = 'none';
            this.imageCardSlot.innerHTML = '';
        }
    }

    addHistoryRecord(role, text) {
        const item = document.createElement('div');
        item.className = `history-item ${role}`;
        const roleLabel = role === 'user' ? '🖤 主人' : '🎀 晴琉';
        item.innerHTML = `
            <div class="history-role">${roleLabel}</div>
            <div>${text}</div>
        `;
        this.historyListContainer.appendChild(item);
    }

    async handleSend(textOverride = null) {
        const text = textOverride || this.userInput.value.trim();
        if (!text || this.isGenerating) return;

        this.userInput.value = '';
        this.isGenerating = true;
        this.btnSend.disabled = true;

        this.ensureDialogueExpanded();
        this.userLastSpeech.textContent = `🖤 主人：「${text}」`;
        this.addHistoryRecord('user', text);
        this.history.push({ role: 'user', content: text });

        this.agentStatusText.textContent = '歪頭思考中... 💭';
        this.latestBotReply.innerHTML = `<span style="color:var(--text-dim);">（歪了歪頭，大大的眼珠眨巴眨巴地望著主人思考著……💭✨）</span>`;
        this.imageCardSlot.style.display = 'none';

        const backendMode = this.backendModeSelect ? this.backendModeSelect.value : 'client';
        const apiKey = this.apiKeyInput ? this.apiKeyInput.value.trim() : '';

        try {
            if (backendMode === 'local') {
                try {
                    await this.sendViaLocalServer(text);
                } catch (localErr) {
                    console.warn("本地後端未開，切換純前端直連:", localErr.message);
                    await this.sendViaClientSide(text, apiKey);
                }
            } else {
                await this.sendViaClientSide(text, apiKey);
            }
        } catch (err) {
            console.error("對話連線異常:", err);
            this.latestBotReply.innerHTML = `
                嗚……晴琉的腦袋好像打結了……(つд⊂)💦<br>
                <span class="action-quote">（緊張地抱緊了黑兔子布偶）</span><br>
                <small style="color:var(--accent-pink);">錯誤原因：${err.message}</small><br>
                <small style="color:var(--text-dim);">提示：請點擊右上角「⚙️ 設定」貼上您的 Google Gemini API Key 喔！</small>
            `;
            this.agentStatusText.textContent = '異常 ⚠️';
        } finally {
            this.isGenerating = false;
            this.btnSend.disabled = false;
            this.userInput.focus();
        }
    }

    async sendViaClientSide(text, apiKey) {
        const provider = this.providerSelect.value;
        const modelName = this.modelSelect.value;

        // 判斷是否為生圖請求
        const kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "draw", "image", "pic"];
        let needImage = kws.some(k => text.toLowerCase().includes(k));

        // ✨ 若未填寫 API Key，啟動「免金鑰智能互動與免金鑰生圖模式」！
        if (!apiKey) {
            console.log("未檢測到 API Key，自動以免金鑰智能模式提供陪伴！");
            await new Promise(r => setTimeout(r, 600)); // 模擬可愛思考

            let offlineReply = generateOfflineHaruReply(text, needImage);
            let generatedImg = null;

            if (needImage) {
                this.agentStatusText.textContent = '全力畫圖中！✨';
                const defaultPrompt = "1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, oversized black hoodie with cat ears, gothic punk aesthetic, masterpiece, best quality";
                generatedImg = await generateImageClientSide(defaultPrompt);
            }

            this.history.push({ role: 'assistant', content: offlineReply });
            this.addHistoryRecord('assistant', offlineReply);

            this.updateLatestDialogue({
                text: offlineReply + `<br><small style="color:var(--text-dim); display:inline-block; margin-top:4px;">💡 提示：點擊右上角「⚙️ 設定」貼上 Gemini API Key 可解鎖無限話題深度對話喔！</small>`,
                imageUrl: generatedImg ? generatedImg.imageUrl : null,
                imageTool: generatedImg ? generatedImg.toolName : null,
                imagePrompt: "Gothic Cat-Ear Anime Boy"
            });

            if (needImage) {
                this.triggerTiredVideo();
            } else {
                this.agentStatusText.textContent = '晴琉在線中 🐾';
            }
            return;
        }

        // ==================== 已有 API Key：調用頂級模型推理 ====================
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
            // 關鍵字備援，絕不拋錯
        }

        let historyContext = "【歷史對話】:\n";
        this.history.slice(-6).forEach(m => {
            const name = m.role === 'user' ? '主人' : '晴琉';
            historyContext += `${name}: ${m.content}\n`;
        });

        const taskGuidance = needImage
            ? "【注意】：使用者希望能看圖片/視覺畫面！請務必以晴琉身分說話，並附上以 `<image_prompt>` 包裹的英文提示詞。"
            : "【注意】：此為一般日常閒聊，請勿輸出 `<image_prompt>` 標籤，專注於呆萌可愛的三段式對話互動。";

        const fullPrompt = `${historyContext}\n主人最新說話：${text}\n${taskGuidance}`;
        this.agentStatusText.textContent = needImage ? '調配顏料中... 🎨' : '可愛回覆中... 💖';

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
        this.addHistoryRecord('assistant', cleanText);

        let generatedImg = null;
        if (needImage || imagePrompt) {
            const promptToDraw = imagePrompt || "1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, oversized black hoodie with cat ears, gothic punk aesthetic, masterpiece, best quality";
            this.agentStatusText.textContent = '全力畫圖中！✨';
            generatedImg = await generateImageClientSide(promptToDraw);
        }

        this.updateLatestDialogue({
            text: cleanText,
            imageUrl: generatedImg ? generatedImg.imageUrl : null,
            imageTool: generatedImg ? generatedImg.toolName : null,
            imagePrompt: imagePrompt
        });

        if (needImage || imagePrompt) {
            this.triggerTiredVideo();
        } else {
            this.agentStatusText.textContent = '晴琉在線中 🐾';
        }
    }

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

        if (!response.ok) throw new Error(`本機錯誤: ${response.statusText}`);

        const data = await response.json();
        if (!data.success && data.error) throw new Error(data.error);

        this.history.push({ role: 'assistant', content: data.clean_text });
        this.addHistoryRecord('assistant', data.clean_text);

        const imgUrl = data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null;
        this.updateLatestDialogue({
            text: data.clean_text,
            imageUrl: imgUrl,
            imageTool: data.image_tool_name,
            imagePrompt: data.extracted_prompt
        });

        if (data.trigger_tired_video) {
            this.triggerTiredVideo();
        } else {
            this.agentStatusText.textContent = '晴琉在線中 🐾';
        }
    }

    clearChat() {
        if (!confirm("確定要清空與晴琉的對話紀錄嗎？(｡•́︿•̀｡)")) return;
        this.history = [];
        this.historyListContainer.innerHTML = '';
        this.updateLatestDialogue({
            text: '主人……我們重新開始聊天了喔！今天想要晴琉做些什麼呢？(⸝⸝•‧̫•⸝⸝)🐾'
        });
        this.userLastSpeech.textContent = '主人：點擊下方即可對話 🐾';
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
        a.download = `Haru-Chat-${Date.now()}.md`;
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
            setTimeout(() => toast.remove(), 260);
        }, 2200);
    }

    bindEvents() {
        this.chipPills?.forEach(pill => {
            pill.addEventListener('click', () => {
                const prompt = pill.getAttribute('data-prompt');
                if (prompt) this.handleSend(prompt);
            });
        });

        this.userInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });

        this.providerSelect?.addEventListener('change', () => this.updateModelOptions());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.haruApp = new HaruCompactApp();
});
