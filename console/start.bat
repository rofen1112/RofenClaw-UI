@echo off
chcp 65001 >nul 2>&1
cls
echo.
echo  ========================================================
echo.
echo                 RofenClaw Launcher
echo.
echo  ========================================================
echo.

cd /d "%~dp0"

echo [Step 1/3] Setting environment...
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set NODE_ENV=development

echo [Step 2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo [Step 3/3] Starting application...
echo.
echo Starting Vite dev server and Electron...
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Application failed to start
    pause
)
