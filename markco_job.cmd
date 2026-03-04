@echo off
cd /d "%~dp0"
node markco_hub.js >> hub_output.log 2>&1
