---
title: 基本命令-新建/删除/修改
sidebar_position: 2
---

# 新建

## 新建一个 Blog 网站
1. 在任意盘中新建一个文件夹
2. 用 VSCode 打开  
打开 VSCode → File → Open Folder

## 新建一个目录
### 新建目录  
例：新建一个名为 SSG 的目录

```powershell title="PowerShell"
New-Item -ItemType Directory -Name SSG
```

### 新建子目录  
例：新建一个名为 New 的 SSH 子目录

```powershell title="PowerShell"
New-Item -ItemType File -Path .\SSG\New.md
```

### 新建规则
新建的目录中不能有空格，如果想新建一个名为 “ Basic Experiments ” 的子目录

```powershell title="PowerShell"  
# 错误示例
New-Item -ItemType File -Path .\SSG\Basic Experiments.md  

# 正确示例 1
New-Item -ItemType File -Path .\SSG\Basic-Experiments.md  

# 正确示例 2
New-Item -ItemType File -Path '.\SSG\Basic Experiments.md' -Force
```

# 删除
例：删除一个在 Experiments 目录下面叫做 Basic 的目录

```powershell title="PowerShell"
Remove-Item 'F:\lab-protocol\docs\Experiments\Basic' -Recurse -Force
```

# 修改
例：将 SSH 改为 SSG

```powershell title="PowerShell"
Rename-Item -Path "F:\lab-protocol\docs\SSH" -NewName "SSG"
```