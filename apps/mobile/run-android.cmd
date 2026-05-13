@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

where node >nul 2>&1
if errorlevel 1 goto try_pf
node "%ROOT%\scripts\run-android.cjs"
exit /b %ERRORLEVEL%

:try_pf
if exist "%ProgramFiles%\nodejs\node.exe" (
  "%ProgramFiles%\nodejs\node.exe" "%ROOT%\scripts\run-android.cjs"
  exit /b %ERRORLEVEL%
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  "%ProgramFiles(x86)%\nodejs\node.exe" "%ROOT%\scripts\run-android.cjs"
  exit /b %ERRORLEVEL%
)

if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
  "%LOCALAPPDATA%\Programs\node\node.exe" "%ROOT%\scripts\run-android.cjs"
  exit /b %ERRORLEVEL%
)

echo [mobile] No se encontro node.exe para cmd.exe.
echo Agrega Node al PATH del sistema ^(Variables de entorno - Path^) o reinstala Node.js marcando "Add to PATH".
echo En PowerShell, "where" es distinto: usa  where.exe node  o  Get-Command node
exit /b 1
