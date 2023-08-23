@echo off
echo Stopping http-server...
for /f "tokens=5" %%a in ('netstat -aon ^| find "0.0.0.0:5500" ^| find "LISTENING"') do taskkill /f /pid %%a
echo Server stopped.
pause