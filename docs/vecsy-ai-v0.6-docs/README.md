# Vecsy AI v0.6 文档

本目录包含 Vecsy 下一阶段 **AI-native SVG Editing** 的实施文档与当前进度。

## 当前状态（2026-08-22）

已完成首个本地编辑闭环：VDAP v1.0 校验、Action Runtime、Selection Edit、Preview / Apply / Cancel、Undo 兼容、文档版本保护、可替换的 AI Client 合约，以及演示快捷操作和 VDAP JSON 调试。

已接入首个真实 Provider（DeepSeek，`deepseek-chat`）：`functions/api/ai/edit` Cloudflare Pages Function 负责请求防护、KV 限流（可选）、系统提示词与 Provider 适配，命令栏自由文本输入经 `thinking → validating → preview` 状态走真实模型；快捷操作仍为本地确定性执行。`/api/ai/generate` 为显式 503 桩。

尚未实施 Create Mode、Prompt → SVG、生产级 Quick Actions、Evals 与 Alpha Release Gate。

### 启用 Provider

```bash
# 本地：项目根 .env（git-ignored）配置 DEEPSEEK_API_KEY，优先于 shell 导出（如 ~/.zshrc）；
# 由 scripts/dev-ai.mjs 解析并注入 wrangler。
npm run dev:ai        # wrangler pages dev 代理 vite，地址 http://localhost:8788

# 生产：
npx wrangler pages secret put DEEPSEEK_API_KEY --project-name vecsy
npm run build && npx wrangler pages deploy dist --project-name vecsy --branch main

# 可选限流（20 次/IP/天 + 突发限制）：
npx wrangler kv namespace create AI_RATE_LIMIT
# 然后在 wrangler.toml 中取消 [[kv_namespaces]] 注释并填入 id，重新部署
```

`AI_MODEL` 与 `DEEPSEEK_BASE_URL` 环境变量可覆盖默认模型与端点（`.env` 优先于 shell 导出）；API Key 只存在于 Cloudflare 服务端 Secret 与本地 `.env`/shell（均已 git-ignore）。

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
