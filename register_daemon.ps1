# ============================================================
# Markco's Daemon - Windows Scheduled Task Registrar
# Updated for Markco Hub (Standard User Permissions)
# ============================================================

$TaskName      = "MarkcoHub"
$ScriptDir     = "$PSScriptRoot"
$HubScript     = "$ScriptDir\markco_hub.js"
$LogFile       = "$ScriptDir\hub_output.log"
$NodePath      = (Get-Command node -ErrorAction SilentlyContinue).Source

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
# /B runs in background (minimized)
$RunCmd = "cmd /c node `"$HubScript`" >> `"$LogFile`" 2>&1"

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
    Write-Host " [SUCCESS] Markco Hub is now a persistent Windows background task!" -ForegroundColor Green
    Write-Host "  - Runs automatically on Windows Logon" -ForegroundColor Green
    Write-Host "  - Log output: $LogFile" -ForegroundColor Green
    Write-Host "  - Terminal Startup: start_markco.cmd (for debugging)" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

    # Fire the first run immediately
    Write-Host "`n[Markco] Launching Hub now for initial run..." -ForegroundColor Cyan
    schtasks /Run /TN $TaskName | Out-Null
    Start-Sleep -Seconds 3

    if (Test-Path $LogFile) {
        Write-Host "`n[Markco] Initial Log Output:" -ForegroundColor Cyan
        Write-Host "------------------------------------------------------------"
        Get-Content $LogFile | Select-Object -Last 10
        Write-Host "------------------------------------------------------------"
    }
} else {
    Write-Host "[ERROR] Task registration failed." -ForegroundColor Red
    Write-Host "Result: $result"
    exit 1
}
