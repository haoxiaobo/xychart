import http.server
import socketserver
import logging
import os
import json
from volcenginesdkarkruntime import Ark
from volcenginesdkarkruntime.types.chat.completion_create_params import Thinking

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 初始化 Ark 客户端
def init_ark_client():
    try:
        client = Ark(
            base_url="https://ark.cn-beijing.volces.com/api/v3",
            api_key='7e8658d8-df0f-4132-8f26-788bfe449167'
            # 建议在生产环境中使用环境变量: os.environ.get("ARK_API_KEY")
        )
        return client
    except Exception as e:
        logging.error(f"初始化 Ark 客户端失败: {e}")
        return None

# 初始化客户端实例
ark_client = init_ark_client()

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/listcsvfiles'):  # 检查请求路径是否以指定路径开头
            # 处理指定路径的 GET 请求逻辑
            logging.info(f"listcsvfiles: {self.path}")
            dataPath = '/datas'
            # 获取当前文件夹路径
            current_directory = os.getcwd()
            file_names = []
            for filename in os.listdir(current_directory+dataPath):
                if filename.endswith('.csv'):
                     file_names.append(filename)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(file_names).encode())
        else:
            # 对于其他路径，使用默认的静态资源服务
            super().do_GET()
            
    def do_POST(self):
        # 处理 AskAI API 请求
        if self.path.startswith('/api/AskAI'):
            logging.info(f"收到 AskAI 请求")
            
            # 读取请求体数据
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                # 解析 JSON 数据
                request_data = json.loads(post_data)
                prompt = request_data.get('prompt', '')
                
                if not prompt:
                    # 如果没有提供 prompt 参数，返回错误
                    response = {
                        "code": "400",
                        "msg": "缺少 prompt 参数"
                    }
                    self.send_response(400)
                else:
                    # 检查 Ark 客户端是否初始化成功
                    if not ark_client:
                        response = {
                            "code": "500",
                            "msg": "AI 服务初始化失败"
                        }
                        self.send_response(500)
                    else:
                        # 调用 AI 服务处理请求
                        try:
                            logging.info(f"调用 AI 服务处理请求: {prompt}")
                            response_ai = ark_client.chat.completions.create(
                                model="doubao-seed-1-6-250615",
                                messages=[
                                    {"role": "user", "content": [{"type": "text", "text": prompt}]}
                                ],
                                stream=False,  # 非流式模式                                
                            )
                            
                            # 提取 AI 回复内容
                            ai_reply = response_ai.choices[0].message.content
                            
                            # 构造成功响应
                            response = {
                                "code": "200",
                                "msg": ai_reply
                            }
                            self.send_response(200)
                        except Exception as e:
                            logging.error(f"AI 服务调用失败: {e}")
                            response = {
                                "code": "500",
                                "msg": f"AI 服务调用失败: {str(e)}"
                            }
                            self.send_response(500)
            except json.JSONDecodeError:
                # JSON 解析错误
                response = {
                    "code": "400",
                    "msg": "无效的 JSON 格式"
                }
                self.send_response(400)
            except Exception as e:
                # 其他错误
                logging.error(f"处理请求时发生错误: {e}")
                response = {
                    "code": "500",
                    "msg": f"服务器内部错误: {str(e)}"
                }
                self.send_response(500)
            
            # 发送响应
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        
        else:
            # 对于其他 POST 请求，返回 404
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"code": "404", "msg": "Not Found"}')

# 指定端口和处理程序创建服务器实例           
with socketserver.TCPServer(("", 8000), MyHandler) as httpd:
    logging.info("服务器已启动，正在监听 8000 端口")  # 在此添加服务器启动的日志
    httpd.serve_forever()