# Vecsy v0.5 Foundation — RoadMap

> 目标版本：v0.5.0
>
> 文档状态：In Progress（发布 Gate 未通过）
>
> 基准周期：单人 4～6 周；Gate 0 后重新确认
>
> 更新日期：2026-08-09
>
> 范围来源：[PRD](./prd.md) 第 3 节与第 12 节

> 实施状态：`2a1b32e` 已推送至 `main`，GitHub Actions CI 通过，Cloudflare Pages 已自动部署。Gate 0 资料盘点未正式验收；Phase 1 已通过本地与远端 CI；Phase 2 已完成统一安全输入入口、四语反馈与 CSP 配置，`vecsy.pages.dev` 的生产响应头已验证，但 `vecsy.top` 仍缺 CSP；Phase 3 已完成；Phase 4、Phase 5 与 Phase 7 仍有回归、故障与浏览器验收工作。

> Checklist 回填说明（2026-08-09）：本次仅勾选已有代码、自动化测试或已记录运行验证的事项。未勾选不等于未编码；它表示尚缺入口级、故障级、性能级或正式浏览器证据，不能作为 v0.5 发布通过的依据。

---

## 1. RoadMap 原则

本 RoadMap 只回答四个问题：

1. 哪些工作必须先完成；
2. 每一阶段用什么证据退出；
3. 哪些高风险工作可以进入下一阶段；
4. 哪些 Should 项必须延后。

执行原则：

- Must、Should 与 Release Gate 以 PRD 需求追踪表为唯一来源；
- 不按日期强行进入下一 Phase，只按 Exit Criteria；
- 不并行修改相同高风险边界；
- Security、Drag、Storage 分别交付并回归，避免最后一次性集成；
- App Decomposition 只服务于本阶段改动，不作为泛化重构项目；
- 每个高风险 PR 必须可独立回滚；
- 每个 Phase 都保留真实浏览器验证，不把 Build PASS 当作行为证明。

---

## 2. 总体执行顺序

```text
Gate 0
Decisions & Baseline
  ↓
Phase 1
Test Foundation & CI
  ↓
Phase 2
Safe SVG Input & CSP
  ↓
Phase 3
Transaction Spine & Geometry Contract
  ↓
Phase 4
Drag Migration
  ↓
Optional Gate A
Resize Decision
  ↓
Phase 5
IndexedDB & Migration
  ↓
Optional Phase 6
Selective Decomposition
  ↓
Phase 7
Regression & Release
```

关键依赖：

- Security 实现前必须确定威胁模型与 Browser Test 运行方式；
- Drag Migration 前必须固定 Transaction 和 Geometry 契约；
- Resize 只能在 Drag 稳定后决定；
- Storage Migration 前必须通过数据模型和失败恢复 Drill；
- CSP Enforce 与 v0.5 Release 都必须有真实部署证据。

### 2.1 当前状态（2026-08-09）

| 阶段 | 状态 | 已有证据 | 仍需完成 |
|---|---|---|---|
| Gate 0 | 进行中 | 现有输入、渲染、Geometry 和 localStorage 路径已盘点 | 可复现 Inventory 产物、性能基线、Storage failure drill 与正式退出验收 |
| Phase 1 | 已完成 | `vitest.config.js`、Unit/Chromium Browser 测试、Storage / Export fixtures、GitHub Actions；本地 `npm test`、`npm run test:webkit`、`npm run build` 与 GitHub Actions run `31310189957` 均已通过 | — |
| Phase 2 | 实装完成，待 Exit 验收 | `processSvgInput` 已接入文件、粘贴、源码、收藏与自定义素材；四语提示、CSP 与 sanitizer 幂等测试已加入；`vecsy.pages.dev` 已返回 Enforce CSP | 对 Legacy Restore 的接入、完整恶意 corpus、完整入口回归，以及 `vecsy.top` CSP 缺失 |
| Phase 3 | 已完成 | `editSvgDocument` 纯 Transaction、Unit 矩阵基元、Browser Transaction / DOM Geometry 测试；属性、键盘位移、对齐、分组/删除和 Drag/部分 Resize 预览已接入；`preserveAspectRatio` 坐标偏移已修复；真实应用 Drag / Undo / Redo 已通过 | — |
| Phase 4 | 进行中 | 单图层及 Meta 多选真实 Pointer Drag 已通过，两个图层获得一致位移；顶层选择过滤、Group Drag 路径、PointerCancel 不提交和一次手势一次 History 均已实现；Undo 可一次恢复 | 补齐完整 transform / Cancel 矩阵、Pan/Zoom 回归与性能证据 |
| Phase 5 | 进行中 | IndexedDB schema、事务完成写入、当前文档/语言恢复、750ms revision autosave（含 visibility flush）、Recent Documents 持久化、legacy localStorage 的一次性迁移标记已加入；真实浏览器修改/刷新恢复和 IndexedDB unavailable drill 已通过 | 多文档 source-of-truth、其余故障 drill、跨浏览器 storage 验收 |
| Phase 7 | 进行中 | 本地测试、WebKit 自动化、build、远端 GitHub Actions 及 Pages 生产部署均已通过；生产页面已加载 `2a1b32e` 对应资源 | Chrome 完整回归、正式域名 CSP、Safari/Edge 手工 Smoke（已延期）、tag 与最终 Release Gate |

---

## 3. Gate 0 — Decisions & Baseline

建议投入：2～3 个工程日。

Gate 0 不交付用户功能，只消除会导致后续返工的未知项。

### 3.1 Security Inventory

- [ ] 枚举全部 SVG 输入与恢复入口；
- [ ] 枚举 `dangerouslySetInnerHTML` 的 SVG 渲染位置；
- [ ] 枚举所有 URL-bearing element / attribute / style；
- [ ] 扫描内置素材中的 `<style>`、动画和外部资源；
- [ ] 将每个入口标记为 App-owned、Untrusted 或 Legacy。

产物：Security entry-point matrix，更新到测试用例或 PR 描述中。

### 3.2 Test Environment Spike

- [x] 验证 Vitest Node Unit 配置；
- [x] 验证 Vitest Browser Mode + Playwright provider；
- [x] 验证 CI 中 Chromium headless；
- [x] 确认 Safari 与 Edge 手工 Smoke 方式（当前发布决策延期）；
- [x] 固定 Node 主版本与测试命令。

### 3.3 Geometry Inventory

- [ ] 列出现有 `svg-geometry.js` API 与调用方；
- [ ] 列出 Drag / Resize 当前坐标转换路径；
- [ ] 确认 transform 是 preserve 还是 bake；
- [ ] 确认 Pure Matrix 与 Live DOM Adapter 边界；
- [ ] 禁止在 Inventory 前直接新建第二套 geometry 模块。

### 3.4 Storage Inventory

- [ ] 列出 current document、history、language、selection 的现有 payload；
- [ ] 列出 Recent Documents key 与去重规则；
- [ ] 列出 custom SVG collection key；
- [ ] 列出 `vecsy:*` 与 `vector-forge:*` legacy key；
- [ ] 准备 migration success / abort / quota / unavailable Drill。

### 3.5 Performance Baseline

使用 PRD 定义的 500KB / 2000 nodes Fixture，记录：

- Import 到首次 Preview；
- 连续 Drag 的 pointer-to-preview p95；
- Long Task；
- PointerMove Parse / Serialize 次数；
- localStorage 当前写入耗时。

### Gate 0 Exit Criteria

- [ ] 四份 Inventory 完成并作为可复现产物保存；
- [x] Node 与 Browser 测试最小样例在本地可运行；
- [ ] 性能基线包含设备、系统和浏览器版本；
- [ ] 没有未决的安全渲染模式或 Storage source-of-truth 决策；
- [ ] 根据证据重新确认 4～6 周排期。

Gate 0 未通过时不得开始 Security、Geometry 或 IndexedDB 主体实现。

---

## 4. Phase 1 — Test Foundation & CI

优先级：Must

建议投入：2～3 个工程日。

目标：在修改核心行为前建立真实可运行的测试保护。

### Task 1.1 Test Commands

目标命令：

```text
npm run test:unit
npm run test:browser
npm run test
```

`npm test` 运行 Unit + Browser 必需集合。Watch 命令可按现有开发习惯补充，但不属于 Release Gate。

### Task 1.2 Test Structure

```text
tests/
├── unit/
│   ├── security/
│   ├── matrix/
│   └── storage/
├── browser/
│   ├── parser/
│   ├── security/
│   ├── geometry/
│   └── storage/
└── fixtures/svg/
    ├── valid/
    ├── transforms/
    ├── rendering/
    ├── security/
    └── migration/
```

### Task 1.3 Baseline Coverage

在不改行为的前提下优先保护：

- `parseSvg`；
- `updateElementAttributes`；
- `translateElementsById`；
- `groupLayers` / `removeLayers`；
- `sanitizeForExport`；
- `getSvgDimensions`；
- current document 与 recent documents payload 读取。

### Task 1.4 GitHub Actions

```text
Checkout
  ↓
Setup pinned Node major
  ↓
npm ci
  ↓
npm run test:unit
  ↓
npm run test:browser
  ↓
npm run build
```

### Phase 1 Exit Criteria

- [x] 三个 test command 可执行；
- [x] Chromium Browser Test 已配置为 CI headless 运行；
- [x] 已有 Parser、Transform 与 Geometry baseline tests 且本地通过；
- [x] 工作流会在 PR 上运行失败即失败的验证步骤；
- [x] Fixture 与现有 Parser、Transform、Geometry、Storage、Export 断言建立对应关系；
- [x] `npm run build` PASS（本地）。

---

## 5. Phase 2 — Safe SVG Input & CSP

优先级：Must

建议投入：4～6 个工程日。

目标：任何非可信 SVG 在进入 Canvas 前都得到可证明的安全输出或明确拒绝。

### Task 2.1 Security Module

推荐边界：

```text
src/editor/security/
├── process-svg-input.js
├── sanitize-svg.js
├── audit-svg.js
└── rules.js
```

文件名可以根据现有模块风格调整，但必须保持：规则、审计、DOM 清理和入口编排职责分离。

### Task 2.2 Pipeline

实现 PRD 定义的：

```text
Parse
  ↓
Validate
  ↓
Audit
  ↓
Sanitize
  ↓
Serialize
  ↓
Reparse / Validate
```

返回 `accepted / sanitized / rejected`，不得保留含义不清的 `safe: boolean`。

### Task 2.3 Security Rules

- [x] Dangerous elements；
- [x] Event attributes；
- [x] Namespace validation；
- [x] URL protocol 与 external reference；
- [x] CSS `<style>` 与 style attribute；
- [x] Data URI MIME allowlist；
- [x] App-owned 与 Untrusted policy；
- [x] Sanitizer idempotence。

### Task 2.4 Integrate Entry Points

按独立小步接入：

1. File Import + Clipboard Import；
2. Source Edit Commit；
3. Custom SVG Save + Insert；
4. Legacy Current + Recent Restore；
5. App-owned Collection Insert。

当前进度：1、2、3、5 已接入；4 的 current document Restore 已在启动时经 `processSvgInput` 处理，Recent Documents 的 legacy restore 与完整 migration 验收仍待完成。

每一步必须同时补入口级 Browser Test。不得先修改所有入口，再到 Phase 尾部统一补测试。

### Task 2.5 Security Feedback

- [x] accepted 无提示；
- [x] sanitized 显示类别与数量；
- [ ] rejected 保留当前文档并显示 error；
- [x] 四语言文案完整；
- [ ] 导出结果与清理后 Canvas 一致。

### Task 2.6 CSP Report-Only

当前已在 `public/_headers` 配置 Enforce CSP。2026-08-09 已验证 Pages 生产域名 `https://vecsy.pages.dev` 返回该响应头，并确认其加载 `2a1b32e` 构建资源；自定义域名 `https://vecsy.top` 加载相同资源，但当前未返回 CSP，需在 Cloudflare 域名层规则中修复后复验。

- [x] App Shell（Pages 生产域名）；
- [ ] File / Clipboard / Source Import；
- [ ] SVG Collection 与动画素材；
- [ ] Canvas Drag；
- [ ] Export Preview；
- [ ] PWA / Manifest；
- [ ] Chrome / Safari / Edge console。

修复非预期 violation 后切换 Enforce，并保留安全 Header。

### Task 2.7 Adversarial Tests

至少证明：

- script、mixed-case event、encoded javascript 无法执行；
- external image / use / CSS / font 不产生请求；
- SVG style 不能改变宿主 UI；
- link traversal 不离开页面；
- malformed input 不覆盖当前文档；
- valid gradient / clipPath / mask / text 不被无故破坏。

### Phase 2 Exit Criteria

- [ ] PRD 输入入口清单覆盖率 100%（Legacy Restore 待 Phase 5）；
- [ ] Security corpus 全部 PASS；
- [x] Sanitizer 重复运行输出稳定；
- [x] CSP Enforce 配置已加入构建产物；
- [x] Pages 生产响应头验证通过（`vecsy.pages.dev`）；
- [ ] 自定义域名 `vecsy.top` 返回相同 CSP；
- [x] 四语言 feedback 已实现；
- [ ] 原有 Import / Source / Collection / Export 全量回归通过。

---

## 6. Phase 3 — Transaction Spine & Geometry Contract

优先级：Must

建议投入：3～4 个工程日。

目标：在迁移 Drag 前固定 mutation 与坐标边界，避免先按旧接口迁移后再返工。

### Task 3.1 Minimal Editor Transaction

实现：

```js
editSvgDocument(markup, transaction)
// => { markup, changed }
```

约束：

- Transaction 不操作 React State；
- Transaction 不调用 `commitDocument`；
- 一次用户操作最多一次 commit；
- 不要求重写全部 `svg-transforms.js`。

### Task 3.2 Geometry Consolidation

基于 Gate 0 Inventory 选择：

- 就地扩展 `src/editor/svg-geometry.js`；或
- 在无并行旧实现的前提下拆为 `editor/geometry/`。

必须明确：

- Pure Matrix API；
- Client → SVG / Parent Local Point；
- Live DOM Adapter；
- Transform preserve / bake 规则；
- Error / null matrix fallback。

### Task 3.3 Geometry Tests

Unit：

- translate / scale / rotate / matrix composition；
- inverse 与 point transform；
- serialization；
- transform order preservation。

Browser：

- `getScreenCTM()`；
- nested group；
- canvas zoom；
- preserveAspectRatio；
- rotated / matrix parent。

### Phase 3 Exit Criteria

- [x] Transaction 最小契约有浏览器测试；
- [x] `commitDocument` 仍是唯一 History Commit Boundary；
- [x] Geometry 只有一套被支持的公共入口（`svg-geometry.js`）；
- [x] 已新增 Pure Matrix Unit 与 DOM-dependent Browser 测试；
- [x] Transform order 测试通过；
- [x] Drag Migration 所需 API 已稳定（真实应用 Single Drag / Undo / Redo 验证）。

---

## 7. Phase 4 — Drag Migration

优先级：Must

建议投入：3～5 个工程日。

目标：Drag 使用统一 Geometry Contract，同时保持选择、History 和性能语义。

### Task 4.1 Single Drag

迁移并验证：

- Plain；
- Translate；
- Scale；
- Rotate；
- Matrix；
- Nested Group；
- Canvas Zoom。

### Task 4.2 Multi / Group Drag

- [x] Multi Select；
- [x] Parent + Child selection filtering；
- [x] Group Drag；
- [x] Visual delta 一致；
- [ ] Transform Stack 不损坏。

### Task 4.3 Gesture Semantics

- [x] PointerMove 只更新 transient preview；
- [x] PointerUp 一次 commit；
- [x] PointerCancel 恢复 base snapshot；
- [x] Drag = one History step；
- [x] Autosave 只由 final commit 触发。

### Task 4.4 Performance Evidence

在 Gate 0 同设备、同 Fixture 上复测：

- pointer-to-preview p95；
- Long Task；
- PointerMove Parse / Serialize；
- Storage Write 次数。

### Phase 4 Exit Criteria

- [ ] PRD Drag 验收矩阵全部 PASS；
- [ ] 视觉位移误差不超过 1 CSS px；
- [ ] Click / Multi Select / Pan / Zoom / Pinch 无回归；
- [ ] Undo / Redo / Cancel 语义正确；
- [ ] 性能达到 PRD 阈值；
- [ ] Chrome 与 Safari 手工 Drag Smoke 通过。

---

## 8. Optional Gate A — Resize Decision

Resize 是 Should，不因“Phase 4 已完成”自动进入。

只有同时满足以下条件才实施：

- [ ] Phase 4 无遗留 Geometry 接口重构；
- [ ] Drag 在 Chrome 与 Safari 稳定；
- [ ] Must Storage 工作尚有完整 4～6 日预算；
- [ ] Release Regression 仍保留至少 4 个工程日；
- [ ] Resize 可以作为独立可回滚 PR。

若任一条件不满足：

```text
Resize Migration
  ↓
v0.5.x or Backlog
```

若进入，至少覆盖 rect、circle、ellipse、line、group、transformed element、nested group，并遵循 one gesture = one history step。

---

## 9. Phase 5 — IndexedDB & Migration

优先级：Must

建议投入：4～6 个工程日。

目标：IndexedDB 成为文档唯一持久化主源，旧数据迁移失败时可恢复且不发生 split-brain。

### Task 5.1 DB Wrapper & Schema

- [x] `vecsy` database version 1；
- [x] `documents` store；
- [x] `meta` store；
- [x] `updatedAt` index；
- [x] open / upgrade / blocked / versionchange / error handling；
- [x] transaction helper 以 `complete` 为成功边界。

`custom-assets` 为 Should，不得阻塞 Must schema。

### Task 5.2 Document Model

当前文档使用固定 id `current`；真正的多文档 Stable ID 与 Recent Documents 的唯一 source-of-truth 尚未完成，因此该项保持未勾选。

- [ ] Stable ID；
- [x] name；
- [x] svgMarkup；
- [x] revision；
- [x] createdAt / updatedAt；
- [x] lastDocumentId；
- [x] Recent Documents 由 updatedAt 查询产生。

### Task 5.3 Autosave Queue

- [x] 750ms debounce；
- [x] per-document write queue；
- [x] stale revision guard；
- [ ] document switch handling；
- [x] visibilitychange best-effort flush；
- [x] error / abort feedback；
- [ ] export-current-document recovery action。

### Task 5.4 Restore

启动流程：

```text
Open DB
  ↓
Read runtime meta
  ↓
Read lastDocumentId
  ↓
Load + Security Process
  ↓
Open Editor
```

任何失败不得覆盖现有存储记录。

### Task 5.5 Migration

按 PRD 状态机执行：

1. legacy-only；
2. migrating；
3. copy current document；
4. copy recent documents with stable IDs；
5. wait transaction complete；
6. reread and compare；
7. set idb-primary；
8. retain legacy keys read-only through v0.5。

### Task 5.6 Failure Drills

- [x] DB open rejected / unavailable；
- [ ] upgrade blocked by second tab；
- [ ] transaction abort；
- [ ] quota / write failure；
- [ ] reload during migration；
- [ ] duplicate migration；
- [ ] corrupted legacy current document；
- [ ] one corrupted recent document does not block all valid documents。

### Phase 5 Exit Criteria

- [x] New commit 只持久化到 IndexedDB（IndexedDB 可用时）；
- [x] Reload 恢复最后文档；
- [ ] Recent Documents 来源唯一；
- [x] Autosave 不发生旧 revision 覆盖新 revision；
- [x] Migration 幂等（已有当前文档时不重复复制）；
- [ ] Failure Drill 全部提供可见反馈与恢复出口；
- [x] legacy keys 未删除；
- [x] localStorage 不再保存完整 History（IndexedDB 可用时）；
- [ ] Chrome 与 Safari Storage Smoke 通过。

---

## 10. Optional Phase 6 — Selective Decomposition

优先级：Should

建议投入：0～3 个工程日，不占用 Release Regression。

原则：只拆本阶段已经触碰且有测试保护的职责。

允许：

- Security feedback orchestration；
- Storage boot / restore workflow；
- Drag 迁移后自然形成的 interaction helper；
- 明显独立且本阶段已修改的 Export / Clipboard / Text 片段。

禁止：

- 为追求目录整齐迁移未触碰模块；
- 同时重写 Export、Clipboard、Text、Keyboard；
- 把 Interaction Mode 未来状态一次性全部预建；
- 以 main.jsx 行数作为唯一成功指标。

### Phase 6 Exit Criteria

- [ ] 每个拆分都可追溯到本阶段需求；
- [ ] 行为前后测试一致；
- [ ] 未新增第二套状态或 mutation 边界；
- [ ] 没有挤占 Phase 7 回归时间。

---

## 11. Phase 7 — Regression & Release

优先级：Must

建议投入：3～4 个工程日。

### 11.1 Automated Gate

- [x] `npm ci`（本地干净安装）；
- [x] `npm run test:unit`；
- [x] `npm run test:browser`；
- [x] `npm run test:webkit`；
- [x] `npm run build`；
- [x] GitHub Actions（`2a1b32e` 的 CI run `31310189957`）；
- [x] `git diff --check`。

### 11.2 Security Gate

- [ ] 所有入口；
- [ ] malicious corpus；
- [ ] no external request；
- [ ] no host DOM / style impact；
- [x] CSP Enforce（Pages 生产域名）；
- [x] Pages production response headers（`vecsy.pages.dev`）；
- [ ] custom domain response headers（`vecsy.top` 当前缺 CSP）。

### 11.3 Browser Matrix

当前补充证据：`npm run test:webkit` 已通过。Safari 与 Edge 的真实手工 smoke 均按当前发布决策延期；WebKit 自动化覆盖不替代其验收。

| Flow | Chrome | Safari | Edge |
|---|---:|---:|---:|
| Import / Sanitize / Reject | 必测 | 延期 | 延期 |
| Source Commit | 必测 | 延期 | 延期 |
| Drag matrix | 必测 | 延期 | 延期 |
| IndexedDB Migration | 必测 | 延期 | 延期 |
| Reload Restore | 必测 | 延期 | 延期 |
| SVG / PNG / WebP Export | 必测 | 延期 | 延期 |
| CSP console | 必测 | 延期 | 延期 |

Safari 与 Edge 验收由产品决策延期，不作为当前本地开发的阻塞项；发布前仍应恢复对应 Smoke。

### 11.4 Existing Feature Regression

#### Import

- [ ] File；
- [ ] Clipboard；
- [ ] Custom SVG；
- [ ] SVG Collection；
- [ ] Legacy Restore。

#### Canvas

- [ ] Select / Multi Select；
- [ ] Pan / Zoom / Pinch；
- [ ] Drag / Cancel；
- [ ] Resize baseline，即使 Optional Gate 未实施也不得回归。

#### Layer

- [ ] Rename / Visibility / Reorder；
- [ ] Copy / Paste / Delete / Group。

#### Editing

- [ ] Fill / Stroke / Opacity；
- [ ] Gradient / Color Token；
- [ ] Text / Source。

#### History

- [ ] Undo / Redo；
- [ ] Drag = one step；
- [ ] Storage restore 不伪造 History。

#### Export

- [ ] SVG / PNG / WebP；
- [ ] Selected Only；
- [ ] Optimize；
- [ ] Export Preview。

### 11.5 Release Actions

全部 Must Gate 通过后：

1. 更新 `package.json` 为 `0.5.0`；
2. 完成 Release Notes，说明安全清理与 localStorage 迁移行为；
3. 构建并部署 Preview；
4. 验证实际响应头与核心流程；
5. 打 `v0.5.0` tag；
6. 发布后保留 legacy keys，不执行清理迁移。

当前进度：版本已更新为 `0.5.0`，Release Notes 已写入 `docs/v0.5/release-notes.md`；提交 `2a1b32e` 已推送，GitHub Actions 已通过，Cloudflare Pages Production 部署 `272a57a2-c916-4e11-aae4-e084916594b1` 已由 Git 集成自动完成。`vecsy.pages.dev` CSP 已通过；`vecsy.top` CSP 仍待域名层修复。`v0.5.0` tag 尚未创建，且不得在 Release Gate 全部通过前创建。

---

## 12. 推荐 PR 拆分

PR 数量可根据实际 diff 合并，但依赖顺序不得倒置。

| PR | Scope | Depends On | Rollback Boundary |
|---|---|---|---|
| 01 | test: unit/browser infrastructure and fixtures | Gate 0 | 测试配置 |
| 02 | ci: unit/browser/build pipeline | PR 01 | Workflow |
| 03 | security: rules, audit, sanitizer and corpus | PR 01 | Security module |
| 04 | security: integrate untrusted input paths and feedback | PR 03 | Entry orchestration |
| 05 | security: CSP report-only, enforce and headers | PR 04 | `_headers` |
| 06 | editor: minimal transaction and geometry contract | PR 01 | Editor API |
| 07 | canvas: migrate drag with regression and performance | PR 06 | Drag path |
| 08 | canvas: optional resize migration | Optional Gate A | Resize path |
| 09 | storage: IndexedDB wrapper and document model | PR 01 | Storage module |
| 10 | storage: autosave, restore and failure handling | PR 09 | Document hook |
| 11 | storage: idempotent legacy migration | PR 10 | Migration switch |
| 12 | release: regression fixes, docs and v0.5.0 | All Must | Release |

PR 03～05 与 PR 06～07 可以由不同负责人并行，但不得同时修改同一入口或 Canvas ownership；Storage 主切换必须等 Security restore policy 稳定后合并。

---

## 13. 排期模型

### 单人基准

| Stage | Estimate |
|---|---:|
| Gate 0 | 2～3 日 |
| Phase 1 Test Foundation | 2～3 日 |
| Phase 2 Security & CSP | 4～6 日 |
| Phase 3 Transaction & Geometry | 3～4 日 |
| Phase 4 Drag | 3～5 日 |
| Phase 5 Storage | 4～6 日 |
| Phase 7 Regression & Release | 3～4 日 |
| 合计 | 21～31 工程日 |

这对应约 4～6 周单人周期。Optional Resize 与 Selective Decomposition 不包含在 Must 基准中。

### 多人协作

Gate 0 与 Phase 1 仍串行。之后可有限并行：

- Lane A：Security + CSP；
- Lane B：Transaction + Geometry + Drag；
- Lane C：Storage wrapper 可提前准备，但 Restore / Migration 必须等 Security restore policy 稳定。

多人协作不改变每个 Phase 的 Exit Criteria，也不能以并行开发替代集成回归。

### 日期固定时的裁剪顺序

如果发布日期不可移动，按以下顺序裁剪：

1. Selective Decomposition；
2. Resize Migration；
3. Custom Assets IndexedDB；
4. 非关键附加 Fixture。

Security、Tests、Drag、Document Migration 与 Release Regression 不可通过降低验收标准来压缩。

---

## 14. Release Gate

发布负责人只检查以下统一 Gate，不再维护第二套 Must 清单。

### G1 Safe Input

- [ ] Phase 2 Exit Criteria 全部完成。

### G2 Testable

- [x] Phase 1 Exit Criteria 全部完成；
- [x] Phase 7 Automated Gate 全部完成。

### G3 Stable Drag

- [ ] Phase 3 和 Phase 4 Exit Criteria 全部完成。

### G4 Durable Document

- [ ] Phase 5 Exit Criteria 全部完成。

### Regression

- [ ] Phase 7 Browser Matrix 与 Existing Feature Regression 全部完成。

只有上述 Gate 全部通过才能发布 v0.5.0。Should 项是否完成不影响发布判断，但必须在 Release Notes 中明确延期状态。

---

## 15. v0.5 之后

v0.5 发布后不继续无边界 Architecture Refactor。

下一阶段进入 Vecsy v0.6 — SVG Surgery，优先验证：

1. SVG Audit Panel；
2. Global Palette；
3. Convert to currentColor；
4. Clean SVG；
5. Developer Export：Data URL、CSS、React JSX。

这些能力必须复用 v0.5 的 Security Pipeline、Editor Transaction 和 `commitDocument`，以此作为 Foundation 是否真正有效的后续验证。
