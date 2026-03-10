# RofenClaw - OpenClaw 桌面控制台

<p align="center">
  <img src="../resources/icon.png" alt="RofenClaw Logo" width="128" height="128">
</p>

<p align="center">
  <strong>🦁 RofenClaw - AI 智能助手桌面控制台</strong>
</p>

<p align="center">
  基于 OpenClaw 的现代化桌面应用，提供直观的图形界面来管理和交互 AI 分身。
</p>

---

## ✨ 功能特性

- 🤖 **智能对话** - 与 AI 分身进行自然语言交互
- 🎭 **分身管理** - 创建、配置和管理多个 AI 分身
- 🛠️ **技能库** - 安装和管理 AI 技能扩展
- 📊 **状态监控** - 实时监控系统状态和资源使用
- 💻 **开发者工具** - 内置代码编辑器和执行环境
- 📝 **日志查看** - 详细的系统日志和调试信息
- ⚙️ **系统设置** - 灵活的配置选项

## 📋 系统要求

- **操作系统**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Node.js**: v18.0.0 或更高版本
- **内存**: 最少 4GB RAM
- **磁盘空间**: 最少 500MB

## 🚀 快速开始

### 1. 安装依赖

```bash
cd console
npm install
```

### 2. 启动 OpenClaw Gateway

```bash
openclaw gateway --auth none
```

### 3. 启动应用

**开发模式：**
```bash
npm run dev
```

**生产模式：**
```bash
npm run build
npm start
```

### 4. 使用启动脚本 (Windows)

双击 `start.bat` 文件即可启动应用。

## 📖 详细文档

- [安装指南](./INSTALLATION.md) - 详细的安装步骤
- [使用手册](./USER_GUIDE.md) - 完整的功能说明
- [开发文档](./DEVELOPMENT.md) - 开发者指南

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron
- **UI 组件**: Ant Design 5
- **状态管理**: Zustand
- **构建工具**: Vite
- **样式方案**: CSS Modules

## 📁 项目结构

```
console/
├── electron/           # Electron 主进程
│   ├── main.cjs       # 主进程入口
│   └── preload.cjs    # 预加载脚本
├── src/               # 渲染进程源码
│   ├── components/    # UI 组件
│   ├── views/         # 页面视图
│   ├── stores/        # 状态管理
│   ├── services/      # 服务层
│   └── styles/        # 全局样式
├── resources/         # 应用资源
│   ├── icon.png       # 应用图标
│   └── splash.html    # 启动画面
├── doc/               # 文档目录
├── package.json       # 项目配置
└── start.bat          # Windows 启动脚本
```

## 🔧 配置说明

应用配置存储在 `~/.openclaw/openclaw.json` 文件中，主要配置项：

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "your-token-here"
    }
  },
  "console": {
    "language": "zh-CN",
    "autoStart": false,
    "theme": "light"
  }
}
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](../LICENSE) 文件

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw) - AI Agent 框架
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Ant Design](https://ant.design/) - React UI 组件库
- [React](https://reactjs.org/) - 用户界面库

---

<p align="center">
  Made with ❤️ by RofenClaw Team
</p>
