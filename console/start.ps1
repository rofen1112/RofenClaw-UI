$Host.UI.RawUI.WindowTitle = "RofenClaw"

Write-Host ""
Write-Host "  ===============================================================" -ForegroundColor Cyan
Write-Host "  |                                                             |" -ForegroundColor Cyan
Write-Host "  |                    RofenClaw Launcher                       |" -ForegroundColor Cyan
Write-Host "  |                                                             |" -ForegroundColor Cyan
Write-Host "  ===============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[Step 1/3] Setting environment..." -ForegroundColor Yellow
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:NODE_ENV = "development"

Write-Host "[Step 2/3] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "[Step 3/3] Starting application..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Vite dev server and Electron..." -ForegroundColor Green
Write-Host ""

npm run dev

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Application failed to start" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
