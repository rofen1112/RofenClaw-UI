#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能文件整理器
自动按日期/类型整理下载文件夹

用法: python file_organizer.py [文件夹路径] [选项]
"""

import os
import shutil
from pathlib import Path
from datetime import datetime
import argparse

# 文件类型映射
FILE_TYPES = {
    'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'],
    'documents': ['.pdf', '.doc', '.docx', '.txt', '.md', '.xls', '.xlsx', '.ppt', '.pptx'],
    'videos': ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv'],
    'audio': ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    'archives': ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
    'code': ['.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.h', '.go', '.rs', '.ts'],
    'data': ['.json', '.xml', '.csv', '.yaml', '.yml', '.sql', '.db'],
    'executables': ['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm']
}

def get_file_category(filename):
    """根据扩展名返回文件类别"""
    ext = Path(filename).suffix.lower()
    for category, extensions in FILE_TYPES.items():
        if ext in extensions:
            return category
    return 'others'

def organize_by_type(source_dir, dry_run=False):
    """按文件类型整理"""
    source_path = Path(source_dir)
    moved_count = 0
    
    for file_path in source_path.iterdir():
        if file_path.is_file():
            category = get_file_category(file_path.name)
            target_dir = source_path / category
            
            if not target_dir.exists() and not dry_run:
                target_dir.mkdir()
            
            target_path = target_dir / file_path.name
            
            # 处理重名文件
            counter = 1
            original_target = target_path
            while target_path.exists() and not dry_run:
                stem = original_target.stem
                suffix = original_target.suffix
                target_path = target_dir / f"{stem}_{counter}{suffix}"
                counter += 1
            
            if dry_run:
                print(f"[预览] {file_path.name} -> {category}/")
            else:
                shutil.move(str(file_path), str(target_path))
                print(f"✓ {file_path.name} -> {category}/")
            
            moved_count += 1
    
    return moved_count

def organize_by_date(source_dir, dry_run=False):
    """按修改日期整理 (年/月)"""
    source_path = Path(source_dir)
    moved_count = 0
    
    for file_path in source_path.iterdir():
        if file_path.is_file():
            # 获取文件修改时间
            mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
            year_month = f"{mtime.year}/{mtime.strftime('%m-%m月')}"
            
            target_dir = source_path / year_month
            if not target_dir.exists() and not dry_run:
                target_dir.mkdir(parents=True)
            
            target_path = target_dir / file_path.name
            
            # 处理重名
            counter = 1
            original_target = target_path
            while target_path.exists() and not dry_run:
                stem = original_target.stem
                suffix = original_target.suffix
                target_path = target_dir / f"{stem}_{counter}{suffix}"
                counter += 1
            
            if dry_run:
                print(f"[预览] {file_path.name} -> {year_month}/")
            else:
                shutil.move(str(file_path), str(target_path))
                print(f"✓ {file_path.name} -> {year_month}/")
            
            moved_count += 1
    
    return moved_count

def main():
    parser = argparse.ArgumentParser(description='智能文件整理器')
    parser.add_argument('path', nargs='?', default='.', help='要整理的文件夹路径 (默认: 当前目录)')
    parser.add_argument('--by-date', '-d', action='store_true', help='按日期整理')
    parser.add_argument('--by-type', '-t', action='store_true', help='按类型整理 (默认)')
    parser.add_argument('--dry-run', '-n', action='store_true', help='预览模式，不实际移动文件')
    
    args = parser.parse_args()
    
    source_dir = Path(args.path).expanduser().resolve()
    
    if not source_dir.exists():
        print(f"❌ 错误: 路径不存在 {source_dir}")
        return
    
    print(f"📁 整理文件夹: {source_dir}")
    print(f"{'='*50}")
    
    if args.by_date:
        print("📅 按日期整理模式")
        count = organize_by_date(source_dir, args.dry_run)
    else:
        print("📂 按类型整理模式")
        count = organize_by_type(source_dir, args.dry_run)
    
    print(f"{'='*50}")
    mode = "预览" if args.dry_run else "完成"
    print(f"✅ {mode}: 处理了 {count} 个文件")

if __name__ == '__main__':
    main()
