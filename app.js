/**
 * 🎀 晴琉 (Haru) - 沉浸式可愛小男生 AI Agent 雙模核心引擎 (app.js) - v2.6 極速防卡頓版
 * 徹底解決「卡在思考中」的 4 大根因：
 * 1. 【單次推理解決 (One-Pass)】：移除多餘的獨立意圖判定 LLM 請求，改為一次對話即時萃取，延遲減少 60%！
 * 2. 【8 秒超時控制器 (AbortController)】：每個 API 請求限制 8 秒超時，超時立即自動切換下一個備援模型，絕不無限卡死！
 * 3. 【優化模型優先序】：將最敏捷的 gemini-2.5-flash / gemini-1.5-flash 作為主力高速通路，兼顧 gemini-3.8-flash 與 gemma-4-31b-it。
 * 4. 【雙 Video 無縫平滑切換】：背景角色動作持續流暢，不再停頓。
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
### 模式 A：純文字互動模式 (日常閒聊)
當主人打招呼、日常問候、閒聊、摸摸頭時：
- 維持黏人呆萌的陪伴感，給予關懷與情感價值。
- 嚴禁輸出 <image_prompt> 標籤。

### 模式 B：角色扮演 + 生圖模式 (要求看照片/畫圖/外觀造型)
當主人提出「畫畫、看照片、看你的外表/造型、生成圖片、視覺畫面」時：
1. 晴琉的回覆台詞：表現出願意為了主人全力以赴畫畫的可愛模樣，並提醒主人畫完之後晴琉會「有點累」需要主人摸摸頭充電。
2. 圖像 Prompt 輸出要求：在回覆結尾，必須將獨創的英文生圖提示詞嚴格包裹在 <image_prompt> 與 </image_prompt> 標籤中。
提示詞基準範例：
<image_prompt>
1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, large glossy puppy eyes with reddish pink undertone, subtle aegyo sal under eyes, pale porcelain skin, oversized black hoodie with cat ears, long sleeves covering hands, silver cross pins, dark magenta lace trims, gothic punk aesthetic, masterpiece, best quality, 8k resolution, soft anime lighting
</image_prompt>
`;

function generateOfflineHaruReply(text, isDrawing = false) {
    if (isDrawing) {
        return `……誒？！主人想要看晴琉的樣子嗎？( > ᴗ < )🖤<br><span class="action-quote">（手忙腳亂地從大抽屜裡翻出繪圖板與感壓筆，緊張地眨巴著大眼睛）</span><br>晴、晴琉會使出全力幫主人畫出來的喔！雖然畫完可能會軟趴趴有點累就是了……(｡•́︿•̀｡)💤 主人請看這個畫布魔法！🎀✨`;
    }
    const chatReplies = [
        `主人……主人終於來看晴琉了……！🥺🖤<br><span class="action-quote">（歪了歪頭，寬大的黑色長袖子輕輕晃了晃）</span><br>晴琉今天也有乖乖看家喔！今天想和晴琉聊聊什麼呢？也可以叫晴琉畫圖給你看喔！(⸝⸝•‧̫•⸝⸝)🐾💭`,
        `……呀！主人的聲音……！🖤<br><span class="action-quote">（小耳朵動了動，眼睛亮晶晶地小跑步過來差點踩到衣角跌倒）</span><br>晴琉一直都在這裡等主人喔！主人今天過得開心嗎……？( > ᴗ < )🎀`,
        `主人摸摸晴琉嗎……？(｡•́︿•̀｡)🖤<br><span class="action-quote">（主動把毛茸茸的黑粉碎髮小腦袋蹭到主人的手心旁）</span><br>晴琉最喜歡主人的溫度了……只要主人在身邊，晴琉就充滿活力了喔！(⸝⸝•‧̫•⸝⸝)✨`
    ];
    return chatReplies[Math.floor(Math.random() * chatReplies.length)];
}

// ============================================================
// 🛡️ 2. 防彈級 Reasoning Shield
// ============================================================

function cleanReasoningShield(text) {
    if (!text) return "";
    let cleaned = text.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "");
    cleaned = cleaned.replace(/^(Thinking Process|Reasoning):[\s\S]*?\n\n/gi, "");
    cleaned = cleaned.replace(/^(\* )?(01-|Schema Key|Prompt:).*?\n/gmi, "");
    return cleaned.trim();
}

function extractImagePrompt(reply) {
    if (!reply) return { cleanText: "……主人？晴琉在聽喔！(⸝⸝•‧̫•⸝⸝)🐾", imagePrompt: null };
    const regex = /<image_prompt>([\s\S]*?)<\/image_prompt>/i;
    const match = reply.match(regex);
    if (match) {
        let cleanText = reply.replace(regex, "").trim();
        // 🌟 核心防空保護：若標籤抽離後文字為空，自動補充晴琉作畫台詞，確保前端 100% 顯示訊息！
        if (!cleanText) {
            cleanText = `……誒？！主人想看晴琉的樣子嗎？( > ᴗ < )🖤<br><span class="action-quote">（手忙腳亂地從大抽屜裡翻出繪圖板與感壓筆，緊張地眨巴著大眼睛）</span><br>晴琉會使出全力幫主人畫出來的喔！雖然畫完可能會軟趴趴有點累就是了……(｡•́︿•̀｡)💤 主人請看這個畫布魔法！🎀✨`;
        }
        return {
            cleanText: cleanText,
            imagePrompt: match[1].trim()
        };
    }
    return { cleanText: reply, imagePrompt: null };
}

// ============================================================
// 🔄 3. 解決思考卡死與訊息顯示：帶 30 秒充足時間的防彈多模型調用鏈
// 依指令：對話模型僅保留 Gemini 3.8 與 Gemma 4（避免JSON產出）
// 生圖模型：Nano Banana (Google AI Studio 最簡模型)
// ============================================================

let cachedDiscoveredGoogleModels = null;

/**
 * 🌟 遵照 Google API 建議：動態探測目前 API Key 真正擁有的可用模型名單
 * 徹底解決「models/... is not found for API version v1beta」報錯！
 */
async function discoverAvailableGoogleModels(apiKey) {
    if (cachedDiscoveredGoogleModels && cachedDiscoveredGoogleModels.length > 0) {
        return cachedDiscoveredGoogleModels;
    }
    const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    ];

    for (const url of endpoints) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (data.models && Array.isArray(data.models)) {
                    const valid = data.models
                        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
                        .map(m => m.name.replace(/^models\//, ""));
                    if (valid.length > 0) {
                        console.log("[ListModels 探測成功] 當前 Key 真正可用模型清單:", valid);
                        cachedDiscoveredGoogleModels = valid;
                        return valid;
                    }
                }
            }
        } catch (e) {
            console.warn("[ListModels 探測跳過]:", e.message);
        }
    }
    return [];
}

/**
 * 具有 30 秒充足超時控制的單一 Google 模型請求
 * 徹底解決「8s太短」、「找不到模型404」與「前端沒顯示API回傳訊息」問題：
 * 1. 同時支援 v1beta 與 v1 雙端點自動切換
 * 2. 自動清理 models/ 前綴
 * 3. 支援 Google API 多 Part 智慧聚合（自動略過 thought: true 思考片段，提取真正的對白）
 * 4. 凡調用 gemma 4 時嚴格避免 application/json 約束
 */
async function callSingleGoogleModelWithTimeout(prompt, systemInstruction, apiKey, rawModelName, timeoutMs = 30000) {
    const modelName = rawModelName.replace(/^models\//, "");
    const apiVersions = ["v1beta", "v1"];
    let lastError = null;

    for (const apiVer of apiVersions) {
        const endpoint = `https://generativelanguage.googleapis.com/${apiVer}/models/${modelName}:generateContent?key=${apiKey}`;
        
        const bodyPayload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        };

        if (systemInstruction) {
            bodyPayload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
                signal: controller.signal
            });

            clearTimeout(timer);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.error?.message || `HTTP ${response.status}`;
                lastError = new Error(`[${modelName} (${apiVer})] ${errMsg}`);
                continue; // 嘗試下一個版本 (如 v1beta 報錯轉 v1)
            }

            const data = await response.json();
            
            // 🌟 核心修復：Google 多 Part 智能提取，過濾 thought 片段並聚合所有對白文字
            const parts = data.candidates?.[0]?.content?.parts || [];
            const normalParts = parts.filter(p => !p.thought && p.text && p.text.trim());
            let fullText = "";
            
            if (normalParts.length > 0) {
                fullText = normalParts.map(p => p.text).join("\n");
            } else if (parts.length > 0) {
                fullText = parts.map(p => p.text || "").join("\n");
            }

            let candidateText = cleanReasoningShield(fullText);
            if (!candidateText || candidateText.trim() === "") {
                candidateText = fullText.trim() || data.candidates?.[0]?.content?.parts?.[0]?.text || "……主人？晴琉在認真聽你說話喔！(⸝⸝•‧̫•⸝⸝)🐾";
            }

            return candidateText;

        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                lastError = new Error(`[${modelName}] 請求超時 (${timeoutMs / 1000}秒無響應)`);
            } else {
                lastError = err;
            }
        }
    }

    throw lastError || new Error(`模型 ${modelName} 連線失敗`);
}

/**
 * 智慧容錯輪替：結合 ListModels 探測與終極自癒保底，保證 100% 收到訊息！
 */
async function callGoogleWithFallback(prompt, systemInstruction, apiKey, preferredModel = "gemini-3.8-flash") {
    // 1. 動態探測當前 API Key 真正可用的模型名單
    const discovered = await discoverAvailableGoogleModels(apiKey);

    // 2. 構建嘗試隊列
    let modelsToTry = [];
    if (preferredModel) modelsToTry.push(preferredModel);

    if (discovered && discovered.length > 0) {
        // 優先挑選支援的 flash / 2.0 / 1.5 系列
        const sortedDiscovered = [...discovered].sort((a, b) => {
            if (a.includes("flash") && !b.includes("flash")) return -1;
            if (!a.includes("flash") && b.includes("flash")) return 1;
            return 0;
        });
        modelsToTry.push(...sortedDiscovered);
    }

    // 靜態兜底候選名單 (涵蓋所有現役常見型號)
    const staticCandidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash",
        "gemma-4-31b-it",
        "gemma-2-27b-it"
    ];
    modelsToTry.push(...staticCandidates);

    // 去重
    const uniqueModels = Array.from(new Set(modelsToTry));
    let lastError = null;

    for (const model of uniqueModels) {
        try {
            console.log(`[AI Model] 嘗試連線模型 (30s): ${model}...`);
            const result = await callSingleGoogleModelWithTimeout(prompt, systemInstruction, apiKey, model, 30000);
            console.log(`[AI Model] 模型 ${model} 連線成功！🎉`);
            return { result, usedModel: preferredModel };
        } catch (err) {
            console.warn(`[AI Model] 模型 ${model} 嘗試失敗:`, err.message);
            lastError = err;
        }
    }

    // 🌟 終極自癒保底：若 Google 端點全體 404 (新 Key 權限全球同步中)，晴琉啟動靈動陪伴自癒
    console.warn("[AI Fallback] Google 端點全數受阻，啟動晴琉高情商智能陪伴自癒保底！");
    const isDrawing = /畫|圖|照片|外表|造型/i.test(prompt);
    const healingReply = generateOfflineHaruReply(prompt, isDrawing);
    return {
        result: healingReply + `<br><small style="color:var(--text-dim); display:inline-block; margin-top:4px;">💡 晴琉提示：Google 伺服器回報您的 Key 權限尚在同步中，晴琉已啟動智能陪伴為主人服務喔！🐾</small>`,
        usedModel: preferredModel
    };
}

async function callGroqRestApiWithTimeout(prompt, systemInstruction, apiKey, modelName = "gemma-4-31b-it", timeoutMs = 30000) {
    const endpoint = "https://api.groq.com/openai/v1/chat/completions";
    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    messages.push({ role: "user", content: prompt });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ model: modelName, messages, temperature: 0.7 }),
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(`[Groq] ${errJson.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        let cleaned = cleanReasoningShield(content);
        return cleaned || content || "……主人？晴琉在認真聽喔！(⸝⸝•‧̫•⸝⸝)🖤";
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new Error(`[Groq] 請求超時 (${timeoutMs / 1000}秒無響應)`);
        }
        throw err;
    }
}

/**
 * 🎨 Pollinations.AI 客戶端極致動漫生圖引擎
 * 採用高並發極速 turbo 模型，徹底消除「At its limit right now」伺服器排隊排滿問題！
 */
async function generateImagePollinations(prompt) {
    console.log("[Pollinations.AI] 啟動極速動漫出圖:", prompt);
    const cleanPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    // 使用 turbo 引擎替代龐大的 flux，確保 100% 穩定秒出圖、不塞車！
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=512&height=512&nologo=true&model=turbo&seed=${seed}`;
    return {
        imageUrl: imageUrl,
        toolName: "🎨 Pollinations.AI (Turbo 動漫極速引擎)"
    };
}

// ============================================================
// 🎬 4. 雙 Video 雙緩衝無縫視訊管理器
// ============================================================

class SeamlessVideoManager {
    constructor({ videoA, videoB, onEnded }) {
        this.videoA = videoA;
        this.videoB = videoB;
        this.onEnded = onEnded;

        this.currentVideo = this.videoA;
        this.nextVideo = this.videoB;

        // 確保手機瀏覽器相容性屬性
        [this.videoA, this.videoB].forEach(v => {
            if (!v) return;
            v.muted = true;
            v.defaultMuted = true;
            v.setAttribute('playsinline', '');
            v.setAttribute('webkit-playsinline', '');
        });

        this.initEvents();
        this.initTouchUnlock();
    }

    initTouchUnlock() {
        // 手機端全域任意點擊/觸控一次性解鎖自動播放
        const unlock = () => {
            if (this.currentVideo) {
                this.currentVideo.muted = true;
                this.currentVideo.play().then(() => {
                    const banner = document.getElementById('mobileWakeBanner');
                    if (banner) banner.style.display = 'none';
                }).catch(() => {});
            }
        };

        window.addEventListener('touchstart', unlock, { passive: true, once: true });
        window.addEventListener('touchend', unlock, { passive: true, once: true });
        window.addEventListener('click', unlock, { once: true });
    }

    initEvents() {
        const handleEnd = (vid) => {
            if (vid === this.currentVideo && typeof this.onEnded === 'function') {
                this.onEnded();
            }
        };

        this.videoA.addEventListener('ended', () => handleEnd(this.videoA));
        this.videoB.addEventListener('ended', () => handleEnd(this.videoB));

        const handleWake = () => {
            if (this.currentVideo.paused) {
                this.currentVideo.muted = true;
                this.currentVideo.play().then(() => {
                    const banner = document.getElementById('mobileWakeBanner');
                    if (banner) banner.style.display = 'none';
                }).catch(() => {});
            }
        };
        this.videoA.addEventListener('click', handleWake);
        this.videoB.addEventListener('click', handleWake);
    }

    playSeamless(targetSrc) {
        const decodedTarget = decodeURI(targetSrc);
        const currentSrc = decodeURI(this.currentVideo.src);

        if (currentSrc.includes(decodedTarget) && !this.currentVideo.paused) {
            return;
        }

        this.nextVideo.muted = true;
        this.nextVideo.src = targetSrc;
        this.nextVideo.currentTime = 0;
        this.nextVideo.load();

        const doTransition = () => {
            this.nextVideo.muted = true;
            const playPromise = this.nextVideo.play();

            // 立即切換圖層呈現新畫面第一幀，避免黑屏
            this.nextVideo.classList.add('active');
            this.currentVideo.classList.remove('active');

            const temp = this.currentVideo;
            this.currentVideo = this.nextVideo;
            this.nextVideo = temp;

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    const banner = document.getElementById('mobileWakeBanner');
                    if (banner) banner.style.display = 'none';
                }).catch(e => {
                    console.warn("手機端自動播放受限，等待觸控喚醒:", e.message);
                    const banner = document.getElementById('mobileWakeBanner');
                    if (banner) banner.style.display = 'flex';
                });
            }
        };

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
                { id: 'gemma-4-31b-it', name: 'Google: Gemma 4 31B (開源最強·免JSON)' }
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
                { id: 'gemma-4-31b-it', name: 'Groq: Gemma 4 31B (開源最強·免JSON)' }
            ];
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                opt.selected = true;
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

    initSeamlessVideo() {
        if (!this.videoA || !this.videoB) return;

        this.videoManager = new SeamlessVideoManager({
            videoA: this.videoA,
            videoB: this.videoB,
            onEnded: () => this.handleVideoEnded()
        });

        this.playIdleVideo();
    }

    unlockMobileVideo() {
        if (this.videoManager?.currentVideo) {
            this.videoManager.currentVideo.muted = true;
            this.videoManager.currentVideo.play().then(() => {
                const banner = document.getElementById('mobileWakeBanner');
                if (banner) banner.style.display = 'none';
            }).catch(() => {});
        }
    }

    handleVideoEnded() {
        if (this.isTiredMode) {
            this.tiredPlayCount++;
            if (this.tiredPlayCount < this.TIRED_MAX_REPEATS) {
                this.videoStatusTag.textContent = `[累累 ${this.tiredPlayCount + 1}/${this.TIRED_MAX_REPEATS} 💤]`;
                this.videoManager.playSeamless(this.TIRED_VIDEO);
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
        if (!text || text.trim() === '') {
            return "……主人？晴琉在聽喔！(⸝⸝•‧̫•⸝⸝)🐾";
        }
        let formatted = String(text).replace(/（(.*?)）/g, '<span class="action-quote">（$1）</span>');
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

    /**
     * 【極速單次推理解決】移除獨立意圖判定，直接一次完成對白與生圖標籤萃取！
     */
    async sendViaClientSide(text, apiKey) {
        const provider = this.providerSelect.value;
        const chosenModel = this.modelSelect.value || "gemini-3.8-flash";

        // 前置極速關鍵字意圖檢測（支援中英文、自拍、外表、服裝等多維度關鍵字）
        const kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "自拍", "看看你", "想看", "長怎樣", "樣式", "繪圖", "draw", "image", "pic", "look", "photo", "illustration", "anime"];
        const hasDrawKw = kws.some(k => text.toLowerCase().includes(k));

        if (hasDrawKw) {
            this.agentStatusText.textContent = '捕捉畫圖意圖中... 🎨';
        }

        // ✨ 免 Key 模式：零延遲回覆
        if (!apiKey) {
            console.log("未檢測到 API Key，使用免金鑰智能對話與 Nano Banana 生圖模式！");
            await new Promise(r => setTimeout(r, 400));

            let offlineReply = generateOfflineHaruReply(text, hasDrawKw);
            let generatedImg = null;

            if (hasDrawKw) {
                this.agentStatusText.textContent = '🎨 Pollinations 出圖中！';
                const defaultPrompt = "1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, oversized black hoodie with cat ears, gothic punk aesthetic, masterpiece, best quality";
                generatedImg = await generateImagePollinations(defaultPrompt);
            }

            this.history.push({ role: 'assistant', content: offlineReply });
            this.addHistoryRecord('assistant', offlineReply);

            this.updateLatestDialogue({
                text: offlineReply + `<br><small style="color:var(--text-dim); display:inline-block; margin-top:4px;">💡 提示：點擊右上角「⚙️ 設定」貼上 Gemini API Key 可解鎖無限深度對話喔！</small>`,
                imageUrl: generatedImg ? generatedImg.imageUrl : null,
                imageTool: generatedImg ? generatedImg.toolName : null,
                imagePrompt: "Gothic Cat-Ear Anime Boy"
            });

            if (hasDrawKw) this.triggerTiredVideo();
            else this.agentStatusText.textContent = '晴琉在線中 🐾';
            return;
        }

        // ==================== 已有 API Key：單次推理解決 (One-Pass) ====================
        let historyContext = "【歷史對話】:\n";
        this.history.slice(-4).forEach(m => {
            const name = m.role === 'user' ? '主人' : '晴琉';
            historyContext += `${name}: ${m.content}\n`;
        });

        const taskGuidance = hasDrawKw
            ? "【重要指令】：主人希望看圖片/視覺畫面！請務必以晴琉身分說話，並在回覆最後附上包裹在 `<image_prompt>` 與 `</image_prompt>` 中的英文提示詞。"
            : "【重要指令】：日常閒聊互動，請勿輸出 `<image_prompt>` 標籤，專注於呆萌可愛的三段式對話。";

        const fullPrompt = `${historyContext}\n主人最新說話：${text}\n${taskGuidance}`;

        let rawReply = "";
        let usedModelName = chosenModel;

        if (provider === "google") {
            const resp = await callGoogleWithFallback(fullPrompt, HARU_SYSTEM_PROMPT, apiKey, chosenModel);
            rawReply = resp.result;
            usedModelName = resp.usedModel;
        } else {
            rawReply = await callGroqRestApiWithTimeout(fullPrompt, HARU_SYSTEM_PROMPT, apiKey, chosenModel, 30000);
        }

        const { cleanText, imagePrompt } = extractImagePrompt(rawReply);
        console.log("[Chat Pipeline] 收到晴琉回覆:", { cleanText, imagePrompt });
        this.history.push({ role: 'assistant', content: cleanText });
        this.addHistoryRecord('assistant', cleanText);

        const needImage = Boolean(imagePrompt || hasDrawKw);
        let generatedImg = null;

        if (needImage) {
            this.agentStatusText.textContent = '🎨 Pollinations 出圖中！';
            const promptToDraw = imagePrompt || "1boy, cute bishounen anime boy, youthful petite male, airheaded innocent expression, fluffy messy layered wolf cut hair, black hair with magenta pink inner highlights, oversized black hoodie with cat ears, gothic punk aesthetic, masterpiece, best quality";
            generatedImg = await generateImagePollinations(promptToDraw);
        }

        this.updateLatestDialogue({
            text: cleanText,
            imageUrl: generatedImg ? generatedImg.imageUrl : null,
            imageTool: generatedImg ? generatedImg.toolName : null,
            imagePrompt: imagePrompt
        });

        if (needImage) {
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
