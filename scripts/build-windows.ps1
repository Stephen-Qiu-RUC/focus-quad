# Build a Windows NSIS installer for Quadrant (Si Xiang).
# Run from the repo root in Windows PowerShell (prefer a real Windows path,
# not \\wsl$\... which can break encoding and native toolchains):
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-windows.ps1

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

function Assert-Cmd($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "Missing dependency: $Name" -ForegroundColor Red
    Write-Host $Hint
    exit 1
  }
}

Write-Host "==> Checking environment..." -ForegroundColor Cyan
Assert-Cmd "node" "Install Node.js 20+: https://nodejs.org or winget install OpenJS.NodeJS.LTS"
Assert-Cmd "npm"  "Reopen the terminal so npm is on PATH"
Assert-Cmd "rustc" "Install Rust: winget install Rustlang.Rustup then reopen the terminal and run: rustup default stable"
Assert-Cmd "cargo" "Reopen the terminal so cargo is on PATH"

$nodeMajor = [int]((node -v).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 20) {
  Write-Host "Node.js 20+ required, current: $(node -v)" -ForegroundColor Red
  exit 1
}

# MSVC linker is required on Windows.
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$hasMsvc = $false
if (Test-Path $vswhere) {
  $inst = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if ($inst) { $hasMsvc = $true }
}
if (-not $hasMsvc) {
  Write-Host ""
  Write-Host "Visual C++ Build Tools not detected." -ForegroundColor Yellow
  Write-Host "Install then retry:"
  Write-Host "  winget install Microsoft.VisualStudio.2022.BuildTools"
  Write-Host "Select workload: Desktop development with C++"
  exit 1
}

$root = (Get-Location).Path
if ($root -like "\\wsl$*") {
  Write-Host ""
  Write-Host "You are building from a WSL path ($root)." -ForegroundColor Yellow
  Write-Host "Copy the repo to a Windows path first, for example:"
  Write-Host '  Copy-Item -Recurse \\wsl$\Ubuntu\home\qiuxiaorui\focus-quad $HOME\Desktop\focus-quad'
  Write-Host "  cd $HOME\Desktop\focus-quad"
  Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\build-windows.ps1"
  exit 1
}

Write-Host "==> Installing npm dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Building Windows NSIS installer..." -ForegroundColor Cyan
npm run desktop:build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$bundle = Get-ChildItem -Path "src-tauri\target\release\bundle\nsis" -Filter "*.exe" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

Write-Host ""
if ($bundle) {
  Write-Host "Build succeeded:" -ForegroundColor Green
  Write-Host "  $($bundle.FullName)"
  Write-Host ""
  Write-Host "Double-click the installer to install (current user, no admin needed)."
} else {
  Write-Host "Build finished. Check: src-tauri\target\release\bundle\nsis\" -ForegroundColor Green
}
