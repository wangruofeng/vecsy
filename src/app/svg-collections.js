const SVG_REPO_COMPANY_LOGOS = [
  ['Digg', 494332], ['Deviantart', 494333], ['Blogger', 494334], ['Dribbble', 494335], ['Apple', 494336], ['Behance', 494337], ['Flickr', 494338], ['Ebay', 494339], ['Dropbox', 494340], ['Facebook', 494341], ['Forrst', 494342], ['Github', 494343], ['Instagram', 494344], ['Gplus', 494345], ['Lastfm', 494346], ['Gdrive', 494347], ['Picasa', 494348], ['Linkedin', 494349], ['Pinterest', 494350], ['Skype', 494351], ['Reddit', 494352], ['Rss', 494353], ['Stumbleupon', 494354], ['Soundcloud', 494355], ['Tumblr', 494356], ['Vimeo', 494357], ['Vine', 494358], ['Twitter', 494359], ['Wordpress', 494360], ['Yahoo', 494361], ['Amazon', 494362], ['Android', 494363], ['Windows', 494364], ['Youtube', 494365],
]

const ICONIFY_LOGO_NAMES = {
  Gplus: 'fa6-brands:google-plus-g', Lastfm: 'fa6-brands:lastfm', Gdrive: 'simple-icons:googledrive', Picasa: 'logos:picasa', Stumbleupon: 'fa6-brands:stumbleupon', Vine: 'fa6-brands:vine',
}

const INLINE_LOGOS = {
  Forrst: '<svg viewBox="-287 273 224.2 256" xmlns="http://www.w3.org/2000/svg"><path d="M-63.3 520.7-169.3 276.5a5.9 5.9 0 0 0-10.8 0l-106.4 244.2a6 6 0 0 0 5.4 8.3h94.4v-52l-25.3-17.5 4.2-6 21.1 14.6v-41.6h24v27.3l22-11.1 3.3 6.5-25.3 12.8v20.1l40.4-20.4 3.3 6.5-43.7 22v38.5h94a6 6 0 0 0 5.4-8.3Z"/></svg>',
}

const ANIMATION_COLLECTIONS = [
  {
    id: 'animation-examples',
    labelKey: 'svgCollectionAnimationExamples',
    directory: 'animation-examples',
    files: ['01-path-drawing.svg', '02-dash-flow.svg', '03-orbit-loader.svg', '04-blob-morph.svg', '05-bouncing-ball.svg', '06-radar-ripple.svg', '07-audio-equalizer.svg', '08-mask-reveal.svg', '09-path-flight.svg', '10-glow-particles.svg'],
  },
  {
    id: 'animation-pack',
    labelKey: 'svgCollectionAnimationPack',
    directory: 'animation-pack',
    files: ['01-menu-close-morph.svg', '02-gradient-orb.svg', '03-car-on-road.svg', '04-water-drop.svg', '05-clock.svg', '06-battery-charge.svg', '07-wifi-pulse.svg', '08-upload-cloud.svg', '09-bell-shake.svg', '10-heart-burst.svg', '11-lock-unlock.svg', '12-radar-sweep.svg', '13-dna-helix.svg', '14-satellite-orbit.svg', '15-timeline-progress.svg'],
  },
  {
    id: 'loading-cases',
    labelKey: 'svgCollectionLoadingCases',
    directory: 'loading-cases',
    files: ['01-arc-chase.svg', '02-bars-pulse.svg', '03-circular-progress.svg', '04-dots-spinner.svg', '05-dual-ring.svg', '06-hourglass-loader.svg', '07-orbit-dots.svg', '08-ripple-loader.svg', '09-shimmer-pill.svg', '10-spinner-ring.svg', '11-square-flip.svg', '12-three-dots-bounce.svg'],
  },
  {
    id: 'svg-spinners',
    labelKey: 'svgCollectionSvgSpinners',
    directory: 'svg-spinners',
    sourceUrl: 'https://icon-sets.iconify.design/svg-spinners/',
    nameFn: spinnerName,
    files: ['12-dots-scale-rotate.svg', '180-ring.svg', '180-ring-with-bg.svg', '270-ring.svg', '270-ring-with-bg.svg', '3-dots-bounce.svg', '3-dots-fade.svg', '3-dots-move.svg', '3-dots-rotate.svg', '3-dots-scale.svg', '3-dots-scale-middle.svg', '6-dots-rotate.svg', '6-dots-scale.svg', '6-dots-scale-middle.svg', '8-dots-rotate.svg', '90-ring.svg', '90-ring-with-bg.svg', 'bars-fade.svg', 'bars-rotate-fade.svg', 'bars-scale.svg', 'bars-scale-fade.svg', 'bars-scale-middle.svg', 'blocks-scale.svg', 'blocks-shuffle-2.svg', 'blocks-shuffle-3.svg', 'blocks-wave.svg', 'bouncing-ball.svg', 'clock.svg', 'dot-revolve.svg', 'eclipse.svg', 'eclipse-half.svg', 'gooey-balls-1.svg', 'gooey-balls-2.svg', 'pulse.svg', 'pulse-2.svg', 'pulse-3.svg', 'pulse-multiple.svg', 'pulse-ring.svg', 'pulse-rings-2.svg', 'pulse-rings-3.svg', 'pulse-rings-multiple.svg', 'ring-resize.svg', 'tadpole.svg', 'wifi.svg', 'wifi-fade.svg', 'wind-toy.svg'],
  },
  {
    id: 'unique-animations',
    labelKey: 'svgCollectionUniqueAnimations',
    directory: 'unique-animations',
    files: ['01-gooey-dots.svg', '02-play-pause-morph.svg', '03-neon-flicker.svg', '04-gears.svg', '05-rain-cloud.svg', '06-rocket-launch.svg', '07-envelope-fold.svg', '08-check-success.svg', '09-barcode-scan.svg', '10-flower-bloom.svg', '11-conveyor.svg', '12-magnifier-search.svg', '13-pulse-grid.svg', '14-waveform-scan.svg'],
  },
]

function getEditableUrl(name) {
  const icon = ICONIFY_LOGO_NAMES[name] || `simple-icons:${name.toLowerCase()}`
  return `https://api.iconify.design/${icon.replace(':', '/')}.svg`
}

function animationName(file) {
  return file.replace(/\.svg$/, '').replace(/^\d+-/, '').split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')
}

// 品牌名大小写固定，不走 Title Case 推导
const SOCIAL_MEDIA_DIRECTORY = 'social-media'
const SOCIAL_MEDIA_FILES = [
  '01-xiaohongshu.svg',
  '02-douyin.svg',
  '03-wechat-official-account.svg',
  '04-wechat-channels.svg',
  '05-instagram.svg',
  '06-youtube.svg',
  '07-x.svg',
]
const SOCIAL_MEDIA_NAMES = {
  '01-xiaohongshu': 'Xiaohongshu',
  '02-douyin': 'Douyin',
  '03-wechat-official-account': 'WeChat Official Account',
  '04-wechat-channels': 'WeChat Channels',
  '05-instagram': 'Instagram',
  '06-youtube': 'YouTube',
  '07-x': 'X',
}

function socialMediaName(file) {
  return SOCIAL_MEDIA_NAMES[file.replace(/\.svg$/, '')] || animationName(file)
}

// 品牌名大小写固定，统一走显式映射，缺失才回退 Title Case
const BRAND_NAMES = {
  // AI & LLMs
  'ai-studio-google': 'Google AI Studio', anthropic: 'Anthropic', claude: 'Claude', openai: 'OpenAI',
  'codex-openai': 'Codex', deepseek: 'DeepSeek', doubao: 'Doubao', gemini: 'Gemini',
  'google-antigravity': 'Google Antigravity', 'google-gemini': 'Google Gemini', grok: 'Grok',
  kimi: 'Kimi', manus: 'Manus', minimax: 'MiniMax', moonshot: 'Moonshot',
  'nvidia-nemotron': 'Nemotron (NVIDIA)', 'openai-chatgpt': 'ChatGPT', perplexity: 'Perplexity',
  qwen: 'Qwen', 'sora-openai': 'Sora', 'xai-grok': 'xAI Grok', 'xiaomi-mimo': 'MiMo (Xiaomi)', zhipu: 'Zhipu',
  'claude-code': 'Claude Code', elevenlabs: 'ElevenLabs', exa: 'Exa', 'hugging-face': 'Hugging Face',
  lovable: 'Lovable', midjourney: 'Midjourney', mistral: 'Mistral AI', 'nano-banana-google': 'Nano Banana (Google)',
  'nousresearch-hermes': 'NousResearch Hermes', ollama: 'Ollama', runway: 'Runway',
  'character-ai': 'Character.AI', 'cherry-studio': 'Cherry Studio', dify: 'Dify', kling: 'Kling', notebooklm: 'NotebookLM',
  // Tech & Internet
  alibaba: 'Alibaba', amazon: 'Amazon', 'apple-light': 'Apple', google: 'Google', meta: 'Meta', microsoft: 'Microsoft',
  amd: 'AMD', arm: 'ARM', atlassian: 'Atlassian', baidu: 'Baidu', bytedance: 'ByteDance', 'cisco-light': 'Cisco',
  datadog: 'Datadog', 'google-maps': 'Google Maps', 'google-translate': 'Google Translate', huawei: 'Huawei',
  ibm: 'IBM', intel: 'Intel', 'microsoft-365-copilot': 'Microsoft 365 Copilot', micron: 'Micron', nvidia: 'NVIDIA',
  palantir: 'Palantir', panasonic: 'Panasonic', qualcomm: 'Qualcomm', samsung: 'Samsung', sandisk: 'SanDisk',
  'sk-hynix': 'SK Hynix', snapdragon: 'Snapdragon', tencent: 'Tencent', workbuddy: 'Work Buddy', workday: 'Workday',
  xiaomi: 'Xiaomi', agora: 'Agora',
  siemens: 'Siemens', 'kingston-technology': 'Kingston Technology', hcaptcha: 'hCaptcha', caterpillar: 'Caterpillar',
  // Developer & Design Tools
  figma: 'Figma', github: 'GitHub', 'github-copilot': 'GitHub Copilot', notion: 'Notion', slack: 'Slack',
  'visual-studio-code': 'VS Code', adobe: 'Adobe', canva: 'Canva', coderabbit: 'CodeRabbit', cursor: 'Cursor',
  'github-pages': 'GitHub Pages', 'model-context-protocol': 'MCP', obsidian: 'Obsidian', openclaw: 'OpenClaw',
  opencode: 'OpenCode', openrouter: 'OpenRouter', 'refined-github': 'Refined GitHub', 'sketch-mono': 'Sketch', zoom: 'Zoom',
  firecrawl: 'Firecrawl', 'kilo-code': 'Kilo Code', lottiefiles: 'LottieFiles', 'new-api': 'New API',
  ffmpeg: 'FFmpeg', freecodecamp: 'freeCodeCamp', hexo: 'Hexo', 'intellij-idea': 'IntelliJ IDEA', n8n: 'n8n',
  obs: 'OBS', raycast: 'Raycast', removedotbg: 'remove.bg', roocode: 'Roo Code', capcut: 'CapCut',
  // Languages & Cloud
  aws: 'AWS', cloudflare: 'Cloudflare', digitalocean: 'DigitalOcean', firebase: 'Firebase', mongodb: 'MongoDB',
  nextdotjs: 'Next.js', nodejs: 'Node.js', postgresql: 'PostgreSQL', python: 'Python', react: 'React', redis: 'Redis',
  rust: 'Rust', supabase: 'Supabase', swift: 'Swift', tailwindcss: 'Tailwind CSS', typescript: 'TypeScript', vercel: 'Vercel',
  html5: 'HTML5', htmx: 'htmx', javascript: 'JavaScript', markdown: 'Markdown', svg: 'SVG', tex: 'TeX',
  threedotjs: 'Three.js', volcengine: 'Volcengine', googlecloud: 'Google Cloud', snowflake: 'Snowflake',
  bash: 'Bash', cplusplus: 'C++', dart: 'Dart', denojs: 'Deno', go: 'Go', gopher: 'Gopher',
  'grpc-mono': 'gRPC', kotlin: 'Kotlin', objectivec: 'Objective-C', php: 'PHP', powershell: 'PowerShell',
  ruby: 'Ruby', sass: 'Sass', apache: 'Apache', jpeg: 'JPEG',
  // Browsers & OS
  android: 'Android', chrome: 'Chrome', firefox: 'Firefox', linux: 'Linux', safari: 'Safari',
  harmonyos: 'HarmonyOS', macos: 'macOS', opera: 'Opera', imessage: 'iMessage',
  'airplay-audio': 'AirPlay Audio', 'airplay-video': 'AirPlay Video', openwrt: 'OpenWrt',
  'app-store': 'App Store', 'google-play': 'Google Play',
  ios: 'iOS', 'apple-tv': 'Apple TV',
  // Social & Community
  discord: 'Discord', dribbble: 'Dribbble', bilibili: 'Bilibili', bluesky: 'Bluesky', facebook: 'Facebook', instagram: 'Instagram',
  linkedin: 'LinkedIn', medium: 'Medium', messenger: 'Messenger', pinterest: 'Pinterest', qq: 'QQ', reddit: 'Reddit',
  'sina-weibo': 'Sina Weibo', substack: 'Substack', telegram: 'Telegram', 'threads-mono': 'Threads', vsco: 'VSCO',
  wechat: 'WeChat', whatsapp: 'WhatsApp', xiaohongshu: 'Xiaohongshu', zhihu: 'Zhihu',
  behance: 'Behance', csdn: 'CSDN', disqus: 'Disqus', douban: 'Douban', fanfou: 'Fanfou', feedly: 'Feedly',
  instapaper: 'Instapaper', kakaotalk: 'KakaoTalk', skype: 'Skype', rss: 'RSS',
  'buy-me-a-coffee': 'Buy Me a Coffee', arxiv: 'arXiv', 'creative-commons': 'Creative Commons',
  // Finance & Crypto
  stripe: 'Stripe', adyen: 'Adyen', alipay: 'Alipay', binance: 'Binance', bitcoin: 'Bitcoin', 'bitcoin-cash': 'Bitcoin Cash',
  'bitcoin-sv': 'Bitcoin SV', bybit: 'Bybit', 'cash-app': 'Cash App', chase: 'Chase', 'chase-wordmark': 'Chase',
  coinbase: 'Coinbase', dingocoin: 'Dingocoin', dogecoin: 'Dogecoin', hsbc: 'HSBC', litecoin: 'Litecoin',
  metamask: 'MetaMask', nasdaq: 'Nasdaq', okx: 'OKX', paypal: 'PayPal', robinhood: 'Robinhood',
  'standard-chartered': 'Standard Chartered', venmo: 'Venmo',
  solana: 'Solana', tether: 'Tether', usdc: 'USDC', xrp: 'XRP',
  'apple-pay': 'Apple Pay', 'goldman-sachs': 'Goldman Sachs', jcb: 'JCB',
  // Auto & Travel
  airasia: 'AirAsia', airbnb: 'Airbnb', 'airbnb-wordmark': 'Airbnb', bentley: 'Bentley', expedia: 'Expedia',
  grab: 'Grab', klook: 'Klook', mitsubishi: 'Mitsubishi', mtr: 'MTR', porsche: 'Porsche', spacex: 'SpaceX',
  tesla: 'Tesla', tripadvisor: 'Tripadvisor', tripdotcom: 'Trip.com', uber: 'Uber', waze: 'Waze',
  cadillac: 'Cadillac', chevrolet: 'Chevrolet', 'china-railway': 'China Railway', ferrari: 'Ferrari',
  infiniti: 'INFINITI', maserati: 'Maserati', nasa: 'NASA', lyft: 'Lyft', fedex: 'FedEx',
  // Retail & Entertainment
  netflix: 'Netflix', spotify: 'Spotify', adidas: 'Adidas', 'apple-music': 'Apple Music', costco: 'Costco',
  'dazhong-dianping': 'Dianping', ea: 'EA', ikea: 'IKEA', mcdonalds: "McDonald's", meituan: 'Meituan',
  'netease-cloud-music': 'NetEase Cloud Music', nike: 'Nike', 'nintendo-switch': 'Nintendo Switch',
  shopee: 'Shopee', shopify: 'Shopify', 'sony-mono': 'Sony', starbucks: 'Starbucks', taobao: 'Taobao',
  ticketmaster: 'Ticketmaster', 'walmart-wordmark-light': 'Walmart', curseforge: 'CurseForge',
  'beats-by-dre': 'Beats', 'burger-king': 'Burger King', carrefour: 'Carrefour', 'coca-cola': 'Coca-Cola',
  'counter-strike': 'Counter-Strike', dior: 'Dior', disney: 'Disney', disneyplus: 'Disney+', ebay: 'eBay',
  fifa: 'FIFA', fila: 'FILA', handm: 'H&M', 'hbo-max': 'HBO Max', jbl: 'JBL', jordan: 'Jordan',
  kodak: 'Kodak', mlb: 'MLB', nba: 'NBA', nbc: 'NBC', 'new-balance': 'New Balance',
  'new-york-times': 'New York Times', nexon: 'Nexon', nikon: 'Nikon', puma: 'Puma', rakuten: 'Rakuten',
  roblox: 'Roblox', battledotnet: 'Battle.net',
}

function brandName(file) {
  const stem = file.replace(/\.svg$/, '')
  return BRAND_NAMES[stem] || stem.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')
}

// 9 个品牌分组：stems 不带扩展名，createBrandCollection 内部补 .svg
const AI_LLM_STEMS = ['ai-studio-google', 'anthropic', 'claude', 'openai', 'codex-openai', 'deepseek', 'doubao', 'gemini', 'google-antigravity', 'google-gemini', 'grok', 'kimi', 'manus', 'minimax', 'moonshot', 'nvidia-nemotron', 'openai-chatgpt', 'perplexity', 'qwen', 'sora-openai', 'xai-grok', 'xiaomi-mimo', 'zhipu', 'claude-code', 'elevenlabs', 'exa', 'hugging-face', 'lovable', 'midjourney', 'mistral', 'nano-banana-google', 'nousresearch-hermes', 'ollama', 'runway', 'character-ai', 'cherry-studio', 'dify', 'kling', 'notebooklm']
const TECH_COMPANIES_STEMS = ['alibaba', 'amazon', 'apple-light', 'google', 'meta', 'microsoft', 'amd', 'arm', 'atlassian', 'baidu', 'bytedance', 'cisco-light', 'datadog', 'google-maps', 'google-translate', 'huawei', 'ibm', 'intel', 'microsoft-365-copilot', 'micron', 'nvidia', 'palantir', 'panasonic', 'qualcomm', 'samsung', 'sandisk', 'sk-hynix', 'snapdragon', 'tencent', 'workbuddy', 'workday', 'xiaomi', 'agora', 'siemens', 'kingston-technology', 'hcaptcha', 'caterpillar']
const DEV_TOOLS_STEMS = ['figma', 'github', 'github-copilot', 'notion', 'slack', 'visual-studio-code', 'adobe', 'canva', 'coderabbit', 'cursor', 'github-pages', 'model-context-protocol', 'obsidian', 'openclaw', 'opencode', 'openrouter', 'refined-github', 'sketch-mono', 'zoom', 'firecrawl', 'kilo-code', 'lottiefiles', 'new-api', 'ffmpeg', 'freecodecamp', 'hexo', 'intellij-idea', 'n8n', 'obs', 'raycast', 'removedotbg', 'roocode', 'capcut']
const LANG_CLOUD_STEMS = ['aws', 'cloudflare', 'digitalocean', 'firebase', 'mongodb', 'nextdotjs', 'nodejs', 'postgresql', 'python', 'react', 'redis', 'rust', 'supabase', 'swift', 'tailwindcss', 'typescript', 'vercel', 'html5', 'htmx', 'javascript', 'markdown', 'svg', 'tex', 'threedotjs', 'volcengine', 'googlecloud', 'snowflake', 'bash', 'cplusplus', 'dart', 'denojs', 'go', 'gopher', 'grpc-mono', 'kotlin', 'objectivec', 'php', 'powershell', 'ruby', 'sass', 'apache', 'jpeg']
const BROWSERS_OS_STEMS = ['android', 'chrome', 'firefox', 'linux', 'safari', 'harmonyos', 'macos', 'opera', 'imessage', 'airplay-audio', 'airplay-video', 'openwrt', 'app-store', 'google-play', 'ios', 'apple-tv']
const SOCIAL_COMMUNITY_STEMS = ['discord', 'dribbble', 'bilibili', 'bluesky', 'facebook', 'instagram', 'linkedin', 'medium', 'messenger', 'pinterest', 'qq', 'reddit', 'sina-weibo', 'substack', 'telegram', 'threads-mono', 'vsco', 'wechat', 'whatsapp', 'xiaohongshu', 'zhihu', 'behance', 'csdn', 'disqus', 'douban', 'fanfou', 'feedly', 'instapaper', 'kakaotalk', 'skype', 'rss', 'buy-me-a-coffee', 'arxiv', 'creative-commons']
const FINANCE_CRYPTO_STEMS = ['stripe', 'adyen', 'alipay', 'binance', 'bitcoin', 'bitcoin-cash', 'bitcoin-sv', 'bybit', 'cash-app', 'chase', 'chase-wordmark', 'coinbase', 'dingocoin', 'dogecoin', 'hsbc', 'litecoin', 'metamask', 'nasdaq', 'okx', 'paypal', 'robinhood', 'standard-chartered', 'venmo', 'solana', 'tether', 'usdc', 'xrp', 'apple-pay', 'goldman-sachs', 'jcb']
const AUTO_TRAVEL_STEMS = ['airasia', 'airbnb', 'airbnb-wordmark', 'bentley', 'expedia', 'grab', 'klook', 'mitsubishi', 'mtr', 'porsche', 'spacex', 'tesla', 'tripadvisor', 'tripdotcom', 'uber', 'waze', 'cadillac', 'chevrolet', 'china-railway', 'ferrari', 'infiniti', 'maserati', 'nasa', 'lyft', 'fedex']
const RETAIL_ENTERTAINMENT_STEMS = ['netflix', 'spotify', 'adidas', 'apple-music', 'costco', 'dazhong-dianping', 'ea', 'ikea', 'mcdonalds', 'meituan', 'netease-cloud-music', 'nike', 'nintendo-switch', 'shopee', 'shopify', 'sony-mono', 'starbucks', 'taobao', 'ticketmaster', 'walmart-wordmark-light', 'curseforge', 'beats-by-dre', 'burger-king', 'carrefour', 'coca-cola', 'counter-strike', 'dior', 'disney', 'disneyplus', 'ebay', 'fifa', 'fila', 'handm', 'hbo-max', 'jbl', 'jordan', 'kodak', 'mlb', 'nba', 'nbc', 'new-balance', 'new-york-times', 'nexon', 'nikon', 'puma', 'rakuten', 'roblox', 'battledotnet']

// 浅色图标（fill/stroke 为白或极浅灰）：浅色预览底上不可见，渲染时需套深色底
const LIGHT_ICON_STEMS = new Set(['anthropic', 'grok', 'manus', 'qwen', 'xai-grok', 'uber', 'cursor', 'model-context-protocol', 'openrouter', 'markdown', 'nextdotjs', 'threedotjs', 'firecrawl', 'kilo-code', 'midjourney', 'ollama', 'bash', 'go', 'php', 'curseforge', 'rust'])

function createBrandCollection({ id, labelKey, directory, stems }) {
  return {
    id,
    labelKey,
    items: stems.map((stem) => {
      const url = getCollectionAssetUrl(directory, `${stem}.svg`)
      return { id: `${id}-${stem}`, name: brandName(`${stem}.svg`), url, editableUrl: url, preserveAppearance: true, light: LIGHT_ICON_STEMS.has(stem) }
    }),
  }
}

// Google 2026 品牌刷新后的各服务图标（本地静态资源，保留品牌贴色）
const GOOGLE_2026_DIRECTORY = 'google-2026'
const GOOGLE_2026_FILES = ['gmail-2026.svg', 'google-calendar-2026.svg', 'google-chat-2026.svg', 'google-docs-2026.svg', 'google-drive-2026.svg', 'google-forms-2026.svg', 'google-keep-2026.svg', 'google-meet-2026.svg', 'google-sheets-2026.svg', 'google-sites-2026.svg', 'google-slides-2026.svg', 'google-tasks-2026.svg', 'google-vids-2026.svg', 'google-voice-2026.svg']

// svg-spinners 的名字里数字前缀（如 90-ring、180-ring）是名称语义的一部分，不可剥离
function spinnerName(file) {
  return file.replace(/\.svg$/, '').split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ')
}

function getCollectionAssetUrl(directory, file) {
  return `${import.meta.env.BASE_URL}svg-collections/${directory}/${file}`
}

function createSvgCollection({ id, labelKey, directory, files, sourceUrl, nameFn = animationName }) {
  const collection = {
    id,
    labelKey,
    items: files.map((file) => {
      const url = getCollectionAssetUrl(directory, file)
      return { id: `${id}-${file.replace(/\.svg$/, '')}`, name: nameFn(file), url, editableUrl: url, preserveAppearance: true }
    }),
  }
  if (sourceUrl) collection.sourceUrl = sourceUrl
  return collection
}

// 「动画示例 / 动画组合 / 创意动画」三组合并为单一「动画合集」组（三者目录不同，各自保留原加载路径）
const MERGED_ANIMATION_IDS = ['animation-examples', 'animation-pack', 'unique-animations']
const mergedAnimationCollection = {
  id: 'animations',
  labelKey: 'svgCollectionAnimations',
  items: ANIMATION_COLLECTIONS.filter((c) => MERGED_ANIMATION_IDS.includes(c.id)).flatMap((c) => createSvgCollection(c).items),
}
// 「旋转加载（svg-spinners）」并入「加载动画（loading-cases）」：合并 items，各自保留原加载目录与命名
const standaloneAnimationCollections = (() => {
  const loadingCases = createSvgCollection(ANIMATION_COLLECTIONS.find((c) => c.id === 'loading-cases'))
  loadingCases.items.push(...createSvgCollection(ANIMATION_COLLECTIONS.find((c) => c.id === 'svg-spinners')).items)
  return [loadingCases]
})()

// 「社交媒体」并入「社交与社区」：追加 social-media 独有项（跳过已存在的 Instagram / Xiaohongshu），各自保留原加载目录
const socialCommunityCollection = (() => {
  const collection = createBrandCollection({
    id: 'social-community',
    labelKey: 'svgCollectionSocialCommunity',
    directory: 'social-community',
    stems: SOCIAL_COMMUNITY_STEMS,
  })
  const existingNames = new Set(collection.items.map((item) => item.name))
  collection.items.push(...SOCIAL_MEDIA_FILES.map((file) => {
    const stem = file.replace(/\.svg$/, '')
    const url = getCollectionAssetUrl(SOCIAL_MEDIA_DIRECTORY, file)
    return { id: `social-community-${stem}`, name: socialMediaName(file), url, editableUrl: url, preserveAppearance: true }
  }).filter((item) => !existingNames.has(item.name)))
  return collection
})()

export const SVG_COLLECTIONS = [{
  id: 'company-logos',
  labelKey: 'svgCollectionCompanyLogos',
  items: SVG_REPO_COMPANY_LOGOS.map(([name, id]) => ({
    id: `company-logo-${name.toLowerCase()}`,
    name,
    url: `https://www.svgrepo.com/show/${id}/${name.toLowerCase()}.svg`,
    editableUrl: getEditableUrl(name),
    inlineSvgMarkup: INLINE_LOGOS[name],
  })),
}, createBrandCollection({
  id: 'ai-llm',
  labelKey: 'svgCollectionAiLlm',
  directory: 'ai-llm',
  stems: AI_LLM_STEMS,
}), createBrandCollection({
  id: 'tech-companies',
  labelKey: 'svgCollectionTechCompanies',
  directory: 'tech-companies',
  stems: TECH_COMPANIES_STEMS,
}), createBrandCollection({
  id: 'dev-tools',
  labelKey: 'svgCollectionDevTools',
  directory: 'dev-tools',
  stems: DEV_TOOLS_STEMS,
}), createBrandCollection({
  id: 'lang-cloud',
  labelKey: 'svgCollectionLangCloud',
  directory: 'lang-cloud',
  stems: LANG_CLOUD_STEMS,
}), createBrandCollection({
  id: 'browsers-os',
  labelKey: 'svgCollectionBrowsersOs',
  directory: 'browsers-os',
  stems: BROWSERS_OS_STEMS,
}), socialCommunityCollection, createBrandCollection({
  id: 'finance-crypto',
  labelKey: 'svgCollectionFinanceCrypto',
  directory: 'finance-crypto',
  stems: FINANCE_CRYPTO_STEMS,
}), createBrandCollection({
  id: 'auto-travel',
  labelKey: 'svgCollectionAutoTravel',
  directory: 'auto-travel',
  stems: AUTO_TRAVEL_STEMS,
}), createBrandCollection({
  id: 'retail-entertainment',
  labelKey: 'svgCollectionRetailEntertainment',
  directory: 'retail-entertainment',
  stems: RETAIL_ENTERTAINMENT_STEMS,
}), createSvgCollection({
  id: 'google-2026',
  labelKey: 'svgCollectionGoogle2026',
  directory: GOOGLE_2026_DIRECTORY,
  files: GOOGLE_2026_FILES,
}), mergedAnimationCollection, ...standaloneAnimationCollections]
