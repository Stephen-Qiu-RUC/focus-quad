# Build a Windows NSIS installer for 四象 (Quadrant).
# Run from the repo root in PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-windows.ps1

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path "$PSScriptRoot\..")

function Assert-Cmd($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "缺少依赖：$Name" -ForegroundColor Red
    Write-Host $Hint
    exit 1
  }
}

Write-Host "==> 检查环境..." -ForegroundColor Cyan
Assert-Cmd "node" "请安装 Node.js 20+：https://nodejs.org 或 winget install OpenJS.NodeJS.LTS"
Assert-Cmd "npm"  "请重新打开终端，确保 npm 在 PATH 中"
Assert-Cmd "rustc" "请安装 Rust：winget install Rustlang.Rustup ，然后重新打开终端并执行 rustup default stable"
Assert-Cmd "cargo" "请重新打开终端，确保 cargo 在 PATH 中"

$nodeMajor = [int]((node -v).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 20) {
  Write-Host "需要 Node.js 20+，当前为 $(node -v)" -ForegroundColor Red
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
  Write-Host "未检测到 Visual C++ 生成工具。" -ForegroundColor Yellow
  Write-Host "请安装后重试："
  Write-Host "  winget install Microsoft.VisualStudio.2022.BuildTools"
  Write-Host "安装时勾选「使用 C++ 的桌面开发」。"
  exit 1
}

Write-Host "==> 安装 npm 依赖..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> 打包 Windows 安装程序（NSIS）..." -ForegroundColor Cyan
npm run desktop:build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$bundle = Get-ChildItem -Path "src-tauri\target\release\bundle\nsis" -Filter "*.exe" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

Write-Host ""
if ($bundle) {
  Write-Host "打包完成：" -ForegroundColor Green
  Write-Host "  $($bundle.FullName)"
  Write-Host ""
  Write-Host "双击安装即可。安装包为当前用户安装，不需要管理员权限。"
} else {
  Write-Host "构建已结束，请到 src-tauri\target\release\bundle\nsis\ 查看安装包。" -ForegroundColor Green
}
