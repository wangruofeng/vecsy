# Vecsy Design Action Protocol v1.0

> 协议版本：1.0
> 适用版本：Vecsy AI v0.6+
> 状态：已在本地 Runtime 与真实 Provider 链路实现
> 最近更新：2026-08-22

---

## 0. 当前实现范围

Vecsy 已实现 VDAP 1.0 的严格 Envelope 校验、Action 编译、无副作用 dry-run 与 Preview / Apply 链路。已实现的 MVP Action 为：

```text
set-style
set-attributes
move
resize
replace-text
remove
group
insert-shape
```

当前实现的额外边界：

- `targetIds` 必须存在且属于当前 Selection；
- `resize` 仅支持 `anchor: "center"`；
- `insert-shape` 仅支持根 SVG 插入，`data-editor-id` 由 Vecsy 生成；
- unknown fields、非有限数值、不安全颜色和不支持属性会拒绝整个 Envelope；
- 命令栏自由文本经 `POST /api/ai/edit`（Cloudflare Pages Function）调用真实 Provider（DeepSeek，`deepseek-chat`，JSON mode）；服务端做信封形状检查，完整校验与预览仍由客户端 VDAP 管线负责；
- 快捷动作与 JSON 调试在本地确定性执行，不请求网络。

服务端已实现 IP 级速率限制（可选 KV 绑定）。网络重试与 Evals 不属于本协议 Runtime 的当前实现范围。

---

## 1. 目的

Vecsy Design Action Protocol（VDAP）定义：

> AI 如何用结构化、受控、可验证的方式表达对 SVG 文档的修改意图。

它位于：

```text
Natural Language
       ↓
      LLM
       ↓
Vecsy Design Actions
       ↓
Action Compiler
       ↓
Editor Transactions
       ↓
Canonical SVG
```

协议目标：

- 不让 LLM 直接操作内部 Editor API；
- 不让 LLM 直接替换完整 SVG；
- 将 AI 意图限制在明确 Action 集；
- 支持 Schema Validation；
- 支持 Selection Boundary；
- 支持 Atomic Execution；
- 支持 Preview；
- 支持 Undo；
- 支持版本演进。

---

## 2. Envelope

所有 Edit Response 必须：

```json
{
  "version": "1.0",
  "intent": "edit-selection",
  "summary": "Make both eyes larger and blue",
  "actions": []
}
```

字段：

| Field | Required | Description |
|---|---|---|
| version | Yes | 协议版本 |
| intent | Yes | 当前 AI 意图 |
| summary | Yes | 面向用户的简短修改摘要 |
| actions | Yes | Action 列表 |

---

## 3. Intent

v1：

```text
edit-selection
```

预留：

```text
edit-document
create-variant
review-design
```

v0.6 仅实现：

```text
edit-selection
```

---

## 4. 通用 Action 字段

所有 Action：

```json
{
  "type": "set-style",
  "targetIds": ["node-5"]
}
```

约束：

### type

必须属于支持集合。

### targetIds

- 必须为数组；
- 必须非空，除非 Action 特别说明；
- ID 必须存在；
- `edit-selection` 下默认必须属于当前 Selection。

---

# 5. set-style

用于修改常见视觉属性。

```json
{
  "type": "set-style",
  "targetIds": ["node-5", "node-6"],
  "properties": {
    "fill": "#6366F1",
    "stroke": "#111111",
    "strokeWidth": 2,
    "opacity": 0.8
  }
}
```

允许属性 v1：

```text
fill
stroke
strokeWidth
opacity
fillOpacity
strokeOpacity
strokeLinecap
strokeLinejoin
```

禁止：

- arbitrary style string；
- CSS expression；
- URL；
- remote resource；
- event handler。

映射：

```text
fill           → fill
stroke         → stroke
strokeWidth    → stroke-width
opacity        → opacity
fillOpacity    → fill-opacity
strokeOpacity  → stroke-opacity
strokeLinecap  → stroke-linecap
strokeLinejoin → stroke-linejoin
```

---

# 6. set-attributes

用于安全、明确的 SVG 属性。

```json
{
  "type": "set-attributes",
  "targetIds": ["node-5"],
  "attributes": {
    "rx": 8,
    "ry": 8
  }
}
```

v1 不允许任意属性。

建议 allowlist 根据 tag 校验。

例如：

### rect

```text
x
y
width
height
rx
ry
```

### circle

```text
cx
cy
r
```

### ellipse

```text
cx
cy
rx
ry
```

### line

```text
x1
y1
x2
y2
```

禁止：

```text
href
xlink:href
on*
style
class
id
data-editor-id
```

---

# 7. move

语义级移动。

```json
{
  "type": "move",
  "targetIds": ["node-5"],
  "delta": {
    "x": 20,
    "y": 0
  }
}
```

单位：

```text
SVG user units
```

Compiler 映射至：

```text
translate
/
translate-by-id
```

AI 不允许自己拼接 `transform`。

---

# 8. resize

语义级缩放。

```json
{
  "type": "resize",
  "targetIds": ["node-5", "node-6"],
  "scale": 1.25,
  "anchor": "center"
}
```

v1：

```text
scale > 0
```

推荐限制：

```text
0.1 ≤ scale ≤ 10
```

anchor：

```text
center
top-left
top-right
bottom-left
bottom-right
```

MVP 可以只实现：

```text
center
```

Compiler 使用 Vecsy geometry 计算实际变换。

---

# 9. replace-text

只用于 text。

```json
{
  "type": "replace-text",
  "targetIds": ["node-12"],
  "text": "Vecsy AI"
}
```

校验：

```text
target tag == text
```

禁止通过 `set-attributes` 修改 textContent。

---

# 10. remove

```json
{
  "type": "remove",
  "targetIds": ["node-7"]
}
```

映射：

```text
remove
```

Selection Edit 下只允许删除 Selection。

---

# 11. group

```json
{
  "type": "group",
  "targetIds": [
    "node-5",
    "node-6"
  ]
}
```

要求：

- ≥ 2 targets；
- targets 可被当前 Editor group；
- 不制造非法 DOM 层级。

---

# 12. insert-shape

用于在 Selection 附近插入简单形状。

```json
{
  "type": "insert-shape",
  "shape": {
    "tag": "circle",
    "attributes": {
      "cx": 100,
      "cy": 100,
      "r": 20,
      "fill": "#6366F1"
    }
  },
  "parentId": null
}
```

v1 允许：

```text
rect
circle
ellipse
line
polygon
polyline
text
```

Path 插入建议放到 P1 或单独限制。

禁止：

```text
script
style
image
use external
foreignObject
a
iframe
object
embed
```

插入元素的 `data-editor-id`：

> 必须由 Vecsy 生成，AI 不得指定。

---

# 13. 完整示例

用户：

```text
Make the eyes larger and blue.
```

Context：

```json
{
  "selection": [
    {
      "id": "node-5",
      "tag": "circle",
      "name": "Left Eye"
    },
    {
      "id": "node-6",
      "tag": "circle",
      "name": "Right Eye"
    }
  ]
}
```

AI：

```json
{
  "version": "1.0",
  "intent": "edit-selection",
  "summary": "Make both eyes larger and blue",
  "actions": [
    {
      "type": "set-style",
      "targetIds": ["node-5", "node-6"],
      "properties": {
        "fill": "#6366F1"
      }
    },
    {
      "type": "resize",
      "targetIds": ["node-5", "node-6"],
      "scale": 1.25,
      "anchor": "center"
    }
  ]
}
```

---

# 14. Selection Boundary

默认：

```text
all targetIds
⊆
selectedIds
```

如果：

```json
{
  "selectedIds": ["node-5"]
}
```

AI 返回：

```json
{
  "targetIds": ["node-9"]
}
```

必须 Reject：

```text
OUT_OF_SELECTION_TARGET
```

---

# 15. Action Order

Actions 按数组顺序执行。

```json
{
  "actions": [
    {
      "type": "set-style"
    },
    {
      "type": "resize"
    }
  ]
}
```

即：

```text
set-style
   ↓
resize
```

AI 不应依赖隐式并行行为。

---

# 16. Atomicity

整个 Envelope 是一个 Atomic Batch。

```text
A1 valid
A2 valid
A3 invalid
```

结果：

```text
整个 Batch Reject
```

不得：

```text
Apply A1 + A2
Reject A3
```

---

# 17. Validation Pipeline

```text
JSON Parse
   ↓
Protocol Version
   ↓
Schema Validation
   ↓
Action Type Validation
   ↓
Target Validation
   ↓
Selection Boundary
   ↓
Value Validation
   ↓
Compile
   ↓
Dry-run
   ↓
SVG Parse
   ↓
Preview
```

---

# 18. Unknown Fields

v1 推荐：

```text
Reject unknown fields
```

原因：

- 防止模型发明参数；
- 防止协议漂移；
- Evals 更容易稳定。

未来版本可以引入明确 extension 字段。

---

# 19. 数值规则

所有数值：

- 必须是 finite number；
- 禁止 NaN；
- 禁止 Infinity；
- 禁止指数级异常值。

建议全局范围：

```text
-1,000,000 ≤ coordinate ≤ 1,000,000
0 ≤ opacity ≤ 1
0 < scale ≤ 10
0 ≤ strokeWidth ≤ 10,000
```

实际可以根据 ViewBox 做更严格的相对限制。

---

# 20. 颜色规则

允许：

```text
#RGB
#RGBA
#RRGGBB
#RRGGBBAA
rgb(...)
rgba(...)
currentColor
none
```

第一版建议优先规范输出：

```text
#RRGGBB
```

禁止：

```text
url(...)
javascript:
external resource
```

---

# 21. ID 规则

AI 只能使用 Context 中提供的 Editor ID。

例如：

```text
node-5
node-6
```

AI 不得：

- 发明 node-999；
- 通过 CSS selector 定位；
- 使用 XPath；
- 使用 DOM path；
- 通过 name 模糊匹配执行。

name 仅用于理解，不用于执行。

---

# 22. Compiler Contract

Compiler：

```js
compileDesignAction(action, context)
```

返回：

```js
EditorTransaction[]
```

例如：

```text
set-style
 ↓
set-attributes
```

```text
move
 ↓
translate-by-id
```

```text
remove
 ↓
remove
```

Compiler 不允许产生：

- arbitrary JS；
- direct DOM mutation；
- network operation；
- storage operation。

---

# 23. Execute Contract

```js
executeDesignActions(markup, actions, context)
```

返回：

```js
{
  markup,
  changed,
  affectedIds,
  summary
}
```

该函数必须是：

- deterministic；
- side-effect free；
- 不读 UI State；
- 不写 History；
- 不写 Storage。

---

# 24. Preview Contract

AI Runtime：

```text
executeDesignActions()
```

只产生：

```text
previewMarkup
```

Apply 才进入：

```text
commitDocument()
```

---

# 25. Versioning

协议版本：

```text
1.0
```

Breaking Change：

```text
2.0
```

向后兼容新增 Action：

```text
1.x
```

客户端不支持版本时：

```text
UNSUPPORTED_PROTOCOL_VERSION
```

不得尝试猜测转换。

---

# 26. P1 Actions

未来候选：

```text
duplicate
reorder
align
distribute
rotate
set-root-attributes
replace-path
apply-palette
make-symmetric
simplify-path
```

只有真实 Prompt 数据证明需求后再增加。

---

# 27. 明确不进入协议的能力

VDAP 不负责：

- API Provider；
- Prompt；
- Chat History；
- Token Usage；
- Rate Limit；
- 用户账号；
- Storage；
- Billing；
- MCP；
- Agent；
- Image Generation。

它只描述：

> **如何安全表达 SVG Design Intent。**

---

# 28. MVP Action Set

最终 v1 MVP：

```text
set-style
set-attributes
move
resize
replace-text
remove
group
insert-shape
```

只要这一组稳定，就足以覆盖 v0.6 Selection AI Edit 的大部分基础需求。

---

# 29. 核心协议原则

必须长期保持：

1. AI Action 是语义级，而非底层 DOM 操作；
2. AI 不能绕过 Validator；
3. AI 不能绕过 Compiler；
4. AI 不能直接提交 History；
5. AI 不能指定新的 Editor ID；
6. AI 不能默认修改 Selection 外元素；
7. 一个 Envelope 必须原子执行；
8. Preview 必须可丢弃；
9. Apply 必须可 Undo；
10. Canonical Document 始终是 SVG Markup。
