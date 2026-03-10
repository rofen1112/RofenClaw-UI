# OpenClaw 控制台

一个现代化的 OpenClaw 桌面控制台应用，提供可视化界面管理 AI 助手。

## 功能特性

- 🚀 **启动画面** - 品牌化启动体验
- 📊 **状态监控** - 实时可视化 OpenClaw IP 人物在空间场景中的活动状态
- 💬 **智能对话** - 支持推理过程可视化展示
- 🤖 **分身管理** - 便捷创建、配置、切换 AI 分身
- 📦 **技能库** - 可视化安装、管理技能扩展
- ⚙️ **设置中心** - 全界面化配置，无需代码操作
- 🎨 **双主题** - 支持深色/浅色模式切换
- 🌐 **全汉化** - 完整中文界面

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **桌面框架**: Electron 28+
- **构建工具**: Vite

## 项目结构

```
console/
├── electron/                 # Electron 主进程
│   ├── main.js              # 主进程入口
│   └── preload.js           # 预加载脚本
├── src/                     # 前端源码
│   ├── components/          # 通用组件
│   │   ├── Layout.tsx       # 布局组件
│   │   ├── Sidebar.tsx      # 侧边栏
│   │   └── TitleBar.tsx     # 标题栏
│   ├── views/               # 页面视图
│   │   ├── Home.tsx         # 主页
│   │   ├── Status.tsx       # 状态监控
│   │   ├── Chat.tsx         # 对话界面
│   │   ├── Agents.tsx       # 分身管理
│   │   ├── Skills.tsx       # 技能库
│   │   └── Settings.tsx     # 设置中心
│   ├── stores/              # 状态管理
│   │   ├── themeStore.ts    # 主题状态
│   │   ├── statusStore.ts   # 状态监控
│   │   ├── agentStore.ts    # Agent状态
│   │   └── skillStore.ts    # 技能状态
│   ├── i18n/                # 国际化
│   │   └── zh-CN.ts         # 中文语言包
│   ├── types/               # 类型定义
│   └── styles/              # 全局样式
├── resources/               # 资源文件
│   └── splash.html          # 启动画面
└── public/                  # 静态资源
```

## 开发指南

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
cd console
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建应用

```bash
npm run build:electron
```

## 与 OpenClaw 集成

控制台通过以下方式与现有 OpenClaw 系统集成：

1. **Gateway API**: 通过 HTTP 连接 `localhost:18789`
2. **配置文件**: 读写 `~/.openclaw/openclaw.json`
3. **会话存储**: 复用 `agents/*/sessions/`
4. **技能系统**: 通过 API 调用现有技能

## 状态监控说明

状态监控面板展示 OpenClaw IP 人物（🦁）在 3D 空间场景中的活动：

- **空闲状态**: 人物轻微浮动，光晕柔和
- **思考状态**: 光晕变为橙黄色，表示正在推理
- **工作状态**: 光晕变为绿色，表示正在执行任务
- **对话状态**: 光晕变为青色，表示正在对话

## 许可证

MIT License
