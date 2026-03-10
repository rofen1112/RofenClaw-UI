# 安装指南

本文档提供 RofenClaw 的详细安装步骤。

## 📋 前置条件

### 1. Node.js

RofenClaw 需要 Node.js 18.0.0 或更高版本。

**检查已安装版本：**
```bash
node --version
```

**安装 Node.js：**
- Windows/macOS: 从 [nodejs.org](https://nodejs.org/) 下载安装包
- Linux (Ubuntu/Debian):
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```

### 2. OpenClaw

RofenClaw 依赖 OpenClaw 作为后端服务。

**安装 OpenClaw：**
```bash
npm install -g openclaw
```

**验证安装：**
```bash
openclaw --version
```

### 3. Git (可选)

用于克隆仓库和版本管理。

```bash
git --version
```

## 🚀 安装步骤

### 方式一：从源码安装

#### 1. 获取源码

```bash
# 克隆仓库
git clone https://github.com/your-repo/rofenclaw.git
cd rofenclaw/console
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 配置 OpenClaw

确保 OpenClaw 配置文件存在：

```bash
# 初始化 OpenClaw 配置（如果不存在）
openclaw init
```

配置文件位置：`~/.openclaw/openclaw.json`

#### 4. 启动应用

**开发模式：**
```bash
npm run dev
```

**生产构建：**
```bash
npm run build
npm start
```

### 方式二：使用预构建包 (Windows)

1. 下载最新的发布包
2. 解压到任意目录
3. 双击 `start.bat` 启动

## ⚙️ 配置

### Gateway 配置

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "your-secure-token-here"
    }
  }
}
```

### 认证模式

| 模式 | 说明 | 推荐场景 |
|------|------|----------|
| `none` | 无认证 | 本地开发测试 |
| `token` | Token 认证 | 生产环境 |
| `password` | 密码认证 | 多用户环境 |

### API 密钥配置

在 `~/.openclaw/openclaw.json` 中配置 AI 提供商：

```json
{
  "models": {
    "providers": {
      "openai": {
        "baseUrl": "https://api.openai.com/v1",
        "api": "sk-your-api-key"
      },
      "moonshot": {
        "baseUrl": "https://api.moonshot.cn/v1",
        "api": "your-moonshot-api-key"
      }
    }
  }
}
```

## 🔧 故障排除

### 问题：Gateway 连接失败

**解决方案：**
1. 确认 Gateway 正在运行：
   ```bash
   openclaw gateway --auth none
   ```
2. 检查端口是否被占用：
   ```bash
   netstat -ano | findstr :18789
   ```

### 问题：依赖安装失败

**解决方案：**
1. 清除 npm 缓存：
   ```bash
   npm cache clean --force
   ```
2. 删除 node_modules 重新安装：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 问题：Electron 启动失败

**解决方案：**
1. 检查 Node.js 版本兼容性
2. 尝试禁用 GPU 加速：
   - 编辑 `electron/main.cjs`
   - 添加 `app.commandLine.appendSwitch('disable-gpu')`

### 问题：Windows 上脚本执行策略

**解决方案：**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📁 目录结构

安装完成后的目录结构：

```
~/.openclaw/
├── openclaw.json          # 主配置文件
├── workspace/             # 工作空间
│   ├── BOOTSTRAP.md       # 启动配置
│   ├── AGENTS.md          # 分身定义
│   └── ...
├── agents/                # 分身数据
│   └── main/              # 默认分身
│       ├── sessions/      # 会话历史
│       └── agent/         # 分身配置
└── skills/                # 技能目录
```

## 🔄 更新

### 更新应用

```bash
cd console
git pull
npm install
npm run build
```

### 更新 OpenClaw

```bash
npm update -g openclaw
```

## 🗑️ 卸载

1. 删除应用目录
2. 删除配置（可选）：
   ```bash
   rm -rf ~/.openclaw
   ```
3. 卸载 OpenClaw：
   ```bash
   npm uninstall -g openclaw
   ```

---

如有其他问题，请提交 [Issue](https://github.com/your-repo/rofenclaw/issues)。
