# 备份说明 - OpenClaw Workspace

## 备份信息

| 项目 | 内容 |
|------|------|
| **备份时间** | 2026-03-04 17:15:54 (Asia/Shanghai) |
| **OpenClaw 版本** | v2026.2.26 (待更新至 v2026.3.2) |
| **备份原因** | 更新前预防性备份 |

## 备份内容清单

### 核心身份文件
- `AGENTS.md` - 工作区规则和行为指南
- `SOUL.md` - 核心人格设定
- `USER.md` - 用户信息（空白，待填写）
- `IDENTITY.md` - 助手身份定义（空白，待填写）

### 记忆系统
- `MEMORY.md` - 长期记忆（如存在）
- `memory/` 目录 - 每日记忆文件
  - 包含历史对话记录和每日日志

### 工具与技能
- `TOOLS.md` - 本地工具配置
- `skills/` 目录 - 已安装的技能
  - clawhub (官方)
  - healthcheck (官方)
  - skill-creator (官方)
  - weather (官方)
  - brave-search (自定义)
  - cron-scheduling (自定义)
  - decision-frameworks (自定义)
  - edge-tts (自定义)
  - logging-observability (自定义)
  - search-cluster (自定义)
  - wps-word-automation (自定义)

### 项目文件
- `products/` 目录 - 24Konbini 产品目录
  - CATALOG.md
  - check-registration.js
  - 4个产品子目录

### 自动化配置
- `HEARTBEAT.md` - 定时任务配置（24Konbini 注册监控）

## 更新后验证清单

更新完成后，检查以下项目是否正常：

- [ ] 工作区目录结构完整
- [ ] 所有 `.md` 文件可读
- [ ] 技能目录存在且包含所有技能
- [ ] 记忆文件可正常访问
- [ ] 心跳任务正常运行

## 还原方法

如需还原，将此备份目录中的文件复制回工作区根目录即可：

```powershell
# 假设在备份目录中
Copy-Item -Path * -Destination "C:\Users\RofenBB\.openclaw\workspace" -Recurse -Force
```

---
**备份由助手自动创建**
