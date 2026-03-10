@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "SHORTCUT_NAME=RofenClaw"
set "ICON_PATH=%SCRIPT_DIR%resources\icon.ico"

echo Creating desktop shortcut...

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\%SHORTCUT_NAME%.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%start.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'RofenClaw'; if (Test-Path '%ICON_PATH%') { $Shortcut.IconLocation = '%ICON_PATH%' }; $Shortcut.Save()"

if errorlevel 1 (
    echo Failed to create shortcut
) else (
    echo Desktop shortcut created successfully!
)

pause
