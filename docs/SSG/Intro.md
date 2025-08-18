---
title: Intro
sidebar_position: 1
---

# 介绍
本网站所有内容均为自己记录备用。  
本章是根据 ChatGPT 的指示和引导，从零开始的 SSG 学习过程。使用的是 Docusaurus 进行搭建。

# 环境准备

<!-- 选中表格，按 Shift + Alt + F ，即可自动对齐 -->

| 组件                  | 推荐版本     | 安装途径（任选其一）                                     |
| ------------------- | -------- | ---------------------------------------------- |
| **Node.js**（自带 npm） | ≥ 18 LTS | 1) 官方 MSI 安装包 2) **winget** 3) **nvm-windows** |
| **Git for Windows** | ≥ 2.40   | 同上：MSI / winget / choco                        |

## 安装
### 使用 Windows 包管理器 winget（最快捷）  

1. 打开 Powershell（管理员）

```powershell title="PowerShell (Admin)"
winget install --id OpenJS.NodeJS.LTS          # 安装 Node.js 18/20 LTS，含 npm
winget install --id Git.Git                    # 安装 Git

#安装 npm，解决 powershell 把 npm 当脚本的问题
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

## 本次以 TypeScript 为例，没有选 Javascript
```

2. 安装完成后关闭全部 PowerShell 终端，重新打开一个窗口，使新环境变量生效。
3. 验证：  

```powershell title="PowerShell"
node -v        # 例如 v20.12.0
npm -v         # 例如 10.5.0
git --version  # 例如 git version 2.44.0.windows.1
```

## Docusaurus 初始化  

例：切换到 TypeScript 模板，创建一个 lab-protocol 的文件（？）

```powershell title="PowerShell"
npx create-docusaurus@latest lab-protocol classic
cd lab-protocol
npm install
npm run start
```

## 初始化完成

在 http://localhost:3000/docs/intro 看到示例站点，说明依赖安装和热更新链路一切正常。

## 保持该窗口开启，打开其他窗口写代码
1. 保持此窗口开着，另开一个新的 PowerShell / VS Code 终端来编辑 docs/ 或配置文件。
2. 每当你保存 Markdown / TSX 文件，开发服务器会自动重新编译并在浏览器中热更新，无需手动刷新。


