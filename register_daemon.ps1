# ============================================================
# Markco's Daemon - Windows Scheduled Task Registrar
# Updated for Markco Hub (Standard User Permissions)
# ============================================================

$TaskName = "MarkcoHub"
$ScriptDir = "$PSScriptRoot"
$HubScript = "$ScriptDir\markco_hub.js"
$LogFile = "$ScriptDir\hub_output.log"
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

if (-not $NodePath) {
    Write-Host "[ERROR] Node.js not found in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "[Markco] Node.js found at: $NodePath" -ForegroundColor Cyan

# Cleanup existing (silently delete old and new names)
schtasks /Delete /TN "MarkcoHub" /F 2>$null | Out-Null
schtasks /Delete /TN "MarkcoHub_Repeat" /F 2>$null | Out-Null
schtasks /Delete /TN "MarkcoDaemon" /F 2>$null | Out-Null
schtasks /Delete /TN "MarkcoDaemon_Repeat" /F 2>$null | Out-Null

Write-Host "[Markco] Cleared any previous task registrations." -ForegroundColor Yellow

# Build Command
$RunCmd = "`"$ScriptDir\markco_job.cmd`""

# Create the logon trigger (standard user permissions)
# We don't use /RL HIGHEST because that requires Admin.
Write-Host "[Markco] Registering MarkcoHub for logon..." -ForegroundColor Cyan
$result = schtasks /Create `
    /TN $TaskName `
    /TR $RunCmd `
    /SC ONLOGON `
    /F 2>&1

if ($result -match "SUCCESS") {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Markco Hub (PM2 Armored) is a persistent task!" -ForegroundColor Green
    Write-Host "  - Runs automatically on Windows Logon via PM2" -ForegroundColor Green
    Write-Host "  - PM2 Logs: $ScriptDir\logs\" -ForegroundColor Green
    Write-Host "  - Terminal Monitor: start_markco.cmd (for live dashboard)" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

    # Fire the first run immediately
    Write-Host "`n[Markco] Launching PM2 Engine now for initial run..." -ForegroundColor Cyan
    schtasks /Run /TN $TaskName | Out-Null
    Start-Sleep -Seconds 3

    if (Test-Path "$ScriptDir\logs\out.log") {
        Write-Host "`n[Markco] PM2 Initialization Log:" -ForegroundColor Cyan
        Write-Host "------------------------------------------------------------"
        Get-Content "$ScriptDir\logs\out.log" | Select-Object -Last 10
        Write-Host "------------------------------------------------------------"
    }
}
else {
    Write-Host "[ERROR] Task registration failed." -ForegroundColor Red
    Write-Host "Result: $result"
    exit 1
}
