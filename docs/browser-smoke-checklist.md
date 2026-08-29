# Vecsy 浏览器冒烟清单

用于每次架构重构 checkpoint 的本地回归验证。启动 `npm run dev` 后，在浏览器访问 `http://127.0.0.1:5173/`。AI 功能为纯前端直连，需先在「AI 模型设置」面板配置供应商与 API Key。

## 基础加载

- [ ] 页面标题为 `Vecsy — SVG editor`。
- [ ] 首屏出现 VECSY、Layers、Preview、Inspector 和示例 SVG。
- [ ] 页面没有 Vite/React 错误覆盖层，控制台没有 error/warn。

## 图层与画布

- [ ] 点击图层行后，预览区域出现对应选框，Inspector 内容同步。
- [ ] 按 Cmd/Ctrl 点击第二个图层后，两个图层行均保持 selected，预览显示两个独立选框及多选组外框。
- [ ] 在预览中点击已选图层不会把多选折回单选。
- [ ] 拖动已选图层后，SVG 内容更新且可用 Undo 恢复。
- [ ] Preview / Source 切换正常，源码编辑区可以显示 SVG。

## 编辑与导出

- [ ] 修改填充色或透明度后，预览即时更新，Undo / Redo 正常。
- [ ] 点击 Export SVG 后导出弹窗打开，关闭按钮正常。
- [ ] Cmd/Ctrl+A、Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z 快捷键正常。

## 响应式

- [ ] 375×800 视口下页面不出现横向滚动，预览和 Inspector 可见。
- [ ] 小屏下图层面板按设计隐藏，顶部导入/导出操作仍可用。

## AI 编辑（`npm run dev`，需在设置面板配置 API Key）

- [ ] 未配置 API Key 时，命令栏显示「请先配置 API Key」提示与设置入口。
- [ ] 顶部设置按钮打开「AI 模型设置」弹窗，可填写供应商名称 / Base URL / API 格式（三选一）/ API Key，添加、删除、激活模型，保存后写入 localStorage。
- [ ] 选中图层后，快捷动作（改为蓝色 / 放大 / 更圆润 / 删除）立即可预览并可应用 / 取消（本地 demo，不依赖供应商）。
- [ ] 已配置时输入自然语言进入 思考中 → 校验中 → 预览 状态；密钥无效时报「AI 服务未配置或密钥无效」。
- [ ] 自由文本编辑预览确认后可应用，Undo 恢复原状。
- [ ] VDAP JSON 调试输入合法 Envelope 可预览。

## 记录

每次重构 checkpoint 至少执行：

```bash
npm run build
```

并在浏览器完成上述清单。若某项失败，先回退当前 checkpoint，再继续拆分。
