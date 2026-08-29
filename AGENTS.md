# AGENTS.md — Vecsy

浏览器端 SVG 编辑器。React + Vite 单页应用，部署到 Cloudflare Pages。

## 架构要点

- **模块化单页架构**：`src/main.jsx` 负责应用编排和跨模块行为组合；纯 SVG 逻辑位于 `src/editor/`，文案位于 `src/app/copy.js`，面板位于 `src/components/`，文档与画布状态分别位于 `src/hooks/`。保持模块边界清晰，避免把新的业务逻辑重新堆回入口文件。
- **不可变字符串驱动的 SVG 编辑**：SVG 内容始终以原始 markup 字符串形式存在 state（`svgMarkup`），所有编辑操作（改属性、增删图层、排序、变换）都是「解析字符串 → 用 DOM API 修改 → 序列化回字符串 → `commitDocument`」。不要引入直接操作 DOM 节点的副作用。
- **历史记录**：`commitDocument` 是唯一的变更入口，自动 push 快照到 `history.past`。撤销/重做在快照间移动。新增任何会改变 SVG 的操作，必须走 `commitDocument`，否则历史会断。
- **i18n**：所有界面文案在 `src/app/copy.js` 的 `COPY` 对象，含 `en` / `zh` / `zh-TW` / `ja` 四份，通过 `language` state 切换。新增文案必须同时补齐四语言，禁止硬编码任何语言文案到 JSX 里。
- **AI 编辑分层**：`src/ai/` 是纯客户端 VDAP 管线（schema → validate → compile → execute + `direct-ai-client`）。AI 配置（供应商 Base URL / API 格式 / API Key / 模型列表）由用户在 `AiSettingsModal` 里动态配置，存浏览器 `localStorage`（`vecsy:ai-settings`），前端直连第三方 AI API（三种格式：Chat Completions / Anthropic Messages / Responses），无服务端代理。AI 预览应用同样必须走 `commitDocument`。

## 开发命令

```bash
npm install
npm run dev      # http://localhost:5173，AI 功能直接可用（需在界面里配置 API Key）
npm run build    # 产物输出到 dist/
npm run preview  # 预览构建产物
```

AI 供应商配置在应用内「AI 模型设置」面板填写，保存在浏览器本地，无需任何环境变量。

## 部署

Cloudflare Pages Direct Upload（项目内无 CI 配置，手动部署）：

```bash
npm run build
npx wrangler pages deploy dist --project-name vecsy --branch main
```

纯静态部署，无 Functions、无 Secret、无 KV 绑定。

## 红线

- **不要引入新依赖**：项目零运行时依赖（React/Vite 之外），SVG 操作全靠原生 DOM API。新增功能优先用浏览器原生能力。
- **不要硬编码界面文案**：一律走 `COPY` 四语对象（`en` / `zh` / `zh-TW` / `ja`）。
- **任何 SVG 变更必须经 `commitDocument`**：否则撤销/重做会失同步。
- **AI 密钥只存在用户浏览器本地**：API Key 存 `localStorage`（`vecsy:ai-settings`），仅在前端直连用户自选的供应商时使用；禁止把 Key 发到 Vecsy 自己的任何服务端、写入日志或打包进 bundle。供应商端点（Base URL）必须走 HTTPS 或 localhost。

## 项目状态

- 版本 `0.6.0`，仍在功能迭代中（近期：AI v0.6——VDAP Action Runtime + 纯前端多供应商动态配置已接入，Create Mode / Evals 未实施）。
- 在线 demo：<https://vecsy.top/>
