// settings

// browser.storage.sync.clear();
// console.log('Storage cleared.');

let settings = {}

const defaults = {
  alwaysOpen: true,
  openInNewTab: true,
  jsonMode: false,
  keybinding: "Ctrl+Alt+1"
}

async function loadSettings() {
  try {
    const data = await browser.storage.sync.get()
    console.log('Data retrieved:', data)
    settings = { ...defaults, ...data }
    console.log('Current settings:', settings)
    updateKeybinding()
  } catch (error) {
    console.error('Error retrieving settings:', error)
    return null
  }
}
loadSettings()

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area != 'sync') return
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
  if (info.menuItemId != "PDSls") { return true }
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
      console.error(`Error retrieving DID '${did}':`)
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
      console.log("Fetching did:web DID doc")
      res = await fetch(`https://${did.slice(8)}/.well-known/did.json`)
    } else {
      console.log("Fetching did:plc DID doc")
      res = await fetch(`https://plc.directory/${did}`)
    }

    if (!res.ok) {
      console.error(`Failed to fetch DID doc for '${did}'. Status: ${res.status}`)
      return null
    }

    return await res.json()
  } catch (err) {
    console.error("Error fetching DID doc:", err)
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

// Validate and format URL
async function validateUrl(url) {
  if (!url) return null

  const bsky = /^https:\/\/(?:bsky\.app|main\.bsky\.dev)\/(?<prefix>profile|starter-pack)\/(?<handle>[\w.:%-]+)(?:\/(?<suffix>post|lists|feed))?\/?(?<rkey>[\w.:%-]+)?$/
  const whtwnd = /^https:\/\/whtwnd\.com\/(?<handle>[\w.:%-]+)\/(?:entries\/(?<title>[\w.:%-]+)(?:\?rkey=(?<rkey>[\w.:%-]+))?|(?<postId>[\w.:%-]+))$/
  const atBrowser = /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[\w.:%-]+)(?:\/(?<rest>.*))?$/
  const clearSky = /^https:\/\/clearsky\.app\/(?<handle>[\w.:%-]+)(?:\/(?<type>[\w.:%-]+))?/
  const smokeSignal = /^https:\/\/smokesignal\.events\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?/
  const camp = /^https:\/\/atproto.camp\/@(?<handle>[\w.:%-]+)$/
  const blueBadge = /^https:\/\/badge\.blue\/verify\?uri=at:\/\/(?<uri>.+)/
  const linkAt = /^https:\/\/linkat\.blue\/(?<handle>[\w.:%-]+)$/
  const internect = /^https:\/\/internect\.info\/did\/(?<did>[\w.:%-]+)$/
  const pds = /^https:\/\/.+/

  let match
  let uri

  if ((match = url.match(bsky))) {
    console.log("Match: Bluesky")
    const { prefix, handle, suffix, rkey } = match.groups
    console.log("Capture groups: " + prefix, handle, suffix, rkey)
    let did = await getDid(handle)
    if (!did) return null
    if ((prefix === "starter-pack") && rkey) {
      uri = `${did}/app.bsky.graph.starterpack/${rkey}`
    } else if (rkey) {
      if (prefix != "profile") return null
      if (suffix === "post") {
        uri = `${did}/app.bsky.feed.post/${rkey}`
        if (settings.jsonMode) {
          let depth = settings.replyCount
          let parents = settings.parentCount
          return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=${depth}&parentHeight=${parents}`
        }
      } else if (suffix === "feed") {
        uri = `${did}/app.bsky.feed.generator/${rkey}`
      } else if (suffix === "lists") {
        uri = `${did}/app.bsky.graph.list/${rkey}`
      } else return null
    } else uri = did

  } else if ((match = url.match(whtwnd))) {
    console.log("Match: WhiteWind")
    const { handle, title, rkey, postId } = match.groups
    let lexicon = `com.whtwnd.blog.entry`
    let did = await getDid(handle)
    if (!did) return null
    if (rkey || postId) {
      uri = `${did}/${lexicon}/${rkey || postId}`
    } else if (title) {
      const service = await getServiceEndpoint(did)
      if (service) {
        uri = await getWhiteWindUri(did, service, title)
        if (uri) uri = uri.replace("at://", "")
      }
      if (!uri) uri = `${did}/${lexicon}`
    } else {
      uri = `${did}/${lexicon}`
    }

  } else if ((match = url.match(atBrowser))) {
    console.log("Match: AT-Browser")
    const { handle, rest } = match.groups
    if (!handle) return null
    did = await getDid(handle)
    if (!did) return null
    uri = `${did}/${rest || ''}`

  } else if ((match = url.match(clearSky))) {
    console.log("Match: ClearSky")
    const { handle, type } = match.groups
    if (!handle) return null
    did = await getDid(handle)
    if (!did) return null
    uri = did
    if (type === "history") {
      uri += "/app.bsky.feed.post"
    } else if (type === "blocking") {
      uri += "/app.bsky.graph.block"
    }

  } else if ((match = url.match(smokeSignal))) {
    console.log("Match: Smoke Signal")
    const { handle, rkey } = match.groups
    did = await getDid(handle)
    if (!did) return null
    uri = `${did}${rkey ? `/events.smokesignal.calendar.event/${rkey}` : "/events.smokesignal.app.profile/self"}`

  } else if ((match = url.match(linkAt))) {
    console.log("Match: Link AT")
    const { handle } = match.groups
    did = await getDid(handle)
    if (!did) return null
    uri = `${did}/blue.linkat.board/self`

  } else if ((match = url.match(camp))) {
    console.log("Match: At Proto Camp")
    const { handle } = match.groups
    let did = await getDid(handle)
    if (!did) return null
    uri = `${did}/blue.badge.collection`

  } else if ((match = url.match(blueBadge))) {
    console.log("Match: Blue Badge")
    const { temp } = match.groups
    uri = temp

  } else if ((match = url.match(internect))) {
    console.log("Match: Internect")
    const { did } = match.groups
    uri = did

  } else if ((url.match(pds))) {
    console.log("No match found: Defaulting to PDS")
    uri = `${url.replace("https://", "").replace("/", "")}`

  } else {
    console.error("No match found: Invalid website")
    return null
  }

  return `https://pdsls.dev/at/${uri}`
}

// Open a provided url or the current page url, after validation 
async function openNewTab(url) {
  console.log("Entered: openNewTab")

  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    url = tabs[0]?.url
  }
  if (!url) { console.error("Error: No URL"); return }

  let newUrl = await validateUrl(url)
  if (!newUrl) {
    if (settings.alwaysOpen) {
      newUrl = `https://pdsls.dev`
    } else return
  }
  if (settings.openInNewTab) {
    await browser.tabs.create({ url: newUrl })
  } else {
    await browser.tabs.update({ url: newUrl })
  }

  console.log(`URL opened: ${newUrl}`)
}