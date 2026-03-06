# ============================================================
# Markco's Next PC Setup Protocol
# Automates the Path Migration & Config Transfer
# ============================================================

$RepoDir = $PSScriptRoot
$NewUserDir = $env:USERPROFILE
$OpenClawDir = Join-Path $NewUserDir ".openclaw"
$ConfigSrc = Join-Path $RepoDir "openclaw_config"
$SourceJsonPath = Join-Path $ConfigSrc "openclaw.json"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Running Zion-Link Auto-Migration Hook..." -ForegroundColor Cyan
Write-Host " Target Profile: $NewUserDir" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Update openclaw.json Workspace Path
Write-Host "`n[1/3] Updating Local Workspace Paths..." -ForegroundColor Yellow
if (Test-Path $SourceJsonPath) {
    # Read the JSON
    $jsonContent = Get-Content $SourceJsonPath -Raw | ConvertFrom-Json
    
    # Target the new workspace path
    $newWorkspacePath = Join-Path $NewUserDir ".openclaw\workspace"
    
    # Update the defaults
    $jsonContent.agents.defaults.workspace = $newWorkspacePath
    
    # Save back to file
    $jsonContent | ConvertTo-Json -Depth 10 | Set-Content $SourceJsonPath
    Write-Host " -> Successfully repointed workspace to: $newWorkspacePath" -ForegroundColor Green
} else {
    Write-Host " -> [ERROR] $SourceJsonPath not found." -ForegroundColor Red
}

# 2. Copy configurations over
Write-Host "`n[2/3] Transferring Configuration to Core..." -ForegroundColor Yellow
if (-not (Test-Path $OpenClawDir)) {
    New-Item -ItemType Directory -Path $OpenClawDir | Out-Null
}

Copy-Item -Path "$ConfigSrc\*" -Destination $OpenClawDir -Recurse -Force
Write-Host " -> Copied config files to $OpenClawDir" -ForegroundColor Green

# 3. Install packages
Write-Host "`n[3/3] Installing Node Dependencies..." -ForegroundColor Yellow
Set-Location $RepoDir
npm install

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host " SETUP COMPLETE." -ForegroundColor Green
Write-Host " Do not forget to populate your .env file." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
