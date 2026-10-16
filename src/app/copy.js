// 文案按「key 聚合 + 功能分组」组织：每条文案的四语言写在一起，
// buildCopy 在运行时拍平成 { en, "zh-CN", "zh-TW", ja } 各一份 { key: text }。
// 新增/修改文案：在对应功能分组里加/改一条 { en, "zh-CN", "zh-TW", ja }，四语言相邻、不会漏。

export const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文', short: '简' },
  { code: 'zh-TW', label: '繁體中文', short: '繁' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
]

const LANGS = ['en', 'zh-CN', 'zh-TW', 'ja']

const SECTIONS = {
  landing: {
    landingDocumentTitle: { en: 'Vecsy — A Simple, Free Online SVG Editor', 'zh-CN': 'Vecsy 随形 — 轻巧免费的在线 SVG 编辑器', 'zh-TW': 'Vecsy 隨形 — 輕巧免費的線上 SVG 編輯器', ja: 'Vecsy — 手軽に使える無料オンライン SVG エディター' },
    landingMetaDescription: { en: 'Meet Vecsy, a free SVG editor in your browser. Explore layer, color and text editing, SVG, PNG and WebP export, and local file storage. No account or install.', 'zh-CN': '认识 Vecsy 随形：轻巧免费的浏览器 SVG 编辑器。了解图层、配色、文字编辑及 SVG、PNG、WebP 导出，查看使用步骤与常见问题。无需安装或注册，文件在本地处理。', 'zh-TW': '認識 Vecsy 隨形：輕巧免費的瀏覽器 SVG 編輯器。了解圖層、配色、文字編輯及 SVG、PNG、WebP 匯出，查看使用步驟與常見問題。無需安裝或註冊，檔案在本機處理。', ja: 'Vecsy は手軽に使える無料のブラウザー SVG エディターです。レイヤー、色、テキストの編集、SVG・PNG・WebP 書き出し、使い方とよくある質問を紹介。登録やインストールは不要です。' },
    editorJavascriptRequired: { en: 'Enable JavaScript to use the editor. You can read the product information and guides without it.', 'zh-CN': '使用编辑器需要启用 JavaScript。产品介绍与使用指南无需 JavaScript 也可阅读。', 'zh-TW': '使用編輯器需要啟用 JavaScript。產品介紹與使用指南無需 JavaScript 也可閱讀。', ja: 'エディターの利用には JavaScript を有効にしてください。製品紹介とガイドは JavaScript なしでも読めます。' },
    landingHome: { en: 'Vecsy home', 'zh-CN': 'Vecsy 首页', 'zh-TW': 'Vecsy 首頁', ja: 'Vecsy ホーム' },
    landingSkip: { en: 'Skip to content', 'zh-CN': '跳到主要内容', 'zh-TW': '跳到主要內容', ja: '本文へ移動' },
    landingNav: { en: 'Main navigation', 'zh-CN': '主导航', 'zh-TW': '主導覽', ja: 'メインナビゲーション' },
    landingMenu: { en: 'Navigation menu', 'zh-CN': '导航菜单', 'zh-TW': '導覽選單', ja: 'ナビゲーションメニュー' },
    landingFeaturesNav: { en: 'Features', 'zh-CN': '功能', 'zh-TW': '功能', ja: '機能' },
    landingDemoNav: { en: 'Take a look', 'zh-CN': '先看看', 'zh-TW': '先看看', ja: 'プレビュー' },
    landingStepsNav: { en: 'How it works', 'zh-CN': '如何使用', 'zh-TW': '如何使用', ja: '使い方' },
    landingFaqNav: { en: 'FAQ', 'zh-CN': '常见问题', 'zh-TW': '常見問題', ja: 'よくある質問' },
    landingGuideNav: { en: 'Guide', 'zh-CN': '使用指南', 'zh-TW': '使用指南', ja: 'ガイド' },
    landingStart: { en: 'Open editor', 'zh-CN': '开始创作', 'zh-TW': '開始創作', ja: 'エディターを開く' },
    landingHeroWord: { en: 'Simply SVG.', 'zh-CN': '随形', 'zh-TW': '隨形', ja: 'かたち自在' },
    landingHeroDescription: { en: 'A little edit. A new possibility. Give your SVG the colors, layers and details it deserves, right in your browser.', 'zh-CN': '改一点颜色，调几处细节，让手中的 SVG 恰如所想。一个浏览器，就够了。', 'zh-TW': '改一點顏色，調幾處細節，讓手中的 SVG 恰如所想。一個瀏覽器，就夠了。', ja: '色を変え、細部を整え、思い描いた SVG に。ブラウザーひとつで、すぐに。' },
    landingPromises: { en: ['Free to use', 'No account', 'No installation', 'Files stay local'], 'zh-CN': ['免费使用', '无需注册', '不必安装', '文件留在本地'], 'zh-TW': ['免費使用', '無需註冊', '不必安裝', '檔案留在本機'], ja: ['無料で使える', '登録不要', 'インストール不要', 'ファイルはローカルに'] },
    landingExplore: { en: 'Explore the details', 'zh-CN': '看看它能做什么', 'zh-TW': '看看它能做什麼', ja: 'できることを見る' },
    landingHeroNote: { en: 'For the small changes that make a difference.', 'zh-CN': '为那些「只想改一点」的时刻而做。', 'zh-TW': '為那些「只想改一點」的時刻而做。', ja: '「少しだけ直したい」そんなときに。' },
    landingDemoTitle: { en: 'Your SVG. Every little detail.', 'zh-CN': '每一个图层，都有新可能', 'zh-TW': '每一個圖層，都有新可能', ja: 'レイヤーごとに、広がる可能性' },
    landingDemoDescription: { en: 'Layers, colors, source and export, together in one quiet workspace. Try the preview below.', 'zh-CN': '图层、颜色、源码与导出，在一个安静的工作台里各就其位。不妨先在下面试一试。', 'zh-TW': '圖層、顏色、原始碼與匯出，在一個安靜的工作台裡各就其位。不妨先在下面試一試。', ja: 'レイヤー、色、コード、書き出しを、ひとつの落ち着いた作業場に。下のプレビューをお試しください。' },
    landingDemoLabel: { en: 'Interactive product illustration', 'zh-CN': '产品交互示意', 'zh-TW': '產品互動示意', ja: '製品のインタラクティブデモ' },
    landingDemoTabs: { en: ['Canvas', 'Layers', 'Source', 'Export'], 'zh-CN': ['画布', '图层', '源码', '导出'], 'zh-TW': ['畫布', '圖層', '原始碼', '匯出'], ja: ['キャンバス', 'レイヤー', 'コード', '書き出し'] },
    landingDemoCaptions: { en: ['Make a little room for your ideas.', 'Every shape has its place. Select a layer to see it.', 'The picture and its source, side by side.', 'Keep it vector, or take it anywhere as an image.'], 'zh-CN': ['把一点想法，变成眼前的形状。', '每个形状，各有位置。点选图层，看看它在哪里。', '看得见图形，也读得懂背后的源码。', '保留矢量的灵活，也照顾每一次分享。'], 'zh-TW': ['把一點想法，變成眼前的形狀。', '每個形狀，各有位置。點選圖層，看看它在哪裡。', '看得見圖形，也讀得懂背後的原始碼。', '保留向量的靈活，也照顧每一次分享。'], ja: ['小さなアイデアを、目の前のかたちに。', 'かたちには、それぞれの場所がある。レイヤーを選んで確認。', '絵と、その向こうにあるコードを一緒に。', 'ベクターのままでも、画像としても。'] },
    landingDemoLayers: { en: ['Orbit', 'Sun', 'Star', 'Caption'], 'zh-CN': ['轨道', '日轮', '星芒', '文字'], 'zh-TW': ['軌道', '日輪', '星芒', '文字'], ja: ['軌道', '太陽', '星', 'テキスト'] },
    landingDemoPalettes: { en: ['Terracotta', 'Garden', 'Ultramarine'], 'zh-CN': ['陶土', '花园', '群青'], 'zh-TW': ['陶土', '花園', '群青'], ja: ['テラコッタ', 'ガーデン', 'ウルトラマリン'] },
    landingDemoPalette: { en: 'Try a palette', 'zh-CN': '换个配色试试', 'zh-TW': '換個配色試試', ja: '配色を試す' },
    landingDemoArtTitle: { en: 'A little space', 'zh-CN': '一方天地', 'zh-TW': '一方天地', ja: '小さな世界' },
    landingDemoArtSubtitle: { en: 'FOR YOUR NEXT IDEA', 'zh-CN': '留给下一个灵感', 'zh-TW': '留給下一個靈感', ja: '次のひらめきのために' },
    landingDemoArtFooter: { en: 'Shapes, with a little soul.', 'zh-CN': '形有尽，意无穷。', 'zh-TW': '形有盡，意無窮。', ja: 'かたちに、少しの遊び心を。' },
    landingDemoFile: { en: 'a-little-space.svg', 'zh-CN': '一方天地.svg', 'zh-TW': '一方天地.svg', ja: '小さな世界.svg' },
    landingDemoProperty: { en: 'Appearance', 'zh-CN': '外观', 'zh-TW': '外觀', ja: '外観' },
    landingDemoFill: { en: 'Fill', 'zh-CN': '填充', 'zh-TW': '填色', ja: '塗り' },
    landingDemoOpacity: { en: 'Opacity', 'zh-CN': '不透明度', 'zh-TW': '不透明度', ja: '不透明度' },
    landingDemoSize: { en: 'Dimensions', 'zh-CN': '尺寸', 'zh-TW': '尺寸', ja: 'サイズ' },
    landingDemoFormats: { en: ['Editable vector', 'Transparent image', 'Compact image'], 'zh-CN': ['可继续编辑的矢量', '支持透明背景的图片', '便于分享的轻量图片'], 'zh-TW': ['可繼續編輯的向量', '支援透明背景的圖片', '便於分享的輕量圖片'], ja: ['再編集できるベクター', '透過に対応した画像', '共有しやすい軽量画像'] },
    landingDemoExportNote: { en: 'Choose a format in the editor to export your own file.', 'zh-CN': '进入编辑器，即可导出你自己的作品。', 'zh-TW': '進入編輯器，即可匯出你自己的作品。', ja: 'エディターで、自分の作品を書き出せます。' },
    landingFeaturesTitle: { en: 'A light tool, for the details that matter.', 'zh-CN': '轻装上阵，细节不将就', 'zh-TW': '輕裝上陣，細節不將就', ja: '軽やかに、細部まで。' },
    landingFeaturesDescription: { en: 'From a quick color change to the finishing touches on an illustration. Just the tools you need, close at hand.', 'zh-CN': '从换一个图标颜色，到调整一整张插画。常用的工具，伸手就能找到。', 'zh-TW': '從換一個圖示顏色，到調整一整張插畫。常用的工具，伸手就能找到。', ja: 'アイコンの色替えから、イラストの仕上げまで。必要な道具が、すぐそばに。' },
    landingFeatureTitles: { en: ['See every layer', 'Find your colors', 'Stay close to the source', 'Export, your way'], 'zh-CN': ['图层之间，井然有序', '一点颜色，就很不同', '图形与代码，两面相通', '做好了，带走吧'], 'zh-TW': ['圖層之間，井然有序', '一點顏色，就很不同', '圖形與程式碼，兩面相通', '做好了，帶走吧'], ja: ['レイヤーを、すっきりと', '少しの色で、変わる表情', '絵もコードも、ひと続き', 'できたら、持ち出そう'] },
    landingFeatureBodies: { en: ['Select, rename, reorder and group. Align several shapes or hide one for a moment. Everything has its place.', 'Fine-tune fills, strokes and opacity with a live preview. Make small adjustments and see the difference as you go.', 'Switch between the canvas and SVG source. Read highlighted markup, edit directly, or format it with a click.', 'Keep your work as SVG, or export PNG and WebP. Choose the scale, export selected layers and optimize SVG size.'], 'zh-CN': ['点选、重命名、排序与编组，多选后对齐或等距分布。复杂的图形，也能理出清晰的层次。', '填充、描边、透明度，边改边看。微调几处色彩，给熟悉的图形一个新的表情。', '在可视画布与 SVG 源码之间切换。语法高亮、一键格式化，习惯看图或写代码，都顺手。', '保留 SVG，或导出 PNG、WebP。支持指定倍率、选中图层导出和 SVG 体积优化。'], 'zh-TW': ['點選、重新命名、排序與群組，多選後對齊或等距分佈。複雜的圖形，也能理出清晰的層次。', '填色、描邊、透明度，邊改邊看。微調幾處色彩，給熟悉的圖形一個新的表情。', '在視覺畫布與 SVG 原始碼之間切換。語法高亮、一鍵格式化，習慣看圖或寫程式碼，都順手。', '保留 SVG，或匯出 PNG、WebP。支援指定倍率、選取圖層匯出和 SVG 體積最佳化。'], ja: ['選択、名前変更、並べ替え、グループ化。複数の図形を整列・等間隔に配置し、複雑な絵も整理できます。', '塗り、線、不透明度をプレビューしながら調整。少しの色替えで、見慣れた図形に新しい表情を。', 'キャンバスと SVG コードを切り替え。構文ハイライト、直接編集、ワンクリック整形に対応します。', 'SVG のまま保存、または PNG・WebP に書き出し。倍率、選択レイヤー、SVG のサイズ最適化も選べます。'] },
    landingLocalTitle: { en: 'Your files feel at home. On your device.', 'zh-CN': '创作留在这里，文件也是', 'zh-TW': '創作留在這裡，檔案也是', ja: '作品もファイルも、手元に。' },
    landingLocalBody: { en: 'Editing happens in your browser. Your documents are saved locally, with no account to create. Export a backup before clearing browser data.', 'zh-CN': '编辑在浏览器里完成，文档自动保存在当前设备。无需账号，不必上传文件。清理浏览器数据前，记得导出一份备份。', 'zh-TW': '編輯在瀏覽器裡完成，文件自動儲存在目前裝置。無需帳號，不必上傳檔案。清理瀏覽器資料前，記得匯出一份備份。', ja: '編集も自動保存も、今使っているブラウザーで。アカウントもファイルのアップロードも不要です。ブラウザーデータを消す前に、バックアップを書き出してください。' },
    landingLocalLink: { en: 'More about your files', 'zh-CN': '了解文件与存储', 'zh-TW': '了解檔案與儲存', ja: 'ファイルと保存について' },
    landingStepsTitle: { en: 'From a file to a finished thought.', 'zh-CN': '从一个文件，到心中所想', 'zh-TW': '從一個檔案，到心中所想', ja: 'ファイルから、思い描いたかたちへ。' },
    landingStepTitles: { en: ['Bring it in', 'Make it yours', 'Take it with you'], 'zh-CN': ['放进来', '改一改', '带出去'], 'zh-TW': ['放進來', '改一改', '帶出去'], ja: ['読み込む', '整える', '持ち出す'] },
    landingStepBodies: { en: ['Drop an SVG into the editor, open a file, or start with the built-in example.', 'Select a layer. Change a color, edit some text, or move a shape. Undo any time.', 'Export SVG, PNG or WebP. Ready for your site, a presentation, or the next idea.'], 'zh-CN': ['拖入 SVG、打开本地文件，或从内置示例开始。', '选中图层，改颜色、编辑文字、调整位置。随时可以撤销。', '导出 SVG、PNG 或 WebP，用到网页、演示文稿或下一个项目里。'], 'zh-TW': ['拖入 SVG、開啟本機檔案，或從內建範例開始。', '選取圖層，改顏色、編輯文字、調整位置。隨時可以復原。', '匯出 SVG、PNG 或 WebP，用到網頁、簡報或下一個專案裡。'], ja: ['SVG をドロップ、ローカルファイルを開く、またはサンプルから始めます。', 'レイヤーを選んで、色、テキスト、位置を調整。いつでも元に戻せます。', 'SVG、PNG、WebP に書き出し。サイト、スライド、次のプロジェクトに。'] },
    landingFaqTitle: { en: 'A few things you might wonder.', 'zh-CN': '你可能还想知道', 'zh-TW': '你可能還想知道', ja: '気になることを、いくつか。' },
    landingClosing: { en: 'A little idea. Give it a shape.', 'zh-CN': '让下一点灵感，有形可循。', 'zh-TW': '讓下一點靈感，有形可循。', ja: '次のひらめきを、かたちに。' },
    landingClosingNote: { en: 'Open your browser. Your workspace is ready.', 'zh-CN': '打开浏览器，工作台就准备好了。', 'zh-TW': '開啟瀏覽器，工作台就準備好了。', ja: 'ブラウザーを開けば、作業場はもうそこに。' },
    landingFooter: { en: 'A little workspace for vector ideas.', 'zh-CN': '一个安放矢量灵感的小小工作台。', 'zh-TW': '一個安放向量靈感的小小工作台。', ja: 'ベクターのアイデアに、小さな作業場を。' },
    landingTop: { en: 'Back to top', 'zh-CN': '回到顶部', 'zh-TW': '回到頂部', ja: 'ページの先頭へ' },
    landingOpenSource: { en: 'Open source · AGPL-3.0', 'zh-CN': '开源 · AGPL-3.0', 'zh-TW': '開源 · AGPL-3.0', ja: 'オープンソース · AGPL-3.0' },
  },
  guide: {
    guideTitle: {
      "en": "Vecsy SVG editor guide",
      "zh-CN": "Vecsy SVG 编辑器使用指南",
      "zh-TW": "Vecsy SVG 編輯器使用指南",
      "ja": "Vecsy SVG エディターガイド"
    },
    guideSummary: {
      "en": "Vecsy is a free browser SVG editor for editing existing vector files, layers, colors and text, with SVG, PNG and WebP export. No installation or account is required.",
      "zh-CN": "Vecsy 是免费的浏览器 SVG 编辑器，可编辑已有矢量文件、图层、颜色和文字，并导出 SVG、PNG 或 WebP，无需安装或注册账号。",
      "zh-TW": "Vecsy 是免費的瀏覽器 SVG 編輯器，可編輯現有向量檔案、圖層、顏色和文字，並匯出 SVG、PNG 或 WebP，無需安裝或註冊帳號。",
      "ja": "Vecsy は無料のブラウザー SVG エディターです。ベクターファイル、レイヤー、色、テキストを編集し、SVG、PNG、WebP で書き出せます。インストールやアカウントは不要です。"
    },
    guideStart: {
      "en": "Open SVG editor",
      "zh-CN": "打开 SVG 编辑器",
      "zh-TW": "開啟 SVG 編輯器",
      "ja": "SVG エディターを開く"
    },
    guideStepsTitle: {
      "en": "How to edit an SVG",
      "zh-CN": "如何编辑 SVG",
      "zh-TW": "如何編輯 SVG",
      "ja": "SVG の編集手順"
    },
    guideSteps: {
      "en": [
        "Import an SVG with the Import button or drag a file onto the editor.",
        "Select an element on the canvas or in the layer tree.",
        "Change its fill, stroke, text or transform in the property panel; undo if needed.",
        "Choose Export and select SVG, PNG or WebP."
      ],
      "zh-CN": [
        "点击导入按钮选择 SVG 文件，或将文件拖入编辑器。",
        "在画布或图层树中选择需要编辑的元素。",
        "在属性面板修改填充、描边、文字或变换；需要时可撤销。",
        "点击导出，选择 SVG、PNG 或 WebP 格式。"
      ],
      "zh-TW": [
        "點擊匯入按鈕選擇 SVG 檔案，或將檔案拖入編輯器。",
        "在畫布或圖層樹中選擇需要編輯的元素。",
        "在屬性面板修改填色、描邊、文字或變換；需要時可復原。",
        "點擊匯出，選擇 SVG、PNG 或 WebP 格式。"
      ],
      "ja": [
        "インポートボタンまたはドラッグで SVG を読み込みます。",
        "キャンバスまたはレイヤーツリーで要素を選択します。",
        "プロパティで塗り、線、テキスト、変形を変更します。必要なら元に戻せます。",
        "エクスポートで SVG、PNG、WebP を選択します。"
      ]
    },
    guideFaqTitle: {
      "en": "Frequently asked questions",
      "zh-CN": "常见问题",
      "zh-TW": "常見問題",
      "ja": "よくある質問"
    },
    guideFaq: {
      "en": [
        [
          "Is Vecsy free?",
          "Yes. The SVG editor is free and does not require an account."
        ],
        [
          "Are SVG files uploaded?",
          "Imported documents are edited and saved in this browser. Export a backup: clearing browser storage can remove locally saved documents. External image URLs and active content are filtered during SVG import; use embedded images for a self-contained file."
        ],
        [
          "Can I edit colors and text?",
          "Select a layer to change its fill, stroke and text. You can also rename, reorder, group, align and distribute layers."
        ],
        [
          "Can I convert PNG to editable SVG paths?",
          "Vecsy edits SVG vectors and exports PNG or WebP. Importing a raster image does not trace it into editable vector paths."
        ],
        [
          "Which format should I export?",
          "SVG preserves vector markup for further editing. PNG and WebP are raster images; their resolution depends on export settings."
        ],
        [
          "Does every SVG render identically?",
          "Fonts, external resources and browser support can affect rendering. Active or unsafe SVG content is filtered on import. Check the preview and exported file for complex SVGs."
        ]
      ],
      "zh-CN": [
        [
          "Vecsy 免费吗？",
          "是，SVG 编辑器免费使用，无需注册账号。"
        ],
        [
          "SVG 文件会上传吗？",
          "导入文档在当前浏览器中编辑和保存。建议导出备份，清除浏览器存储可能删除本地文档。导入 SVG 时会过滤外部图片链接与活跃内容；建议使用嵌入图片，让文件不依赖外部资源。"
        ],
        [
          "可以修改颜色和文字吗？",
          "选择图层后可修改填充、描边和文字，也可重命名、排序、分组、对齐及分布图层。"
        ],
        [
          "能把 PNG 转为可编辑的 SVG 路径吗？",
          "Vecsy 编辑 SVG 矢量并导出 PNG 或 WebP。导入位图不会自动描摹为可编辑的矢量路径。"
        ],
        [
          "应该导出哪种格式？",
          "SVG 保留矢量标记，便于继续编辑。PNG 和 WebP 是位图，分辨率取决于导出设置。"
        ],
        [
          "所有 SVG 都能原样显示吗？",
          "字体、外部资源和浏览器支持可能影响显示。导入时会过滤活跃或不安全的 SVG 内容，复杂文件请检查预览和导出结果。"
        ]
      ],
      "zh-TW": [
        [
          "Vecsy 免費嗎？",
          "是，SVG 編輯器免費使用，無需註冊帳號。"
        ],
        [
          "SVG 檔案會上傳嗎？",
          "匯入文件在目前瀏覽器中編輯和儲存。建議匯出備份，清除瀏覽器儲存空間可能刪除本地文件。匯入 SVG 時會過濾外部圖片連結與活躍內容；建議使用嵌入圖片，讓檔案不依賴外部資源。"
        ],
        [
          "可以修改顏色和文字嗎？",
          "選擇圖層後可修改填色、描邊和文字，也可重新命名、排序、群組、對齊及分佈圖層。"
        ],
        [
          "能把 PNG 轉為可編輯的 SVG 路徑嗎？",
          "Vecsy 編輯 SVG 向量並匯出 PNG 或 WebP。匯入點陣圖不會自動描摹為可編輯的向量路徑。"
        ],
        [
          "應該匯出哪種格式？",
          "SVG 保留向量標記，便於繼續編輯。PNG 和 WebP 是點陣圖，解析度取決於匯出設定。"
        ],
        [
          "所有 SVG 都能原樣顯示嗎？",
          "字型、外部資源和瀏覽器支援可能影響顯示。匯入時會過濾活躍或不安全的 SVG 內容，複雜檔案請檢查預覽和匯出結果。"
        ]
      ],
      "ja": [
        [
          "Vecsy は無料ですか？",
          "はい。SVG エディターは無料で、アカウント登録は不要です。"
        ],
        [
          "SVG はアップロードされますか？",
          "読み込んだ文書は現在のブラウザーで編集・保存されます。ストレージの削除で文書が失われる場合があるため、書き出してバックアップしてください。SVG の読み込み時に外部画像 URL とアクティブなコンテンツは除去されます。外部リソースに依存しない埋め込み画像を使用してください。"
        ],
        [
          "色やテキストを編集できますか？",
          "レイヤーの塗り、線、テキストを変更できます。名前変更、並べ替え、グループ化、整列、均等配置もできます。"
        ],
        [
          "PNG を編集可能な SVG パスに変換できますか？",
          "Vecsy は SVG の編集と PNG・WebP の書き出しに対応します。画像の読み込みはベクターパスへの自動トレースではありません。"
        ],
        [
          "どの形式で書き出すべきですか？",
          "SVG は再編集用のベクターマークアップを保持します。PNG と WebP はラスター画像で、解像度は書き出し設定によります。"
        ],
        [
          "すべての SVG が同じように表示されますか？",
          "フォント、外部リソース、ブラウザーの対応状況により表示が変わる場合があります。読み込み時には危険な SVG 内容が除去されます。複雑なファイルはプレビューと書き出し結果を確認してください。"
        ]
      ]
    },
    guideSource: {
      "en": "Product source",
      "zh-CN": "产品源码",
      "zh-TW": "產品原始碼",
      "ja": "製品ソース"
    },
  },

  chrome: {
    languageSwitch: {
      'en': 'Language',
      'zh-CN': '语言',
      'zh-TW': '語言',
      'ja': '言語',
    },
    githubRepository: {
      'en': 'View source on GitHub',
      'zh-CN': '在 GitHub 查看源码',
      'zh-TW': '在 GitHub 查看原始碼',
      'ja': 'GitHub でソースを見る',
    },
    saved: {
      'en': 'All changes saved',
      'zh-CN': '所有更改已保存',
      'zh-TW': '所有更改已儲存',
      'ja': 'すべての変更が保存されました',
    },
    unsaved: {
      'en': 'Changes not exported',
      'zh-CN': '更改尚未导出',
      'zh-TW': '更改尚未匯出',
      'ja': '変更はまだエクスポートされていません',
    },
    open: {
      'en': 'Import',
      'zh-CN': '导入',
      'zh-TW': '匯入',
      'ja': 'インポート',
    },
    export: {
      'en': 'Export',
      'zh-CN': '导出',
      'zh-TW': '匯出',
      'ja': 'エクスポート',
    },
    exportShort: {
      'en': 'Export',
      'zh-CN': '导出',
      'zh-TW': '匯出',
      'ja': 'エクスポート',
    },
    documentTitle: {
      'en': 'Vecsy — Free Online SVG Editor in Your Browser',
      'zh-CN': 'Vecsy — 免费在线 SVG 编辑器',
      'zh-TW': 'Vecsy — 免費線上 SVG 編輯器',
      'ja': 'Vecsy — 無料オンライン SVG エディター',
    },
    metaDescription: {
      'en': 'Free online SVG editor. Edit layers, colors, text and shapes in your browser, then export SVG, PNG or WebP. No install or account; your files stay on your device.',
      'zh-CN': '免费在线 SVG 编辑器：在浏览器中编辑图层、颜色、文字和形状，支持对齐、分布、撤销与重做，导出 SVG、PNG 或 WebP。无需安装或注册，文件在本地处理。',
      'zh-TW': '免費線上 SVG 編輯器：在瀏覽器中編輯圖層、色彩、文字和形狀，支援對齊、分佈、復原與重做，匯出 SVG、PNG 或 WebP。無需安裝或註冊，檔案在本機處理。',
      'ja': '無料オンライン SVG エディター。ブラウザーでレイヤー、色、テキスト、図形を編集し、整列や取り消しも利用できます。SVG、PNG、WebP に書き出し可能。インストールや登録は不要で、ファイルは端末内で処理されます。',
    },
    socialImageAlt: {
      'en': 'Vecsy — browser SVG editor with layers, live preview and export',
      'zh-CN': 'Vecsy — 支持图层编辑、实时预览和导出的浏览器 SVG 编辑器',
      'zh-TW': 'Vecsy — 支援圖層編輯、即時預覽和匯出的瀏覽器 SVG 編輯器',
      'ja': 'Vecsy — レイヤー編集、ライブプレビュー、書き出しに対応するブラウザー SVG エディター',
    },
    brandTagline: {
      'en': 'Free online SVG editor',
      'zh-CN': '免费在线 SVG 编辑器',
      'zh-TW': '免費線上 SVG 編輯器',
      'ja': '無料オンライン SVG エディター',
    },
  },
  layers: {
    layers: {
      'en': 'Layers',
      'zh-CN': '图层',
      'zh-TW': '圖層',
      'ja': 'レイヤー',
    },
    addLayer: {
      'en': 'Add layer',
      'zh-CN': '添加图层',
      'zh-TW': '新增圖層',
      'ja': 'レイヤーを追加',
    },
    addElement: {
      'en': 'Add element',
      'zh-CN': '添加元素',
      'zh-TW': '新增元素',
      'ja': '要素を追加',
    },
    fromImage: {
      'en': 'Add from image',
      'zh-CN': '图片',
      'zh-TW': '圖片',
      'ja': '画像',
    },
    fromSvgCollection: {
      'en': 'Add from SVG collection',
      'zh-CN': '收藏',
      'zh-TW': 'SVG 收藏',
      'ja': 'SVG コレクション',
    },
    commonShapes: {
      'en': 'Common',
      'zh-CN': '常用',
      'zh-TW': '常用',
      'ja': '図形',
    },
    loadDemo: {
      'en': 'Load demo SVG',
      'zh-CN': '加载 Demo SVG',
      'zh-TW': '載入 Demo SVG',
      'ja': 'デモ SVG を読み込む',
    },
    newLayerText: {
      'en': 'New text',
      'zh-CN': '新文本',
      'zh-TW': '新文字',
      'ja': '新しいテキスト',
    },
  },
  collection: {
    svgCollectionTitle: {
      'en': 'SVG collection',
      'zh-CN': '收藏',
      'zh-TW': 'SVG 收藏',
      'ja': 'SVG コレクション',
    },
    svgCollectionThemes: {
      'en': 'SVG themes',
      'zh-CN': 'SVG 主题',
      'zh-TW': 'SVG 主題',
      'ja': 'SVG テーマ',
    },
    svgCollectionCompanyLogos: {
      'en': 'Company logos',
      'zh-CN': '公司 Logo',
      'zh-TW': '公司 Logo',
      'ja': '企業ロゴ',
    },
    svgCollectionAiLlm: {
      'en': 'AI & LLMs',
      'zh-CN': 'AI 与大模型',
      'zh-TW': 'AI 與大模型',
      'ja': 'AI・LLM',
    },
    svgCollectionTechCompanies: {
      'en': 'Tech & Internet',
      'zh-CN': '科技与互联网',
      'zh-TW': '科技與網路',
      'ja': 'テック・ネット',
    },
    svgCollectionDevTools: {
      'en': 'Developer & Design Tools',
      'zh-CN': '开发与设计工具',
      'zh-TW': '開發與設計工具',
      'ja': '開発・デザインツール',
    },
    svgCollectionLangCloud: {
      'en': 'Languages & Cloud',
      'zh-CN': '编程语言与云技术',
      'zh-TW': '程式語言與雲端',
      'ja': '言語・クラウド',
    },
    svgCollectionBrowsersOs: {
      'en': 'Browsers & OS',
      'zh-CN': '浏览器与操作系统',
      'zh-TW': '瀏覽器與作業系統',
      'ja': 'ブラウザ・OS',
    },
    svgCollectionSocialCommunity: {
      'en': 'Social & Community',
      'zh-CN': '社交与社区',
      'zh-TW': '社交與社群',
      'ja': 'ソーシャル・コミュニティ',
    },
    svgCollectionFinanceCrypto: {
      'en': 'Finance & Crypto',
      'zh-CN': '金融与加密货币',
      'zh-TW': '金融與加密貨幣',
      'ja': '金融・暗号資産',
    },
    svgCollectionAutoTravel: {
      'en': 'Auto & Travel',
      'zh-CN': '汽车与出行',
      'zh-TW': '汽車與旅行',
      'ja': '自動車・旅行',
    },
    svgCollectionRetailEntertainment: {
      'en': 'Retail & Entertainment',
      'zh-CN': '零售与娱乐',
      'zh-TW': '零售與娛樂',
      'ja': '小売・エンタメ',
    },
    svgCollectionGoogle2026: {
      'en': 'Google 2026',
      'zh-CN': 'Google 2026',
      'zh-TW': 'Google 2026',
      'ja': 'Google 2026',
    },
    svgCollectionAnimations: {
      'en': 'Animations',
      'zh-CN': '动画合集',
      'zh-TW': '動畫合集',
      'ja': 'アニメーション',
    },
    svgCollectionLoadingCases: {
      'en': 'Loading cases',
      'zh-CN': '加载动画',
      'zh-TW': '載入動畫',
      'ja': 'ローディング',
    },
    svgCollectionCustom: {
      'en': 'My SVGs',
      'zh-CN': '我的 SVG',
      'zh-TW': '我的 SVG',
      'ja': 'マイ SVG',
    },
    svgCollectionAddCustom: {
      'en': 'Add SVG',
      'zh-CN': '添加 SVG',
      'zh-TW': '新增 SVG',
      'ja': 'SVG を追加',
    },
    svgCollectionCustomName: {
      'en': 'Name (optional)',
      'zh-CN': '名称（可选）',
      'zh-TW': '名稱（可選）',
      'ja': '名前（任意）',
    },
    svgCollectionCustomMarkup: {
      'en': 'Paste SVG markup',
      'zh-CN': '粘贴 SVG 源码',
      'zh-TW': '貼上 SVG 原始碼',
      'ja': 'SVG マークアップを貼り付け',
    },
    svgCollectionSaveCustom: {
      'en': 'Save SVG',
      'zh-CN': '保存 SVG',
      'zh-TW': '儲存 SVG',
      'ja': 'SVG を保存',
    },
    svgCollectionRemoveCustom: {
      'en': 'Remove',
      'zh-CN': '删除',
      'zh-TW': '刪除',
      'ja': '削除',
    },
    svgCollectionCustomDefaultName: {
      'en': 'Custom SVG',
      'zh-CN': '自定义 SVG',
      'zh-TW': '自訂 SVG',
      'ja': 'カスタム SVG',
    },
    svgCollectionInvalidCustom: {
      'en': 'Paste a valid SVG markup.',
      'zh-CN': '请粘贴有效的 SVG 源码。',
      'zh-TW': '請貼上有效的 SVG 原始碼。',
      'ja': '有効な SVG マークアップを貼り付けてください。',
    },
    svgCollectionItems: {
      'en': 'items',
      'zh-CN': '个项目',
      'zh-TW': '個項目',
      'ja': '個のアイテム',
    },
    svgCollectionSource: {
      'en': 'View source',
      'zh-CN': '查看来源',
      'zh-TW': '查看來源',
      'ja': 'ソースを見る',
    },
    svgCollectionAdd: {
      'en': 'Add',
      'zh-CN': '添加',
      'zh-TW': '新增',
      'ja': '追加',
    },
    svgCollectionSearchPlaceholder: {
      'en': 'Search icons',
      'zh-CN': '搜索图标',
      'zh-TW': '搜尋圖示',
      'ja': 'アイコンを検索',
    },
    svgCollectionSearchResults: {
      'en': 'Search results',
      'zh-CN': '搜索结果',
      'zh-TW': '搜尋結果',
      'ja': '検索結果',
    },
    svgCollectionNoResults: {
      'en': 'No icons found.',
      'zh-CN': '没有找到图标。',
      'zh-TW': '沒有找到圖示。',
      'ja': 'アイコンが見つかりません。',
    },
  },
  text: {
    textContent: {
      'en': 'Text content',
      'zh-CN': '文字内容',
      'zh-TW': '文字內容',
      'ja': 'テキスト内容',
    },
    editText: {
      'en': 'Edit text content',
      'zh-CN': '编辑文字内容',
      'zh-TW': '編輯文字內容',
      'ja': 'テキストを編集',
    },
    fontSize: {
      'en': 'Font size',
      'zh-CN': '字体大小',
      'zh-TW': '字體大小',
      'ja': 'フォントサイズ',
    },
    letterSpacing: {
      'en': 'Character spacing',
      'zh-CN': '字符间距',
      'zh-TW': '字元間距',
      'ja': '文字間隔',
    },
    fontFamily: {
      'en': 'Font family',
      'zh-CN': '字体家族',
      'zh-TW': '字體家族',
      'ja': 'フォントファミリー',
    },
    fontFamilyDefault: {
      'en': 'SVG default',
      'zh-CN': 'SVG 默认字体',
      'zh-TW': 'SVG 預設字體',
      'ja': 'SVG のデフォルト',
    },
    fontFamilyPlaceholder: {
      'en': 'e.g. Arial, sans-serif',
      'zh-CN': '例如 Arial, sans-serif',
      'zh-TW': '例如 Arial, sans-serif',
      'ja': '例: Arial, sans-serif',
    },
    bold: {
      'en': 'Bold',
      'zh-CN': '加粗',
      'zh-TW': '粗體',
      'ja': '太字',
    },
  },
  source: {
    preview: {
      'en': 'Preview',
      'zh-CN': '预览',
      'zh-TW': '預覽',
      'ja': 'プレビュー',
    },
    source: {
      'en': 'Source',
      'zh-CN': '源码',
      'zh-TW': '原始碼',
      'ja': 'ソース',
    },
    format: {
      'en': 'Format',
      'zh-CN': '格式化',
      'zh-TW': '格式化',
      'ja': '整形',
    },
    simplify: {
      'en': 'Simplify',
      'zh-CN': '简化',
      'zh-TW': '簡化',
      'ja': '簡略化',
    },
    copySource: {
      'en': 'Copy',
      'zh-CN': '复制',
      'zh-TW': '複製',
      'ja': 'コピー',
    },
    editSource: {
      'en': 'Edit',
      'zh-CN': '编辑',
      'zh-TW': '編輯',
      'ja': '編集',
    },
    sourceTree: {
      'en': 'SVG source tree',
      'zh-CN': 'SVG 源码树',
      'zh-TW': 'SVG 原始碼樹',
      'ja': 'SVG ソースツリー',
    },
    collapsedContent: {
      'en': 'Collapsed content',
      'zh-CN': '已折叠内容',
      'zh-TW': '已摺疊內容',
      'ja': '折りたたまれた内容',
    },
  },
  view: {
    resetView: {
      'en': 'Reset view and center',
      'zh-CN': '重置视图并居中',
      'zh-TW': '重置視圖並置中',
      'ja': 'ビューをリセットして中央に',
    },
    collapseLayers: {
      'en': 'Collapse layers',
      'zh-CN': '折叠图层面板',
      'zh-TW': '摺疊圖層面板',
      'ja': 'レイヤーパネルを折りたたむ',
    },
    expandLayers: {
      'en': 'Expand layers',
      'zh-CN': '展开图层面板',
      'zh-TW': '展開圖層面板',
      'ja': 'レイヤーパネルを展開',
    },
    collapseInspector: {
      'en': 'Collapse properties',
      'zh-CN': '折叠属性面板',
      'zh-TW': '摺疊屬性面板',
      'ja': 'プロパティパネルを折りたたむ',
    },
    expandInspector: {
      'en': 'Expand properties',
      'zh-CN': '展开属性面板',
      'zh-TW': '展開屬性面板',
      'ja': 'プロパティパネルを展開',
    },
    dropHint: {
      'en': 'Drop an SVG anywhere to begin',
      'zh-CN': '将 SVG 拖到这里开始',
      'zh-TW': '將 SVG 拖到這裡開始',
      'ja': 'SVG をここにドロップして開始',
    },
    inspector: {
      'en': 'Inspector',
      'zh-CN': '检查器',
      'zh-TW': '檢查器',
      'ja': 'インスペクター',
    },
    appearance: {
      'en': 'Appearance',
      'zh-CN': '外观',
      'zh-TW': '外觀',
      'ja': '外観',
    },
    dropOverlayTitle: {
      'en': 'Drop to import SVG',
      'zh-CN': '松开以导入 SVG',
      'zh-TW': '放開以匯入 SVG',
      'ja': 'ドロップして SVG を読み込む',
    },
  },
  inspector: {
    fill: {
      'en': 'Fill',
      'zh-CN': '填充',
      'zh-TW': '填色',
      'ja': '塗りつぶし',
    },
    stroke: {
      'en': 'Stroke',
      'zh-CN': '描边',
      'zh-TW': '描邊',
      'ja': 'ストローク',
    },
    opacity: {
      'en': 'Opacity',
      'zh-CN': '不透明度',
      'zh-TW': '不透明度',
      'ja': '不透明度',
    },
    strokeWidth: {
      'en': 'Stroke width',
      'zh-CN': '描边宽度',
      'zh-TW': '描邊寬度',
      'ja': 'ストローク幅',
    },
    cornerRadius: {
      'en': 'Corner radius',
      'zh-CN': '圆角半径',
      'zh-TW': '圓角半徑',
      'ja': '角丸半径',
    },
    polygonSides: {
      'en': 'Sides',
      'zh-CN': '边数',
      'zh-TW': '邊數',
      'ja': '辺の数',
    },
    width: {
      'en': 'Width',
      'zh-CN': '宽度',
      'zh-TW': '寬度',
      'ja': '幅',
    },
    height: {
      'en': 'Height',
      'zh-CN': '高度',
      'zh-TW': '高度',
      'ja': '高さ',
    },
    lineStartX: {
      'en': 'Start X',
      'zh-CN': '起点 X',
      'zh-TW': '起點 X',
      'ja': '始点 X',
    },
    lineStartY: {
      'en': 'Start Y',
      'zh-CN': '起点 Y',
      'zh-TW': '起點 Y',
      'ja': '始点 Y',
    },
    lineEndX: {
      'en': 'End X',
      'zh-CN': '终点 X',
      'zh-TW': '終點 X',
      'ja': '終点 X',
    },
    lineEndY: {
      'en': 'End Y',
      'zh-CN': '终点 Y',
      'zh-TW': '終點 Y',
      'ja': '終点 Y',
    },
    capNone: {
      'en': 'None',
      'zh-CN': '无',
      'zh-TW': '無',
      'ja': 'なし',
    },
    capRound: {
      'en': 'Round',
      'zh-CN': '圆形',
      'zh-TW': '圓形',
      'ja': '丸',
    },
    capSquare: {
      'en': 'Square',
      'zh-CN': '方形',
      'zh-TW': '方形',
      'ja': '四角',
    },
    capLineArrow: {
      'en': 'Line arrow',
      'zh-CN': '直线箭头',
      'zh-TW': '直線箭頭',
      'ja': '線矢印',
    },
    capTriangleArrow: {
      'en': 'Triangle arrow',
      'zh-CN': '三角箭头',
      'zh-TW': '三角箭頭',
      'ja': '三角矢印',
    },
    capReversedTriangle: {
      'en': 'Reversed triangle',
      'zh-CN': '反转三角',
      'zh-TW': '反轉三角',
      'ja': '反転三角',
    },
    capCircleArrow: {
      'en': 'Circle arrow',
      'zh-CN': '圆形箭头',
      'zh-TW': '圓形箭頭',
      'ja': '円矢印',
    },
    capDiamondArrow: {
      'en': 'Diamond arrow',
      'zh-CN': '菱形箭头',
      'zh-TW': '菱形箭頭',
      'ja': 'ひし形矢印',
    },
    lineStartPoint: {
      'en': 'Start point',
      'zh-CN': '开始点',
      'zh-TW': '開始點',
      'ja': '始点',
    },
    lineEndPoint: {
      'en': 'End point',
      'zh-CN': '结束点',
      'zh-TW': '結束點',
      'ja': '終点',
    },
    lineWeight: {
      'en': 'Weight',
      'zh-CN': '线宽',
      'zh-TW': '線寬',
      'ja': '線の太さ',
    },
    aspectRatio: {
      'en': 'Aspect ratio',
      'zh-CN': '图层比例',
      'zh-TW': '圖層比例',
      'ja': 'アスペクト比',
    },
    aspectRatioOriginal: {
      'en': 'Original',
      'zh-CN': '原始',
      'zh-TW': '原始',
      'ja': '元の比率',
    },
    gradient: {
      'en': 'Gradient',
      'zh-CN': '渐变色',
      'zh-TW': '漸層色',
      'ja': 'グラデーション',
    },
    gradientStart: {
      'en': 'Start color',
      'zh-CN': '起始颜色',
      'zh-TW': '起始顏色',
      'ja': '開始色',
    },
    gradientEnd: {
      'en': 'End color',
      'zh-CN': '结束颜色',
      'zh-TW': '結束顏色',
      'ja': '終了色',
    },
    gradientAngle: {
      'en': 'Angle',
      'zh-CN': '角度',
      'zh-TW': '角度',
      'ja': '角度',
    },
    layerTypes: {
      'en': 'Layer types',
      'zh-CN': '图层类型',
      'zh-TW': '圖層類型',
      'ja': 'レイヤーの種類',
    },
    colorTokens: {
      'en': 'Color tokens',
      'zh-CN': '颜色 Token',
      'zh-TW': '顏色 Token',
      'ja': 'カラートークン',
    },
    colorTokenUsage: {
      'en': 'uses',
      'zh-CN': '次使用',
      'zh-TW': '次使用',
      'ja': '回使用',
    },
    colorTokensEmpty: {
      'en': 'No color tokens found in this SVG.',
      'zh-CN': '当前 SVG 中没有颜色 Token。',
      'zh-TW': '目前 SVG 中沒有顏色 Token。',
      'ja': 'この SVG にはカラートークンがありません。',
    },
    copyColor: {
      'en': 'Copy color',
      'zh-CN': '复制颜色',
      'zh-TW': '複製顏色',
      'ja': '色をコピー',
    },
    editColor: {
      'en': 'Edit color',
      'zh-CN': '编辑颜色',
      'zh-TW': '編輯顏色',
      'ja': '色を編集',
    },
    copied: {
      'en': 'Copied',
      'zh-CN': '已复制',
      'zh-TW': '已複製',
      'ja': 'コピーしました',
    },
    elementDetails: {
      'en': 'Element details',
      'zh-CN': '元素详情',
      'zh-TW': '元素詳情',
      'ja': '要素の詳細',
    },
    layer: {
      'en': 'Layer',
      'zh-CN': 'Layer',
      'zh-TW': 'Layer',
      'ja': 'レイヤー',
    },
    visibility: {
      'en': 'Visibility',
      'zh-CN': '可见性',
      'zh-TW': '可見性',
      'ja': '表示状態',
    },
  },
  selection: {
    visible: {
      'en': 'Visible',
      'zh-CN': '可见',
      'zh-TW': '可見',
      'ja': '表示',
    },
    hidden: {
      'en': 'Hidden',
      'zh-CN': '已隐藏',
      'zh-TW': '已隱藏',
      'ja': '非表示',
    },
    livePreview: {
      'en': 'Live preview',
      'zh-CN': '实时预览',
      'zh-TW': '即時預覽',
      'ja': 'ライブプレビュー',
    },
    statusReady: {
      'en': 'elements • SVG ready',
      'zh-CN': '个元素 · SVG 就绪',
      'zh-TW': '個元素 · SVG 就緒',
      'ja': '個の要素 • SVG 準備完了',
    },
    changesInstant: {
      'en': 'Changes apply instantly',
      'zh-CN': '更改会即时生效',
      'zh-TW': '更改會即時生效',
      'ja': '変更は即時反映されます',
    },
    selected: {
      'en': 'Selected',
      'zh-CN': '已选中',
      'zh-TW': '已選取',
      'ja': '選択中',
    },
    resizeLineStart: {
      'en': 'Adjust line start',
      'zh-CN': '调整线条起点',
      'zh-TW': '調整線條起點',
      'ja': '線の始点を調整',
    },
    resizeLineEnd: {
      'en': 'Adjust line end',
      'zh-CN': '调整线条终点',
      'zh-TW': '調整線條終點',
      'ja': '線の終点を調整',
    },
    playAnimation: {
      'en': 'Play animation',
      'zh-CN': '播放动画',
      'zh-TW': '播放動畫',
      'ja': 'アニメーションを再生',
    },
    pauseAnimation: {
      'en': 'Pause animation',
      'zh-CN': '暂停动画',
      'zh-TW': '暫停動畫',
      'ja': 'アニメーションを一時停止',
    },
    elementSuffix: {
      'en': 'element',
      'zh-CN': '元素',
      'zh-TW': '元素',
      'ja': '要素',
    },
    show: {
      'en': 'Show',
      'zh-CN': '显示',
      'zh-TW': '顯示',
      'ja': '表示',
    },
    hide: {
      'en': 'Hide',
      'zh-CN': '隐藏',
      'zh-TW': '隱藏',
      'ja': '非表示',
    },
    noSelection: {
      'en': 'Select a layer to edit its properties.',
      'zh-CN': '选择一个图层来编辑它的属性。',
      'zh-TW': '選取一個圖層來編輯它的屬性。',
      'ja': 'レイヤーを選択してプロパティを編集します。',
    },
    invalidSvg: {
      'en': 'This file does not contain a valid SVG.',
      'zh-CN': '该文件不包含有效的 SVG。',
      'zh-TW': '此檔案不包含有效的 SVG。',
      'ja': 'このファイルには有効な SVG が含まれていません。',
    },
    emptySource: {
      'en': 'The document is empty — add a layer, paste SVG source, or load the demo.',
      'zh-CN': '文档为空：可添加图层、粘贴 SVG 源码或载入示例。',
      'zh-TW': '文件為空：可添加圖層、貼上 SVG 原始碼或載入範例。',
      'ja': 'ドキュメントが空です。レイヤーを追加、SVG ソースを貼り付け、またはデモを読み込めます。',
    },
  },
  actions: {
    svgSafetySanitized: {
      'en': 'Unsafe SVG content was removed:',
      'zh-CN': '已移除不安全的 SVG 内容：',
      'zh-TW': '已移除不安全的 SVG 內容：',
      'ja': '安全でない SVG コンテンツを削除しました:',
    },
    svgSafetyBlockedElement: {
      'en': 'blocked element', 'zh-CN': '受限元素', 'zh-TW': '受限元素', 'ja': '制限された要素',
    },
    svgSafetyEventHandler: {
      'en': 'event handler', 'zh-CN': '事件处理器', 'zh-TW': '事件處理器', 'ja': 'イベントハンドラー',
    },
    svgSafetyExternalUrl: {
      'en': 'external URL', 'zh-CN': '外部 URL', 'zh-TW': '外部 URL', 'ja': '外部 URL',
    },
    svgSafetyStyleElement: {
      'en': 'style element', 'zh-CN': '样式元素', 'zh-TW': '樣式元素', 'ja': 'style 要素',
    },
    svgSafetyUnsafeStyle: {
      'en': 'unsafe style', 'zh-CN': '不安全样式', 'zh-TW': '不安全樣式', 'ja': '安全でない style',
    },
    svgSafetyProcessingInstruction: {
      'en': 'processing instruction', 'zh-CN': '处理指令', 'zh-TW': '處理指令', 'ja': '処理命令',
    },
    svgSafetyLink: {
      'en': 'link', 'zh-CN': '链接', 'zh-TW': '連結', 'ja': 'リンク',
    },
    undo: {
      'en': 'Undo',
      'zh-CN': '撤销',
      'zh-TW': '復原',
      'ja': '取り消し',
    },
    redo: {
      'en': 'Redo',
      'zh-CN': '重做',
      'zh-TW': '重做',
      'ja': 'やり直し',
    },
    close: {
      'en': 'Close',
      'zh-CN': '关闭',
      'zh-TW': '關閉',
      'ja': '閉じる',
    },
    cancel: {
      'en': 'Cancel',
      'zh-CN': '取消',
      'zh-TW': '取消',
      'ja': 'キャンセル',
    },
  },
  align: {
    alignLeft: {
      'en': 'Align left',
      'zh-CN': '左对齐',
      'zh-TW': '靠左對齊',
      'ja': '左揃え',
    },
    alignCenterX: {
      'en': 'Align horizontal centers',
      'zh-CN': '水平居中',
      'zh-TW': '水平置中',
      'ja': '水平方向中央揃え',
    },
    alignRight: {
      'en': 'Align right',
      'zh-CN': '右对齐',
      'zh-TW': '靠右對齊',
      'ja': '右揃え',
    },
    alignTop: {
      'en': 'Align top',
      'zh-CN': '顶对齐',
      'zh-TW': '靠上對齊',
      'ja': '上揃え',
    },
    alignCenterY: {
      'en': 'Align vertical centers',
      'zh-CN': '垂直居中',
      'zh-TW': '垂直置中',
      'ja': '垂直方向中央揃え',
    },
    alignBottom: {
      'en': 'Align bottom',
      'zh-CN': '底对齐',
      'zh-TW': '靠下對齊',
      'ja': '下揃え',
    },
    distributeX: {
      'en': 'Distribute horizontally',
      'zh-CN': '水平等距分布',
      'zh-TW': '水平等距分佈',
      'ja': '水平方向に等間隔配置',
    },
    distributeY: {
      'en': 'Distribute vertically',
      'zh-CN': '垂直等距分布',
      'zh-TW': '垂直等距分佈',
      'ja': '垂直方向に等間隔配置',
    },
  },
  transform: {
    collapseGroup: {
      'en': 'Collapse group',
      'zh-CN': '折叠分组',
      'zh-TW': '摺疊群組',
      'ja': 'グループを折りたたむ',
    },
    expandGroup: {
      'en': 'Expand group',
      'zh-CN': '展开分组',
      'zh-TW': '展開群組',
      'ja': 'グループを展開',
    },
    resizeTopLeft: {
      'en': 'Resize from top left',
      'zh-CN': '从左上角调整大小',
      'zh-TW': '從左上角調整大小',
      'ja': '左上からリサイズ',
    },
    resizeTopRight: {
      'en': 'Resize from top right',
      'zh-CN': '从右上角调整大小',
      'zh-TW': '從右上角調整大小',
      'ja': '右上からリサイズ',
    },
    resizeBottomLeft: {
      'en': 'Resize from bottom left',
      'zh-CN': '从左下角调整大小',
      'zh-TW': '從左下角調整大小',
      'ja': '左下からリサイズ',
    },
    resizeBottomRight: {
      'en': 'Resize from bottom right',
      'zh-CN': '从右下角调整大小',
      'zh-TW': '從右下角調整大小',
      'ja': '右下からリサイズ',
    },
    menuGroup: {
      'en': 'Group',
      'zh-CN': '创建分组',
      'zh-TW': '建立群組',
      'ja': 'グループ化',
    },
    toastGrouped: {
      'en': 'Layers grouped',
      'zh-CN': '已创建分组',
      'zh-TW': '已建立群組',
      'ja': 'グループを作成しました',
    },
    shortcutGroup: {
      'en': 'Group selected layers',
      'zh-CN': '创建分组',
      'zh-TW': '建立群組',
      'ja': '選択したレイヤーをグループ化',
    },
  },
  zoom: {
    canvasSelect: { en: 'Select', 'zh-CN': '选择', 'zh-TW': '選取', ja: '選択' },
    canvasPan: { en: 'Pan', 'zh-CN': '平移', 'zh-TW': '平移', ja: '手のひら' },
    zoomIn: {
      'en': 'Zoom in',
      'zh-CN': '放大',
      'zh-TW': '放大',
      'ja': '拡大',
    },
    zoomOut: {
      'en': 'Zoom out',
      'zh-CN': '缩小',
      'zh-TW': '縮小',
      'ja': '縮小',
    },
    zoomFit: {
      'en': 'Fit to screen',
      'zh-CN': '适应屏幕',
      'zh-TW': '適應螢幕',
      'ja': '画面に合わせる',
    },
  },
  exportDialog: {
    exportDialogTitle: {
      'en': 'Export',
      'zh-CN': '导出',
      'zh-TW': '匯出',
      'ja': 'エクスポート',
    },
    exportFormat: {
      'en': 'Format',
      'zh-CN': '格式',
      'zh-TW': '格式',
      'ja': 'フォーマット',
    },
    exportScope: {
      'en': 'Export scope',
      'zh-CN': '导出范围',
      'zh-TW': '匯出範圍',
      'ja': 'エクスポート範囲',
    },
    exportAllLayers: {
      'en': 'Export all layers',
      'zh-CN': '导出整个图层',
      'zh-TW': '匯出整個圖層',
      'ja': 'すべてのレイヤー',
    },
    exportSelectedLayers: {
      'en': 'Export selected layers',
      'zh-CN': '导出选择图层',
      'zh-TW': '匯出選取圖層',
      'ja': '選択したレイヤー',
    },
    exportScale: {
      'en': 'Scale',
      'zh-CN': '倍率',
      'zh-TW': '倍率',
      'ja': '倍率',
    },
    exportOptimize: {
      'en': 'Optimize & minify SVG',
      'zh-CN': '优化并压缩 SVG',
      'zh-TW': '最佳化並壓縮 SVG',
      'ja': 'SVG を最適化・圧縮',
    },
    exportPreview: {
      'en': 'Preview',
      'zh-CN': '预览',
      'zh-TW': '預覽',
      'ja': 'プレビュー',
    },
    exportEstimatedSize: {
      'en': 'Est. size',
      'zh-CN': '预计大小',
      'zh-TW': '預計大小',
      'ja': '推定サイズ',
    },
    exportLayerCount: {
      'en': 'Layers to export',
      'zh-CN': '待导出图层',
      'zh-TW': '待匯出圖層',
      'ja': 'エクスポートするレイヤー',
    },
    expandExportPreview: {
      'en': 'Expand export preview',
      'zh-CN': '放大导出预览',
      'zh-TW': '放大匯出預覽',
      'ja': 'エクスポートプレビューを拡大',
    },
    exportFailed: {
      'en': 'Export failed',
      'zh-CN': '导出失败',
      'zh-TW': '匯出失敗',
      'ja': 'エクスポートに失敗しました',
    },
  },
  shortcuts: {
    shortcutsTitle: {
      'en': 'Keyboard shortcuts',
      'zh-CN': '键盘快捷键',
      'zh-TW': '鍵盤快捷鍵',
      'ja': 'キーボードショートカット',
    },
    shortcutsGeneral: {
      'en': 'General',
      'zh-CN': '通用',
      'zh-TW': '一般',
      'ja': '一般',
    },
    shortcutsLayers: {
      'en': 'Layers',
      'zh-CN': '图层',
      'zh-TW': '圖層',
      'ja': 'レイヤー',
    },
    shortcutsCanvas: {
      'en': 'Canvas',
      'zh-CN': '画布',
      'zh-TW': '畫布',
      'ja': 'キャンバス',
    },
    shortcutsHint: {
      'en': 'Press ? to toggle this panel',
      'zh-CN': '按 ? 可打开或关闭此面板',
      'zh-TW': '按 ? 可開啟或關閉此面板',
      'ja': '? キーでこのパネルを開閉',
    },
    shortcutUndo: {
      'en': 'Undo',
      'zh-CN': '撤销',
      'zh-TW': '復原',
      'ja': '取り消し',
    },
    shortcutRedo: {
      'en': 'Redo',
      'zh-CN': '重做',
      'zh-TW': '重做',
      'ja': 'やり直し',
    },
    shortcutExport: {
      'en': 'Export SVG',
      'zh-CN': '导出 SVG',
      'zh-TW': '匯出 SVG',
      'ja': 'SVG をエクスポート',
    },
    shortcutSelectAll: {
      'en': 'Select all layers',
      'zh-CN': '全选图层',
      'zh-TW': '全選圖層',
      'ja': 'すべてのレイヤーを選択',
    },
    shortcutCopy: {
      'en': 'Copy layer',
      'zh-CN': '复制图层',
      'zh-TW': '複製圖層',
      'ja': 'レイヤーをコピー',
    },
    shortcutPaste: {
      'en': 'Paste layer',
      'zh-CN': '粘贴图层',
      'zh-TW': '貼上圖層',
      'ja': 'レイヤーを貼り付け',
    },
    shortcutPasteSvg: {
      'en': 'Paste SVG or layer',
      'zh-CN': '粘贴 SVG 或图层',
      'zh-TW': '貼上 SVG 或圖層',
      'ja': 'SVG またはレイヤーを貼り付け',
    },
    shortcutDelete: {
      'en': 'Delete layer',
      'zh-CN': '删除图层',
      'zh-TW': '刪除圖層',
      'ja': 'レイヤーを削除',
    },
    shortcutPanels: {
      'en': 'Cycle panels',
      'zh-CN': '循环切换面板',
      'zh-TW': '循環切換面板',
      'ja': 'パネルを切り替え',
    },
    shortcutHelp: {
      'en': 'Toggle shortcuts panel',
      'zh-CN': '打开/关闭快捷键面板',
      'zh-TW': '開啟/關閉快捷鍵面板',
      'ja': 'ショートカットパネルの開閉',
    },
    shortcutRangeSelect: {
      'en': 'Select layer range',
      'zh-CN': '选中图层范围',
      'zh-TW': '選取圖層範圍',
      'ja': 'レイヤーを範囲選択',
    },
    shortcutToggleSelect: {
      'en': 'Add or remove layer from selection',
      'zh-CN': '添加或取消单个图层',
      'zh-TW': '加入或取消單個圖層',
      'ja': 'レイヤーの選択を切り替え',
    },
    shortcutPan: {
      'en': 'Pan canvas',
      'zh-CN': '平移画布',
      'zh-TW': '平移畫布',
      'ja': 'キャンバスをパン',
    },
    shortcutSelectTool: {
      'en': 'Switch to Select tool',
      'zh-CN': '切换至选择工具',
      'zh-TW': '切換至選取工具',
      'ja': '選択ツールに切り替え',
    },
    shortcutPanTool: {
      'en': 'Switch to Pan tool',
      'zh-CN': '切换至平移工具',
      'zh-TW': '切換至平移工具',
      'ja': '手のひらツールに切り替え',
    },
    shortcutTemporaryPan: {
      'en': 'Temporarily pan canvas',
      'zh-CN': '临时平移画布',
      'zh-TW': '暫時平移畫布',
      'ja': '一時的にキャンバスをパン',
    },
    shortcutZoom: {
      'en': 'Zoom in / out',
      'zh-CN': '放大 / 缩小',
      'zh-TW': '放大 / 縮小',
      'ja': '拡大 / 縮小',
    },
    shortcutEditText: {
      'en': 'Edit text content',
      'zh-CN': '编辑文字内容',
      'zh-TW': '編輯文字內容',
      'ja': 'テキストを編集',
    },
    shortcutResizeProportional: {
      'en': 'Resize proportionally',
      'zh-CN': '等比例调整大小',
      'zh-TW': '等比例調整大小',
      'ja': '比率を維持してリサイズ',
    },
    shortcutMove: {
      'en': 'Move selected layers',
      'zh-CN': '移动选中的图层',
      'zh-TW': '移動選取的圖層',
      'ja': '選択したレイヤーを移動',
    },
    shortcutDeselect: {
      'en': 'Clear selection',
      'zh-CN': '取消选择',
      'zh-TW': '取消選取',
      'ja': '選択を解除',
    },
    shortcutZoomIn: {
      'en': 'Zoom in',
      'zh-CN': '放大',
      'zh-TW': '放大',
      'ja': '拡大',
    },
    shortcutZoomOut: {
      'en': 'Zoom out',
      'zh-CN': '缩小',
      'zh-TW': '縮小',
      'ja': '縮小',
    },
    shortcutZoomFit: {
      'en': 'Fit to screen',
      'zh-CN': '适应屏幕',
      'zh-TW': '適應螢幕',
      'ja': '画面に合わせる',
    },
    shortcutKeyPanDrag: { en: 'Pan tool + Drag', 'zh-CN': '平移工具 + 拖拽', 'zh-TW': '平移工具 + 拖曳', ja: '手のひらツール + ドラッグ' },
    shortcutKeySpaceHold: { en: 'Hold Space', 'zh-CN': '按住空格', 'zh-TW': '按住空白鍵', ja: 'Space を長押し' },
    shortcutKeyDrag: {
      'en': 'Drag',
      'zh-CN': '拖拽',
      'zh-TW': '拖曳',
      'ja': 'ドラッグ',
    },
    shortcutKeyScroll: {
      'en': '⌘ + Scroll',
      'zh-CN': '⌘ + 滚轮',
      'zh-TW': '⌘ + 滾輪',
      'ja': '⌘ + スクロール',
    },
    shortcutKeyDoubleClick: {
      'en': 'Double-click',
      'zh-CN': '双击',
      'zh-TW': '雙擊',
      'ja': 'ダブルクリック',
    },
  },
  toast: {
    toastExported: {
      'en': 'SVG exported',
      'zh-CN': 'SVG 已导出',
      'zh-TW': 'SVG 已匯出',
      'ja': 'SVG をエクスポートしました',
    },
    toastImported: {
      'en': 'Imported',
      'zh-CN': '已导入',
      'zh-TW': '已匯入',
      'ja': '読み込みました',
    },
    toastCopy: {
      'en': 'Layer copied',
      'zh-CN': '已复制图层',
      'zh-TW': '已複製圖層',
      'ja': 'レイヤーをコピーしました',
    },
    toastPaste: {
      'en': 'Layer pasted',
      'zh-CN': '已粘贴图层',
      'zh-TW': '已貼上圖層',
      'ja': 'レイヤーを貼り付けました',
    },
    toastDelete: {
      'en': 'Layer deleted — press ⌘Z to undo',
      'zh-CN': '已删除图层 — 按 ⌘Z 撤销',
      'zh-TW': '已刪除圖層 — 按 ⌘Z 復原',
      'ja': 'レイヤーを削除しました — ⌘Z で取り消し',
    },
    toastFormatted: {
      'en': 'Source formatted',
      'zh-CN': '源码已格式化',
      'zh-TW': '原始碼已格式化',
      'ja': 'ソースを整形しました',
    },
    toastSimplified: {
      'en': 'Consecutive translations simplified',
      'zh-CN': '已简化连续平移',
      'zh-TW': '已簡化連續平移',
      'ja': '連続した移動を簡略化しました',
    },
    toastSourceCopied: {
      'en': 'Source copied',
      'zh-CN': '源码已复制',
      'zh-TW': '原始碼已複製',
      'ja': 'ソースをコピーしました',
    },
    toastSourceCopyFailed: {
      'en': 'Could not copy source',
      'zh-CN': '无法复制源码',
      'zh-TW': '無法複製原始碼',
      'ja': 'ソースをコピーできませんでした',
    },
    toastInvalidFile: {
      'en': 'Please drop or choose an SVG file.',
      'zh-CN': '请拖入或选择一个 SVG 文件。',
      'zh-TW': '請拖入或選擇一個 SVG 檔案。',
      'ja': 'SVG ファイルをドロップまたは選択してください。',
    },
    toastInvalidImageFile: {
      'en': 'Please choose a supported image file.',
      'zh-CN': '请选择受支持的图片文件。',
      'zh-TW': '請選擇支援的圖片檔案。',
      'ja': '対応している画像ファイルを選択してください。',
    },
    toastCollectionImportFailed: {
      'en': 'Could not import this SVG collection item.',
      'zh-CN': '无法导入此 SVG 收藏图标。',
      'zh-TW': '無法匯入此 SVG 收藏圖示。',
      'ja': 'この SVG コレクション項目を読み込めませんでした。',
    },
    storageFull: {
      'en': 'Local storage is full — changes may not be saved',
      'zh-CN': '本地存储已满，更改可能无法保存',
      'zh-TW': '本機儲存空間已滿，更改可能無法儲存',
      'ja': 'ローカルストレージがいっぱいです — 変更が保存されない場合があります',
    },
  },
  rename: {
    menuRename: {
      'en': 'Rename',
      'zh-CN': '重命名',
      'zh-TW': '重新命名',
      'ja': '名前を変更',
    },
    renamePlaceholder: {
      'en': 'Layer name',
      'zh-CN': '图层名称',
      'zh-TW': '圖層名稱',
      'ja': 'レイヤー名',
    },
    svgName: {
      'en': 'SVG name',
      'zh-CN': 'SVG 名称',
      'zh-TW': 'SVG 名稱',
      'ja': 'SVG 名',
    },
    editSvgName: {
      'en': 'Rename SVG',
      'zh-CN': '编辑 SVG 名称',
      'zh-TW': '編輯 SVG 名稱',
      'ja': 'SVG 名を編集',
    },
    confirmSvgUrlName: {
      'en': 'Use “{name}” from the SVG URL in your clipboard?',
      'zh-CN': '检测到剪贴板中的 SVG 链接，使用“{name}”作为名称吗？',
      'zh-TW': '偵測到剪貼簿中的 SVG 連結，要使用「{name}」作為名稱嗎？',
      'ja': 'クリップボード内の SVG URL から「{name}」を名前に使いますか？',
    },
    useSvgUrlName: {
      'en': 'Use name',
      'zh-CN': '使用名称',
      'zh-TW': '使用名稱',
      'ja': '名前を使用',
    },
    recentSvgs: {
      'en': 'Recent SVGs',
      'zh-CN': '历史 SVG 列表',
      'zh-TW': '歷史 SVG 列表',
      'ja': 'SVG 履歴',
    },
    recentSvgsEmpty: {
      'en': 'No edited SVGs yet.',
      'zh-CN': '暂时没有编辑过的 SVG。',
      'zh-TW': '暫時沒有編輯過的 SVG。',
      'ja': '編集した SVG はまだありません。',
    },
    recentSvgPreview: {
      'en': 'SVG preview',
      'zh-CN': 'SVG 预览',
      'zh-TW': 'SVG 預覽',
      'ja': 'SVG プレビュー',
    },
    expandRecentSvgPreview: {
      'en': 'Expand SVG preview',
      'zh-CN': '放大 SVG 预览',
      'zh-TW': '放大 SVG 預覽',
      'ja': 'SVG プレビューを拡大',
    },
    removeRecentSvg: {
      'en': 'Remove from recent SVGs',
      'zh-CN': '删除历史 SVG',
      'zh-TW': '刪除歷史 SVG',
      'ja': 'SVG 履歴から削除',
    },
  },
}

function buildCopy(sections) {
  const byLang = { en: {}, "zh-CN": {}, "zh-TW": {}, ja: {} }
  for (const section of Object.values(sections)) {
    for (const [key, texts] of Object.entries(section)) {
      if (import.meta.env?.DEV) {
        const missing = LANGS.filter((l) => texts[l] == null)
        if (missing.length) console.warn(`[copy] "${key}" 缺少语言: ${missing.join(", ")}`)
      }
      for (const lang of LANGS) {
        if (texts[lang] != null) byLang[lang][key] = texts[lang]
      }
    }
  }
  return byLang
}

export const COPY = buildCopy(SECTIONS)

const TAG_ENTRIES = {
    rect: {
      'zh-CN': '矩形',
      'zh-TW': '矩形',
      'ja': '矩形',
    },
    circle: {
      'zh-CN': '圆形',
      'zh-TW': '圓形',
      'ja': '円',
    },
    ellipse: {
      'zh-CN': '椭圆',
      'zh-TW': '橢圓',
      'ja': '楕円',
    },
    line: {
      'zh-CN': '直线',
      'zh-TW': '直線',
      'ja': '直線',
    },
    arrow: {
      'zh-CN': '箭头',
      'zh-TW': '箭頭',
      'ja': '矢印',
    },
    polyline: {
      'zh-CN': '折线',
      'zh-TW': '折線',
      'ja': '折れ線',
    },
    polygon: {
      'zh-CN': '多边形',
      'zh-TW': '多邊形',
      'ja': '多角形',
    },
    heart: {
      'zh-CN': '爱心',
      'zh-TW': '愛心',
      'ja': 'ハート',
    },
    star: {
      'zh-CN': '五角星',
      'zh-TW': '五角星',
      'ja': '星',
    },
    path: {
      'zh-CN': '路径',
      'zh-TW': '路徑',
      'ja': 'パス',
    },
    text: {
      'zh-CN': '文字',
      'zh-TW': '文字',
      'ja': 'テキスト',
    },
    g: {
      'zh-CN': '分组',
      'zh-TW': '群組',
      'ja': 'グループ',
    },
    image: {
      'zh-CN': '图片',
      'zh-TW': '圖片',
      'ja': '画像',
    },
}

const LAYER_ENTRIES = {
    Background: {
      'zh-CN': '背景',
      'zh-TW': '背景',
      'ja': '背景',
    },
    'Logo mark': {
      'zh-CN': '标志图形',
      'zh-TW': '標誌圖形',
      'ja': 'ロゴマーク',
    },
    Wordmark: {
      'zh-CN': '文字标志',
      'zh-TW': '文字標誌',
      'ja': 'ワードマーク',
    },
    Heart: {
      'zh-CN': '爱心',
      'zh-TW': '愛心',
      'ja': 'ハート',
    },
    Star: {
      'zh-CN': '五角星',
      'zh-TW': '五角星',
      'ja': '星',
    },
    Arrow: {
      'zh-CN': '箭头',
      'zh-TW': '箭頭',
      'ja': '矢印',
    },
}

function buildByLanguage(entries) {
  const byLang = {}
  for (const [key, texts] of Object.entries(entries)) {
    for (const [lang, text] of Object.entries(texts)) {
      ;(byLang[lang] ??= {})[key] = text
    }
  }
  return byLang
}

export const TAG_NAMES = buildByLanguage(TAG_ENTRIES)
export const LAYER_NAMES = buildByLanguage(LAYER_ENTRIES)

export const ADD_LAYER_TAGS = ["rect","circle","ellipse","line","arrow","polygon","heart","star","text"]

export function getLayerDisplayName(item, language) {
  const layerNames = LAYER_NAMES[language]
  if (!layerNames) return item.name
  if (layerNames[item.name]) return layerNames[item.name]
  const match = item.name.match(/^([a-z]+)(\s+\d+)?$/i)
  if (!match) return item.name
  return `${TAG_NAMES[language]?.[match[1].toLowerCase()] || match[1]}${match[2] || ""}`
}

export function getTagDisplayName(tag, language) {
  return TAG_NAMES[language]?.[tag] || tag
}
