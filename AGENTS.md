# AGENTS.md — Vecsy

浏览器端 SVG 编辑器。React + Vite 单页应用，部署到 Cloudflare Pages。

## 架构要点

- **模块化单页架构**：`src/main.jsx` 负责应用编排和跨模块行为组合；纯 SVG 逻辑位于 `src/editor/`，文案位于 `src/app/copy.js`，面板位于 `src/components/`，文档与画布状态分别位于 `src/hooks/`。保持模块边界清晰，避免把新的业务逻辑重新堆回入口文件。
- **不可变字符串驱动的 SVG 编辑**：SVG 内容始终以原始 markup 字符串形式存在 state（`svgMarkup`），所有编辑操作（改属性、增删图层、排序、变换）都是「解析字符串 → 用 DOM API 修改 → 序列化回字符串 → `commitDocument`」。不要引入直接操作 DOM 节点的副作用。
- **历史记录**：`commitDocument` 是唯一的变更入口，自动 push 快照到 `history.past`。撤销/重做在快照间移动。新增任何会改变 SVG 的操作，必须走 `commitDocument`，否则历史会断。
- **i18n**：所有界面文案在 `src/app/copy.js` 的 `COPY` 对象，含 `en` / `zh-CN` / `zh-TW` / `ja` 四份，通过 `language` state 切换。新增文案必须同时补齐四语言，禁止硬编码任何语言文案到 JSX 里。

## 开发命令

```bash
npm install
npm run dev      # 本地开发，默认 http://localhost:5173
npm run build    # 产物输出到 dist/
npm run preview  # 预览构建产物
npm test         # 运行单元测试 + 浏览器集成测试
```

## 部署

Cloudflare Pages 已接入 Git 集成：推送 `main` 即自动构建部署（CI 先跑测试），vecsy.top 与 `main` 保持一致。也可手动 Direct Upload：

```bash
npm run build
npx wrangler pages deploy dist --project-name vecsy --branch main
```

## 红线

- **不要引入新依赖**：项目零运行时依赖（React/Vite 之外），SVG 操作全靠原生 DOM API。新增功能优先用浏览器原生能力。
- **不要硬编码界面文案**：一律走 `COPY` 四语对象（`en` / `zh-CN` / `zh-TW` / `ja`）。
- **任何 SVG 变更必须经 `commitDocument`**：否则撤销/重做会失同步。

## 项目状态

- 版本 `0.5.0`（Foundation），已完成：统一 SVG 安全输入 Pipeline、CI/CD 自动化测试、IndexedDB 持久化与自动保存、Drag 统一坐标契约、Editor Transaction 最小契约。
- v0.5 后已在 `main` 追加：PNG/WebP 导出与体积优化、对齐/分布、右键菜单与图层重命名、框选多选与选择/平移工具、线段端点样式（marker 承载）与箭头图层、Alt 测距参考线、分组/多选整体拖拽、defs 孤儿资源随图层删除清理。
- 下一阶段 v0.6 — SVG Surgery：SVG Audit Panel、Global Palette、`currentColor` 转换、Clean SVG 与 Developer Export（见 `docs/v0.5/roadmap.md` §15）。
- 在线 demo（自动部署 main）：<https://vecsy.top/>
- 注意：远程存在未合并分支 `codex/v06-ai-action-runtime`（AI 能力线，含独立 v0.6 文档），与上述 v0.6 方向并存，合并前需先裁决方向。
