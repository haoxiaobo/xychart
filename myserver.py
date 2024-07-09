import http.server
import socketserver
import logging
import os
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

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
            
 # 指定端口和处理程序创建服务器实例           
with socketserver.TCPServer(("", 8000), MyHandler) as httpd:
    logging.info("服务器已启动，正在监听 8000 端口")  # 在此添加服务器启动的日志
    httpd.serve_forever()