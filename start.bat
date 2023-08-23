@echo off
chcp 65001
echo 正在尝试启动服务器...
start /b http-server -p 5500
timeout /t 3
echo 服务器启动成功，现在你可以通过浏览器访问http://127.0.0.1:5500来进入客户端页面
start http://127.0.0.1:5500
echo 按任意键停止客户端服务器运行
pause >nul
echo 正在尝试关闭服务器中...
for /f "tokens=5" %%a in ('netstat -aon ^| find "0.0.0.0:5500" ^| find "LISTENING"') do taskkill /f /pid %%a
echo 服务器已停止运行!
pause >nul