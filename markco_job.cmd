@echo off
cd /d "%~dp0"
npx pm2 start ecosystem.config.js >> hub_output.log 2>&1
