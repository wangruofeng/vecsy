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

function getCollectionAssetUrl(directory, file) {
  return `${import.meta.env.BASE_URL}svg-collections/${directory}/${file}`
}

function createAnimationCollection({ id, labelKey, directory, files }) {
  return {
    id,
    labelKey,
    items: files.map((file) => {
      const url = getCollectionAssetUrl(directory, file)
      return { id: `${id}-${file.replace(/\.svg$/, '')}`, name: animationName(file), url, editableUrl: url, preserveAppearance: true }
    }),
  }
}

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
}, ...ANIMATION_COLLECTIONS.map(createAnimationCollection)]
