@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "RN=%ROOT%\node_modules\.bin\react-native.cmd"
if not exist "%RN%" (
  echo [mobile] Falta node_modules\.bin\react-native.cmd. Ejecuta: pnpm install
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 goto try_pf
call "%RN%" start
exit /b %ERRORLEVEL%

:try_pf
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
  call "%RN%" start
  exit /b %ERRORLEVEL%
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
  call "%RN%" start
  exit /b %ERRORLEVEL%
)

if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
  set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
  call "%RN%" start
  exit /b %ERRORLEVEL%
)

echo [mobile] No se encontro node.exe. Ver run-android.cmd.
exit /b 1
