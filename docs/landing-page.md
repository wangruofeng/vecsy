# 产品介绍页

## 页面与入口

- `/` 为产品介绍页，`/editor/` 为原 SVG 编辑器。
- 介绍页提供产品概览、图层/画布/源码/导出交互示意、四项现有功能、使用步骤、文件存储说明和常见问题。
- 交互示意是独立的产品插画，不读取、编辑或覆盖用户当前文档。实际文件编辑仍通过编辑器的 `commitDocument` 入口。
- 编辑器顶栏可返回介绍页，指南内的「打开编辑器」直接进入 `/editor/`。
- 首页与编辑器分别构建为 `dist/index.html` 与 `dist/editor/index.html`。Cloudflare Pages 通过 `public/_redirects` 将 `/editor` 规范化为 `/editor/`，不再将编辑器重写为首页。PWA 的启动入口保持为编辑器。

## 设计

参考 [Mole 中文官网](https://mole.fit/zh/) 的暖白背景、深蓝衬线大标题、悬浮胶囊导航、编号章节和轻量滚动反馈，内容、品牌和插画围绕 Vecsy 重新制作。

导航在首屏离开视口后显示创作入口；产品演示支持四个标签、键盘方向键切换和三套插画配色；FAQ 使用原生可展开组件。语言切换采用自定义下拉菜单，选项间保留 4px 间距，支持当前语言标记、键盘选择、Escape、Tab 离开与点击外部关闭。移动端导航支持展开、点击外部与 Escape 关闭。遵循系统减少动态效果偏好。按钮与普通链接使用文字，避免装饰性箭头，仅保留明确方向操作所需的标识。

## 实现

- `src/entry.jsx` 负责页面入口选择和编辑器按需加载。
- `src/components/landing/` 包含介绍页、演示组件及独立作用域样式。
- 四语言文案均位于 `src/app/copy.js`，FAQ 复用指南的已有说明。
- `src/app/language.js` 读取 URL 的 `lang`、本地语言偏好，介绍页首次访问时按浏览器语言选择。语言存储不可用时不影响浏览。
- 首页不加载编辑器文档状态和持久化流程，避免介绍页访问触发文档写入。

## SEO 与静态内容

- 运行 `npm run generate:site` 生成首页、编辑器的 HTML、四语言指南与站点地图。开发、构建及浏览器测试前会自动执行。
- HTML 模板位于 `scripts/templates/app.html`，页面元信息与实体关系位于 `src/app/seo.js`，文案位于 `src/app/copy.js`。生成的 `index.html`、`editor/index.html` 和 `public/guide/` 不应单独修改。
- 首页和编辑器各自拥有标题、描述、canonical、Open Graph、Twitter Card 与 `WebPage` 实体，均关联同一 `WebApplication`、`WebSite` 和发布者实体。
- 不执行 JavaScript 的客户端也可读取首页的功能、步骤、存储说明与 FAQ，以及编辑器的功能说明和指南入口。启用 JavaScript 后，现有 React 页面接管。
- `?lang=` 是界面语言偏好，首页与编辑器的 canonical 均不包含参数；四语言独立指南使用自引用 canonical、互惠 hreflang 与 `x-default`。站点地图只收录六个规范 URL，并在指南条目中同步语言关系。
- `robots.txt` 保持现有搜索抓取和训练爬虫策略；HTML 设置重新验证缓存，带哈希的静态资源继续长期缓存。SEO 更新随下次部署生效。
- 采用 [Vite 多页面构建](https://vite.dev/guide/build.html#multi-page-app) 输出两个入口，规范地址与多语言处理参考 [Google canonical 文档](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) 和 [多语言站点文档](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)。

## 验证

运行 `npm test` 与 `npm run build`；浏览器核对桌面和移动布局、导航锚点、四语言、演示标签和配色、FAQ、进入编辑器及返回介绍页。预览生产构建后，可运行 `node tests/e2e/seo-pages.mjs http://127.0.0.1:4173` 验证两个入口在禁用 JavaScript 时的可读内容和启用时的元信息。
