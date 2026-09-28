import SAMPLE_SVG from './sample.svg?raw'

const SAMPLE_TEXT = {
  'en': ['FORM / COLOR / PLAY', 'VECTOR STUDIES — 001', 'VECSY', 'A SMALL LAB', 'FOR BIG IDEAS.', '01 — ORBITAL FORMS', '02 — COLOR & MOTION', 'Make shapes. Make something.'],
  'zh-CN': ['形态 / 色彩 / 玩心', '矢量研究 — 001', 'VECSY', '小小实验室', '装下大创意。', '01 — 轨道形态', '02 — 色彩与运动', '创造形状，创造可能。'],
  'zh-TW': ['形態 / 色彩 / 玩心', '向量研究 — 001', 'VECSY', '小小實驗室', '裝下大創意。', '01 — 軌道形態', '02 — 色彩與動態', '創造形狀，創造可能。'],
  'ja': ['かたち / 色 / あそび', 'ベクター研究 — 001', 'VECSY', '小さな実験室', '大きなアイデアを。', '01 — 軌道のかたち', '02 — 色と動き', 'かたちから、何かをつくろう。'],
}

const SAMPLE_LAYERS = {
  'en': ['Editorial heading', 'Orbital study', 'Color overlap', 'Curve and direction', 'Spark', 'Caption and swatches'],
  'zh-CN': ['标题排版', '轨道研究', '色彩叠加', '曲线与方向', '星芒', '说明与色板'],
  'zh-TW': ['標題排版', '軌道研究', '色彩疊加', '曲線與方向', '星芒', '說明與色板'],
  'ja': ['見出し', '軌道の研究', '色の重なり', '曲線と方向', 'きらめき', 'キャプションと配色'],
}

export function getSampleSvg(language = 'en') {
  if (language === 'en' || !SAMPLE_TEXT[language]) return SAMPLE_SVG
  let markup = SAMPLE_SVG
  SAMPLE_TEXT.en.forEach((value, index) => {
    const localized = SAMPLE_TEXT[language][index].replaceAll('&', '&amp;')
    markup = markup.replace(`>${value.replaceAll('&', '&amp;')}</text>`, `>${localized}</text>`)
  })
  SAMPLE_LAYERS.en.forEach((value, index) => {
    markup = markup.replace(`data-name="${value}"`, `data-name="${SAMPLE_LAYERS[language][index]}"`)
  })
  return markup
}
