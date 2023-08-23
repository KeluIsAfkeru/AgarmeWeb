@echo off
chcp 65001
echo 正在安装 http-server...
npm install --global http-server
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install http-server, exiting...
    exit /b
)
echo http-server 安装成功!
echo Press Enter to close this window...
pause >nul