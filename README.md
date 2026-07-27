<h4 align="right"><strong>简体中文</strong> | <a href="README_EN.md">English</a></h4>

<p align="center">
  <img src="/public/favicon.svg" width="138" alt="logo">
</p>
<h1 align="center">Vector Forge</h1>

<p align="center"><strong>Vector Forge 是一个运行在浏览器中的 SVG 编辑器，支持拖入 SVG 文件后实时查看、选择和调整内部图层。</strong></p>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-AGPL%20v3-blue.svg" alt="License"></a>
</div>

<div align="center">
    <a href="https://vector-forge.wangruofeng007.com/" target="_blank">在线体验</a>
</div>

## 功能

### 导入与浏览
- 拖拽或选择 SVG 文件导入
- 左侧图层树查看 SVG 内部元素，分组可展开 / 折叠
- 点击预览图中的元素，自动选中对应图层
- 图层显示 / 隐藏

### 图层编辑
- 添加图层：矩形、圆形、椭圆、直线、折线、多边形、路径、文字
- 从内置 SVG 素材库添加：公司 Logo、动画示例、加载动画、创意动画等预设素材，点击即导入画布
- 复制 / 粘贴 / 删除图层
- 拖拽图层调整上下顺序
- 选中文字图层可在画布上直接编辑文字内容

### 画布操作
- 拖拽 SVG 图片调整画布位置
- 双指捏合、触控板或鼠标滚轮缩放
- 矢量元素支持缩放手柄调整尺寸，矩形可修改圆角半径
- 支持 Cmd/Ctrl 多选图层，并在 2D 预览中显示每个图层和组合边界

### 属性面板
- 实时编辑填充色、描边色、透明度、描边宽度
- 可折叠的属性检查器面板

### 源码与历史
- Preview / Source 视图，源码带语法高亮并可一键格式化为可折叠的层级树，点击源码元素可同步选中图层
- 修改历史记录，支持撤销 / 前进
- 导出编辑后的 SVG

### 其他
- 简体中文 / English 双语界面

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| <kbd>⌘</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Z</kbd> | 撤销 |
| <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | 重做 |
| <kbd>⌘</kbd> + <kbd>C</kbd> / <kbd>V</kbd> / <kbd>Ctrl</kbd> + <kbd>C</kbd> / <kbd>V</kbd> | 复制 / 粘贴图层 |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | 删除选中图层 |

## 技术栈

- React
- Vite
- Cloudflare Pages
- Wrangler

## 本地运行

```bash
npm install
npm run dev
```

启动后访问终端输出的本地地址，通常是 `http://localhost:5173`。

## 构建

```bash
npm run build
npm run preview
```

## 部署到 Cloudflare Pages

项目当前使用 Cloudflare Pages Direct Upload，将 Vite 构建产物上传到 Pages：

```bash
npm run build
npx wrangler pages deploy dist --project-name vector-forge --branch main
```

部署前需要先使用 Wrangler 登录 Cloudflare：

```bash
npx wrangler login
```

## 项目结构

应用入口负责编排，SVG 解析/几何/变换、共享文案、面板组件和状态 Hook 分别按职责拆分；样式仍集中在 `src/styles.css`。

```text
.
├── public/
│   ├── favicon.svg              # SVG favicon
│   ├── apple-touch-icon.png     # iOS 触摸图标 (180×180)
│   ├── icon-192.png             # PWA 图标 (192×192)
│   ├── icon-512.png             # PWA 图标 (512×512)
│   ├── icon-maskable-512.png    # PWA maskable 图标 (512×512)
│   ├── og-image.png             # 社交分享图 (1200×630)
│   ├── manifest.json            # PWA manifest
│   ├── robots.txt               # 爬虫策略（覆盖 Cloudflare 托管默认）
│   ├── sitemap.xml              # 站点地图
│   ├── _headers                 # Cloudflare Pages 缓存策略
│   └── 404.html                 # 静态 404 页（解决 SPA 软 404）
├── src/
│   ├── main.jsx     # 应用入口与业务编排
│   ├── app/copy.js  # 双语文案和显示名称
│   ├── components/  # LayerPanel、CanvasPanel、InspectorPanel、Icon
│   ├── editor/      # SVG parser、geometry、transforms
│   ├── hooks/       # 文档状态和画布交互 Hook
│   └── styles.css   # 全局样式
├── docs/
│   ├── product-roadmap.md       # 产品迭代计划
│   ├── browser-smoke-checklist.md  # 浏览器手动验收清单
│   └── web-storage-options.md   # Web 数据持久化方案选型
├── index.html
└── package.json
```

## License

Copyright (c) 2026 wangruofeng. 本项目基于 [GNU AGPL v3](./LICENSE) 开源。

- 任何人可自由使用、修改、分发本项目，包括商业用途。
- 但任何**分发**或**通过网络提供服务**（SaaS）的衍生作品，**必须以 AGPL v3 开源全部源码**，并向用户提供获取源码的途径。
- 如需将本项目用于**不允许开源衍生代码**的商业场景，请发邮件另行协商商业授权。
