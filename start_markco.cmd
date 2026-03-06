@echo off
TITLE Markco Hub Terminal
SET "REPO_DIR=%~dp0"
cd /d "%REPO_DIR%"
echo ============================================================
echo  [MARKCO HUB] PM2 Armor Activated
echo  - Launching and entering PM2 Monit...
echo ============================================================
echo.
npx pm2 start ecosystem.config.js
npx pm2 monit
echo.
echo [MARKCO HUB] Monitor closed. (Hub still runs in background)
pause
