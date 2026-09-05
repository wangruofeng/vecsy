# Vecsy 浏览器冒烟清单

用于每次架构重构 checkpoint 的本地回归验证。启动 `npm run dev` 后，在浏览器访问 `http://127.0.0.1:5173/`。

## 基础加载

- [ ] 页面标题为 `Vecsy — Free Online SVG Editor in Your Browser`。
- [ ] 首屏出现 VECSY、Layers、Preview、Inspector 和示例 SVG。
- [ ] 页面没有 Vite/React 错误覆盖层，控制台没有 error/warn。

## 图层与画布

- [ ] 点击图层行后，预览区域出现对应选框，Inspector 内容同步。
- [ ] 按 Cmd/Ctrl 点击第二个图层后，两个图层行均保持 selected，预览显示两个独立选框及多选组外框。
- [ ] 在预览中点击已选图层不会把多选折回单选。
- [ ] 拖动已选图层后，SVG 内容更新且可用 Undo 恢复。
- [ ] Preview / Source 切换正常，源码编辑区可以显示 SVG。

## 画布框选

- [ ] 默认「选择」工具：空白处拖动框选完整包围的可见元素，隐藏元素不参与，父子不重复选中。
- [ ] Shift 点击增减单个元素；Shift 框选追加选择；Cmd/Ctrl 点击保持兼容。
- [ ] 「平移」工具：从元素或空白处拖动均只改变视角，保留选中集合。
- [ ] 缩放和平移后，正向、反向框选命中一致。
- [ ] Esc / pointercancel 取消框选并保留原选择；空白点击清空选择。
- [ ] 框选不新增撤销记录；框选后整体移动一次，Undo 一次恢复位置与多选集合。

自动鼠标验收：启动本地开发服务后运行 `node tests/e2e/canvas-selection.mjs http://127.0.0.1:5173`。同目录另有 `canvas-shortcuts.mjs`、`canvas-hover.mjs`、`canvas-distances.mjs`、`canvas-group-drag.mjs`、`canvas-multi-drag.mjs`，覆盖对应交互场景。

## 线段端点与测距

- [ ] 选中直线图层后，Inspector 出现开始/结束点样式下拉，hover 选项即时预览、关闭菜单不产生撤销记录，提交后可撤销。
- [ ] 「添加图层 → 箭头」生成带三角端点的直线；删除该图层后源码视图不残留 `<defs>` marker 定义。
- [ ] 选中任意图层后按住 Alt，hover 其他图层显示间距参考线与数值。

## 编辑与导出

- [ ] 修改填充色或透明度后，预览即时更新，Undo / Redo 正常。
- [ ] 点击 Export SVG 后导出弹窗打开，关闭按钮正常。
- [ ] Cmd/Ctrl+A、Cmd/Ctrl+Z、Cmd/Ctrl+Shift+Z 快捷键正常。

## 响应式

- [ ] 375×800 视口下页面不出现横向滚动，预览和 Inspector 可见。
- [ ] 小屏下图层面板按设计隐藏，顶部导入/导出操作仍可用。

## 记录

每次重构 checkpoint 至少执行：

```bash
npm run build
```

并在浏览器完成上述清单。若某项失败，先回退当前 checkpoint，再继续拆分。
