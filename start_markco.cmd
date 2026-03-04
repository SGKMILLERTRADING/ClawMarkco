@echo off
TITLE Markco Hub Terminal
SET REPO_DIR=C:\Users\Markco Ella\Desktop\clawMarkco\
cd /d "%REPO_DIR%"
echo ============================================================
echo  [MARKCO HUB] Starting up...
echo  - Hub Script: %REPO_DIR%markco_hub.js
echo  - Date: %DATE% %TIME%
echo ============================================================
echo.
node "%REPO_DIR%markco_hub.js"
echo.
echo [MARKCO HUB] Hub has terminated. 
pause
