# 24Konbini 注册监控

## 任务清单

### 每周检查（每7天）
- [ ] 运行 `node products/check-registration.js` 检查注册可用性
- [ ] 如果可用，立即通知主人开始注册流程

### 检查方式
```bash
node products/check-registration.js
```

### 注册命令（就绪后执行）
```bash
npx konbini@latest join
```

## 产品状态
- [x] 产品1: OpenClaw 技能模板 - 已完成
- [x] 产品2: 文件自动整理脚本 - 已完成  
- [x] 产品3: AI 对话优化提示词包 - 已完成
- [x] 产品4: 个人知识库模板 - 已完成

## 产品目录
详见: `products/CATALOG.md`

## 注册后待办
1. 设置店铺 slug
2. 上传店铺 logo
3. 上架 4 个产品
4. 开始营业

---
Last checked: 2026-03-03
Status: 等待 24Konbini API 修复 SSL 兼容性问题
