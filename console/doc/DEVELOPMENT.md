# 开发文档

本文档面向开发者，介绍 RofenClaw 的架构设计和开发指南。

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     RofenClaw Application                    │
├─────────────────────────────────────────────────────────────┤
│  渲染进程 (React)                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Views     │ │ Components  │ │   Stores    │           │
│  │  (页面)     │ │  (组件)     │ │  (状态)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│         │               │               │                   │
│         └───────────────┼───────────────┘                   │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────┐           │
│  │              Services (服务层)               │           │
│  │  Gateway API | Config | Storage             │           │
│  └──────────────────────┬──────────────────────┘           │
├─────────────────────────┼───────────────────────────────────┤
│  IPC 通信 (contextBridge)                                   │
├─────────────────────────┼───────────────────────────────────┤
│  主进程 (Electron)                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Window    │ │   Tray      │ │   IPC       │           │
│  │  (窗口)     │ │  (托盘)     │ │  (通信)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│         │                                                   │
│  ┌──────────────▼──────────────┐                           │
│  │     OpenClaw Gateway        │                           │
│  │     (AI Agent 服务)          │                           │
│  └─────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| UI 框架 | React 18 | 用户界面构建 |
| 语言 | TypeScript | 类型安全 |
| 状态管理 | Zustand | 全局状态 |
| UI 组件 | Ant Design 5 | 组件库 |
| 桌面框架 | Electron | 跨平台桌面应用 |
| 构建工具 | Vite | 开发和构建 |
| 样式 | CSS Modules | 样式隔离 |

## 📁 目录结构详解

```
console/
├── electron/                    # Electron 主进程
│   ├── main.cjs                # 主进程入口
│   │   - 窗口管理
│   │   - IPC 处理
│   │   - 托盘图标
│   │   - Gateway 通信
│   └── preload.cjs             # 预加载脚本
│       - contextBridge API 暴露
│       - 安全的 IPC 通信
│
├── src/                        # 渲染进程源码
│   ├── components/             # 可复用组件
│   │   ├── Layout.tsx         # 布局组件
│   │   ├── Sidebar.tsx        # 侧边栏
│   │   └── TitleBar.tsx       # 标题栏
│   │
│   ├── views/                  # 页面视图
│   │   ├── Home.tsx           # 主页
│   │   ├── Chat.tsx           # 对话页面
│   │   ├── Agents.tsx         # 分身管理
│   │   ├── Skills.tsx         # 技能库
│   │   ├── Settings.tsx       # 设置页面
│   │   ├── Status.tsx         # 状态监控
│   │   ├── Developer.tsx      # 开发者工具
│   │   └── Logs.tsx           # 日志查看
│   │
│   ├── stores/                 # Zustand 状态管理
│   │   ├── chatStore.ts       # 对话状态
│   │   ├── agentStore.ts      # 分身状态
│   │   ├── skillStore.ts      # 技能状态
│   │   ├── statusStore.ts     # 系统状态
│   │   └── themeStore.ts      # 主题状态
│   │
│   ├── services/               # 服务层
│   │   └── gateway.ts         # Gateway API 封装
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts           # 全局类型
│   │
│   ├── styles/                 # 全局样式
│   │   └── global.css         # 全局 CSS 变量
│   │
│   └── App.tsx                 # 应用入口
│
├── resources/                  # 应用资源
│   ├── icon.png               # 应用图标
│   └── splash.html            # 启动画面
│
├── doc/                        # 文档目录
│   ├── README.md              # 项目说明
│   ├── INSTALLATION.md        # 安装指南
│   ├── USER_GUIDE.md          # 使用手册
│   └── DEVELOPMENT.md         # 开发文档
│
├── package.json               # 项目配置
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── start.bat                 # Windows 启动脚本
```

## 🔧 开发指南

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/your-repo/rofenclaw.git
cd rofenclaw/console

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 开发命令

```bash
# 开发模式（同时启动 Vite 和 Electron）
npm run dev

# 仅启动 Vite 开发服务器
npm run dev:renderer

# 仅启动 Electron
npm run dev:electron

# 构建生产版本
npm run build

# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint
```

### 添加新页面

1. 在 `src/views/` 创建新组件：

```tsx
// src/views/NewPage.tsx
import React from 'react'
import './NewPage.css'

const NewPage: React.FC = () => {
  return (
    <div className="new-page">
      <h1>新页面</h1>
    </div>
  )
}

export default NewPage
```

2. 在 `src/App.tsx` 添加路由：

```tsx
import NewPage from './views/NewPage'

// 在 Routes 中添加
<Route path="new-page" element={<NewPage />} />
```

3. 在 `src/components/Sidebar.tsx` 添加导航：

```tsx
const navItems: NavItem[] = [
  // ...
  { path: '/new-page', icon: <YourIcon />, label: '新页面' },
]
```

### 添加新的 IPC 通信

1. 在 `electron/main.cjs` 添加处理器：

```javascript
ipcMain.handle('my-action', async (event, data) => {
  // 处理逻辑
  return result
})
```

2. 在 `electron/preload.cjs` 暴露 API：

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // ...
  myAction: (data) => ipcRenderer.invoke('my-action', data),
})
```

3. 在 `src/types/index.ts` 添加类型：

```typescript
interface Window {
  electronAPI?: {
    // ...
    myAction: (data: SomeType) => Promise<ResultType>
  }
}
```

4. 在渲染进程使用：

```typescript
const result = await window.electronAPI?.myAction(data)
```

### 状态管理

使用 Zustand 创建新的 store：

```typescript
// src/stores/myStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MyState {
  value: string
  setValue: (value: string) => void
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    { name: 'my-store' }
  )
)
```

### 样式规范

使用 CSS 变量保持主题一致性：

```css
/* 使用全局变量 */
.my-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* 可用变量 */
--bg-primary      /* 主背景 */
--bg-secondary    /* 次级背景 */
--bg-card         /* 卡片背景 */
--text-primary    /* 主文字 */
--text-secondary  /* 次级文字 */
--border-color    /* 边框颜色 */
--color-primary   /* 主色调 */
--color-success   /* 成功色 */
--color-error     /* 错误色 */
--color-warning   /* 警告色 */
```

## 🔌 Gateway API

### 连接检测

```typescript
const isConnected = await window.electronAPI?.checkGateway()
```

### 发送消息

```typescript
const response = await window.electronAPI?.gatewayChat('你好')
```

### 实现原理

Gateway 通信通过 `openclaw agent` 命令实现：

```javascript
// electron/main.cjs
const { exec } = require('child_process')

ipcMain.handle('gateway:chat', async (event, message) => {
  return new Promise((resolve, reject) => {
    exec(`openclaw agent --agent main --message "${message}" --json`, 
      (error, stdout) => {
        if (error) reject(error)
        else {
          const result = JSON.parse(stdout)
          resolve(result.result.payloads[0].text)
        }
      }
    )
  })
})
```

## 🧪 测试

### 单元测试

```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

### E2E 测试

```bash
# 运行 E2E 测试
npm run test:e2e
```

## 📦 构建发布

### 构建应用

```bash
# 构建渲染进程
npm run build

# 打包应用
npm run package
```

### 发布流程

1. 更新版本号 (`package.json`)
2. 更新变更日志
3. 构建测试
4. 创建 Git 标签
5. 发布到 GitHub Releases

## 🐛 调试

### 主进程调试

在 `electron/main.cjs` 添加日志：

```javascript
console.log('[Main]', message)
```

### 渲染进程调试

使用 React DevTools 和浏览器开发者工具。

### 查看日志

在应用的「日志」页面查看系统日志。

## 🤝 贡献代码

1. Fork 仓库
2. 创建特性分支
3. 编写代码和测试
4. 提交 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加必要的注释
- 编写单元测试

---

如有问题，请提交 [Issue](https://github.com/your-repo/rofenclaw/issues)。
