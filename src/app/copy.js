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
      'en': 'Vecsy — SVG editor',
      'zh-CN': 'Vecsy — SVG 编辑器',
      'zh-TW': 'Vecsy — SVG 編輯器',
      'ja': 'Vecsy — SVG エディター',
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
      if (import.meta.env.DEV) {
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
