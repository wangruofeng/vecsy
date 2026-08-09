# Vecsy v0.5.0 Release Notes

## Highlights

- SVG 输入统一经过安全处理：移除脚本、事件属性、外部资源、危险样式和 SVG 链接；合法的本地 paint 引用保留。
- Canvas 编辑使用纯 Transaction 与统一 Geometry 契约，Drag 保持一次手势一次历史提交。
- 文档主存储迁至 IndexedDB：自动保存、刷新恢复、Recent Documents 与删除同步均由数据库处理。

## Storage migration

首次启动时，若 IndexedDB 中没有当前文档，Vecsy 会安全处理并复制 legacy localStorage 的当前文档与 Recent Documents 到 IndexedDB，然后记录 `idb-primary`。

v0.5 不删除 legacy key；IndexedDB 不可用时仍保留 localStorage 降级，便于恢复。

## Verification

- Chromium Browser tests
- WebKit Browser tests（Safari 自动化近似覆盖）
- Unit tests、`npm ci`、production build、`git diff --check`

## Deferred

- Microsoft Edge smoke 根据当前发布决策延期；发布前应恢复。
- 真实 Safari 与 Pages Preview/production CSP 验收需要在部署版本上完成。
