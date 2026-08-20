# Vecsy AI v0.6 — 产品需求文档（PRD）

> 版本：v0.6.0
> 阶段名称：AI Alpha
> 产品定位：AI-native SVG Editor
> 状态：部分实施 — 本地 Selection AI Edit 闭环已完成
> 最近更新：2026-08-21

---

## 1. 背景

Vecsy 当前已经具备浏览器 SVG 编辑器的核心基础能力，包括：

- SVG 文件导入与解析；
- Canvas 预览；
- 图层树；
- 元素选择与多选；
- 属性编辑；
- 图层增删、分组、移动；
- Source 视图；
- Undo / Redo；
- SVG 导出；
- 安全输入 Pipeline；
- Browser / Unit Test；
- IndexedDB 文档持久化。

v0.6 不再继续横向扩展传统 SVG 编辑功能，而是验证一个新的核心方向：

> **用户是否愿意通过自然语言生成和编辑真正可继续修改的 SVG。**

Vecsy 不定位为 AI Image Generator，而定位为：

> **Create and edit vector graphics with natural language.**

### 当前实施状态

| 功能 | 当前状态 | 说明 |
|---|---|---|
| AI Design Action Protocol | 已完成 | VDAP 1.0 Envelope 与八类 MVP Action 已校验、编译并执行。 |
| Selection → AI Edit | 已完成（本地 Demo Runtime） | 仅允许修改当前选择的真实 SVG 元素。 |
| Preview / Apply / Cancel / Undo | 已完成 | Preview 不写入 History；Apply 只调用一次 `commitDocument()`。 |
| Revision Guard / Failure Isolation | 已完成 | 文档或选择变更会阻止旧预览应用；非法 Action 不会部分提交。 |
| AI Quick Actions | 已完成（演示） | 当前提供改为蓝色、放大、更圆润、删除。 |
| Prompt → Editable SVG / Create Mode | 未实施 | 依赖真实 Provider 和安全的 Generate API。 |
| Cloudflare API / Provider / Evals | 未实施 | 不在本地 Demo Runtime 范围内。 |

---

## 2. 产品目标

### 2.1 North Star

跑通完整闭环：

```text
Prompt
  ↓
Editable SVG
  ↓
Select
  ↓
AI Edit
  ↓
Preview
  ↓
Apply
  ↓
Manual Edit
  ↓
Export
```

### 2.2 MVP 核心问题

第一阶段只验证：

> 用户能否通过一句自然语言获得结构化、可编辑的 SVG，并继续通过 AI 和手工编辑共同完成设计。

### 2.3 成功标准

v0.6 Alpha 成立，需要同时满足：

1. Prompt 能稳定生成合法 SVG；
2. 用户能选择真实 SVG 元素；
3. AI 能只修改被选择的元素；
4. AI 修改支持 Preview / Apply / Cancel；
5. 一次 AI Apply 只产生一个 History Transaction；
6. AI 失败不得破坏当前文档；
7. 用户可继续手工编辑和导出。

---

## 3. 目标用户

第一阶段优先服务：

- 前端开发者；
- AI Builder；
- 独立开发者；
- 产品设计人员；
- 需要快速制作 SVG 素材的内容创作者。

不优先服务：

- 专业插画师；
- 高复杂度矢量艺术创作；
- Figma / Illustrator 重度用户。

---

## 4. 核心 JTBD

### JTBD 1：快速生成矢量素材

当我需要一个图标、Logo、Badge、简单插图或 Diagram 时，

我希望：

```text
一句 Prompt
→ 得到 SVG
→ 可以继续编辑
→ 可以直接导出
```

而不是得到不可编辑的位图。

### JTBD 2：通过自然语言修改选中元素

当我已经有一个 SVG 时，

我希望选中其中一部分，然后说：

```text
改成蓝色
大一点
更圆润
移动到右边
文字改成 Vecsy
```

Vecsy 只修改我的 Selection，而不是重新生成整张图。

### JTBD 3：AI 与手工编辑共存

我希望：

```text
AI 修改
→ 手工拖动
→ AI 再修改
→ Undo
```

全部操作同一个 SVG Document，而不是 AI 和编辑器使用两套状态。

---

## 5. 产品定位

### 5.1 推荐定位

**Vecsy — AI-native SVG Editor**

副标题：

> Generate and edit vector graphics with natural language.

### 5.2 不是什么

Vecsy v0.6 不是：

- AI Image Generator；
- ChatGPT UI；
- Figma 替代品；
- Illustrator 替代品；
- AI Agent 平台；
- 多模型 Playground。

---

## 6. MVP 功能范围

### P0

| 功能 | 优先级 | 状态 | 说明 |
|---|---|---|---|
| Prompt → Editable SVG | P0 | 未实施 | 从空白生成完整 SVG |
| Selection → AI Edit | P0 | 已完成（本地） | 修改选中的真实 SVG 元素 |
| Preview / Apply / Cancel | P0 | 已完成 | AI 修改不得直接写入文档 |
| Undo AI Operation | P0 | 已完成 | 一次 Apply = 一次 Undo |
| AI Quick Actions | P0 | 已完成（演示） | 当前为预置本地操作 |
| AI Design Action Protocol | P0 | 已完成 | AI 与 Editor 之间的协议 |
| Action Validation | P0 | 已完成 | 防止非法操作进入 Editor |
| Failure Isolation | P0 | 已完成 | AI 失败不破坏当前文档 |

### P1

- Whole Document Edit；
- Generate Variants；
- AI Palette；
- Simplify SVG；
- Optimize SVG；
- Design Review；
- Dark Mode Variant。

### P2+

- Screenshot → SVG；
- Image → SVG；
- Reference Image；
- Sketch → SVG；
- 多轮 Chat；
- Brand Kit；
- AI Animation；
- MCP / Agent。

---

## 7. Create Mode

### 7.1 空白状态

```text
┌────────────────────────────────────────┐
│                 Vecsy                  │
│                                        │
│     What do you want to create?        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ Minimal AI robot logo...        │  │
│  └──────────────────────────────────┘  │
│                                        │
│             ✨ Generate                │
│                                        │
│  Logo · Icon · Illustration · Diagram │
└────────────────────────────────────────┘
```

### 7.2 第一版 Preset

- Icon
- Logo
- Illustration
- Diagram
- Badge
- Loading

### 7.3 生成结果

AI 输出必须是：

- 完整 SVG；
- 可经过 Vecsy Security Pipeline；
- 可被 `parseSvg()` 解析；
- 内部元素能生成 `data-editor-id`；
- 可出现在 Layer Tree；
- 可选中；
- 可继续编辑。

---

## 8. Edit Mode

### 8.1 核心入口

编辑状态底部提供 AI Command Bar：

```text
┌──────────────────────────────────────────┐
│ ✨ Ask AI to edit selection...       ↑  │
└──────────────────────────────────────────┘
```

### 8.2 Selection-aware

用户选择：

```text
Robot
├── Head
├── Eye Left      ← Selected
├── Eye Right     ← Selected
├── Mouth
└── Antenna
```

输入：

```text
Make the eyes larger and blue.
```

AI 只能针对 Selection 生成 Design Actions。

### 8.3 第一版重点支持

- fill；
- stroke；
- stroke-width；
- opacity；
- position；
- size；
- text；
- remove；
- group；
- insert basic shape。

---

## 9. AI Preview

AI 不允许直接提交 Document。

流程：

```text
Prompt
  ↓
AI Response
  ↓
Validate
  ↓
Compile Actions
  ↓
Generate Preview Markup
  ↓
Preview
  ↓
Apply / Cancel
```

Preview UI 至少显示：

- 修改摘要；
- 涉及图层数；
- 关键属性变化；
- Apply；
- Cancel。

示例：

```text
AI plans 4 changes

Eye Left
  fill    #111 → #6366F1
  radius     5 → 8

Eye Right
  fill    #111 → #6366F1
  radius     5 → 8

[Cancel] [Apply]
```

---

## 10. History 契约

必须保证：

> 一次 Prompt 的一次 Apply = 一次 History Transaction。

用户执行：

```text
Cmd/Ctrl + Z
```

必须完整撤销本次 AI 修改。

AI 生成 Preview 期间不得写 History。

---

## 11. Quick Actions

当前演示版：

- 改为蓝色；
- 放大；
- 更圆润；
- 删除。

这些操作直接生成同一套 VDAP Envelope，用于验证 Preview / Apply 链路；Simplify、Monochrome、Increase Contrast、Make Bold、Make Thin 和 Center 仍为后续候选。

Quick Action 本质是预定义 Prompt，不做独立 Agent。

---

## 12. UX 状态

AI 必须提供明确状态：

```text
Thinking...
Planning edits...
Validating...
Preview ready
Applying...
```

错误状态：

- AI request failed；
- invalid response；
- invalid SVG；
- invalid action；
- unknown target；
- document changed；
- rate limited；
- timeout。

任何错误：

> 当前 Document 必须保持不变。

---

## 13. Revision Guard

AI 请求发出时记录：

```text
requestId
baseRevision
selectionIds
```

返回后：

```text
currentRevision === baseRevision
```

才允许生成 Preview。

否则显示：

```text
Document changed while AI was working.

[Regenerate]
```

不得静默应用旧 Action。

---

## 14. Atomicity

一组 AI Actions：

```text
Action 1 ✅
Action 2 ✅
Action 3 ❌
Action 4 ✅
```

不得部分执行。

必须：

```text
Validate entire batch
        ↓
全部有效？
  No → Reject
 Yes → Preview
```

---

## 15. 产品埋点

建议事件：

```text
ai_generate_started
ai_generate_succeeded
ai_generate_failed

ai_edit_started
ai_edit_succeeded
ai_edit_failed

ai_preview_shown
ai_preview_apply
ai_preview_cancel

ai_edit_undo
ai_quick_action_used

ai_rate_limited
```

核心指标：

### Activation

```text
Generate
→ Select
→ AI Edit
→ Apply
```

完成率。

### AI Apply Rate

```text
Apply / Preview
```

### Immediate Undo Rate

AI Apply 后短时间内 Undo 的比例。

### Repeat AI Edit Rate

同 Session 中第二次使用 AI Edit 的比例。

---

## 16. MVP Release Gate

### Generate

固定 Prompt 集：

```text
Valid SVG Rate ≥ 90%
```

### Selection Edit

以下基础能力：

- color；
- stroke；
- opacity；
- position；
- size；
- text；
- delete。

正确目标操作率：

```text
≥ 95%
```

### Safety

```text
AI Failure → 0 次破坏当前 Document
```

### History

```text
1 AI Apply = 1 Undo
```

### Atomicity

任一 Action Invalid：

```text
整个 Batch 不 Apply
```

### UX

新用户能够无文档辅助完成：

```text
Generate
→ Select
→ AI Edit
→ Apply
→ Export
```

---

## 17. 推荐发布 Demo

### Demo 1：从 0 生成

```text
Create a minimal AI robot logo.
Rounded geometry, 2px strokes,
purple and blue.
```

展示：

- Prompt；
- SVG；
- Layer Tree；
- Selection。

### Demo 2：Selection-aware AI Edit

选中两个眼睛：

```text
Make the eyes larger and blue.
```

展示：

- 只修改目标元素；
- Preview；
- Apply。

### Demo 3：AI + Manual

```text
AI Edit
→ 手工移动 Antenna
→ Undo
```

突出：

> AI 与人工编辑操作同一个 Document Model。

---

## 18. Roadmap

### v0.6 — AI Foundation

- Prompt → SVG
- Selection AI Edit
- Preview / Apply
- Quick Actions
- Undo
- Action Protocol
- Evals

### v0.7 — AI Copilot

- Whole Document Edit
- Palette
- Simplify
- Optimize
- Variants
- Design Review

### v0.8 — AI Workflows

- AI Icon
- Icon Set Generator
- Logo Generator
- Diagram Generator
- Loading Generator
- Badge Generator

### v0.9+ — Multimodal

- Image → SVG
- Screenshot → SVG
- Sketch → SVG
- Reference Image

---

## 19. 第一阶段明确不做

- 用户系统；
- 云项目；
- 协作；
- 评论；
- Plugin System；
- 多模型选择器；
- Token Billing；
- 图片生成；
- 视频；
- Figma 完整能力；
- Path Node Editor；
- RAG；
- Vector Database；
- AI Agent；
- MCP。

---

## 20. 开发顺序

严格执行：

```text
Design Action Protocol
        ↓
Action Runtime
        ↓
Selection AI Edit
        ↓
Preview / Apply / Undo
        ↓
AI Generate
        ↓
Quick Actions
        ↓
Evals
        ↓
Vecsy AI Alpha
```

不要先做漂亮 Chat UI。

不要先支持多个 Provider。

不要让模型直接改完整 SVG 作为 Edit Mode 的主协议。
