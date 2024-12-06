// Settings
// browser.storage.sync.clear()
// console.log('Storage cleared.')
let settings = {}
const defaults = {
  alwaysOpen: true,
  openInNewTab: true,
  pdsFallback: true,
  pdslsOpensApi: true,
  alwaysApi: false,
  getPostThread: false,
  keybinding: "Ctrl+Shift+1",
  replyCount: 0,
  parentCount: 0
}

async function loadSettings() {
  try {
    const data = await browser.storage.sync.get()
    console.log('Data retrieved from storage:', data)
    settings = { ...defaults, ...data }
    console.log('Loaded settings:', settings)
    updateKeybinding()
  } catch (error) {
    console.error('Error retrieving settings:', error)
    return null
  }
}
loadSettings()

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" changed from`, oldValue, 'to', newValue)
    settings[key] = newValue
    if (key === "keybinding") {
      updateKeybinding()
    }
  }
})

function updateKeybinding() {
  const keybinding = settings.keybinding || defaults.keybinding
  browser.commands.update({
    name: "pdsls-tab",
    shortcut: keybinding
  })
}

// Create context menu
browser.contextMenus.create({
  id: "PDSls",
  title: "PDSls",
  contexts: ["page", "selection", "bookmark", "link"]
})

// Extension Icon
browser.browserAction.onClicked.addListener(() => {
  console.log("Entry point: extension icon")
  openNewTab()
})

// Context Menu
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Entry point: contextMenuListener")
  if (info.menuItemId !== "PDSls") { return true }
  let url
  if (info.bookmarkId) {
    console.log("URL type: bookmark")
    const bookmarks = await browser.bookmarks.get(info.bookmarkId)
    if (bookmarks.length > 0) {
      url = bookmarks[0].url
    }
  } else {
    console.log("URL type: link or page")
    url = info.linkUrl ? info.linkUrl : info.pageUrl
  }
  if (!url) {
    return
  }
  openNewTab(url)
})

// Keybinding
browser.commands.onCommand.addListener((command) => {
  console.log("Entry point: keybinding")
  if (command === "pdsls-tab") { openNewTab() }
})

// API functions
async function getDid(handle) {
  if (handle.startsWith("did:")) return handle
  if (handle.startsWith("@")) handle = handle.slice(1)
  if (!handle) {
    console.error(`Error: invalid handle '${handle}'`)
    return null
  }
  try {
    did = await resolveHandle(handle)
    if (!did) {
      console.error(`Error retrieving DID '${did}'`)
      return null
    }
  } catch (err) {
    console.error(`Error retrieving DID '${did}':`, err)
    return null
  }
  return did
}

async function resolveHandle(handle) {
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=` +
      handle,
    )
    return res.json().then((json) => json.did)
  } catch (err) {
    console.error(`Error resolving handle '${handle}':`, err)
    return null
  }
}

async function getDidDoc(did) {
  let res
  try {
    if (did.startsWith("did:web:")) {
      console.log("Fetching did:web did doc")
      res = await fetch(`https://${did.slice(8)}/.well-known/did.json`)
    } else {
      console.log("Fetching did:plc did doc")
      res = await fetch(`https://plc.directory/${did}`)
    }

    if (!res.ok) {
      console.error(`Failed to fetch did doc for '${did}'. Status: ${res.status}`)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Error fetching did doc:", err)
    return null
  }
}

async function getServiceEndpoint(did) {
  try {
    didDoc = await getDidDoc(did)
    if (didDoc && didDoc.service) {
      for (let service of didDoc.service) {
        if (service.type === 'AtprotoPersonalDataServer') {
          let endpoint = service.serviceEndpoint
          console.log(`Endpoint found: ${endpoint}`)
          return endpoint
        }
      }
    }
    console.error("No service endpoint found.")
    return null
  } catch (err) {
    console.error("Error fetching service endpoint:", err)
    return null
  }
}

async function listRecords(did, service, nsid, limit, cursor) {
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: nsid,
      limit: limit,
      cursor: cursor,
    })

    const response = await fetch(`${service}/xrpc/com.atproto.repo.listRecords?${params.toString()}`, {
      method: 'GET'
    })
    return response.json()
  }
  catch {
    console.error("Error listing records:", err)
    return null
  }
}

async function getWhiteWindUri(did, service, title) {
  const nsid = "com.whtwnd.blog.entry"
  const limit = 100
  let cursor = undefined
  const decodedTitle = decodeURIComponent(title)

  while (true) {
    const data = await listRecords(did, service, nsid, limit, cursor)
    if (!data) break
    const records = data.records

    if (records && records.length > 0) {
      for (let record of records) {
        if (record.value && record.value.title === decodedTitle) {
          return record.uri
        }
      }
    } else {
      break
    }

    cursor = data.cursor
    if (!cursor) {
      break
    }
  }
  console.error(`No WhiteWind blog URI found for title '${decodedTitle}'`)
  return null
}

// Supported site classes
class Patterns {
  static pdsls = /^https:\/\/pdsls\.dev\/(?<pds>[\w.:%-]+)(?:\/(?<handle>[\w.:%-]+))?(?:\/(?<nsid>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static bsky = new RegExp(
    '^https://' +
    '(?:bsky\\.app|main\\.bsky\\.dev|langit\\.pages\\.dev/u/[\\w.:%-]+|tokimekibluesky\\.vercel\\.app)' +
    '/(?<prefix>profile|starter-pack)' +
    '/(?<handle>[\\w.:%-]+)' +
    '(?:/(?<suffix>post|lists|feed))?' +
    '/?(?<rkey>[\\w.:%-]+)?' +
    '(?:/[\\w.:%-]+)?' +
    '(?:[?#].*)?$'
  );
  static aglais = /^https:\/\/aglais\.pages\.dev\/(?<handle>[\w.:%-]+)(?:\/(?<seg2>[\w.:%-]+))?(?:\/(?<seg3>[\w.:%-]+))?(?:[?#].*)?$/
  static ouranos = /^https:\/\/useouranos\.app\/dashboard\/(?:user|feeds)\/(?<handle>[\w.:%-]+)(?:\/(?:[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:\?(?:uri=(?:at:\/\/|at%3A%2F%2F)(?<uri>[\w.:%/-]+)))?$/
  static klearsky = /^https:\/\/klearsky\.pages\.dev\/#\/(?:([^/?]+)\/)?(?<type>[^/?]+)?(?:\?(?:[\w.-]+=(?:at:\/\/|at%3A%2F%2F)(?<uri>[\w.:%/-]+)|account=(?<account>[\w.:/-]+)))?(?:&.*)?$/
  static whtwnd = /^https:\/\/whtwnd\.com\/(?<handle>[\w.:%-]+)(?:\/entries\/(?<title>[\w.,':%-]+)(?:\?rkey=(?<rkey>[\w.:%-]+))?|(?:\/(?<postId>[\w.:%-]+)))?(?:[?#][\w.:%-]+)?$/
  static frontpage = /^https:\/\/frontpage\.fyi\/(?<prefix>profile|post)\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:\/(?<handle2>[\w.:%-]+))?(?:\/(?<rkey2>[\w.:%-]+))?(?:[?#].*)?$/
  static skylights = /^https:\/\/skylights\.my\/profile\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
  static pinksea = /^https:\/\/pinksea\.art\/(?<handle>[\w.:%-]+)(?:\/(?<suffix>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static atBrowser = /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[\w.:%-]+)(?:\/(?<rest>[^?]*))?(?:[?#].*)?$/
  static clearSky = /^https:\/\/clearsky\.app\/(?<handle>[\w.:%-]+)(?:\/(?<type>[\w.:%-]+))?(?:[?#].*)?$/
  static blueViewer = /^https:\/\/blueviewer\.pages\.dev\/view\?actor=(?<handle>[\w.:%-]+)&rkey=(?<rkey>[\w.:%-]+)$/
  static skythread = /^https:\/\/blue\.mackuba\.eu\/skythread\/\?author=(?<handle>[\w.:%-]+)&post=(?<rkey>[\w.:%-]+)$/
  static skyview = /https:\/\/skyview\.social\/\?url=(?<url>[^&]+)/
  static smokeSignal = /^https:\/\/smokesignal\.events\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static camp = /^https:\/\/atproto\.camp\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static blueBadge = /^https:\/\/badge\.blue\/verify\?uri=(?:at:\/\/|at%3A%2F%2F)(?<uri>.+)$/
  static linkAt = /^https:\/\/linkat\.blue\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
  static internect = /^https:\/\/internect\.info\/did\/(?<did>[\w.:%-]+)(?:[?#].*)?$/
  static bskyCDN = /^https:\/\/cdn\.bsky\.app\/(?:[\w.:%-]+\/){3}(?<did>[\w.:%-]+)(?:\/[\w.:%-@]+)?$/
  static bskyVidCDN = /^https:\/\/video\.bsky\.app\/[\w.:%-]+\/(?<did>[\w.:%-]+)(?:\/[\w.:%-@]+)?$/
  static xrpc = /^https:\/\/(?<domain>[^\/]+)\/xrpc\/(?<api>[\w.:%-]+)(?<params>\?.*)?$/
  static pds = /^https:\/\/(?<domain>[^\/]+)/
}

class Handlers {
  static pdsls = async ({ pds, handle, nsid, rkey }, noEarlyQuit = false) => {
    console.log(`PDSls handler recieved: ` + pds, handle, nsid, rkey, noEarlyQuit)
    if (!settings.pdslsOpensApi && !noEarlyQuit) return null
    if (pds !== "at") return `https://${pds}/xrpc/com.atproto.sync.listRepos?limit=1000`
    const did = await getDid(handle)
    if (!did) return null
    const service = await getServiceEndpoint(did)
    if (!service) return null
    if (!nsid) {
      return `${service}/xrpc/com.atproto.repo.describeRepo?repo=${did}`
    } else if (nsid === "blobs") {
      return `${service}/xrpc/com.atproto.sync.listBlobs?did=${did}&limit=1000`
    } else if (!rkey) {
      return `${service}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=${nsid}&limit=100`
    } else {
      return `${service}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=${nsid}&rkey=${rkey}`
    }
  }
  static bsky = async ({ prefix, handle, suffix, rkey }) => {
    const did = await getDid(handle)
    if (!did) return null

    if (prefix === "starter-pack" && rkey) {
      return `https://pdsls.dev/at/${did}/app.bsky.graph.starterpack/${rkey}`
    }

    if (!rkey) return `https://pdsls.dev/at/${did}`
    if (prefix !== "profile") return null

    switch (suffix) {
      case "post":
        const postUri = `${did}/app.bsky.feed.post/${rkey}`
        if (settings.getPostThread) {
          const depth = settings.replyCount
          const parents = settings.parentCount
          return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
        }
        return `https://pdsls.dev/at/${postUri}`
      case "feed":
        return `https://pdsls.dev/at/${did}/app.bsky.feed.generator/${rkey}`
      case "lists":
        return `https://pdsls.dev/at/${did}/app.bsky.graph.list/${rkey}`
      default:
        return null
    }
  }
  static aglais = async ({ handle, seg2, seg3 }) => {
    const did = await getDid(handle)
    if (!did) return null
    if (seg2 === 'curation-lists') return seg3 ? `https://pdsls.dev/at/${did}/app.bsky.graph.list/${seg3}` : `https://pdsls.dev/at/${did}`
    const rkey = seg2 || null
    if (!rkey) return `https://pdsls.dev/at/${did}`
    const postUri = `${did}/app.bsky.feed.post/${rkey}`
    if (settings.getPostThread) {
      const depth = settings.replyCount
      const parents = settings.parentCount
      return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
    }
    return `https://pdsls.dev/at/${postUri}`
  }
  static ouranos = async ({ handle, rkey, uri }) => {
    if (uri) {
      uri = decodeURIComponent(uri)
      return `https://pdsls.dev/at/${uri}`
    }
    const did = await getDid(handle)
    if (!did) return null
    return rkey ? `https://pdsls.dev/at/${did}/app.bsky.feed.post/${rkey}` : `https://pdsls.dev/at/${did}`
  }
  static klearsky = async ({ type, uri, account }) => {
    if (uri) {
      if (settings.getPostThread && type === "post") {
        const depth = settings.replyCount
        const parents = settings.parentCount
        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=${depth}&parentHeight=${parents}`
      }
      return `https://pdsls.dev/at/${uri}`
    }
    const did = await getDid(account)
    if (!did) return null
    if (type === "starterPacks") return `https://pdsls.dev/at/${did}/app.bsky.graph.starterpack`
    else if (type === "feed-generators") return `https://pdsls.dev/at/${did}/app.bsky.feed.generator`
    else if (type === "list") return `https://pdsls.dev/at/${did}/app.bsky.graph.list`
    else return `https://pdsls.dev/at/${did}`
  }
  static whtwnd = async ({ handle, title, rkey, postId }) => {
    console.log(`whtwnd handler recieved: ` + handle, title, rkey, postId)
    const did = await getDid(handle)
    if (!did) return null

    if (rkey || postId) {
      return `https://pdsls.dev/at/${did}/com.whtwnd.blog.entry/${rkey || postId}`
    }

    if (title) {
      const service = await getServiceEndpoint(did)
      let uri = service ? await getWhiteWindUri(did, service, title) : null
      return uri
        ? `https://pdsls.dev/at/${uri.replace("at://", "")}`
        : `https://pdsls.dev/at/${did}/com.whtwnd.blog.entry`
    }

    return `https://pdsls.dev/at/${did}/com.whtwnd.blog.entry`
  }
  static frontpage = async ({ prefix, handle, rkey, handle2, rkey2 }) => {
    let did
    switch (prefix) {
      case 'post':
        if (handle2 && rkey2) {
          const did2 = await getDid(handle2)
          if (did2) return `https://pdsls.dev/at/${did2}/fyi.unravel.frontpage.comment/${rkey2}`
        }
        did = await getDid(handle)
        if (!did) return null
        return rkey ? `https://pdsls.dev/at/${did}/fyi.unravel.frontpage.post/${rkey}` : null
      case 'profile':
        did = await getDid(handle)
        if (!did) return null
        return `https://pdsls.dev/at/${did}/fyi.unravel.frontpage.post`
      default:
        return null
    }
  }
  static skylights = async ({ handle }) => {
    const did = await getDid(handle)
    return did ? `https://pdsls.dev/at/${did}/my.skylights.rel` : null
  }
  static pinksea = async ({ handle, suffix, rkey }) => {
    const did = await getDid(handle)
    if (!did) return null
    return rkey ? `https://pdsls.dev/at/${did}/com.shinolabs.pinksea.oekaki/${rkey}` : `https://pdsls.dev/at/${did}/com.shinolabs.pinksea.oekaki`
  }
  static atBrowser = async ({ handle, rest }) => {
    const did = await getDid(handle)
    return did ? `https://pdsls.dev/at/${did}/${rest || ""}` : null
  }
  static clearSky = async ({ handle, type }) => {
    const did = await getDid(handle)
    if (!did) return null
    const typeSuffix =
      type === "history"
        ? "app.bsky.feed.post"
        : type === "blocking"
          ? "app.bsky.graph.block"
          : ""
    return `https://pdsls.dev/at/${did}/${typeSuffix}`
  }
  static blueViewer = async ({ handle, rkey }) => {
    const did = await getDid(handle)
    if (!(did && rkey)) return null
    return `https://pdsls.dev/at/${did}/app.bsky.feed.post/${rkey}`
  }
  static skythread = async ({ handle, rkey }) => {
    const did = await getDid(handle)
    if (!(did && rkey)) return null
    return `https://pdsls.dev/at/${did}/app.bsky.feed.post/${rkey}`
  }
  static skyview = async ({ url }) => {
    const match = decodeURIComponent(url).match(Patterns.bsky)
    if (!match) return null
    console.log(`Passing to bsky handler`)
    return await Handlers.bsky(match.groups)
  }
  static smokeSignal = async ({ handle, rkey }) => {
    const did = await getDid(handle)
    return did
      ? `https://pdsls.dev/at/${did}${rkey
        ? `/events.smokesignal.calendar.event/${rkey}`
        : "/events.smokesignal.app.profile/self"}`
      : null
  }
  static camp = async ({ handle, rkey }) => {
    const did = await getDid(handle)
    return did ? `https://pdsls.dev/at/${did}/blue.badge.collection/${rkey || ""}` : null
  }
  static blueBadge = async ({ uri }) => {
    return `https://pdsls.dev/at/${decodeURIComponent(uri)}`
  }
  static linkAt = async ({ handle }) => {
    const did = await getDid(handle)
    return did ? `https://pdsls.dev/at/${did}/blue.linkat.board/self` : null
  }
  static internect = async ({ did }) => {
    return `https://pdsls.dev/at/${did}`
  }
  static bskyCDN = async ({ did }) => {
    return `https://pdsls.dev/at/${did}/blobs`
  }
  static bskyVidCDN = async ({ did }) => {
    return `https://pdsls.dev/at/${decodeURIComponent(did)}/blobs`
  }
  static xrpc = async ({ domain, api, params }) => {
    params = Object.fromEntries(new URLSearchParams(params))
    const did = await getDid(params.repo || params.did)
    const nsid = params.collection
    const rkey = params.rkey
    if (!did) return domain ? `https://pdsls.dev/${domain}` : null
    if (api === "com.atproto.sync.listBlobs") return `https://pdsls.dev/at/${did}/blobs`
    return `https://pdsls.dev/at/${did}${nsid ? '/' + nsid : ''}${(nsid && rkey) ? '/' + rkey : ''}`
  }
  static pds = async ({ domain }) => {
    if (!settings.pdsFallback) {
      console.warn("PDS fallback matching is set to false. No match found.")
      return null
    }
    return `https://pdsls.dev/${domain}`
  }
}

// Loop over supported patterns and return processed URL
async function checkPatterns(url) {
  if (!url) return null
  for (const [key, regex] of Object.entries(Patterns)) {
    const match = url.match(regex)
    if (match) {
      console.log(`Match: ${key}`)
      return await Handlers[key](match.groups)
    }
  }
  console.error("No match found: Invalid website")
  return null
}

// Validate a returned pattern
async function validateUrl(url) {
  console.log(`Validate URL received: ${url}`)
  if (settings.alwaysApi && url) {
    const match = decodeURIComponent(url).match(Patterns.pdsls)
    if (match) {
      console.log(`Converting to raw API request...`)
      url = await Handlers.pdsls(match.groups, noEarlyQuit = true)
    }
  }
  if (!url) {
    if (!settings.alwaysOpen) {
      console.warn(`Unsupported input. Not redirecting due to user preferences.`)
    } else {
      console.log(`Unsupported input. Defaulting to pdsls.dev`)
      url = `https://pdsls.dev`
    }
  }
  return url
}

// Open a provided URL or the current page URL, after processing
async function openNewTab(url) {
  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    url = tabs[0]?.url
  }
  if (!url) { console.error("Error: No URL"); return }

  let newUrl = await validateUrl(await checkPatterns(url))

  if (newUrl) {
    await settings.openInNewTab
      ? browser.tabs.create({ url: newUrl })
      : browser.tabs.update({ url: newUrl })
    console.log(`URL opened: ${newUrl}`)
  }
}