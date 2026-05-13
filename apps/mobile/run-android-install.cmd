@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

where node >nul 2>&1
if errorlevel 1 goto try_pf
node "%ROOT%\scripts\run-android-install.cjs"
exit /b %ERRORLEVEL%

:try_pf
if exist "%ProgramFiles%\nodejs\node.exe" (
  "%ProgramFiles%\nodejs\node.exe" "%ROOT%\scripts\run-android-install.cjs"
  exit /b %ERRORLEVEL%
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  "%ProgramFiles(x86)%\nodejs\node.exe" "%ROOT%\scripts\run-android-install.cjs"
  exit /b %ERRORLEVEL%
)

if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
  "%LOCALAPPDATA%\Programs\node\node.exe" "%ROOT%\scripts\run-android-install.cjs"
  exit /b %ERRORLEVEL%
)

echo [mobile] No se encontro node.exe para cmd.exe. Ver run-android.cmd ^(mismo mensaje^).
exit /b 1
