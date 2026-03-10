# RofenClaw

<p align="center">
  <strong>🦁 AI 智能助手桌面控制台</strong>
</p>

<p align="center">
  基于 OpenClaw 的现代化桌面应用，提供直观的图形界面来管理和交互 AI 分身。
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#文档">文档</a> •
  <a href="#技术栈">技术栈</a>
</p>

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🤖 智能对话 | 与 AI 分身进行自然语言交互 |
| 🎭 分身管理 | 创建、配置和管理多个 AI 分身 |
| 🛠️ 技能库 | 安装和管理 AI 技能扩展 |
| 📊 状态监控 | 实时监控系统状态和资源使用 |
| 💻 开发者工具 | 内置代码编辑器和执行环境 |
| 📝 日志查看 | 详细的系统日志和调试信息 |
| ⚙️ 系统设置 | 灵活的配置选项 |

## 🚀 快速开始

### 前置条件

- Node.js 18+
- OpenClaw (`npm install -g openclaw`)

### 安装运行

```bash
# 进入控制台目录
cd console

# 安装依赖
npm install

# 启动 Gateway（新终端）
openclaw gateway --auth none

# 启动应用
npm run dev
```

### Windows 快速启动

双击 `console/start.bat` 文件。

## 📖 文档

| 文档 | 说明 |
|------|------|
| [README.md](./console/doc/README.md) | 项目说明 |
| [INSTALLATION.md](./console/doc/INSTALLATION.md) | 安装指南 |
| [USER_GUIDE.md](./console/doc/USER_GUIDE.md) | 使用手册 |
| [DEVELOPMENT.md](./console/doc/DEVELOPMENT.md) | 开发文档 |

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript
- **桌面**: Electron
- **UI**: Ant Design 5
- **状态**: Zustand
- **构建**: Vite

## 📁 项目结构

```
.openclaw/
├── console/           # RofenClaw 桌面应用
│   ├── electron/     # Electron 主进程
│   ├── src/          # 渲染进程源码
│   ├── resources/    # 应用资源
│   ├── doc/          # 文档目录
│   └── start.bat     # Windows 启动脚本
├── workspace/        # OpenClaw 工作空间
├── agents/           # 分身数据
├── skills/           # 技能目录
└── openclaw.json     # OpenClaw 配置
```

## 📸 截图

> 截图将在正式发布时添加

## 📄 许可证

MIT License

---

<p align="center">
  Made with ❤️ by RofenClaw Team
</p>
