# Vecsy AI v0.6 文档

本目录包含 Vecsy 下一阶段 **AI-native SVG Editing** 的实施文档与当前进度。

## 当前状态（2026-08-21）

已完成首个本地编辑闭环：VDAP v1.0 校验、Action Runtime、Selection Edit、Preview / Apply / Cancel、Undo 兼容、文档版本保护，以及演示快捷操作和 VDAP JSON 调试。

尚未实施真实 AI Provider、Cloudflare API、Create Mode、Prompt → SVG、生产级 Quick Actions、Evals 与 Alpha Release Gate。当前界面中的 Demo Runtime 只执行预置操作或调试输入，不会请求外部模型。

## 文档

1. `PRD.md`
   - 产品定位
   - 用户场景
   - MVP 范围
   - UX
   - Roadmap
   - Release Gate

2. `TECHNICAL-DESIGN.md`
   - 总体架构
   - AI Runtime
   - Cloudflare API
   - Preview / Apply
   - Revision Guard
   - 安全
   - 测试
   - PR 拆分

3. `DESIGN-ACTION-PROTOCOL.md`
   - Vecsy Design Action Protocol v1.0
   - Action Schema
   - Selection Boundary
   - Atomicity
   - Compiler / Execute Contract
   - Versioning

## 推荐开发顺序

```text
Design Action Protocol（已完成）
        ↓
Action Runtime（已完成）
        ↓
Selection AI Edit + Preview / Apply（已完成，本地 Demo Runtime）
        ↓
AI Provider / Cloudflare API
        ↓
AI Generate
        ↓
生产 Quick Actions + Evals
        ↓
Vecsy AI Alpha
```

## 产品定位

> **Vecsy — AI-native SVG Editor**

> 通过自然语言生成和编辑矢量图形。
