// Settings
// browser.storage.sync.clear()
// console.log('Storage cleared.')
let settings = {}
const defaults = {
  alwaysOpen: true,
  openInNewTab: true,
  pdsFallback: true,
  pdslsOpensApi: false,
  alwaysApi: false,
  getPostThread: false,
  keybinding: "Ctrl+Shift+1",
  copyUriEnabled: false,
  copyUriKeybind: "Ctrl+Shift+2",
  jetstreamEnabled: false,
  replyCount: 0,
  parentCount: 0
}

async function loadSettings() {
  try {
    const data = await browser.storage.sync.get()
    console.log('Data retrieved from storage:', data)
    settings = { ...defaults, ...data }
    console.log('Loaded settings:', settings)
    updateKeybindings()
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
  }
  buildMenus()
  updateKeybindings()
})

function updateKeybindings() {
  const keybinding = settings.keybinding || defaults.keybinding
  console.log(`Keybinding for "pdsls-tab" is now`, keybinding)
  browser.commands.update({
    name: "pdsls-tab",
    shortcut: keybinding
  })
  const copyUriKeybind = (settings.copyUriEnabled || defaults.copyUriEnabled)
    ? (settings.copyUriKeybind || defaults.copyUriKeybind)
    : ""
  console.log(`Keybinding for "at-uri-copy" is now`, copyUriKeybind)
  browser.commands.update({
    name: "at-uri-copy",
    shortcut: copyUriKeybind
  })
}

// Create context menu
async function buildMenus() {
  await browser.contextMenus.removeAll()
  await browser.contextMenus.create({
    id: "PDSls",
    title: "PDSls",
    contexts: ["page", "selection", "bookmark", "link"]
  })
  if (settings.copyUriEnabled) {
    await browser.contextMenus.create({
      id: "copyATUri",
      title: "Copy AT-URI",
      contexts: ["page", "selection", "bookmark", "link"]
    })
  }
  if (settings.jetstreamEnabled) {
    await browser.contextMenus.create({
      id: "Jetstream",
      title: "Jetstream",
      contexts: ["page", "selection", "bookmark", "link"]
    })
  }
}
buildMenus()

// Extension Icon
browser.browserAction.onClicked.addListener(() => {
  console.log("Entry point: extension icon")
  openNewTab()
})

// Context Menu
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log(`Entry point: ${info.menuItemId} contextMenuListener`)
  if (info.menuItemId !== "PDSls" && info.menuItemId !== "copyATUri" && info.menuItemId !== "Jetstream") { return true }
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
  switch (info.menuItemId) {
    case "PDSls":
      openNewTab(url)
    case "copyATUri":
      copyAtUri(url)
    case "Jetstream":
      openJetstream(url)
  }
})

// Keybinding
browser.commands.onCommand.addListener((command) => {
  console.log(`Entry point: ${command} keybinding`)
  if (command === "pdsls-tab") { openNewTab() }
  if (command === "at-uri-copy") {
    if (settings.copyUriEnabled || defaults.copyUriEnabled) {
      copyAtUri()
    } else {
      console.log(`Copying AT-URI disabled - configure in settings.`)
    }
  }
})

// API functions
async function getHandle(did) {
  if (!did.startsWith("did:")) return null
  return (await getDidDoc(did))?.alsoKnownAs?.[0]?.replace(/^at:\/\//, "");
}

async function getDid(handle) {
  if (!handle) {
    console.error(`Error: invalid handle '${handle}'`)
    return null
  }
  if (handle.startsWith("did:")) return handle
  if (handle.startsWith("@")) handle = handle.slice(1)
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

async function getRecord(did, nsid, rkey, service) {
  if (!service) {
    service = await getServiceEndpoint(did)
    if (!service) return null
  }
  
  try {
    const params = new URLSearchParams({
      repo: did,
      collection: nsid,
      rkey: rkey
    })

    const response = await fetch(`${service}/xrpc/com.atproto.repo.getRecord?${params.toString()}`, {
      method: 'GET'
    })
    return response.json()
  }
  catch {
    console.error("Error getting record:", err)
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

function decomposeUri(uri) {
  const [did = undefined, nsid = undefined, rkey = undefined] = uri.replace("at://", "").split("/")
  return { did, nsid, rkey }
}

// Supported lexicons
class Lexicons {
  static bsky = /^app\.bsky/
  static pinboards = /^xyz.jeroba.tags/
  static whtwnd = /^com\.whtwnd/
  static frontpage = /^fyi\.unravel\.frontpage/
  static skylights = /^my\.skylights/
  static pinksea = /^com\.shinolabs\.pinksea/
  static smokeSignal = /^events\.smokesignal/
  static blueBadge = /^blue\.badge/
  static linkAt = /^blue\.linkat/
  static recipeExchange = /^exchange.recipe/
  static bluePlace = /^blue\.place/
  static plonk = /^li\.plonk/
  static pastesphere = /^link\.pastesphere/
  static bookhive = /^buzz\.bookhive/
}

// Convert URI data to primary site link
class Resolvers {
  static bsky = async ({ did, nsid, rkey }) => {
    console.log(`bsky resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://bsky.app` : null
    if (!rkey) return `https://bsky.app/profile/${did}`
    switch (nsid) {
      case "app.bsky.feed.post":
        return `https://bsky.app/profile/${did}/post/${rkey}`
      case "app.bsky.feed.generator":
        return `https://bsky.app/profile/${did}/feed/${rkey}`
      case "app.bsky.graph.list":
        return `https://bsky.app/profile/${did}/lists/${rkey}`
      case "app.bsky.graph.starterpack":
        return `https://bsky.app/starter-pack/${did}/${rkey}`
      // case "app.bsky.actor.profile":
      //   return `https://bsky.app/profile/${did}`
      default:
        return `https://bsky.app/profile/${did}`
    }
  }
  static pinboards = async ({ did, nsid, rkey }) => {
    console.log(`pinboards resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://pinboards.jeroba.xyz` : null
    if (!rkey) return settings.alwaysOpen ? `https://pinboards.jeroba.xyz` : null // no profile page for now
    if (nsid === `xyz.jeroba.tags.tag`) {
      return `https://pinboards.jeroba.xyz/profile/${did}/board/${rkey}` 
    }
    return null
  }
  static whtwnd = async ({ did, nsid, rkey }) => {
    console.log(`whtwnd resolver received: ` + did, nsid, rkey)
    // there is only collection for now, but i do this to stay safe
    if (!did) return settings.alwaysOpen ? `https://whtwnd.com` : null
    if (rkey && nsid === "com.whtwnd.blog.entry") {
      return `https://whtwnd.com/${did}/entries/${rkey}`
    }
    return `https://whtwnd.com/${did}`
  }
  static frontpage = async ({ did, nsid, rkey, parentDid, parentRkey }) => {
    console.log(`frontpage resolver received: ` + did, nsid, rkey, parentDid, parentRkey)
    if (!did) return settings.alwaysOpen ? `https://frontpage.fyi` : null
    if (!rkey) return `https://frontpage.fyi/profile/${did}`
    switch (nsid) {
      case "fyi.unravel.frontpage.post":
        return `https://frontpage.fyi/post/${did}/${rkey}`
      case "fyi.unravel.frontpage.comment":
        if (parentDid && parentRkey) {
          return `https://frontpage.fyi/post/${parentDid}/${parentRkey}/${did}/${rkey}`
        }
        const service = await getServiceEndpoint(did)
        if (!service) return settings.alwaysOpen ? `https://frontpage.fyi` : null
  
        const uri = (await getRecord(did, nsid, rkey, service)).value?.post?.uri
        if (!uri) return `https://frontpage.fyi/profile/${did}` // return null?

        let parentNsid
        ({ did: parentDid, nsid: parentNsid, rkey: parentRkey } = decomposeUri(uri))
        return `https://frontpage.fyi/post/${parentDid}/${parentRkey}/${did}/${rkey}`
      default:
        return `https://frontpage.fyi/profile/${did}`
    }
  }
  static skylights = async ({ did, nsid, rkey }) => {
    console.log(`skylights resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://skylights.my` : null
    // there is currently no skylights record page, only the profile
    return `https://skylights.my/profile/${did}`
  }
  static pinksea = async ({ did, nsid, rkey, parentDid, parentRkey }) => {
    console.log(`pinkSea resolver received: ` + did, nsid, rkey, parentDid, parentRkey)
    if (!did) return settings.alwaysOpen ? `https://pinksea.art` : null
    if (!rkey || nsid !== "com.shinolabs.pinksea.oekaki") {
      return `https://pinksea.art/${did}`
    } else if (parentDid && parentRkey) {
      return `https://pinksea.art/${did}/oekaki/${rkey}#${parentDid}-${parentRkey}`
    }

    const service = await getServiceEndpoint(did)
    if (!service) return settings.alwaysOpen ? `https://pinksea.art` : null

    const uri = (await getRecord(did, nsid, rkey, service)).value?.inResponseTo?.uri
    if (!uri) return `https://pinksea.art/${did}/oekaki/${rkey}`

    let parentNsid // i hate that i have to define this.
    ({ did: parentDid, nsid: parentNsid, rkey: parentRkey } = decomposeUri(uri))

    return `https://pinksea.art/${parentDid}/oekaki/${parentRkey}#${did}-${rkey}`

  }
  static smokeSignal = async ({ did, nsid, rkey }) => {
    console.log(`smokeSignal resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://smokesignal.events` : null
    if (!rkey || nsid !== "events.smokesignal.calendar.event") {
      return `https://smokesignal.events/${did}`
    }
    return `https://smokesignal.events/${did}/${rkey}`
    // maybe events.smokesignal.calendar.rsvp should go the subject url
  }
  static blueBadge = async ({ did, nsid, rkey }) => {
    console.log(`blueBadge resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://atproto.camp` : null
    // there is only collection for now, but i do this to stay safe
    if (!rkey || nsid !== "blue.badge.collection") {
      return `https://atproto.camp/${did}`
    }
    return `https://atproto.camp/${did}/${rkey}`
  }
  static linkAt = async ({ did, nsid, rkey }) => {
    console.log(`linkAt resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? `https://linkat.blue` : null
    return `https://linkat.blue/${did}`
  }
  static recipeExchange = async ({ did, nsid, rkey }) => {
    console.log(`recipeExchange resolver received: ` + did, nsid, rkey)
    if (rkey && (nsid === "exchange.recipe.recipe")) return `https://recipe.exchange/recipes/${rkey}`
    if (rkey && (nsid === "exchange.recipe.collection")) return `https://recipe.exchange/collections/${rkey}`
    if (!did) return settings.alwaysOpen ? `https://recipe.exchange` : null
    if (rkey && (nsid === "exchange.recipe.comment")) {
      const service = await getServiceEndpoint(did)
      if (!service) return settings.alwaysOpen ? `https://recipe.exchange` : null
      const uri = (await getRecord(did, nsid, rkey, service)).value?.recipe?.uri
      if (!uri) {
        if (settings.alwaysOpen) {
          let handle = await getHandle(did)
          return handle ? `https://recipe.exchange/profiles/${handle}` : `https://recipe.exchange`
        }
        return null
      }
      console.log(`Recipe URI: ${uri}`)
      let { did: did2, nsid: nsid2, rkey: rkey2 } = decomposeUri(uri)
      console.log(`URI decomposed:`, did2, nsid2, rkey2)
      if (rkey2 && (nsid2 === "exchange.recipe.recipe")) return `https://recipe.exchange/recipes/${rkey2}`
      if (did2) {
        let handle = await getHandle(did2)
        if (handle) return `https://recipe.exchange/profiles/${handle}`
      }
      return settings.alwaysOpen ? `https://recipe.exchange` : null
    }
    let handle = await getHandle(did)
    if (handle) return `https://recipe.exchange/profiles/${handle}`
    return settings.alwaysOpen ? `https://recipe.exchange` : null
  }
  static bluePlace = async ({ did, nsid, rkey }) => {
    console.log(`bluePlace resolver received: ` + did, nsid, rkey)
    return "https://place.blue"
  }
  static plonk = async ({ did, nsid, rkey }) => {
    console.log(`plonk resolver received: ` + did, nsid, rkey)
    // best you can do is link to the profile
    if (!did) return settings.alwaysOpen ? "https://plonk.li" : null
    return `https://plonk.li/u/${did}`
  }
  static pastesphere = async ({ did, nsid, rkey }) => {
    console.log(`plonk resolver received: ` + did, nsid, rkey)
    if (!did) return settings.alwaysOpen ? "https://pastesphere.link" : null
    if (rkey && (nsid === "link.pastesphere.snippet")) {
      return `https://pastesphere.link/user/${did}/snippet/${rkey}`
    }
    return `https://pastesphere.link/user/${did}`
  }
  static bookhive = async ({ did, nsid, rkey }) => {
    if (!did) return settings.alwaysOpen ? "https://bookhive.buzz" : null
    return `https://bookhive.buzz/profile/${did}`
  }
  static xrpc = async ({ did, nsid, rkey, service, pds }) => {
    console.log(`xrpc resolver received: ` + did, nsid, rkey, service, pds)
    if (pds && pds !== "at") return `https://${pds}/xrpc/com.atproto.sync.listRepos?limit=1000`
    if (!did) return null
    if (!service) {
      service = await getServiceEndpoint(did)
      if (!service) return null
    }
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
}

// Supported site classes
class Patterns {
  // (?<handle>[\w.:%-]+) https://atproto.com/specs/handle https://atproto.com/specs/did
  // (?<rkey>[A-Za-z0-9._~:-]{1,512}) https://atproto.com/specs/record-key
  static pdsls = /^https:\/\/pdsls\.dev\/(?<pds>[\w.%-]+)(?:\:\/)?(?:\/(?<handle>[\w.:%-]+))?(?:\/(?<nsid>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:\/)?(?:[?#].*)?$/
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
  static skychat = /^https:\/\/skychat\.social\/(?:\#(?<type>[^/?]+))(?:\/(?<handle>[\w.:%-]+))(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static pinboards = /^https:\/\/pinboards\.jeroba\.xyz\/profile\/(?<handle>[\w.:%-]+)\/(?<type>[^/?]+)\/(?<rkey>[\w.:%-]+)(?:[?#].*)?$/
  static whtwnd = /^https:\/\/whtwnd\.com\/(?<handle>[\w.:%-]+)(?:\/entries\/(?<title>[\w.,':%-]+)(?:\?rkey=(?<rkey>[\w.:%-]+))?|(?:\/(?<postId>[\w.:%-]+)(?:\/[\w.:%-]+)?))?(?:[?#][\w.:%-]+)?$/
  static frontpage = /^https:\/\/frontpage\.fyi\/(?<prefix>profile|post)\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:\/(?<handle2>[\w.:%-]+))?(?:\/(?<rkey2>[\w.:%-]+))?(?:[?#].*)?$/
  static skylights = /^https:\/\/skylights\.my\/profile\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
  static pinksea = /^https:\/\/pinksea\.art\/(?<handle>[\w.:%-]+)(?:\/(?<suffix>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:#(?<handle2>[\w.:%-]+)-(?<rkey2>[\w.:%-]+))?(?:[?#].*)?$/
  static atBrowser = /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[\w.:%-]+)(?:\/(?<rest>[^?]*))?(?:[?#].*)?$/
  static atpTools = /^https:\/\/atp\.tools(?:\/at:\/(?:(?<handle>[\w.:%-]+)(?:\/(?<nsid>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+)?)?)?)?)?(?:[?#].*)?$/
  static clearSky = /^https:\/\/clearsky\.app\/(?<handle>[\w.:%-]+)(?:\/(?<type>[\w.:%-]+))?(?:[?#].*)?$/
  static blueViewer = /^https:\/\/blueviewer\.pages\.dev\/view\?actor=(?<handle>[\w.:%-]+)&rkey=(?<rkey>[\w.:%-]+)$/
  static skythread = /^https:\/\/blue\.mackuba\.eu\/skythread\/\?author=(?<handle>[\w.:%-]+)&post=(?<rkey>[\w.:%-]+)$/
  static skyview = /https:\/\/skyview\.social\/\?url=(?<url>[^&]+)/
  static smokeSignal = /^https:\/\/smokesignal\.events\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static camp = /^https:\/\/atproto\.camp\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
  static blueBadge = /^https:\/\/badge\.blue\/verify\?uri=(?:at:\/\/|at%3A%2F%2F)(?<uri>.+)$/
  static linkAt = /^https:\/\/linkat\.blue\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
  static internect = /^https:\/\/internect\.info\/did\/(?<did>[\w.:%-]+)(?:[?#].*)?$/
  static recipeExchange = /^https:\/\/recipe\.exchange(?:\/(?<type>[\w.:%-]+))(?:\/(?<value>[\w.:%-]+))?$/
  static plonk = /^https:\/\/plonk.li\/u\/(?<did>[\w.:%-]+)/
  static pastesphere = /^https:\/\/pastesphere\.link\/user(?:\/(?<handle>[\w.:%-]+))?(?:\/(?<type>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?/
  static bookhive = /^https:\/\/bookhive\.buzz(?:\/profile\/(?<handle>[\w.:%-]+))/
  static bskyCDN = /^https:\/\/cdn\.bsky\.app\/(?:[\w.:%-]+\/){3}(?<did>[\w.:%-]+)(?:\/[\w.:%-@]+)?$/
  static bskyVidCDN = /^https:\/\/video\.bsky\.app\/[\w.:%-]+\/(?<did>[\w.:%-]+)(?:\/[\w.:%-@]+)?$/
  static xrpc = /^https:\/\/(?<domain>[^\/]+)\/xrpc\/(?<api>[\w.:%-]+)(?<params>\?.*)?$/
  static pds = /^https:\/\/(?<domain>[^\/]+)/
}

// Convert initial site data to redirected link
class Handlers {
  static pdsls = async ({ pds, handle, nsid, rkey }, uriMode) => {
    console.log(`PDSls handler recieved:`, pds, handle, nsid, rkey)

    if (uriMode) {
      const did = await getDid(handle)
      if (!did) return null
      return `at://${did}${nsid ? `/${nsid}` : ""}${(nsid && rkey) ? `/${rkey}` : ""}`
    }

    if (settings.pdslsOpensApi) {
      if (pds !== "at") return `https://${pds}/xrpc/com.atproto.sync.listRepos?limit=1000`
      const did = await getDid(handle)
      if (!did) return null
      return await Resolvers.xrpc({ did, nsid, rkey })
    }

    if (pds !== "at") return `https://${pds}`
    const did = await getDid(handle)
    if (!did) return null
    return await checkLexicons({ did, nsid, rkey })
  }
  static bsky = async ({ prefix, handle, suffix, rkey }, uriMode) => {
    console.log(`bsky handler received: ` + prefix, handle, suffix, rkey)
    const did = await getDid(handle)
    if (!did) return null

    if (prefix === "starter-pack" && rkey) {
      return `at://${did}/app.bsky.graph.starterpack/${rkey}`
    }

    if (!rkey || (prefix === "profile" && rkey === "search")) return `at://${did}`
    if (prefix !== "profile") return null

    switch (suffix) {
      case "post":
        const postUri = `${did}/app.bsky.feed.post/${rkey}`
        if (!uriMode && settings.getPostThread) {
          const depth = settings.replyCount
          const parents = settings.parentCount
          return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
        }
        return `at://${postUri}`
      case "feed":
        return `at://${did}/app.bsky.feed.generator/${rkey}`
      case "lists":
        return `at://${did}/app.bsky.graph.list/${rkey}`
      default:
        return null
    }
  }
  static aglais = async ({ handle, seg2, seg3 }, uriMode) => {
    console.log(`aglais handler received: ` + handle, seg2, seg3)
    const did = await getDid(handle)
    if (!did) return null
    if (seg2 === 'curation-lists') return seg3 ? `at://${did}/app.bsky.graph.list/${seg3}` : `at://${did}`
    const rkey = seg2 || null
    if (!rkey) return `at://${did}`
    const postUri = `${did}/app.bsky.feed.post/${rkey}`
    if (!uriMode && settings.getPostThread) {
      const depth = settings.replyCount
      const parents = settings.parentCount
      return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
    }
    return `at://${postUri}`
  }
  static ouranos = async ({ handle, rkey, uri }, uriMode) => {
    console.log(`ouranos handler received: ` + handle, rkey, uri)
    if (uri) {
      uri = decodeURIComponent(uri)
      return `at://${uri}`
    }
    const did = await getDid(handle)
    if (!did) return null
    return rkey ? `at://${did}/app.bsky.feed.post/${rkey}` : `at://${did}`
  }
  static klearsky = async ({ type, uri, account }, uriMode) => {
    console.log(`klearsky handler received: ` + type, uri, account)
    if (uri) {
      if (!uriMode && settings.getPostThread && type === "post") {
        const depth = settings.replyCount
        const parents = settings.parentCount
        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=${depth}&parentHeight=${parents}`
      }
      return `at://${uri}`
    }
    const did = await getDid(account)
    if (!did) return null
    if (type === "starterPacks") return `at://${did}/app.bsky.graph.starterpack`
    else if (type === "feed-generators") return `at://${did}/app.bsky.feed.generator`
    else if (type === "list") return `at://${did}/app.bsky.graph.list`
    else return `at://${did}`
  }
  static skychat = async ({ type, handle, rkey }, uriMode) => {
    console.log(`skychat handler received: ` + type, handle, rkey)
    const did = await getDid(handle)
    if (!did) return null
    switch (type) {
      case 'feed':
        return `at://${did}/app.bsky.feed.generator/${rkey || ""}`
      case 'list':
        return `at://${did}/app.bsky.graph.list/${rkey || ""}`
      case 'thread':
        if (!rkey) return `at://${did}`
        const postUri = `${did}/app.bsky.feed.post/${rkey}`
        if (!uriMode && settings.getPostThread) {
          const depth = settings.replyCount
          const parents = settings.parentCount
          return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
        }
      default:
        return `at://${did}`
    }
  }
  static pinboards = async ({ handle, type, rkey}, uriMode) => {
    console.log(`pinboards handler received: ` + handle, type, rkey)
    const did = await getDid(handle)
    if (!did) return null
    if (type === `board` && rkey) {
      return `at://${did}/xyz.jeroba.tags.tag/${rkey}`
    }
    return null
  }
  static whtwnd = async ({ handle, title, rkey, postId }, uriMode) => {
    console.log(`whtwnd handler recieved: ` + handle, title, rkey, postId)
    const did = await getDid(handle)
    if (!did) return null

    if (rkey || postId) {
      return `at://${did}/com.whtwnd.blog.entry/${rkey || postId}`
    }

    if (title) {
      const service = await getServiceEndpoint(did)
      let uri = service ? await getWhiteWindUri(did, service, title) : null
      return uri
        ? `at://${uri.replace("at://", "")}`
        : `at://${did}/com.whtwnd.blog.entry`
    }

    return `at://${did}/com.whtwnd.blog.entry`
  }
  static frontpage = async ({ prefix, handle, rkey, handle2, rkey2 }, uriMode) => {
    console.log(`frontpage handler recieved: ` + prefix, handle, rkey, handle2, rkey2)
    let did
    switch (prefix) {
      case 'post':
        if (handle2 && rkey2) {
          const did2 = await getDid(handle2)
          if (did2) return `at://${did2}/fyi.unravel.frontpage.comment/${rkey2}`
        }
        did = await getDid(handle)
        if (!did) return null
        return rkey ? `at://${did}/fyi.unravel.frontpage.post/${rkey}` : null
      case 'profile':
        did = await getDid(handle)
        if (!did) return null
        return `at://${did}/fyi.unravel.frontpage.post`
      default:
        return null
    }
  }
  static skylights = async ({ handle }, uriMode) => {
    console.log(`skylights handler recieved: ` + handle)
    const did = await getDid(handle)
    return did ? `at://${did}/my.skylights.rel` : null
  }
  static pinksea = async ({ handle, suffix, rkey, handle2, rkey2 }, uriMode) => {
    console.log(`pinksea handler recieved: ` + handle, suffix, rkey, handle2, rkey2)
    handle2 = handle2 === "undefined" ? undefined : handle2;
    rkey2 = rkey2 === "undefined" ? undefined : rkey2;
    const did = await getDid((handle2 && rkey2) ? handle2 : handle)
    if (!did) return null
    let baseUrl = `at://${did}/com.shinolabs.pinksea.oekaki`
    if (rkey2) {
      return `${baseUrl}/${rkey2}`
    } else if (rkey) {
      return `${baseUrl}/${rkey}`
    }
    return baseUrl
  }
  static atBrowser = async ({ handle, rest }, uriMode) => {
    console.log(`atBrowser handler recieved: ` + handle, rest)
    const did = await getDid(handle)
    return did ? `at://${did}/${rest || ""}` : null
  }
  static atpTools = async ({ handle, nsid, rkey }, uriMode) => {
    console.log(`clearSky handler recieved: ` + handle, nsid, rkey)
    const did = await getDid(decodeURIComponent(handle))
    if (!did) return null
    return `at://${did}${nsid ? `/${nsid}` : ""}${(nsid && rkey) ? `/${rkey}` : ""}`
  }
  static clearSky = async ({ handle, type }, uriMode) => {
    console.log(`clearSky handler recieved: ` + handle, type)
    const did = await getDid(handle)
    if (!did) return null
    const typeSuffix =
      type === "history"
        ? "app.bsky.feed.post"
        : type === "blocking"
          ? "app.bsky.graph.block"
          : ""
    return `at://${did}/${typeSuffix}`
  }
  static blueViewer = async ({ handle, rkey }, uriMode) => {
    console.log(`blueViewer handler recieved: ` + handle, rkey)
    const did = await getDid(handle)
    if (!(did && rkey)) return null
    return `at://${did}/app.bsky.feed.post/${rkey}`
  }
  static skythread = async ({ handle, rkey }, uriMode) => {
    console.log(`skythread handler recieved: ` + handle, rkey)
    const did = await getDid(handle)
    if (!(did && rkey)) return null
    return `at://${did}/app.bsky.feed.post/${rkey}`
  }
  static skyview = async ({ url }, uriMode) => {
    console.log(`skyview handler recieved: ` + url)
    const match = decodeURIComponent(url).match(Patterns.bsky)
    if (!match) return null
    console.log(`Passing to bsky handler`)
    return await Handlers.bsky(match.groups)
  }
  static smokeSignal = async ({ handle, rkey }, uriMode) => {
    console.log(`smokeSignal handler recieved: ` + handle, rkey)
    const did = await getDid(handle)
    return did
      ? `at://${did}${rkey
        ? `/events.smokesignal.calendar.event/${rkey}`
        : "/events.smokesignal.app.profile/self"}`
      : null
  }
  static camp = async ({ handle, rkey }, uriMode) => {
    console.log(`camp handler recieved: ` + handle, rkey)
    const did = await getDid(handle)
    return did ? `at://${did}/blue.badge.collection/${rkey || ""}` : null
  }
  static blueBadge = async ({ uri }, uriMode) => {
    console.log(`blueBadge handler recieved: ` + uri)
    return `at://${decodeURIComponent(uri)}`
  }
  static linkAt = async ({ handle }, uriMode) => {
    console.log(`linkAt handler recieved: ` + handle)
    const did = await getDid(handle)
    return did ? `at://${did}/blue.linkat.board/self` : null
  }
  static internect = async ({ did }, uriMode) => {
    console.log(`internect handler recieved: ` + did)
    return `at://${did}`
  }
  static recipeExchange = async ({ type, value }, uriMode) => {
    console.log(`recipeExchange handler recieved: ` + type, value)
    // you can't look collections or recipes up by did.
    if (value && type === "profiles") {
      const did = await getDid(value)
      if (did) return `at://${did}`
    }
    return null
  }
  static plonk = async ({ did }, uriMode) => {
    console.log(`plonk handler recieved: ` + did)
    return `at://${decodeURIComponent(did)}`
  }
  static pastesphere = async ({ handle, type, rkey }, uriMode) => {
    console.log(`pastesphere handler recieved: ` + handle, type, rkey)
    const did = await getDid(handle)
    return did ? `at://${did}/link.pastesphere.snippet/${rkey || ""}` : null
  }
  static bookhive = async ({ handle }, uriMode) => {
    console.log(`pastesphere handler recieved: ` + handle)
    const did = await getDid(handle)
    return did ? `at://${did}/buzz.bookhive.book` : null
  }
  static bskyCDN = async ({ did }, uriMode) => {
    console.log(`bskyCDN handler recieved: ` + did)
    return `at://${did}/blobs`
  }
  static bskyVidCDN = async ({ did }, uriMode) => {
    console.log(`bskyVidCDN handler recieved: ` + did)
    return `at://${decodeURIComponent(did)}/blobs`
  }
  static xrpc = async ({ domain, api, params }, uriMode) => {
    console.log(`xrpc handler recieved: ` + domain, api, params)
    params = Object.fromEntries(new URLSearchParams(params))
    const did = await getDid(params.repo || params.did)
    const nsid = params.collection
    const rkey = params.rkey
    if (!did) return (domain && !uriMode) ? `https://pdsls.dev/${domain}` : null
    if (api === "com.atproto.sync.listBlobs") return `at://${did}/blobs`
    return `at://${did}${nsid ? '/' + nsid : ''}${(nsid && rkey) ? '/' + rkey : ''}`
  }
  static pds = async ({ domain }, uriMode) => {
    console.log(`pds handler recieved: ` + domain)
    if (!uriMode) return null
    if (!settings.pdsFallback) {
      console.warn("PDS fallback matching is set to false. No match found.")
      return null
    }
    return `https://pdsls.dev/${domain}`
  }
}

// Loop over supported lexicons and return Resolver URL
async function checkLexicons(args) {
  if (!args.did) return settings.alwaysOpen ? `https://pdsls.dev` : null
  if (!args.nsid) {
    console.log(`No lexicon specified. Defaulting to Bluesky profile for DID.`)
    return `https://bsky.app/profile/${args.did}`
  }
  for (const [key, regex] of Object.entries(Lexicons)) {
    const match = args.nsid.match(regex)
    if (match) {
      console.log(`Lexicon match: ${key}`)
      return await Resolvers[key](args) || (settings.alwaysOpen ? `https://pdsls.dev` : null)
    }
  }
  console.error(`No match found: Invalid lexicon '${args.nsid}'`)
  return settings.alwaysOpen ? `https://pdsls.dev` : null
}

// Loop over supported patterns and return processed URL
async function checkPatterns(url, uriMode = false) {
  if (!url) return null
  for (const [key, regex] of Object.entries(Patterns)) {
    const match = url.match(regex)
    if (match) {
      console.log(`Match: ${key}`)
      const result = await Handlers[key](match.groups, uriMode)
      if (!uriMode && result && result.startsWith("at://")) {
        return `https://pdsls.dev/${result}`
      }
      return result
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
      const { pds, handle, nsid, rkey } = match.groups
      console.log(`Passing variables to xrpc Resolver: ` + pds, handle, nsid, rkey)
      const did = await getDid(handle)
      if (!did) return null
      url = await Resolvers.xrpc({ pds, did, nsid, rkey })
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

// Copy the AT-URI corresponding to a provided URL
async function copyAtUri(url) {
  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    url = tabs[0]?.url
  }
  if (!url) { console.error("Error: No URL"); return }

  let atUri = await checkPatterns(url, uriMode=true)

  if (atUri) {
    console.log(`Copying AT-URI to clipboard: ${atUri}`)
  } else {
    console.warn(`Unsupported input. Writing pdsls.dev to clipboard.`)
    atUri = "https://pdsls.dev"
  }

  try {
    await navigator.clipboard.writeText(atUri);
  } catch (err) {
    console.error("Clipboard write failed: ", err);
  }
}

// Open the PDSls Jetstream link for the relevant DID and collection
async function openJetstream(url) {
  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    url = tabs[0]?.url
  }
  if (!url) { console.error("Error: No URL"); return }

  let atUri = await checkPatterns(url, uriMode=true)

  let newUrl = "https://pdsls.dev/jetstream"
  if (!atUri) {
    console.warn(`Unsupported input. Opening PDSls Jetstream page without parameters.`)
  } else {
    newUrl += `?instance=wss%3A%2F%2Fjetstream1.us-east.bsky.network%2Fsubscribe`
    let {did: did, nsid: nsid, rkey: rkey } = decomposeUri(atUri)
    newUrl += `&dids=${encodeURIComponent(did)}`
    if (nsid) newUrl += `&collections=${encodeURIComponent(nsid)}`
    newUrl += `&allEvents=on`
  }

  await settings.openInNewTab
    ? browser.tabs.create({ url: newUrl })
    : browser.tabs.update({ url: newUrl })
  console.log(`URL opened: ${newUrl}`)
}