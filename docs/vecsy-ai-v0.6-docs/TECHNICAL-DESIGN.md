# Vecsy AI v0.6 — Technical Design

> 版本：v0.6.0
> 状态：部分实施 — 本地 Action Runtime 已完成
> 最近更新：2026-08-22

---

## 0. 当前实施状态

已实现：

- `src/ai/` 中的 VDAP schema、context、validator、compiler、executor 和 Demo quick actions；
- `src/ai/ai-client.js` 中的 Provider-agnostic `editDesign()` / `generateDesign()` 合约、Demo Adapter 和 HTTP Adapter；
- `functions/api/ai/` 中的 Cloudflare Pages Functions：`edit.js`（请求防护、KV 限流（可选）、系统提示词、信封形状检查）、`generate.js`（503 桩）与 `_lib/`（guards / prompt / provider / rate-limit）；
- 首个 Provider 适配器：DeepSeek（`deepseek-chat`，`response_format: json_object`，`temperature: 0`），经 `DEEPSEEK_API_KEY` 服务端密钥启用；
- `useAiDesign` 的 `thinking` 状态、35s 客户端超时中止、`retry()` 与本地 Preview / Apply / Cancel 流程、文档版本与选择集保护；
- `AiCommandBar`、`AiPreviewPanel`、`AiQuickActions`，以及四语言界面文案；
- `resize`、`replace-text`、`insert-shape` 的 Editor Transaction 支持；
- Function `_lib` 的单元测试与预览、Action Runtime、Provider 生命周期的浏览器测试。

尚未实现：`AiGeneratePanel`、Create Mode、Prompt → SVG、生产级遥测与 Evals。

命令栏自由文本输入经 `POST /api/ai/edit` 调用真实模型（未配置密钥时返回 `PROVIDER_NOT_CONFIGURED`）；快捷操作与 JSON 调试仍在本地确定性执行，不请求网络。

---

## 1. 技术目标

在不改变 Vecsy「SVG Markup = Canonical Document」原则的前提下增加 AI Editing。

核心原则：

1. AI 不拥有独立 Document Model；
2. AI 与手工编辑必须操作同一个 SVG；
3. AI Edit 不直接返回完整 SVG；
4. LLM 输出语义级 Design Actions；
5. Vecsy 将 Design Actions 编译为现有 Editor Transactions；
6. AI Preview 不写 History；
7. Apply 后只产生一次 History；
8. 所有 Generate SVG 必须经过现有 Security Pipeline；
9. 所有 Action Batch 必须原子执行；
10. AI 失败不得改变当前 Document。

---

## 2. 总体架构

```text
┌──────────────────────────────────────┐
│              UI Layer                │
│                                      │
│ Generate / Command Bar / Preview     │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│               AI Layer               │
│                                      │
│ Prompt / Context / Design Actions    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│        Design Action Runtime         │
│                                      │
│ Validate / Compile / Execute         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│        Editor Transaction Layer      │
│                                      │
│ editSvgDocument() / Geometry         │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│          Document Layer              │
│                                      │
│ Canonical SVG / History / Storage    │
└──────────────────────────────────────┘
```

---

## 3. 现有基础复用

Vecsy 当前已有：

```text
editSvgDocument(markup, transaction)
```

并支持：

- set-attributes；
- set-transform；
- translate；
- translate-by-id；
- group；
- remove。

当前：

```text
commitDocument()
```

负责：

- parse；
- markup；
- elements；
- history；
- selection；
- dirty；
- recent documents。

v0.6 不重新实现 History。

AI Preview 最终 Apply 时只调用一次：

```text
commitDocument(previewMarkup)
```

---

## 4. 为什么不让 LLM 直接输出 EditorTransaction

EditorTransaction 属于内部低层 API。

例如：

```text
set-transform
matrix(...)
```

模型直接操作容易破坏已有 transform。

因此定义两层：

```text
User Intent
   ↓
AI Design Action
   ↓
Action Compiler
   ↓
Editor Transaction
```

AI Action 使用语义描述：

```json
{
  "type": "resize",
  "targetIds": ["node-12"],
  "scale": 1.25
}
```

Vecsy 自己负责转成具体 SVG 变换。

---

## 5. 模块设计

目标目录中，以下模块已经实现：

```text
src/
├── ai/
│   ├── design-action-schema.js
│   ├── build-design-context.js
│   ├── validate-design-actions.js
│   ├── compile-design-actions.js
│   ├── execute-design-actions.js
│   ├── ai-client.js
│   └── quick-actions.js
│
├── components/
│   ├── AiCommandBar.jsx
│   ├── AiPreviewPanel.jsx
│   └── AiQuickActions.jsx
│
├── hooks/
│   ├── useAiDesign.js
│   └── useEditorDocument.js
│
└── editor/
    ├── edit-svg-document.js
    ├── svg-parser.js
    ├── svg-transforms.js
    └── process-svg-input.js
```

`AiGeneratePanel.jsx` 仍是后续计划。`functions/api/ai/` 已实现并部署为 Cloudflare Pages Functions：

```text
functions/
└── api/
    └── ai/
        ├── edit.js          # POST /api/ai/edit：防护 → 限流 → Provider → 信封检查
        ├── generate.js      # 503 桩，Create Mode 后续实现
        └── _lib/
            ├── errors.js    # 统一错误码与 JSON 响应
            ├── guards.js    # 同源、Content-Type、体积、prompt 与 selection 上限
            ├── prompt.js    # VDAP 系统提示词与用户消息构建
            ├── provider.js  # DeepSeek 适配器（OpenAI 兼容，JSON mode）
            └── rate-limit.js# KV 限流（20 次/IP/天 + 突发限制，绑定缺失时跳过）
```

`DEEPSEEK_API_KEY` 仅存在于 Cloudflare 服务端 Secret 与本地环境（shell 导出或 git-ignore 的 `.env`，由 `scripts/dev-ai.mjs` 解析后经 `wrangler pages dev -b` 注入）；`AI_MODEL`、`DEEPSEEK_BASE_URL` 可覆盖默认模型与端点。本地运行用 `npm run dev:ai`（wrangler 代理 vite）。

---

## 6. useAiDesign

完整目标状态建议统一管理：

```text
idle
generating
editing
validating
preview
applying
error
```

状态：

```js
{
  status,
  requestId,
  baseRevision,
  prompt,
  previewMarkup,
  actions,
  summary,
  error
}
```

核心 API：

```js
generate(prompt, options)
editSelection(prompt)
applyPreview()
cancelPreview()
retry()
```

当前实现仅管理本地编辑所需的 `idle`、`validating`、`preview`、`applying` 与 `error`，并提供 `previewPrompt()`、`previewDemo()`、`submitJson()`、`applyPreview()`、`cancelPreview()`；`useAiDesign` 通过注入的 `aiClient.editDesign()` 获取 Envelope。`generate()`、`editSelection()` 和 `retry()` 需在真实 Provider 接入后实现。

---

## 7. Build Design Context

Selection Edit 不发送完整 SVG。

建议 Context：

```json
{
  "document": {
    "viewBox": "0 0 512 512",
    "width": 512,
    "height": 512
  },
  "selection": [
    {
      "id": "node-5",
      "tag": "circle",
      "name": "Left Eye",
      "attributes": {
        "cx": "190",
        "cy": "210",
        "r": "5",
        "fill": "#111111"
      }
    }
  ],
  "siblings": [],
  "parent": null,
  "styleTokens": {
    "colors": ["#111111", "#6366F1"]
  }
}
```

原则：

- 默认仅发送 Selection；
- 需要布局时附 Parent；
- 需要一致性时附 Siblings；
- 不传 DOM Node；
- 不传 React State；
- 不传历史记录；
- 除 Whole Document Edit 外不传完整 SVG。

---

## 8. AI Provider Boundary

当前已先落地客户端合约：

```js
const aiClient = {
  editDesign({ prompt, context, signal }) {},
  generateDesign({ prompt, options, signal }) {},
}
```

Demo Adapter 将现有预置 Prompt 映射为 VDAP Envelope；HTTP Adapter 只负责向 `/api/ai/edit` 与 `/api/ai/generate` 发送 JSON，并统一映射请求失败、超时和限流错误。Cloudflare Function、Provider Adapter 和服务端 Secret 仍需后续配置后才能启用。

第一版只支持一个 Provider。

统一接口：

```js
generateDesign(input)
editDesign(input)
```

内部：

```text
Cloudflare Function
    ↓
Provider Adapter
    ↓
LLM
```

禁止 UI 直接感知：

```text
OpenAI
Anthropic
Gemini
```

未来更换模型时只改 Provider Adapter。

---

## 9. Create Mode Pipeline

```text
Prompt
  ↓
POST /api/ai/generate
  ↓
Provider
  ↓
Complete SVG
  ↓
processSvgInput(source: "ai")
  ↓
accepted / sanitized
  ↓
parseSvg()
  ↓
Preview
  ↓
loadDocument()
```

### 必须限制 AI Generate 的 SVG 能力

P0 允许：

- svg；
- g；
- rect；
- circle；
- ellipse；
- line；
- polyline；
- polygon；
- path；
- text；
- defs；
- linearGradient；
- radialGradient；
- clipPath；
- mask。

P0 默认禁止：

- script；
- foreignObject；
- iframe；
- object；
- embed；
- external href；
- external image；
- network resource；
- event handler；
- remote font；
- arbitrary CSS fetch。

即使模型返回，也必须经过 Security Pipeline。

---

## 10. Edit Mode Pipeline

```text
Prompt
+
Design Context
  ↓
POST /api/ai/edit
  ↓
Design Actions
  ↓
Schema Validate
  ↓
Semantic Validate
  ↓
Compile
  ↓
Dry-run Execute
  ↓
Preview Markup
  ↓
Apply
  ↓
commitDocument()
```

Edit Mode 禁止模型返回完整 SVG 作为主协议。

---

## 11. Validation 分层

### 11.1 Schema Validation

校验：

- version；
- action type；
- required fields；
- enum；
- number range；
- array length；
- targetIds format。

### 11.2 Semantic Validation

校验：

- targetId 是否存在；
- targetId 是否允许操作；
- action 是否符合 tag；
- 数值是否有限；
- 颜色是否合法；
- opacity 是否在 0~1；
- scale 是否在合理范围；
- insert 是否属于允许元素；
- 未选中元素是否被越权修改。

### 11.3 Runtime Validation

执行完必须再次：

```text
parseSvg(result)
```

确保结果仍为合法 Canonical SVG。

---

## 12. Selection Boundary

Edit Selection 默认规则：

```text
action.targetIds ⊆ selectedIds
```

例外：

- group；
- insert；
-明确允许操作 parent 的 action。

否则 reject：

```text
OUT_OF_SELECTION_TARGET
```

Whole Document Edit 在 P1 单独开放，不与 Selection Edit 混用。

---

## 13. Preview Runtime

Preview 必须是纯 Dry Run。

伪流程：

```js
let markup = currentMarkup

for (const action of actions) {
  const transactions = compile(action, context)

  for (const transaction of transactions) {
    markup = editSvgDocument(markup, transaction).markup
  }
}

parseSvg(markup)

return markup
```

期间：

- 不 `commitDocument`；
- 不改 IndexedDB；
- 不写 History；
- 不改 dirty；
- 不记录 Recent Document。

---

## 14. Apply Runtime

用户点击 Apply：

```js
commitDocument(previewMarkup, {
  nextSelectedIds,
  nextSelectedId,
  nextDirty: true
})
```

只调用一次。

这样天然实现：

```text
1 Prompt
=
1 History Snapshot
=
1 Undo
```

---

## 15. Atomic Execution

Action Batch 在 Preview 前必须全部验证。

实现建议：

```text
validate schema
      ↓
validate semantic
      ↓
compile all
      ↓
execute on local markup
      ↓
parse final markup
      ↓
preview
```

任何阶段失败：

```text
discard temporary markup
return error
```

当前文档保持原样。

---

## 16. Revision Guard

现有文档层建议增加 monotonically increasing revision：

```js
documentRevision
```

任何 Document Commit：

```text
revision += 1
```

发送 AI 请求：

```js
{
  requestId,
  baseRevision: documentRevision,
  selectionIds
}
```

收到响应：

```js
if (baseRevision !== documentRevision) {
  return DOCUMENT_CHANGED
}
```

---

## 17. API

### POST /api/ai/generate

Request：

```json
{
  "prompt": "Create a minimal cloud upload icon",
  "preset": "icon",
  "width": 24,
  "height": 24
}
```

Response：

```json
{
  "requestId": "req_xxx",
  "title": "Cloud Upload",
  "svg": "<svg ...>...</svg>"
}
```

### POST /api/ai/edit

Request：

```json
{
  "prompt": "Make the eyes larger and blue",
  "context": {
    "document": {},
    "selection": [],
    "styleTokens": {}
  }
}
```

Response：

```json
{
  "requestId": "req_xxx",
  "version": "1.0",
  "summary": "Increase both eyes and apply blue fill",
  "actions": []
}
```

---

## 18. Server Guards

必须限制：

- POST only；
- JSON only；
- body size；
- prompt length；
- selection count；
- action count；
- response size；
- timeout；
- same-origin / allowed origin；
- rate limit。

建议默认：

```text
prompt ≤ 2,000 chars
selection ≤ 50
actions ≤ 30
response ≤ 128 KB
request timeout ≤ 30s
```

---

## 19. API Key

Provider API Key 只能在 Cloudflare 服务端。

```text
Browser
❌ Provider Secret

Cloudflare Function
✅ Provider Secret
```

不得：

- 写入 Vite env 并暴露到客户端；
- 打包进 JS；
- LocalStorage 保存；
- 发到浏览器日志。

---

## 20. Anonymous Alpha Rate Limit

v0.6 不做登录。

建议：

```text
20 AI operations / user / day
```

组合标识：

```text
IP
+
anonymous client id
```

同时设置 burst limit。

错误：

```json
{
  "code": "RATE_LIMITED"
}
```

---

## 21. Error Model

统一：

```json
{
  "code": "INVALID_ACTION",
  "message": "AI returned an unsupported action."
}
```

推荐错误码：

```text
AI_PROVIDER_ERROR
AI_TIMEOUT
INVALID_RESPONSE
INVALID_SVG
INVALID_ACTION
UNKNOWN_TARGET
OUT_OF_SELECTION_TARGET
DOCUMENT_CHANGED
RATE_LIMITED
REQUEST_TOO_LARGE
```

UI 根据错误码展示用户友好的文案。

---

## 22. Quick Actions

配置化：

```js
export const QUICK_ACTIONS = [
  {
    id: 'recolor',
    label: 'Recolor',
    prompt: 'Improve the colors of the selected elements while preserving structure.'
  },
  {
    id: 'simplify',
    label: 'Simplify',
    prompt: 'Simplify the selected vector design while preserving its visual meaning.'
  }
]
```

执行仍走：

```text
editSelection(prompt)
```

不得有第二套 Runtime。

---

## 23. Command Router — P1

未来可以识别简单指令：

```text
Make it red
Move right 20px
Opacity 50%
```

直接本地转换为 Design Actions。

架构：

```text
Prompt
 ↓
Command Router
 ├── Deterministic → Local Action
 └── Generative    → LLM
```

v0.6 不实现，只保留接口空间。

---

## 24. 测试策略

### 24.1 Action Runtime Unit Test

不调用 LLM。

Fixture：

```text
tests/fixtures/ai/
├── actions/
├── input/
└── expected/
```

覆盖：

- set-style；
- move；
- resize；
- replace-text；
- remove；
- group；
- insert；
- multi-action；
- invalid target；
- invalid value；
- out-of-selection；
- atomic rollback。

### 24.2 Browser Test

覆盖：

```text
Select
→ AI Mock Response
→ Preview
→ Apply
→ Undo
```

断言：

- Preview 不写 History；
- Apply 只写一次；
- Undo 完整恢复；
- Cancel 无副作用；
- Document Changed 时阻止 Apply。

### 24.3 Contract Test

Mock Provider：

```text
Prompt
→ Mock Response
→ Schema
→ Validate
→ Compile
→ Preview
```

CI 不调用真实 LLM。

### 24.4 AI Eval

独立运行：

```text
tests/evals/
├── generate.json
└── edit.json
```

指标：

- Schema Valid；
- Target Valid；
- Executable；
- Final SVG Valid；
- Selected Target Changed；
- Unselected Target Unchanged。

---

## 25. Observability

建议记录：

```text
requestId
operation
latency
provider
model
token usage
result status
validation failure
action count
```

禁止记录：

- Provider Secret；
- 完整用户 SVG 默认长期保存；
- 敏感浏览器环境信息。

Alpha 阶段 Prompt 日志建议做：

- 明确隐私声明；
- 默认最小化；
- 可配置采样；
- 不作为永久用户资产保存。

---

## 26. 性能预算

目标：

```text
AI UI feedback < 100ms
Preview application < 100ms for normal SVG
Action validation < 50ms
```

模型网络延迟不纳入客户端 Runtime 指标。

对于超大 SVG：

```text
selection context
```

必须截断或摘要。

---

## 27. 开发 PR 划分

### PR 1 — AI Protocol

- docs；
- schema；
- examples。

### PR 2 — Action Runtime

- validate；
- compile；
- execute；
- unit tests。

### PR 3 — AI Infrastructure

- Cloudflare Functions；
- Provider Adapter；
- secrets；
- guards；
- rate limit。

### PR 4 — Selection AI Edit

- context；
- command bar；
- mock → live provider。

### PR 5 — Preview / Apply

- preview state；
- revision guard；
- atomicity；
- history integration。

### PR 6 — AI Generate

- prompt；
- generate API；
- sanitizer；
- editor load。

### PR 7 — Quick Actions + Evals

- presets；
- eval；
- telemetry；
- Alpha release gate。

---

## 28. 架构红线

v0.6 不允许：

1. AI 直接修改 React State；
2. AI 绕过 `editSvgDocument()`；
3. AI Generate 绕过 `processSvgInput()`；
4. Preview 调用 `commitDocument()`；
5. 一个 Prompt 产生多条 History；
6. LLM 直接执行 arbitrary JavaScript；
7. API Key 暴露客户端；
8. Edit Mode 默认整份 SVG replacement；
9. 部分 Action 成功后提交；
10. 文档 Revision 已变化仍自动 Apply。

---

## 29. 最终技术闭环

```text
User Prompt
     ↓
Build Context
     ↓
Cloudflare AI API
     ↓
Design Actions
     ↓
Validate
     ↓
Compile
     ↓
Dry Run
     ↓
Preview
     ↓
Apply
     ↓
commitDocument()
     ↓
Canonical SVG
     ↓
History / Storage / Export
```

这是 v0.6 最核心的工程契约。
