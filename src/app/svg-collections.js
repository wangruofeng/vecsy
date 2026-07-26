const SVG_REPO_COMPANY_LOGOS = [
  ['Digg', 494332], ['Deviantart', 494333], ['Blogger', 494334], ['Dribbble', 494335], ['Apple', 494336], ['Behance', 494337], ['Flickr', 494338], ['Ebay', 494339], ['Dropbox', 494340], ['Facebook', 494341], ['Forrst', 494342], ['Github', 494343], ['Instagram', 494344], ['Gplus', 494345], ['Lastfm', 494346], ['Gdrive', 494347], ['Picasa', 494348], ['Linkedin', 494349], ['Pinterest', 494350], ['Skype', 494351], ['Reddit', 494352], ['Rss', 494353], ['Stumbleupon', 494354], ['Soundcloud', 494355], ['Tumblr', 494356], ['Vimeo', 494357], ['Vine', 494358], ['Twitter', 494359], ['Wordpress', 494360], ['Yahoo', 494361], ['Amazon', 494362], ['Android', 494363], ['Windows', 494364], ['Youtube', 494365],
]

const ICONIFY_LOGO_NAMES = {
  Gplus: 'fa6-brands:google-plus-g', Lastfm: 'fa6-brands:lastfm', Gdrive: 'simple-icons:googledrive', Picasa: 'logos:picasa', Stumbleupon: 'fa6-brands:stumbleupon', Vine: 'fa6-brands:vine',
}

const INLINE_LOGOS = {
  Forrst: '<svg viewBox="-287 273 224.2 256" xmlns="http://www.w3.org/2000/svg"><path d="M-63.3 520.7-169.3 276.5a5.9 5.9 0 0 0-10.8 0l-106.4 244.2a6 6 0 0 0 5.4 8.3h94.4v-52l-25.3-17.5 4.2-6 21.1 14.6v-41.6h24v27.3l22-11.1 3.3 6.5-25.3 12.8v20.1l40.4-20.4 3.3 6.5-43.7 22v38.5h94a6 6 0 0 0 5.4-8.3Z"/></svg>',
}

function getEditableUrl(name) {
  const icon = ICONIFY_LOGO_NAMES[name] || `simple-icons:${name.toLowerCase()}`
  return `https://api.iconify.design/${icon.replace(':', '/')}.svg`
}

export const SVG_COLLECTIONS = [{
  id: 'company-logos',
  labelKey: 'svgCollectionCompanyLogos',
  sourceUrl: 'https://www.svgrepo.com/collection/company-logo-icons/',
  items: SVG_REPO_COMPANY_LOGOS.map(([name, id]) => ({
    id: `company-logo-${name.toLowerCase()}`,
    name,
    url: `https://www.svgrepo.com/show/${id}/${name.toLowerCase()}.svg`,
    editableUrl: getEditableUrl(name),
    inlineSvgMarkup: INLINE_LOGOS[name],
  })),
}]
