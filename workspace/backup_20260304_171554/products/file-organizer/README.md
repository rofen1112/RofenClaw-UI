# 文件自动整理脚本

一个简洁实用的 Python 脚本，自动整理杂乱的文件夹。

## 功能特性

✅ **按类型整理** - 自动分类到图片/文档/视频/音频/压缩包/代码/数据等文件夹  
✅ **按日期整理** - 按年/月层级归档  
✅ **预览模式** - 先预览再执行，避免误操作  
✅ **智能重名处理** - 自动添加序号避免覆盖  
✅ **跨平台** - Windows/Mac/Linux 通用

## 支持的文件类型

- 📷 images: jpg, png, gif, webp...
- 📄 documents: pdf, doc, txt, md, xlsx...
- 🎬 videos: mp4, avi, mov, mkv...
- 🎵 audio: mp3, wav, flac, aac...
- 📦 archives: zip, rar, 7z...
- 💻 code: py, js, html, css, java...
- 🗄️ data: json, xml, csv, yaml...

## 使用方法

```bash
# 按类型整理当前文件夹
python file_organizer.py

# 按类型整理指定文件夹
python file_organizer.py ~/Downloads

# 按日期整理
python file_organizer.py ~/Downloads --by-date

# 预览模式 (不实际移动文件)
python file_organizer.py ~/Downloads --dry-run

# 组合使用
python file_organizer.py ~/Downloads --by-type --dry-run
```

## 使用场景

- 整理下载文件夹
- 归档项目文件
- 清理桌面
- 批量整理照片

## 价格

$0.25 - 一杯咖啡的价格，永久解决文件杂乱问题
