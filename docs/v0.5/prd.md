# Vecsy v0.5 Foundation — 产品需求文档

> 目标版本：v0.5.0
>
> 阶段名称：Foundation
>
> 文档状态：Ready for Review
>
> 更新日期：2026-08-09
>
> 项目：wangruofeng/vecsy

---

## 1. 文档目的

本 PRD 定义 Vecsy v0.5 的产品边界、工程契约和发布验收标准。

v0.5 不是一次笼统的“架构清理”，而是一次风险受控的 Foundation Release。它只解决会直接阻碍后续 SVG 编辑能力扩展的四项基础问题：

1. 外部 SVG 进入编辑器前缺少统一安全边界；
2. 核心 SVG 逻辑与浏览器交互缺少自动化测试保护；
3. Drag 仍缺少明确、统一、可验证的坐标契约；
4. 文档与完整历史依赖 localStorage，存在容量和主线程阻塞风险。

`main.jsx` 和 Canvas Interaction 的职责收敛仍然重要，但 v0.5 只拆分本阶段实际触碰且已有测试保护的工作流，不把“大规模目录迁移”作为发布目标。

---

## 2. 一句话目标

> 在不扩大功能面的前提下，让 Vecsy 获得可验证的 SVG 安全输入、自动化回归、稳定 Drag 坐标基础和可恢复的异步文档存储。

---

## 3. 发布契约

### 3.1 Must：v0.5.0 发布阻塞项

- 统一 SVG Security Pipeline；
- 严格的非可信 SVG Sanitizer；
- 所有非可信输入入口接入同一 Pipeline；
- 安全清理反馈与四语言文案；
- CSP 从 Report-Only 验证后切换为 Enforce；
- Node Unit Tests、Browser Integration Tests 与 GitHub Actions；
- 明确的 Editor Transaction 最小契约；
- Geometry Contract 与 Drag Migration；
- IndexedDB 文档存储、Autosave、Restore 和幂等迁移；
- Chrome、Safari 和 Edge 核心回归通过。

### 3.2 Should：有独立 Gate，不阻塞 v0.5.0

- Resize Migration；
- 自定义 SVG 收藏迁移到 IndexedDB；
- Export / Clipboard / Text Workflow 的选择性拆分；
- Interaction Mode 完整迁移。

Should 项只有在对应 Gate 达标且不挤占 Must 回归时间时进入 v0.5；否则进入后续补丁版本或 Backlog。

### 3.3 非目标

v0.5 不做：

- Rotate UI、Smart Guide、Grid、Ruler；
- Pen Tool、Path Node Editor、Boolean Operations、Brush；
- ViewBox 编辑器；
- Plugin System、Account、Cloud Document、Collaboration、Cloud Sync；
- 分享短链、Landing Page、SEO 工具；
- AI Text-to-SVG 或 AI Command；
- Full Scene Graph；
- Redux / Zustand 迁移；
- 全项目 TypeScript 重写；
- 完整目录重构或 UI 重写。

---

## 4. 用户与风险场景

### Scenario 1：导入互联网下载的 SVG

用户通过文件、剪贴板或自定义收藏导入 SVG。内容可能包含脚本、事件属性、外部网络资源、交互链接、嵌套文档或可影响宿主页面的 CSS。

目标体验：

1. Vecsy 在内容进入 Canvas 前完成解析、审计和清理；
2. 可安全保留的内容继续打开；
3. 被删除的内容以轻量提示告知用户；
4. 无法安全恢复的输入被拒绝，不显示部分解析结果；
5. 导出结果与当前已清理文档一致。

### Scenario 2：打开旧版本保存的作品

用户升级后仍能打开当前文档和 Recent Documents。迁移失败不得静默覆盖旧数据，也不得在 IndexedDB 与 localStorage 之间反复加载不同版本。

目标体验：

1. 迁移成功后恢复最后编辑文档；
2. 迁移失败时保留旧数据并显示可恢复提示；
3. 用户始终可以导出当前内存中的 SVG；
4. v0.5 不删除 legacy 文档 key。

### Scenario 3：拖动带 Transform 的图层

用户拖动普通元素、嵌套 Group、已 Translate / Scale / Rotate / Matrix 的元素，指针方向与元素移动方向一致，且一次拖动只产生一步 History。

---

## 5. SVG 安全模型

### 5.1 信任等级

所有 SVG 入口必须调用同一个 `processSvgInput(rawMarkup, context)`，但根据来源应用明确策略。

| 等级 | 来源 | 策略 |
|---|---|---|
| App-owned | Sample SVG、仓库内置素材 | 构建期审计；运行时验证结构与外部资源，不允许脚本或事件属性 |
| Untrusted | 文件、剪贴板、自定义 SVG、Source Commit | 严格清理；进入 Canvas 前必须得到 safe output |
| Legacy | localStorage 中的旧文档与 Recent Documents | 按 Untrusted 重新处理；原 key 在 v0.5 保留为只读恢复来源 |

App-owned 不是 Pipeline 的例外，只是允许经过审计的内置 CSS/动画能力。运行时新增或用户修改的内容始终按 Untrusted 处理。

### 5.2 处理顺序

```text
Raw Markup
  ↓
Parse XML Once
  ↓
Validate Root / Namespace / Parser Error
  ↓
Audit Original DOM
  ↓
Sanitize DOM by Trust Policy
  ↓
Serialize
  ↓
Reparse and Validate Output
  ↓
Safe Markup or Rejection
```

Audit 与 Sanitize 不得在 Parse 之前执行。任何阶段异常都必须 fail closed：不进入 Canvas、不覆盖现有文档。

### 5.3 统一返回值

```js
{
  status: 'accepted' | 'sanitized' | 'rejected',
  markup,
  warnings,
  removedFeatures,
  source,
}
```

`markup` 只在 `accepted` 或 `sanitized` 时存在。调用方不得根据模糊的 `safe: boolean` 自行猜测是否继续。

### 5.4 非可信 SVG 规则

#### 必须删除的元素

- `script`；
- `foreignObject`；
- `iframe`、`object`、`embed`；
- `audio`、`video`；
- 非 SVG namespace 的节点；
- XML stylesheet processing instruction；
- 非可信输入中的 `style` 元素。

#### 必须删除的属性

- 所有大小写组合的 `on*` 事件属性；
- 可触发导航或外部加载的危险 URL；
- 无法安全解析的 style 属性；
- 非法 namespace 或 parser error 派生属性。

#### URL 策略

| 类型 | 行为 |
|---|---|
| `#local-id` | Allow |
| `data:image/png` / `jpeg` / `gif` / `webp` | Allow，校验 MIME 与大小上限 |
| `data:image/svg+xml` | Block，避免嵌套 SVG 处理差异 |
| `blob:` | Block，不接受输入文档携带的不可移植 URL |
| `http:` / `https:` / protocol-relative | Block，不在 Canvas 中自动发起网络请求 |
| `javascript:` / `vbscript:` / `file:` | Block |
| External `<use>` / CSS import / Web Font | Block |

URL 检查必须覆盖 `href`、`xlink:href` 以及所有可能包含 `url(...)` 的 presentation / style 属性，处理大小写、空白、字符引用和编码变体。

#### Style 策略

- Untrusted 输入删除 `<style>`；
- `style` 属性只保留允许的 SVG presentation property；
- style 属性中的 `url(...)` 只允许同文档 fragment；
- 不允许 `@import`、`@font-face`、`expression`、`behavior`；
- App-owned 素材的 `<style>` 必须通过构建期审计，禁止外部资源与宿主级通用选择器。

### 5.5 输入入口清单

下列入口必须通过统一 Pipeline，且每个入口至少有一条 Browser Integration Test：

- File Import；
- Clipboard SVG Import；
- Custom SVG Save；
- Custom SVG Insert；
- Source Edit Commit；
- Legacy Current Document Restore；
- Legacy Recent Document Restore；
- App-owned SVG Collection Insert。

未来增加 URL Import 或其他入口时，必须先登记到此清单并复用同一 API。

### 5.6 安全反馈

Sanitize 后显示非阻塞反馈：

```text
Unsafe SVG content removed
Script × 1
Event attribute × 2
External reference × 1
```

要求：

- 文案同时提供 `en` / `zh-CN` / `zh-TW` / `ja`；
- 用户可展开查看类别与数量，但 v0.5 不展示原始危险代码；
- `rejected` 使用 error feedback，保留当前文档不变；
- 导出只导出清理后的 Canonical Markup；
- File Import 的原始文件仍由用户自行保留，Vecsy 不承诺恢复已删除的危险内容。

### 5.7 CSP

v0.5 目标策略：

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
style-src-elem 'self' 'unsafe-inline';
style-src-attr 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
worker-src 'self' blob:;
manifest-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'none';
form-action 'none';
```

说明：当前 React UI 使用动态 style 属性，内置动画素材也包含经过审计的 `<style>`，因此 v0.5 允许 inline style attribute 与 style element。安全边界不能依赖 CSP 单独完成，Untrusted `<style>` 仍必须由 Sanitizer 删除。

CSP 上线顺序：

1. 本地与 Preview 环境启用 Report-Only；
2. 完成 Chrome / Safari / Edge 核心流程；
3. 修复非预期 violation；
4. 切换 Enforce；
5. 验证生产响应头与控制台。

同时设置：

- `X-Content-Type-Options: nosniff`；
- `Referrer-Policy: no-referrer`；
- 最小化的 `Permissions-Policy`。

---

## 6. 自动化测试策略

### 6.1 两层测试环境

依赖边界：v0.5 不增加运行时依赖；Vitest 与一个 Browser Mode provider 作为测试专用 `devDependencies`，必须固定版本并且不得进入生产 bundle。

#### Node Unit Tests

适合不依赖浏览器 DOM 的纯逻辑：

- URL policy；
- Security rule classification；
- Matrix arithmetic 与序列化；
- Storage state transition；
- Migration decision；
- 纯字符串或数据模型逻辑。

#### Browser Integration Tests

使用 Vitest Browser Mode 配合 Playwright provider，覆盖：

- DOMParser / XMLSerializer；
- DOMMatrix / DOMPoint / getScreenCTM；
- SVG 注入后的宿主页面隔离；
- Drag / Zoom / Nested Transform；
- IndexedDB transaction、Autosave、Restore、Migration；
- CSP 和外部资源请求拦截。

CI 至少自动运行 Chromium。Safari 使用真实 Safari 手工回归；WebKit 自动化结果不能等同于真实 Safari 已验证。Edge 在 Release Gate 中进行手工 Smoke。

### 6.2 Fixture 分类

```text
tests/fixtures/svg/
├── valid/
├── transforms/
├── rendering/
├── security/
└── migration/
```

至少覆盖：

- basic、nested-groups、translate、scale、rotate、matrix；
- gradient、clip-path、mask、use-symbol、text-whitespace；
- stylesheet、animation、preserve-aspect-ratio；
- malicious-script、events、javascript-url、encoded-url；
- foreign-object、external-image、external-use、css-import；
- legacy-current-document、legacy-recent-documents。

Fixture 数量不是独立成功指标；每个 Fixture 必须对应明确行为断言。

### 6.3 Security Test 必须证明

- 脚本与事件属性无法执行；
- 不产生非预期网络请求；
- 不改变 SVG Canvas 外的宿主 DOM 与样式；
- 不触发页面外导航；
- Safe structure、Defs、Gradient、ClipPath 按规则保留；
- Sanitizer 幂等：重复处理输出不再变化；
- Rejected 输入不覆盖当前文档。

### 6.4 CI

Pull Request：

```text
npm ci
  ↓
npm run test:unit
  ↓
npm run test:browser
  ↓
npm run build
```

CI 必须固定 Node 主版本，并缓存浏览器依赖；任何步骤失败都阻塞合并。

---

## 7. Editor Transaction 最小契约

SVG Markup 继续是 Canonical Document Format，不引入 Scene Graph。

最小接口：

```js
editSvgDocument(svgMarkup, transaction)
// => { markup, changed }
```

约束：

- 内部 Parse Once、Mutate N Times、Serialize Once；
- Transaction 是纯 SVG 操作层，不直接更新 React State；
- Transaction 不调用 `commitDocument`；
- 调用方在一次用户操作完成时最多调用一次 `commitDocument`；
- `commitDocument` 继续是唯一 History Commit Boundary；
- v0.5 只迁移本阶段触碰的高频 mutation，不重写全部 `svg-transforms.js`。

首批迁移范围：

- Security output normalization；
- Drag final commit 所需 mutation；
- Storage restore 后的 canonical parse；
- Attribute / Text / Visibility 中至少一组代表性操作，用于验证 API。

---

## 8. Geometry 与 Drag

### 8.1 原则

现有 `src/editor/svg-geometry.js` 已包含部分 `getScreenCTM()` 能力。v0.5 必须先完成 API Inventory，再决定就地扩展或拆分目录，禁止建立第二套并行 Geometry。

Geometry 分为：

- Pure Matrix：矩阵组合、逆矩阵、点转换、序列化；
- Live DOM Adapter：`getScreenCTM()`、节点边界与 Client Coordinate；
- Interaction Consumer：Drag 使用 Geometry API，但不拥有矩阵实现。

### 8.2 坐标契约

```text
Client Point
  ↓ inverse(parent.getScreenCTM())
Parent Local Point
  ↓ delta
Element Mutation
```

Drag 默认在目标父节点局部坐标中计算 delta。除非操作语义明确要求 bake，否则保持原 transform 顺序，不随意合并 `translate / scale / rotate / matrix`。

### 8.3 Drag 验收矩阵

| Case | Single | Multi | Nested Group | Zoom | Undo |
|---|---:|---:|---:|---:|---:|
| Plain | 必测 | 必测 | — | 必测 | 一步 |
| Translate | 必测 | 必测 | 必测 | 必测 | 一步 |
| Scale | 必测 | 必测 | 必测 | 必测 | 一步 |
| Rotate | 必测 | 必测 | 必测 | 必测 | 一步 |
| Matrix | 必测 | 必测 | 必测 | 必测 | 一步 |

行为标准：

- 指针向右移动时元素视觉位置不向左；
- Pointer 与元素最终视觉位移误差不超过 1 CSS px；
- Transform Stack 不丢失、不重排非目标 transform；
- 拖动预览不写 History、不写 Storage；
- Pointer Up 只产生一步 History；
- Cancel 恢复 base snapshot，不产生 History。

### 8.4 Resize Gate

Resize 是 Should。只有在 Drag 全部通过、Geometry API 未出现待重构接口、且 Release Regression 仍保留至少 4 个工程日时才进入 v0.5。

---

## 9. IndexedDB 文档存储

### 9.1 数据模型

数据库：`vecsy`，schema version 从 `1` 开始。

Must Object Store：

```text
documents
meta
```

Should Object Store：

```text
custom-assets
```

Document：

```js
{
  id,
  name,
  svgMarkup,
  revision,
  createdAt,
  updatedAt,
}
```

`documents.updatedAt` 建立索引。Recent Documents 从 documents 查询得到，不再维护第二份完整 SVG 列表。

Meta 至少保存：

```js
{
  key: 'runtime',
  schemaVersion,
  lastDocumentId,
  migrationState,
  migratedAt,
}
```

localStorage 只保存小型 UI preference、language，以及必要的启动指针；不得再保存完整 History。

### 9.2 Autosave

```text
commitDocument
  ↓
Debounce 750ms
  ↓
Per-document Write Queue
  ↓
IndexedDB Readwrite Transaction
  ↓
Transaction Complete
```

要求：

- PointerMove 不写 Storage；
- 每个文档按 revision 顺序写入，旧 revision 不得覆盖新 revision；
- 切换文档前等待当前队列完成或显式记录 pending 状态；
- `visibilitychange` 时执行 best-effort flush，但不宣称浏览器关闭前绝对持久化；
- `abort` / `error` 显示一次可恢复提示，并保留内存文档；
- 存储失败时提供导出当前 SVG 的明确出口。

### 9.3 迁移状态机

```text
legacy-only
  ↓ copy + verify
migrating
  ↓ transaction complete + reread equals source
idb-primary
  ↓ legacy key retained read-only through v0.5
complete
```

失败状态：

```text
migrating
  ↓ error / abort / mismatch
legacy-only + visible warning
```

规则：

- 迁移必须幂等；重复启动不得创建重复文档；
- 先迁当前文档，再迁 Recent Documents；
- Legacy Recent Document 使用稳定 ID，不能只按运行时随机值；
- 迁移成功必须等待 transaction complete，并重新读取校验关键字段；
- v0.5 不删除 `vecsy:*` 与 `vector-forge:*` legacy document key；
- 进入 `idb-primary` 后不得静默回退到旧快照继续编辑；IndexedDB 不可用时显示错误并保留内存文档；
- Custom SVG Collection 在 Should 范围内；未迁移时继续使用现有 localStorage key。

History 在 v0.5 为 Memory Only。刷新后恢复最新文档，不恢复完整 Undo / Redo Stack。

---

## 10. 性能标准

测试报告必须记录设备、系统、浏览器版本与 Fixture。目标文件定义为：

```text
SVG Size <= 500 KB
Editable Nodes <= 2000
```

在目标 Fixture 上：

- Import 到首次可见 Preview 不超过 1000ms；
- 连续 Drag 5 秒时，pointer-to-preview p95 不超过 50ms；
- 连续 Drag 中不出现超过 200ms 的 Long Task；
- Autosave 调度不产生超过 50ms 的主线程任务；
- PointerMove 的 Storage Write 次数为 0；
- Security Pipeline 与 Storage Migration 的耗时写入测试报告。

若基线设备无法达到阈值，必须在 Gate 0 记录现状并重新批准阈值，不能在发布时以“无明显卡顿”替代数据。

---

## 11. 隐私原则

v0.5 继续保持：

- No Account；
- No Upload；
- No Server-side SVG Processing；
- Untrusted SVG 默认不发起外部网络请求；
- 用户文档默认只存在当前浏览器。

产品承诺：

> Your SVG stays in your browser.

---

## 12. 需求追踪

| Goal | Requirement | RoadMap | Priority | Release Evidence |
|---|---|---|---|---|
| G1 Safe Input | Security Model、Pipeline、Feedback、CSP | Phase 2 | Must | Security corpus、入口测试、生产 Header |
| G2 Testable | Unit、Browser、CI | Phase 1 | Must | CI run、测试报告 |
| G3 Stable Drag | Transaction、Geometry、Drag | Phase 3～4 | Must | Drag matrix、性能记录、Browser regression |
| G4 Durable Document | IndexedDB、Autosave、Migration | Phase 5 | Must | Migration drill、restore、failure drill |
| G5 Controlled Complexity | Selective extraction | Phase 6 | Should | 仅被触碰模块的职责对比 |
| G6 Resize Foundation | Resize migration | Optional Gate | Should | Resize matrix 与回归 |

本表是范围与优先级的唯一来源。RoadMap、PR 拆分和 Release Gate 必须引用本表，不得另建冲突的 Must 列表。

---

## 13. 发布验收

### Security

- [ ] 所有 Untrusted 入口均经过统一 Pipeline；
- [ ] Security corpus 全部通过；
- [ ] 不执行脚本、不触发事件、不产生外部请求、不影响宿主样式；
- [ ] Sanitizer 幂等；
- [ ] Rejected 输入不覆盖当前文档；
- [ ] Security Feedback 四语言完整；
- [ ] CSP 已从 Report-Only 切换为 Enforce；
- [ ] 生产响应头与浏览器控制台验证通过。

### Tests

- [ ] `npm run test:unit` PASS；
- [ ] `npm run test:browser` PASS；
- [ ] `npm run build` PASS；
- [ ] GitHub Actions PASS；
- [ ] 测试报告记录环境、Fixture 与性能结果。

### Drag

- [ ] Drag 验收矩阵全部通过；
- [ ] Pointer / visual delta 误差符合标准；
- [ ] Drag / Cancel / Undo History 语义正确；
- [ ] 性能阈值通过。

### Document

- [ ] IndexedDB Autosave 与 Reload Restore 通过；
- [ ] Current Document 与 Recent Documents 迁移通过；
- [ ] 重复迁移不重复、不覆盖较新 revision；
- [ ] Failure / Abort / Quota Drill 有可见提示与导出出口；
- [ ] Legacy keys 在 v0.5 保留；
- [ ] localStorage 不再保存完整 History。

### Existing Features Regression

- [ ] File / Clipboard / Custom SVG / Collection Import；
- [ ] Layer Rename / Visibility / Reorder / Copy / Paste / Delete / Group；
- [ ] Select / Multi Select / Pan / Zoom / Pinch / Drag；
- [ ] Text / Fill / Stroke / Opacity / Gradient / Source Edit；
- [ ] Undo / Redo；
- [ ] SVG / PNG / WebP / Selected-only Export；
- [ ] `en` / `zh-CN` / `zh-TW` / `ja`；
- [ ] Chrome / Safari / Edge Smoke。

---

## 14. Definition of Done

v0.5 Foundation 完成必须同时满足：

1. 非可信 SVG 无法在 Vecsy 中执行脚本、触发宿主交互或自动请求外部资源；
2. 核心安全、Geometry、Drag 与 Storage 行为有自动化测试和真实浏览器证据；
3. Drag 使用统一坐标契约且不破坏 Transform 与 History；
4. 文档以 IndexedDB 为唯一持久化主源，旧数据可幂等迁移且失败可恢复；
5. 下一阶段 Audit 与 currentColor 能复用 Security Pipeline、Transaction 和 `commitDocument`，无需新增旁路。

完成后进入 Vecsy v0.6 — SVG Surgery，优先考虑 SVG Audit、Global Palette、currentColor、Clean SVG 与 Developer Export。
