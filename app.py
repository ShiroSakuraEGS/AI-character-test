"""
可愛小男生 AI Agent Web App 伺服器 (app.py) - 1110 實驗優化版
完美支援 RWD 手機瀏覽與電腦螢幕、視訊流循環與生圖狀態聯動
支援本地模式與 GitHub Pages 純前端雙模相容
"""

import os
import sys
import json
import base64
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from agent_core import chat_pipeline


class OptimizedHaruHandler(SimpleHTTPRequestHandler):
    """
    處理 Web 前端資源請求與 AI 聊天生圖 API (含 Windows 強化 MIME 對映)
    """

    # 確保 Windows 下 js 與 mp4 的 MIME 正確
    extensions_map = SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".mp4": "video/mp4",
        ".css": "text/css",
        ".html": "text/html",
        ".json": "application/json",
    })

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        """
        處理 POST API 請求
        """
        parsed_url = urllib.parse.urlparse(self.path)

        if parsed_url.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")

            try:
                data = json.loads(body)
                user_message = data.get("message", "")
                history = data.get("history", [])
                provider = data.get("provider", "google")
                model_name = data.get("modelName")
                api_key = data.get("apiKey")
                image_api_key = data.get("imageApiKey")

                # 呼叫後端 Agent 完整管線
                pipeline_result = chat_pipeline(
                    user_input=user_message,
                    conversation_history=history,
                    provider=provider,
                    api_key=api_key,
                    model_name=model_name,
                    google_api_key_for_image=image_api_key
                )

                # 二進位圖片轉換為 Base64
                image_b64 = None
                if pipeline_result.get("image_bytes"):
                    image_b64 = base64.b64encode(pipeline_result["image_bytes"]).decode("utf-8")

                response_payload = {
                    "success": True,
                    "clean_text": pipeline_result["clean_text"],
                    "need_image": pipeline_result["need_image"],
                    "intent_reason": pipeline_result["intent_reason"],
                    "extracted_prompt": pipeline_result.get("extracted_prompt"),
                    "image_base64": image_b64,
                    "image_tool_name": pipeline_result.get("image_tool_name"),
                    "trigger_tired_video": pipeline_result["trigger_tired_video"]
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(response_payload, ensure_ascii=False).encode("utf-8"))

            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err_payload = {"success": False, "error": str(e)}
                self.wfile.write(json.dumps(err_payload, ensure_ascii=False).encode("utf-8"))

        else:
            self.send_error(404, "Endpoint Not Found")

    def end_headers(self):
        """
        跨來源與快取標頭設定
        """
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


def run_server(port: int = 8501):
    """
    啟動 RWD 伺服器
    """
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, OptimizedHaruHandler)
    print("=" * 65)
    print("🎀 晴琉 (Haru) 可愛小男生 AI 聊天室 (GitHub & RWD 優化版) 啟動！")
    print(f"🔗 本地電腦瀏覽: http://127.0.0.1:{port}")
    print(f"📱 同區域網路手機瀏覽: http://[您的電腦區域IP]:{port}")
    print("🌐 支援純前端 GitHub Pages 直接部署 (零後端相容)")
    print("📹 待機影片循環中: 待機.mp4 <-> 待機2.mp4")
    print("😴 生圖後將連續播放「有點累.mp4」3 次")
    print("=" * 65)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n伺服器已正常關閉。")
        httpd.server_close()


if __name__ == "__main__":
    port = 8501
    run_server(port)
