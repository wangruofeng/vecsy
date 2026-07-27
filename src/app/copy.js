export const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文', short: '简' },
  { code: 'zh-TW', label: '繁體中文', short: '繁' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
]

export const COPY = {
  en: {
    languageSwitch: 'Language', githubRepository: 'View source on GitHub', saved: 'All changes saved', unsaved: 'Changes not exported', open: 'Import SVG', export: 'Export SVG',
    layers: 'Layers', addLayer: 'Add layer', addElement: 'Add element', fromImage: 'Add from image', fromSvgCollection: 'Add from SVG collection', commonShapes: 'Common', svgCollectionTitle: 'SVG collection', svgCollectionThemes: 'SVG themes', svgCollectionCompanyLogos: 'Company logos', svgCollectionAnimationExamples: 'Animation examples', svgCollectionAnimationPack: 'Animation pack', svgCollectionLoadingCases: 'Loading cases', svgCollectionSvgSpinners: 'SVG Spinners', svgCollectionUniqueAnimations: 'Unique animations', svgCollectionItems: 'items', svgCollectionSource: 'View source', svgCollectionAdd: 'Add', loadDemo: 'Load demo SVG', textContent: 'Text content', editText: 'Edit text content', fontSize: 'Font size', letterSpacing: 'Character spacing', fontFamily: 'Font family', fontFamilyDefault: 'SVG default', fontFamilyPlaceholder: 'e.g. Arial, sans-serif', bold: 'Bold',
    preview: 'Preview', source: 'Source', format: 'Format', simplify: 'Simplify', copySource: 'Copy', editSource: 'Edit', sourceTree: 'SVG source tree', collapsedContent: 'Collapsed content', resetView: 'Reset view and center', collapseLayers: 'Collapse layers', expandLayers: 'Expand layers', collapseInspector: 'Collapse properties', expandInspector: 'Expand properties', dropHint: 'Drop an SVG anywhere to begin', inspector: 'Inspector', appearance: 'Appearance',
    fill: 'Fill', stroke: 'Stroke', opacity: 'Opacity', strokeWidth: 'Stroke width', cornerRadius: 'Corner radius', polygonSides: 'Sides', width: 'Width', height: 'Height', lineStartX: 'Start X', lineStartY: 'Start Y', lineEndX: 'End X', lineEndY: 'End Y', aspectRatio: 'Aspect ratio', aspectRatioOriginal: 'Original', gradient: 'Gradient', gradientStart: 'Start color', gradientEnd: 'End color', gradientAngle: 'Angle', colorTokens: 'Color tokens', colorTokenUsage: 'uses', colorTokensEmpty: 'No color tokens found in this SVG.', copyColor: 'Copy color', editColor: 'Edit color', copied: 'Copied', elementDetails: 'Element details', layer: 'Layer', visibility: 'Visibility',
    visible: 'Visible', hidden: 'Hidden', livePreview: 'Live preview', statusReady: 'elements • SVG ready', changesInstant: 'Changes apply instantly', exportShort: 'Export', selected: 'Selected', resizeLineStart: 'Adjust line start', resizeLineEnd: 'Adjust line end', playAnimation: 'Play animation', pauseAnimation: 'Pause animation',
    elementSuffix: 'element', show: 'Show', hide: 'Hide', noSelection: 'Select a layer to edit its properties.', invalidSvg: 'This file does not contain a valid SVG.',
    undo: 'Undo', redo: 'Redo', close: 'Close',
    toastExported: 'SVG exported', toastImported: 'Imported', toastCopy: 'Layer copied', toastPaste: 'Layer pasted', toastDelete: 'Layer deleted — press ⌘Z to undo', toastFormatted: 'Source formatted', toastSimplified: 'Consecutive translations simplified', toastSourceCopied: 'Source copied', toastSourceCopyFailed: 'Could not copy source', toastInvalidFile: 'Please drop or choose an SVG file.', toastInvalidImageFile: 'Please choose a supported image file.', toastCollectionImportFailed: 'Could not import this SVG collection item.',
    dropOverlayTitle: 'Drop to import SVG',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomFit: 'Fit to screen',
    shortcutsTitle: 'Keyboard shortcuts', shortcutsGeneral: 'General', shortcutsLayers: 'Layers', shortcutsCanvas: 'Canvas', shortcutsHint: 'Press ? to toggle this panel',
    shortcutUndo: 'Undo', shortcutRedo: 'Redo', shortcutExport: 'Export SVG', shortcutSelectAll: 'Select all layers', shortcutCopy: 'Copy layer', shortcutPaste: 'Paste layer', shortcutDelete: 'Delete layer', shortcutPanels: 'Cycle panels', shortcutHelp: 'Toggle shortcuts panel', shortcutRangeSelect: 'Select layer range', shortcutToggleSelect: 'Add or remove layer from selection', shortcutPan: 'Pan canvas', shortcutZoom: 'Zoom in / out', shortcutEditText: 'Edit text content', shortcutResizeProportional: 'Resize proportionally', shortcutMove: 'Move selected layers (Shift: 10px)', shortcutDeselect: 'Clear selection', shortcutZoomIn: 'Zoom in', shortcutZoomOut: 'Zoom out', shortcutZoomFit: 'Fit to screen',
    shortcutKeyDrag: 'Drag', shortcutKeyScroll: '⌘ + Scroll', shortcutKeyDoubleClick: 'Double-click',
    exportDialogTitle: 'Export', exportFormat: 'Format', exportScope: 'Export scope', exportAllLayers: 'Export all layers', exportSelectedLayers: 'Export selected layers', exportScale: 'Scale', exportOptimize: 'Optimize & minify SVG', exportPreview: 'Preview', exportEstimatedSize: 'Est. size', exportLayerCount: 'Layers to export', expandExportPreview: 'Expand export preview', exportFailed: 'Export failed',
    alignLeft: 'Align left', alignCenterX: 'Align horizontal centers', alignRight: 'Align right', alignTop: 'Align top', alignCenterY: 'Align vertical centers', alignBottom: 'Align bottom', distributeX: 'Distribute horizontally', distributeY: 'Distribute vertically',
    collapseGroup: 'Collapse group', expandGroup: 'Expand group', resizeTopLeft: 'Resize from top left', resizeBottomRight: 'Resize from bottom right', newLayerText: 'New text', documentTitle: 'Vector Forge — SVG editor',
    menuRename: 'Rename', renamePlaceholder: 'Layer name',
    storageFull: 'Local storage is full — changes may not be saved',
    menuGroup: 'Group', toastGrouped: 'Layers grouped', shortcutGroup: 'Group selected layers',
  },
  'zh-CN': {
    languageSwitch: '语言', githubRepository: '在 GitHub 查看源码', saved: '所有更改已保存', unsaved: '更改尚未导出', open: '导入 SVG', export: '导出',
    layers: '图层', addLayer: '添加图层', addElement: '添加元素', fromImage: '图片', fromSvgCollection: '收藏', commonShapes: '常用', svgCollectionTitle: '收藏', svgCollectionThemes: 'SVG 主题', svgCollectionCompanyLogos: '公司 Logo', svgCollectionAnimationExamples: '动画示例', svgCollectionAnimationPack: '动画组合', svgCollectionLoadingCases: '加载动画', svgCollectionSvgSpinners: '旋转加载', svgCollectionUniqueAnimations: '创意动画', svgCollectionItems: '个项目', svgCollectionSource: '查看来源', svgCollectionAdd: '添加', loadDemo: '加载 Demo SVG', textContent: '文字内容', editText: '编辑文字内容', fontSize: '字体大小', letterSpacing: '字符间距', fontFamily: '字体家族', fontFamilyDefault: 'SVG 默认字体', fontFamilyPlaceholder: '例如 Arial, sans-serif', bold: '加粗',
    preview: '预览', source: '源码', format: '格式化', simplify: '简化', copySource: '复制', editSource: '编辑', sourceTree: 'SVG 源码树', collapsedContent: '已折叠内容', resetView: '重置视图并居中', collapseLayers: '折叠图层面板', expandLayers: '展开图层面板', collapseInspector: '折叠属性面板', expandInspector: '展开属性面板', dropHint: '将 SVG 拖到这里开始', inspector: '检查器', appearance: '外观',
    fill: '填充', stroke: '描边', opacity: '不透明度', strokeWidth: '描边宽度', cornerRadius: '圆角半径', polygonSides: '边数', width: '宽度', height: '高度', lineStartX: '起点 X', lineStartY: '起点 Y', lineEndX: '终点 X', lineEndY: '终点 Y', aspectRatio: '图层比例', aspectRatioOriginal: '原始', gradient: '渐变色', gradientStart: '起始颜色', gradientEnd: '结束颜色', gradientAngle: '角度', colorTokens: '颜色 Token', colorTokenUsage: '次使用', colorTokensEmpty: '当前 SVG 中没有颜色 Token。', copyColor: '复制颜色', editColor: '编辑颜色', copied: '已复制', elementDetails: '元素详情', layer: 'Layer', visibility: '可见性',
    visible: '可见', hidden: '已隐藏', livePreview: '实时预览', statusReady: '个元素 · SVG 就绪', changesInstant: '更改会即时生效', exportShort: '导出', selected: '已选中', resizeLineStart: '调整线条起点', resizeLineEnd: '调整线条终点', playAnimation: '播放动画', pauseAnimation: '暂停动画',
    elementSuffix: '元素', show: '显示', hide: '隐藏', noSelection: '选择一个图层来编辑它的属性。', invalidSvg: '该文件不包含有效的 SVG。',
    undo: '撤销', redo: '重做', close: '关闭',
    toastExported: 'SVG 已导出', toastImported: '已导入', toastCopy: '已复制图层', toastPaste: '已粘贴图层', toastDelete: '已删除图层 — 按 ⌘Z 撤销', toastFormatted: '源码已格式化', toastSimplified: '已简化连续平移', toastSourceCopied: '源码已复制', toastSourceCopyFailed: '无法复制源码', toastInvalidFile: '请拖入或选择一个 SVG 文件。', toastInvalidImageFile: '请选择受支持的图片文件。', toastCollectionImportFailed: '无法导入此 SVG 收藏图标。',
    dropOverlayTitle: '松开以导入 SVG',
    zoomIn: '放大', zoomOut: '缩小', zoomFit: '适应屏幕',
    shortcutsTitle: '键盘快捷键', shortcutsGeneral: '通用', shortcutsLayers: '图层', shortcutsCanvas: '画布', shortcutsHint: '按 ? 可打开或关闭此面板',
    shortcutUndo: '撤销', shortcutRedo: '重做', shortcutExport: '导出 SVG', shortcutSelectAll: '全选图层', shortcutCopy: '复制图层', shortcutPaste: '粘贴图层', shortcutDelete: '删除图层', shortcutPanels: '循环切换面板', shortcutHelp: '打开/关闭快捷键面板', shortcutRangeSelect: '选中图层范围', shortcutToggleSelect: '添加或取消单个图层', shortcutPan: '平移画布', shortcutZoom: '放大 / 缩小', shortcutEditText: '编辑文字内容', shortcutResizeProportional: '等比例调整大小', shortcutMove: '移动选中的图层（Shift：10px）', shortcutDeselect: '取消选择', shortcutZoomIn: '放大', shortcutZoomOut: '缩小', shortcutZoomFit: '适应屏幕',
    shortcutKeyDrag: '拖拽', shortcutKeyScroll: '⌘ + 滚轮', shortcutKeyDoubleClick: '双击',
    exportDialogTitle: '导出', exportFormat: '格式', exportScope: '导出范围', exportAllLayers: '导出整个图层', exportSelectedLayers: '导出选择图层', exportScale: '倍率', exportOptimize: '优化并压缩 SVG', exportPreview: '预览', exportEstimatedSize: '预计大小', exportLayerCount: '待导出图层', expandExportPreview: '放大导出预览', exportFailed: '导出失败',
    alignLeft: '左对齐', alignCenterX: '水平居中', alignRight: '右对齐', alignTop: '顶对齐', alignCenterY: '垂直居中', alignBottom: '底对齐', distributeX: '水平等距分布', distributeY: '垂直等距分布',
    collapseGroup: '折叠分组', expandGroup: '展开分组', resizeTopLeft: '从左上角调整大小', resizeBottomRight: '从右下角调整大小', newLayerText: '新文本', documentTitle: 'Vector Forge — SVG 编辑器',
    menuRename: '重命名', renamePlaceholder: '图层名称',
    storageFull: '本地存储已满，更改可能无法保存',
    menuGroup: '创建分组', toastGrouped: '已创建分组', shortcutGroup: '创建分组',
  },
  'zh-TW': {
    languageSwitch: '語言', githubRepository: '在 GitHub 查看原始碼', saved: '所有更改已儲存', unsaved: '更改尚未匯出', open: '匯入 SVG', export: '匯出',
    layers: '圖層', addLayer: '新增圖層', addElement: '新增元素', fromImage: '圖片', fromSvgCollection: 'SVG 收藏', commonShapes: '常用', svgCollectionTitle: 'SVG 收藏', svgCollectionThemes: 'SVG 主題', svgCollectionCompanyLogos: '公司 Logo', svgCollectionAnimationExamples: '動畫範例', svgCollectionAnimationPack: '動畫組合', svgCollectionLoadingCases: '載入動畫', svgCollectionSvgSpinners: 'SVG 旋轉載入', svgCollectionUniqueAnimations: '創意動畫', svgCollectionItems: '個項目', svgCollectionSource: '查看來源', svgCollectionAdd: '新增', loadDemo: '載入 Demo SVG', textContent: '文字內容', editText: '編輯文字內容', fontSize: '字體大小', letterSpacing: '字元間距', fontFamily: '字體家族', fontFamilyDefault: 'SVG 預設字體', fontFamilyPlaceholder: '例如 Arial, sans-serif', bold: '粗體',
    preview: '預覽', source: '原始碼', format: '格式化', simplify: '簡化', copySource: '複製', editSource: '編輯', sourceTree: 'SVG 原始碼樹', collapsedContent: '已摺疊內容', resetView: '重置視圖並置中', collapseLayers: '摺疊圖層面板', expandLayers: '展開圖層面板', collapseInspector: '摺疊屬性面板', expandInspector: '展開屬性面板', dropHint: '將 SVG 拖到這裡開始', inspector: '檢查器', appearance: '外觀',
    fill: '填色', stroke: '描邊', opacity: '不透明度', strokeWidth: '描邊寬度', cornerRadius: '圓角半徑', polygonSides: '邊數', width: '寬度', height: '高度', lineStartX: '起點 X', lineStartY: '起點 Y', lineEndX: '終點 X', lineEndY: '終點 Y', aspectRatio: '圖層比例', aspectRatioOriginal: '原始', gradient: '漸層色', gradientStart: '起始顏色', gradientEnd: '結束顏色', gradientAngle: '角度', colorTokens: '顏色 Token', colorTokenUsage: '次使用', colorTokensEmpty: '目前 SVG 中沒有顏色 Token。', copyColor: '複製顏色', editColor: '編輯顏色', copied: '已複製', elementDetails: '元素詳情', layer: 'Layer', visibility: '可見性',
    visible: '可見', hidden: '已隱藏', livePreview: '即時預覽', statusReady: '個元素 · SVG 就緒', changesInstant: '更改會即時生效', exportShort: '匯出', selected: '已選取', resizeLineStart: '調整線條起點', resizeLineEnd: '調整線條終點', playAnimation: '播放動畫', pauseAnimation: '暫停動畫',
    elementSuffix: '元素', show: '顯示', hide: '隱藏', noSelection: '選取一個圖層來編輯它的屬性。', invalidSvg: '此檔案不包含有效的 SVG。',
    undo: '復原', redo: '重做', close: '關閉',
    toastExported: 'SVG 已匯出', toastImported: '已匯入', toastCopy: '已複製圖層', toastPaste: '已貼上圖層', toastDelete: '已刪除圖層 — 按 ⌘Z 復原', toastFormatted: '原始碼已格式化', toastSimplified: '已簡化連續平移', toastSourceCopied: '原始碼已複製', toastSourceCopyFailed: '無法複製原始碼', toastInvalidFile: '請拖入或選擇一個 SVG 檔案。', toastInvalidImageFile: '請選擇支援的圖片檔案。', toastCollectionImportFailed: '無法匯入此 SVG 收藏圖示。',
    dropOverlayTitle: '放開以匯入 SVG',
    zoomIn: '放大', zoomOut: '縮小', zoomFit: '適應螢幕',
    shortcutsTitle: '鍵盤快捷鍵', shortcutsGeneral: '一般', shortcutsLayers: '圖層', shortcutsCanvas: '畫布', shortcutsHint: '按 ? 可開啟或關閉此面板',
    shortcutUndo: '復原', shortcutRedo: '重做', shortcutExport: '匯出 SVG', shortcutSelectAll: '全選圖層', shortcutCopy: '複製圖層', shortcutPaste: '貼上圖層', shortcutDelete: '刪除圖層', shortcutPanels: '循環切換面板', shortcutHelp: '開啟/關閉快捷鍵面板', shortcutRangeSelect: '選取圖層範圍', shortcutToggleSelect: '加入或取消單個圖層', shortcutPan: '平移畫布', shortcutZoom: '放大 / 縮小', shortcutEditText: '編輯文字內容', shortcutResizeProportional: '等比例調整大小', shortcutMove: '移動選取的圖層（Shift：10px）', shortcutDeselect: '取消選取', shortcutZoomIn: '放大', shortcutZoomOut: '縮小', shortcutZoomFit: '適應螢幕',
    shortcutKeyDrag: '拖曳', shortcutKeyScroll: '⌘ + 滾輪', shortcutKeyDoubleClick: '雙擊',
    exportDialogTitle: '匯出', exportFormat: '格式', exportScope: '匯出範圍', exportAllLayers: '匯出整個圖層', exportSelectedLayers: '匯出選取圖層', exportScale: '倍率', exportOptimize: '最佳化並壓縮 SVG', exportPreview: '預覽', exportEstimatedSize: '預計大小', exportLayerCount: '待匯出圖層', expandExportPreview: '放大匯出預覽', exportFailed: '匯出失敗',
    alignLeft: '靠左對齊', alignCenterX: '水平置中', alignRight: '靠右對齊', alignTop: '靠上對齊', alignCenterY: '垂直置中', alignBottom: '靠下對齊', distributeX: '水平等距分佈', distributeY: '垂直等距分佈',
    collapseGroup: '摺疊群組', expandGroup: '展開群組', resizeTopLeft: '從左上角調整大小', resizeBottomRight: '從右下角調整大小', newLayerText: '新文字', documentTitle: 'Vector Forge — SVG 編輯器',
    menuRename: '重新命名', renamePlaceholder: '圖層名稱',
    storageFull: '本機儲存空間已滿，更改可能無法儲存',
    menuGroup: '建立群組', toastGrouped: '已建立群組', shortcutGroup: '建立群組',
  },
  ja: {
    languageSwitch: '言語', githubRepository: 'GitHub でソースを見る', saved: 'すべての変更が保存されました', unsaved: '変更はまだエクスポートされていません', open: 'SVG を読み込む', export: 'エクスポート',
    layers: 'レイヤー', addLayer: 'レイヤーを追加', addElement: '要素を追加', fromImage: '画像', fromSvgCollection: 'SVG コレクション', commonShapes: '図形', svgCollectionTitle: 'SVG コレクション', svgCollectionThemes: 'SVG テーマ', svgCollectionCompanyLogos: '企業ロゴ', svgCollectionAnimationExamples: 'アニメーション例', svgCollectionAnimationPack: 'アニメーションパック', svgCollectionLoadingCases: 'ローディング', svgCollectionSvgSpinners: 'SVG スピナー', svgCollectionUniqueAnimations: 'ユニークアニメーション', svgCollectionItems: '個のアイテム', svgCollectionSource: 'ソースを見る', svgCollectionAdd: '追加', loadDemo: 'デモ SVG を読み込む', textContent: 'テキスト内容', editText: 'テキストを編集', fontSize: 'フォントサイズ', letterSpacing: '文字間隔', fontFamily: 'フォントファミリー', fontFamilyDefault: 'SVG のデフォルト', fontFamilyPlaceholder: '例: Arial, sans-serif', bold: '太字',
    preview: 'プレビュー', source: 'ソース', format: '整形', simplify: '簡略化', copySource: 'コピー', editSource: '編集', sourceTree: 'SVG ソースツリー', collapsedContent: '折りたたまれた内容', resetView: 'ビューをリセットして中央に', collapseLayers: 'レイヤーパネルを折りたたむ', expandLayers: 'レイヤーパネルを展開', collapseInspector: 'プロパティパネルを折りたたむ', expandInspector: 'プロパティパネルを展開', dropHint: 'SVG をここにドロップして開始', inspector: 'インスペクター', appearance: '外観',
    fill: '塗りつぶし', stroke: 'ストローク', opacity: '不透明度', strokeWidth: 'ストローク幅', cornerRadius: '角丸半径', polygonSides: '辺の数', width: '幅', height: '高さ', lineStartX: '始点 X', lineStartY: '始点 Y', lineEndX: '終点 X', lineEndY: '終点 Y', aspectRatio: 'アスペクト比', aspectRatioOriginal: '元の比率', gradient: 'グラデーション', gradientStart: '開始色', gradientEnd: '終了色', gradientAngle: '角度', colorTokens: 'カラートークン', colorTokenUsage: '回使用', colorTokensEmpty: 'この SVG にはカラートークンがありません。', copyColor: '色をコピー', editColor: '色を編集', copied: 'コピーしました', elementDetails: '要素の詳細', layer: 'レイヤー', visibility: '表示状態',
    visible: '表示', hidden: '非表示', livePreview: 'ライブプレビュー', statusReady: '個の要素 • SVG 準備完了', changesInstant: '変更は即時反映されます', exportShort: 'エクスポート', selected: '選択中', resizeLineStart: '線の始点を調整', resizeLineEnd: '線の終点を調整', playAnimation: 'アニメーションを再生', pauseAnimation: 'アニメーションを一時停止',
    elementSuffix: '要素', show: '表示', hide: '非表示', noSelection: 'レイヤーを選択してプロパティを編集します。', invalidSvg: 'このファイルには有効な SVG が含まれていません。',
    undo: '取り消し', redo: 'やり直し', close: '閉じる',
    toastExported: 'SVG をエクスポートしました', toastImported: '読み込みました', toastCopy: 'レイヤーをコピーしました', toastPaste: 'レイヤーを貼り付けました', toastDelete: 'レイヤーを削除しました — ⌘Z で取り消し', toastFormatted: 'ソースを整形しました', toastSimplified: '連続した移動を簡略化しました', toastSourceCopied: 'ソースをコピーしました', toastSourceCopyFailed: 'ソースをコピーできませんでした', toastInvalidFile: 'SVG ファイルをドロップまたは選択してください。', toastInvalidImageFile: '対応している画像ファイルを選択してください。', toastCollectionImportFailed: 'この SVG コレクション項目を読み込めませんでした。',
    dropOverlayTitle: 'ドロップして SVG を読み込む',
    zoomIn: '拡大', zoomOut: '縮小', zoomFit: '画面に合わせる',
    shortcutsTitle: 'キーボードショートカット', shortcutsGeneral: '一般', shortcutsLayers: 'レイヤー', shortcutsCanvas: 'キャンバス', shortcutsHint: '? キーでこのパネルを開閉',
    shortcutUndo: '取り消し', shortcutRedo: 'やり直し', shortcutExport: 'SVG をエクスポート', shortcutSelectAll: 'すべてのレイヤーを選択', shortcutCopy: 'レイヤーをコピー', shortcutPaste: 'レイヤーを貼り付け', shortcutDelete: 'レイヤーを削除', shortcutPanels: 'パネルを切り替え', shortcutHelp: 'ショートカットパネルの開閉', shortcutRangeSelect: 'レイヤーを範囲選択', shortcutToggleSelect: 'レイヤーの選択を切り替え', shortcutPan: 'キャンバスをパン', shortcutZoom: '拡大 / 縮小', shortcutEditText: 'テキストを編集', shortcutResizeProportional: '比率を維持してリサイズ', shortcutMove: '選択したレイヤーを移動（Shift: 10px）', shortcutDeselect: '選択を解除', shortcutZoomIn: '拡大', shortcutZoomOut: '縮小', shortcutZoomFit: '画面に合わせる',
    shortcutKeyDrag: 'ドラッグ', shortcutKeyScroll: '⌘ + スクロール', shortcutKeyDoubleClick: 'ダブルクリック',
    exportDialogTitle: 'エクスポート', exportFormat: 'フォーマット', exportScope: 'エクスポート範囲', exportAllLayers: 'すべてのレイヤー', exportSelectedLayers: '選択したレイヤー', exportScale: '倍率', exportOptimize: 'SVG を最適化・圧縮', exportPreview: 'プレビュー', exportEstimatedSize: '推定サイズ', exportLayerCount: 'エクスポートするレイヤー', expandExportPreview: 'エクスポートプレビューを拡大', exportFailed: 'エクスポートに失敗しました',
    alignLeft: '左揃え', alignCenterX: '水平方向中央揃え', alignRight: '右揃え', alignTop: '上揃え', alignCenterY: '垂直方向中央揃え', alignBottom: '下揃え', distributeX: '水平方向に等間隔配置', distributeY: '垂直方向に等間隔配置',
    collapseGroup: 'グループを折りたたむ', expandGroup: 'グループを展開', resizeTopLeft: '左上からリサイズ', resizeBottomRight: '右下からリサイズ', newLayerText: '新しいテキスト', documentTitle: 'Vector Forge — SVG エディター',
    menuRename: '名前を変更', renamePlaceholder: 'レイヤー名',
    storageFull: 'ローカルストレージがいっぱいです — 変更が保存されない場合があります',
    menuGroup: 'グループ化', toastGrouped: 'グループを作成しました', shortcutGroup: '選択したレイヤーをグループ化',
  },
}

export const TAG_NAMES = {
  'zh-CN': { rect: '矩形', circle: '圆形', ellipse: '椭圆', line: '直线', polyline: '折线', polygon: '多边形', heart: '爱心', star: '五角星', path: '路径', text: '文字', g: '分组', image: '图片' },
  'zh-TW': { rect: '矩形', circle: '圓形', ellipse: '橢圓', line: '直線', polyline: '折線', polygon: '多邊形', heart: '愛心', star: '五角星', path: '路徑', text: '文字', g: '群組', image: '圖片' },
  ja: { rect: '矩形', circle: '円', ellipse: '楕円', line: '直線', polyline: '折れ線', polygon: '多角形', heart: 'ハート', star: '星', path: 'パス', text: 'テキスト', g: 'グループ', image: '画像' },
}

export const LAYER_NAMES = {
  'zh-CN': { Background: '背景', 'Logo mark': '标志图形', Wordmark: '文字标志', Heart: '爱心', Star: '五角星' },
  'zh-TW': { Background: '背景', 'Logo mark': '標誌圖形', Wordmark: '文字標誌', Heart: '愛心', Star: '五角星' },
  ja: { Background: '背景', 'Logo mark': 'ロゴマーク', Wordmark: 'ワードマーク', Heart: 'ハート', Star: '星' },
}

export const ADD_LAYER_TAGS = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'heart', 'star', 'path', 'text']

export function getLayerDisplayName(item, language) {
  const layerNames = LAYER_NAMES[language]
  if (!layerNames) return item.name
  if (layerNames[item.name]) return layerNames[item.name]
  const match = item.name.match(/^([a-z]+)(\s+\d+)?$/i)
  if (!match) return item.name
  return `${TAG_NAMES[language]?.[match[1].toLowerCase()] || match[1]}${match[2] || ''}`
}

export function getTagDisplayName(tag, language) {
  return TAG_NAMES[language]?.[tag] || tag
}
