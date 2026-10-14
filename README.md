# 四象 · Quadrant

基于艾森豪威尔矩阵的待办应用。网页版可直接运行；桌面版通过 **Tauri 2** 打包为 Windows 安装程序。

## 网页版

需要 Node.js 20+。

```bash
npm install
npm run dev
```

打开 <http://localhost:4317>。

## Windows 桌面安装包

当前仓库已接好 Tauri。Windows 安装包需要在 **Windows 本机**（或 GitHub Actions）上构建——Linux/macOS 无法直接打出 `.exe` 安装程序。

### 一次性准备环境

在 **PowerShell** 中安装依赖（只需做一次）：

```powershell
winget install OpenJS.NodeJS.LTS
winget install Rustlang.Rustup
winget install Microsoft.VisualStudio.2022.BuildTools
```

安装 Visual Studio Build Tools 时，勾选 **「使用 C++ 的桌面开发」**。

装完后 **关掉并重新打开** PowerShell，执行：

```powershell
rustup default stable
node -v
rustc -V
```

Windows 10/11 一般已自带 **WebView2**；若启动报错，再安装 [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。

### 一键打包

在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-windows.ps1
```

成功后安装包在：

```
src-tauri\target\release\bundle\nsis\
```

文件名类似 `四象_0.1.0_x64-setup.exe`。双击安装（默认装到当前用户，无需管理员）。

也可以手动执行：

```powershell
npm install
npm run desktop:build
```

开发时调试桌面窗口：

```powershell
npm run tauri:dev
```

### 用 GitHub Actions 自动打包

若仓库已推到 GitHub，可在 Actions 里手动运行 **Windows Installer**，或打 `v*` 标签触发；产物在 workflow 的 Artifacts 里下载。

## 功能概览

- 四象限画布与收集箱，拖拽分类与排序
- 快速添加（⌘K / Ctrl+K / N），支持中文自然语言日期与 `!重要` / `#标签`
- 截止不足 24 小时的「安排时间」任务会提示升级到「立即去做」
- 浅色 / 深色；桌面、平板、手机布局
- 数据保存在本机浏览器 / 桌面应用的本地存储，可导出 JSON

## 技术栈

Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · dnd-kit · Framer Motion · chrono-node · Tauri 2
