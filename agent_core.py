"""
可愛小男生 AI Agent 核心後端模組 (agent_core.py) - 1110 實驗優化版
支援 Groq API 與 Google AI Studio API (Gemini 3.8 / 2.5 Flash / nano banana)
實作意圖判定、地雷哥特美少年角色扮演、圖像 Prompt 提取與生圖工具調用
"""

import os
import re
import json
from typing import Tuple, Dict, Any, Optional
import requests

# 載入 Google AI Studio SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# 載入 Groq SDK
try:
    from groq import Groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False


# ============================================================
# 🛡️ 1. 防彈級 JSON 解析機制與 Reasoning Shield
# ============================================================

def clean_reasoning_shield(text: str) -> str:
    """
    過濾思考標籤 (<think>, <thought>, <reasoning>)
    """
    if not text:
        return ""
    cleaned = re.sub(r"<(think|thought|reasoning)>.*?</\1>", "", text, flags=re.DOTALL)
    cleaned = re.sub(r"^(Thinking Process|Reasoning):.*?\n\n", "", cleaned, flags=re.DOTALL | re.IGNORECASE)
    return cleaned.strip()


def auto_repair_truncated_json(raw_json: str) -> str:
    """
    自動補全截斷與未閉合括號
    """
    stack = []
    in_string = False
    escape = False

    for char in raw_json:
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if not in_string:
            if char in "{[":
                stack.append(char)
            elif char == "}":
                if stack and stack[-1] == "{":
                    stack.pop()
            elif char == "]":
                if stack and stack[-1] == "[":
                    stack.pop()

    if in_string:
        raw_json += '"'

    while stack:
        open_bracket = stack.pop()
        if open_bracket == "{":
            raw_json += "}"
        elif open_bracket == "[":
            raw_json += "]"

    return raw_json


def bulletproof_json_parse(raw_text: str) -> Dict[str, Any]:
    """
    防彈級 JSON 解析管線
    """
    text = clean_reasoning_shield(raw_text)

    # 提取 Markdown 區塊或大括號
    json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if json_match:
        text = json_match.group(1).strip()
    else:
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            text = text[first_brace : last_brace + 1].strip()

    # 移除末尾多餘逗號
    text = re.sub(r",\s*([}\]])", r"\1", text)
    # 補全未閉合括號
    text = auto_repair_truncated_json(text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        need_img = bool(re.search(r'"need_image"\s*:\s*true', text, re.IGNORECASE))
        return {"need_image": need_img, "reason": "備援正則抽取"}


# ============================================================
# 📜 2. 載入知識庫與 System Prompt
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

def load_prompt_file(filename: str) -> str:
    path = os.path.join(CURRENT_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

SYSTEM_PROMPT_DOC = load_prompt_file("system_prompt.md")
IMAGE_KNOWLEDGE_DOC = load_prompt_file("可愛小男生獨創image_prompt知識庫.md")

INTENT_SYSTEM_PROMPT = """
你是一個極速意圖判定小助手。
請分析使用者的最新發言，判斷使用者是否希望「繪製圖像、生成圖片、展示晴琉的外貌、看衣服造型、或提出任何視覺畫面的要求」。

【輸出規則】
- 僅回傳合法的 JSON 字串：
{
  "need_image": true 或 false,
  "reason": "簡短的判斷原因（繁體中文）"
}
"""

FULL_HARU_SYSTEM_PROMPT = f"""
{SYSTEM_PROMPT_DOC}

---
【生圖專業參考知識庫 (當使用者要求繪圖或展示視覺造型時，請參考以下關鍵字組合獨創 Image Prompt)】:
{IMAGE_KNOWLEDGE_DOC}
"""


# ============================================================
# 🌐 3. 通用 LLM 呼叫介面 (Google AI Studio / Groq)
# ============================================================

def call_llm(
    prompt: str,
    system_instruction: str = "",
    provider: str = "google",
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    json_mode: bool = False
) -> str:
    """
    通用調用介面：支援 Google AI Studio (Gemini 3.8 / 2.5 Flash / nano banana 相容) 與 Groq
    """
    if provider == "google":
        key = api_key or os.getenv("GEMINI_API_KEY")
        if not key:
            raise ValueError("未設定 Google Gemini API Key！請於面板輸入或設定環境變數。")
        
        client = genai.Client(api_key=key)
        config = types.GenerateContentConfig(
            system_instruction=system_instruction or None,
            response_mime_type="application/json" if json_mode else "text/plain"
        )
        # 依指令：模型僅保留 Gemini 3.8 與 Gemma 4（避免JSON產出）
        preferred = model_name or "gemini-3.8-flash"
        fallback = "gemma-4-31b-it" if "3.8" in preferred else "gemini-3.8-flash"
        models_to_try = [preferred, fallback]

        last_exc = None
        for m in models_to_try:
            try:
                # 凡調用 gemma 模型時，嚴格避免傳入 response_mime_type="application/json"
                is_gemma = "gemma" in m.lower()
                current_config = types.GenerateContentConfig(
                    system_instruction=system_instruction or None,
                    response_mime_type=None if is_gemma else ("application/json" if json_mode else "text/plain")
                )
                response = client.models.generate_content(
                    model=m,
                    contents=prompt,
                    config=current_config
                )
                return clean_reasoning_shield(response.text or "")
            except Exception as e:
                print(f"[Gemini Fallback] 模型 {m} 嘗試失敗: {e}，切換下一個備援模型...")
                last_exc = e

        raise last_exc or ValueError("所有備援模型皆呼叫失敗，請檢查 API Key 是否有效！")

    elif provider == "groq":
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("未設定 Groq API Key！請於面板輸入或設定環境變數。")
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        chosen_model = model_name or "llama-3.1-8b-instant"

        if HAS_GROQ:
            groq_client = Groq(api_key=key)
            kwargs = {
                "model": chosen_model,
                "messages": messages
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            completion = groq_client.chat.completions.create(**kwargs)
            return clean_reasoning_shield(completion.choices[0].message.content or "")
        else:
            headers = {
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": chosen_model,
                "messages": messages
            }
            if json_mode:
                payload["response_format"] = {"type": "json_object"}
            res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=30)
            res.raise_for_status()
            data = res.json()
            return clean_reasoning_shield(data["choices"][0]["message"]["content"] or "")

    raise ValueError(f"不支援的 API 提供商: {provider}")


# ============================================================
# 🎯 4. 意圖判定與標籤解析
# ============================================================

def judge_intent(
    user_input: str,
    provider: str = "google",
    api_key: Optional[str] = None
) -> Tuple[bool, str]:
    """
    判定使用者輸入是否需要生圖
    """
    try:
        raw = call_llm(
            prompt=f"使用者輸入：{user_input}",
            system_instruction=INTENT_SYSTEM_PROMPT,
            provider=provider,
            api_key=api_key,
            json_mode=True
        )
        parsed = bulletproof_json_parse(raw)
        return parsed.get("need_image", False), parsed.get("reason", "判定成功")
    except Exception as e:
        # 關鍵字備援降級
        kws = ["畫", "圖", "照片", "造型", "外表", "長相", "樣貌", "洋裝", "衣服", "穿著", "draw", "image", "pic"]
        need_img = any(k in user_input.lower() for k in kws)
        return need_img, f"API 判定降級，使用關鍵字備援: {e}"


def extract_image_prompt(model_reply: str) -> Tuple[str, Optional[str]]:
    """
    自晴琉的回答中萃取 <image_prompt> 內容，並清理出乾淨對白
    """
    pattern = r"<image_prompt>(.*?)</image_prompt>"
    match = re.search(pattern, model_reply, re.DOTALL)
    if match:
        img_prompt = match.group(1).strip()
        clean_text = re.sub(pattern, "", model_reply, flags=re.DOTALL).strip()
        return clean_text, img_prompt
    return model_reply, None


# ============================================================
# 🎨 5. 圖像生成工具 (Google Imagen 3 + 免費免密鑰備援)
# ============================================================

def generate_image_tool(
    prompt: str,
    google_api_key: Optional[str] = None
) -> Tuple[Optional[bytes], str, bool]:
    """
    執行圖像生成工具：全面改用 Pollinations.AI 免費免密鑰動漫極致引擎 (FLUX)
    傳回值: (圖像二進位 bytes, 使用的工具名稱, 是否成功)
    """
    try:
        encoded = requests.utils.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded}?width=512&height=512&nologo=true&model=turbo"
        resp = requests.get(url, timeout=35)
        if resp.status_code == 200:
            return resp.content, "🎨 Pollinations.AI (Turbo 極速動漫引擎)", True
    except Exception as e:
        print(f"Pollinations.AI 生圖失敗: {e}")

    return None, "生圖失敗", False


# ============================================================
# 🚀 6. 整合式對話流程 (Pipeline)
# ============================================================

def chat_pipeline(
    user_input: str,
    conversation_history: list,
    provider: str = "google",
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    google_api_key_for_image: Optional[str] = None
) -> Dict[str, Any]:
    """
    完整的 Agent 執行流程：
    1. 意圖判定 (是否生圖)
    2. 生成角色對話 (若生圖則附帶獨創 Image Prompt)
    3. 提取生圖 Prompt
    4. 調用生圖工具 (若需要)
    5. 回傳完整結構資料供前端 Web App 展示與視訊聯動
    """
    # 步驟 1：意圖判定
    need_image, intent_reason = judge_intent(user_input, provider=provider, api_key=api_key)

    # 步驟 2：建構模型上下文
    messages_context = "【歷史對話】:\n"
    for msg in conversation_history[-6:]:
        role_name = "主人" if msg.get("role") == "user" else "晴琉"
        messages_context += f"{role_name}: {msg.get('content')}\n"
    
    task_guidance = ""
    if need_image:
        task_guidance = "【注意】：使用者希望能看圖片/視覺畫面！請務必以晴琉身分說話，並附上以 `<image_prompt>` 包裹的英文提示詞。"
    else:
        task_guidance = "【注意】：此為一般日常閒聊，請勿輸出 `<image_prompt>` 標籤，專注於呆萌可愛的三段式對話互動。"

    final_prompt = f"""
{messages_context}
主人最新說話：{user_input}
{task_guidance}
"""

    # 呼叫 LLM 生成晴琉回覆
    raw_reply = call_llm(
        prompt=final_prompt,
        system_instruction=FULL_HARU_SYSTEM_PROMPT,
        provider=provider,
        api_key=api_key,
        model_name=model_name,
        json_mode=False
    )

    clean_text, extracted_prompt = extract_image_prompt(raw_reply)

    # 步驟 3：若需生圖，執行生圖工具
    image_bytes = None
    image_tool_name = ""
    image_success = False

    if need_image or extracted_prompt:
        prompt_to_draw = extracted_prompt or (
            "Cute chibi anime boy, 1boy, airheaded smile, messy black hair with magenta highlights, "
            "oversized black cat-ear hoodie, gothic punk, masterpiece, best quality"
        )
        image_bytes, image_tool_name, image_success = generate_image_tool(
            prompt=prompt_to_draw,
            google_api_key=google_api_key_for_image or api_key
        )

    return {
        "need_image": need_image or bool(extracted_prompt),
        "intent_reason": intent_reason,
        "clean_text": clean_text,
        "extracted_prompt": extracted_prompt,
        "has_image": bool(image_bytes),
        "image_bytes": image_bytes,
        "image_tool_name": image_tool_name,
        "image_success": image_success,
        # 標記是否觸發「有點累.mp4」播放 3 次
        "trigger_tired_video": bool(need_image or extracted_prompt)
    }

