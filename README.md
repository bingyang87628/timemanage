# 番茄时钟任务管理工具

一个简洁而强大的番茄工作法任务管理工具，帮助你提高工作效率和时间管理能力。

## 功能特点

- 🍅 经典番茄时钟
  - 25分钟工作时间
  - 5分钟休息时间
  - 可自定义时间长度
  - 优雅的进度条动画

- 📝 任务管理
  - 添加、编辑、删除任务
  - 拖拽排序优先级
  - 任务完成状态追踪
  - 与番茄钟联动

- 📊 数据统计
  - 每日完成番茄数
  - 专注时间统计
  - 任务完成率分析
  - 黄金时间段分析

## 技术特点

- 纯前端实现，无需后端
- 使用 LocalStorage 本地存储
- 响应式设计，支持移动端
- 原生 JavaScript，无框架依赖

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/pomodoro-timer.git
```

2. 打开项目
```bash
cd pomodoro-timer
```

3. 运行项目
- 使用任意 HTTP 服务器运行，例如：
  - Python: `python -m http.server 8080`
  - Node.js: `npx http-server`
  - PHP: `php -S localhost:8080`
- 或直接在浏览器中打开 `index.html`

## 使用说明

1. 番茄时钟
   - 点击开始按钮启动计时
   - 可选择预设时间或自定义时间
   - 工作时间结束后自动提醒

2. 任务管理
   - 输入任务内容并点击添加
   - 拖拽任务调整优先级
   - 点击任务切换完成状态

3. 数据统计
   - 点击"查看详细统计"进入统计页面
   - 查看各类数据分析图表
   - 获取工作效率建议

## 项目结构

```
📦 pomodoro-timer/
├── 📄 index.html      # 主页面
├── 📄 statistics.html # 统计页面
├── 📄 style.css      # 样式文件
├── 📄 script.js      # 计时器核心逻辑
├── 📄 tasks.js       # 任务管理模块
├── 📄 statistics.js  # 数据统计核心
├── 📄 statisticsUI.js # 统计界面渲染
└── 📄 confetti.js    # 特效模块
```

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 开源协议

MIT License 