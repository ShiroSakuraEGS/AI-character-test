/**
 * 🎀 晴琉 (Haru) - 沉浸式可愛小男生 AI Agent 雙模核心引擎 (app.js) - v2.5 雙Video無縫極致流暢版
 * 重大突破：
 * 1. 雙 Video 雙緩衝無縫交叉切換 (Double-Buffering & Crossfade)：
 *    徹底消除單一 video 更換 src 時的「黑屏閃爍」與「加載緩衝卡頓」，連貫度如原生動畫！
 * 2. 精確模型端點：Gemini 3.8 Flash / Gemini 2.5 Flash / Gemma 4 31B (散文解構免JSON)
 * 3. 零金鑰免 Key 陪伴與動漫出圖即開即玩
 */

// ============================================================
// 📜 1. 角色設定與 System Prompt
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

const INTENT_NATURAL_PROMPT = `
你是一個意圖分析小助手。請分析主人的最新發言，判斷主人是否希望「看晴琉的照片、畫畫、生成圖片、看造型裝扮或視覺畫面」？
請直接回答【是】或【否】，並用一句話說明原因。請用自然文字回答，不要輸出任何程式碼圍欄。
`;

function generateOfflineHaruReply(text, isDrawing = false) {
    if (isDrawing) {
        return `……誒？！主人想要看晴琉的樣子嗎？( > ᴗ < )🖤<br><span class="action-quote">（手忙腳亂地從大抽屜裡翻出繪圖板與感壓筆，緊張地眨巴著大眼睛）</span><br>晴、晴琉會使出全力幫主人畫出來的喔！雖然畫完可能會軟趴趴有點累就是了……(｡•́︿•̀｡)💤 主人請看這個畫布魔法！🎀✨`;
    }
    return `主人……主人終於來看晴琉了……！🥺🖤<br><span class="action-quote">（歪了歪頭，寬大的黑色長袖子輕輕晃了晃）</span><br>晴琉今天也有乖乖看家喔！今天想和晴琉聊聊什麼呢？也可以叫晴琉畫圖給你看喔！(⸝⸝•‧̫•⸝⸝)🐾💭`;
}

// ============================================================
// 🛡️ 2. 防彈級 Reasoning Shield 與 Gemma 4 散文解構
// ============================================================

function cleanReasoningShield(text) {
    if (!text) return "";
    let cleaned = text.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "");
    cleaned = cleaned.replace(/^(Thinking Process|Reasoning):[\s\S]*?\n\n/gi, "");
    cleaned = cleaned.replace(/^(\* )?(01-|Schema Key|Prompt:).*?\n/gmi, "");
    return cleaned.trim();
}

function convertProseToIntent(rawText, userText) {
    const text = cleanReasoningShield(rawText).toLowerCase();
    let needImage = false;
    if (text.includes("【是】") || text.includes("是") || text.includes("yes") || text.includes("true") || text.includes("繪製") || text.includes("畫圖")) {
        if (!text.includes("【否】") && !text.includes("不是") && !text.includes("no") && !text.includes("不需要")) {
            needImage = true;
        }
    }
    const kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "draw", "image", "pic", "look"];
    if (kws.some(k => userText.toLowerCase().includes(k))) {
        needImage = true;
    }
    return needImage;
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

const STANDARD_FALLBACK_MODELS = [
    "gemini-3.8-flash",
    "gemini-2.5-flash",
    "gemma-4-31b-it",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

async function callSingleGoogleModel(prompt, systemInstruction, apiKey, modelName) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const bodyPayload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
    };

    if (systemInstruction) {
        bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
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
    if (!candidateText) throw new Error(`[${modelName}] 回傳內容為空`);
    return cleanReasoningShield(candidateText);
}

async function callGoogleWithFallback(prompt, systemInstruction, apiKey, preferredModel = "gemini-3.8-flash") {
    const modelsToTry = [preferredModel, ...STANDARD_FALLBACK_MODELS.filter(m => m !== preferredModel)];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`[AI Model] 連線嘗試: ${model}...`);
            const result = await callSingleGoogleModel(prompt, systemInstruction, apiKey, model);
            console.log(`[AI Model] 模型 ${model} 成功回傳！`);
            return { result, usedModel: model };
        } catch (err) {
            console.warn(`[AI Model Fallback] 模型 ${model} 嘗試下一個:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error("所有候選模型皆無法連線，請檢查 API Key！");
}

async function callGroqRestApi(prompt, systemInstruction, apiKey, modelName = "llama-3.1-8b-instant") {
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    messages.push({ role: "user", content: prompt });

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: modelName, messages, temperature: 0.7 })
    });

    if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(`[Groq] ${errJson.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return cleanReasoningShield(data.choices?.[0]?.message?.content || "");
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
// 🎬 4. 雙 Video 雙緩衝無縫視訊管理器 (Seamless Video Engine)
// ============================================================

class SeamlessVideoManager {
    constructor({ videoA, videoB, onEnded }) {
        this.videoA = videoA;
        this.videoB = videoB;
        this.onEnded = onEnded;

        this.currentVideo = this.videoA;
        this.nextVideo = this.videoB;

        this.initEvents();
    }

    initEvents() {
        const handleEnd = (vid) => {
            if (vid === this.currentVideo && typeof this.onEnded === 'function') {
                this.onEnded();
            }
        };

        this.videoA.addEventListener('ended', () => handleEnd(this.videoA));
        this.videoB.addEventListener('ended', () => handleEnd(this.videoB));

        // 點擊喚醒
        const handleWake = () => {
            if (this.currentVideo.paused) this.currentVideo.play().catch(() => {});
        };
        this.videoA.addEventListener('click', handleWake);
        this.videoB.addEventListener('click', handleWake);
    }

    /**
     * 無縫交叉切換至新視訊 (Zero Black Flash)
     */
    playSeamless(targetSrc) {
        // 如果當前已經是同一支且正在播放，不重複加載
        const decodedTarget = decodeURI(targetSrc);
        const currentSrc = decodeURI(this.currentVideo.src);

        if (currentSrc.includes(decodedTarget) && !this.currentVideo.paused) {
            return;
        }

        // 將下一個影片載入至後台 Video
        this.nextVideo.src = targetSrc;
        this.nextVideo.currentTime = 0;
        this.nextVideo.load();

        const doTransition = () => {
            this.nextVideo.play().then(() => {
                // 平滑交叉淡入淡出
                this.nextVideo.classList.add('active');
                this.currentVideo.classList.remove('active');

                // 互換指針 (Ping-Pong Buffer)
                const temp = this.currentVideo;
                this.currentVideo = this.nextVideo;
                this.nextVideo = temp;
            }).catch(e => {
                console.warn("視訊自動播放受阻，等待使用者點擊:", e);
            });
        };

        // 若後台視頻已準備好直接切換，否則等待 canplay
        if (this.nextVideo.readyState >= 2) {
            doTransition();
        } else {
            this.nextVideo.oncanplay = () => {
                this.nextVideo.oncanplay = null;
                doTransition();
            };
        }
    }
}

// ============================================================
// 📱 5. 超緊湊應用控制器 (HaruCompactApp)
// ============================================================

class HaruCompactApp {
    constructor() {
        this.history = [];
        this.isGenerating = false;

        // 視訊檔案庫 (使用 encodeURI 確保跨平台相容)
        this.IDLE_VIDEOS = [encodeURI('./assets/待機.mp4'), encodeURI('./assets/待機2.mp4')];
        this.TIRED_VIDEO = encodeURI('./assets/有點累.mp4');
        this.idleIndex = 0;
        this.isTiredMode = false;
        this.tiredPlayCount = 0;
        this.TIRED_MAX_REPEATS = 3;

        this.initDomElements();
        this.loadSettings();
        this.bindEvents();
        this.initSeamlessVideo();
        this.detectEnvironment();
    }

    initDomElements() {
        this.videoA = document.getElementById('videoA');
        this.videoB = document.getElementById('videoB');
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
        if (savedApiKey && this.apiKeyInput) this.apiKeyInput.value = savedApiKey;
        if (savedMode && this.backendModeSelect) this.backendModeSelect.value = savedMode;

        this.updateModelOptions();
        if (savedModel && this.modelSelect) this.modelSelect.value = savedModel;
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
                { id: 'gemini-3.8-flash', name: 'Google: Gemini 3.8 Flash (最新極速旗艦)' },
                { id: 'gemini-2.5-flash', name: 'Google: Gemini 2.5 Flash (經典穩定敏捷)' },
                { id: 'gemma-4-31b-it', name: 'Google: Gemma 4 31B (開源最強·免JSON)' },
                { id: 'gemini-1.5-flash', name: 'Google: Gemini 1.5 Flash (輕量備援)' }
            ];
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                if (m.id === currentModel || m.id === 'gemini-3.8-flash') opt.selected = true;
                this.modelSelect.appendChild(opt);
            });
        } else {
            const models = [
                { id: 'gemma-4-31b-it', name: 'Groq: Gemma 4 31B (免JSON高速推理)' },
                { id: 'llama-3.1-8b-instant', name: 'Groq: Llama 3.1 8B Instant (極速)' }
            ];
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                if (m.id === currentModel || m.id === 'gemma-4-31b-it') opt.selected = true;
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

    // ============================================================
    // 🎬 無縫視訊狀態機邏輯 (Seamless Video State Machine)
    // ============================================================

    initSeamlessVideo() {
        if (!this.videoA || !this.videoB) return;

        this.videoManager = new SeamlessVideoManager({
            videoA: this.videoA,
            videoB: this.videoB,
            onEnded: () => this.handleVideoEnded()
        });

        // 啟動首個待機視訊
        this.playIdleVideo();
    }

    handleVideoEnded() {
        if (this.isTiredMode) {
            this.tiredPlayCount++;
            if (this.tiredPlayCount < this.TIRED_MAX_REPEATS) {
                this.videoStatusTag.textContent = `[累累 ${this.tiredPlayCount + 1}/${this.TIRED_MAX_REPEATS} 💤]`;
                // 雙 Video 無縫重複播放同一支影片，完全不卡頓
                this.videoManager.playSeamless(this.TIRED_VIDEO);
            } else {
                // 已連續播放 3 次，切換回待機循環
                this.isTiredMode = false;
                this.tiredPlayCount = 0;
                this.idleIndex = 0;
                this.agentStatusText.textContent = '晴琉休息完畢 💖';
                this.playIdleVideo();
            }
        } else {
            // 待機 1 ⇄ 待機 2 平滑無縫輪播
            this.idleIndex = (this.idleIndex + 1) % this.IDLE_VIDEOS.length;
            this.playIdleVideo();
        }
    }

    playIdleVideo() {
        this.isTiredMode = false;
        this.tiredPlayCount = 0;
        const targetSrc = this.IDLE_VIDEOS[this.idleIndex];

        this.videoManager.playSeamless(targetSrc);
        this.videoStatusTag.textContent = `[待機 ${this.idleIndex === 0 ? '1' : '2'}]`;
        this.statusDot.className = 'status-dot';
        this.agentStatusText.textContent = `晴琉在線中 🐾`;
    }

    triggerTiredVideo() {
        this.isTiredMode = true;
        this.tiredPlayCount = 0;

        this.videoManager.playSeamless(this.TIRED_VIDEO);
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
                    console.warn("本地後端未開，平滑切換純前端直連:", localErr.message);
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
                <small style="color:var(--text-dim);">提示：請確認右上角「⚙️ 設定」中的 API Key 是否正確。</small>
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
        const chosenModel = this.modelSelect.value || "gemini-3.8-flash";

        const kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "draw", "image", "pic", "look"];
        let needImage = kws.some(k => text.toLowerCase().includes(k));

        if (!apiKey) {
            console.log("未填寫 API Key，使用免金鑰智能對話與生圖模式！");
            await new Promise(r => setTimeout(r, 600));

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
                text: offlineReply + `<br><small style="color:var(--text-dim); display:inline-block; margin-top:4px;">💡 提示：點擊右上角「⚙️ 設定」貼上 Gemini API Key 可解鎖無限深度對話喔！</small>`,
                imageUrl: generatedImg ? generatedImg.imageUrl : null,
                imageTool: generatedImg ? generatedImg.toolName : null,
                imagePrompt: "Gothic Cat-Ear Anime Boy"
            });

            if (needImage) this.triggerTiredVideo();
            else this.agentStatusText.textContent = '晴琉在線中 🐾';
            return;
        }

        try {
            let intentRaw = "";
            if (provider === "google") {
                const res = await callGoogleWithFallback(`使用者說：${text}`, INTENT_NATURAL_PROMPT, apiKey, chosenModel);
                intentRaw = res.result;
            } else {
                intentRaw = await callGroqRestApi(`使用者說：${text}`, INTENT_NATURAL_PROMPT, apiKey, chosenModel);
            }
            needImage = convertProseToIntent(intentRaw, text);
        } catch (e) {
            console.warn("意圖判定備援:", e.message);
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

        let rawReply = "";
        let usedModelName = chosenModel;

        if (provider === "google") {
            const resp = await callGoogleWithFallback(fullPrompt, HARU_SYSTEM_PROMPT, apiKey, chosenModel);
            rawReply = resp.result;
            usedModelName = resp.usedModel;
        } else {
            rawReply = await callGroqRestApi(fullPrompt, HARU_SYSTEM_PROMPT, apiKey, chosenModel);
        }

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
            this.agentStatusText.textContent = `晴琉在線中 (${usedModelName}) 🐾`;
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
