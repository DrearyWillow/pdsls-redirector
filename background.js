// Settings
// browser.storage.sync.clear();
// console.log('Storage cleared.');
let settings = {}
const defaults = {
  alwaysOpen: true,
  openInNewTab: true,
  pdsFallback: true,
  jsonMode: false,
  keybinding: "Ctrl+Shift+1"
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

// Validate and format URL
async function validateUrl(url) {
  if (!url) return null

  const bskyClients = [
    'bsky.app',
    'main.bsky.dev',
    'langit.pages.dev/u/[\\w.:%-]+',
    'tokimekibluesky.vercel.app',
  ]

  const patterns = {
    bsky: new RegExp(`^https://(?:${bskyClients.join('|')})/(?<prefix>profile|starter-pack)/(?<handle>[\\w.:%-]+)(?:/(?<suffix>post|lists|feed))?/?(?<rkey>[\\w.:%-]+)?(?:\\?.*)?$`),
    klearsky: /^https:\/\/klearsky\.pages\.dev\/#\/(?:([^/?]+)\/)?(?<type>[^/?]+)?(?:\?(?:[\w.-]+=(?:at:\/\/|at%3A%2F%2F)(?<uri>[\w.:%/-]+)|account=(?<account>[\w.:/-]+)))?(?:&.*)?$/,
    whtwnd: /^https:\/\/whtwnd\.com\/(?<handle>[\w.:%-]+)\/(?:entries\/(?<title>[\w.:%-]+)(?:\?rkey=(?<rkey>[\w.:%-]+))?|(?<postId>[\w.:%-]+))$/,
    atBrowser: /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[\w.:%-]+)(?:\/(?<rest>[^?]*))?(?:\?.*)?$/,
    clearSky: /^https:\/\/clearsky\.app\/(?<handle>[\w.:%-]+)(?:\/(?<type>[\w.:%-]+))?(?:\?.*)?$/,
    blueViewer: /^https:\/\/blueviewer\.pages\.dev\/view\?actor=(?<handle>[\w.:%-]+)&rkey=(?<rkey>[\w.:%-]+)$/,
    skythread: /^https:\/\/blue\.mackuba\.eu\/skythread\/\?author=(?<handle>[\w.:%-]+)&post=(?<rkey>[\w.:%-]+)$/,
    skyview: /https:\/\/skyview\.social\/\?url=(?<url>[^&]+)/,
    smokeSignal: /^https:\/\/smokesignal\.events\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:\?.*)?$/,
    camp: /^https:\/\/atproto.camp\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:\?.*)?$/,
    blueBadge: /^https:\/\/badge\.blue\/verify\?uri=(?:at:\/\/|at%3A%2F%2F)(?<uri>.+)$/,
    linkAt: /^https:\/\/linkat\.blue\/(?<handle>[\w.:%-]+)(?:\?.*)?$/,
    internect: /^https:\/\/internect\.info\/did\/(?<did>[\w.:%-]+)(?:\?.*)?$/,
    pds: /^https:\/\/(?<domain>.+)(?:\?.*)?$/,
  }

  const handlers = {
    bsky: async ({ prefix, handle, suffix, rkey }) => {
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
          if (settings.jsonMode) {
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
    },
    klearsky: async ({ type, uri, account }) => {
      console.log(type, uri, account)
      if (uri) {
        if (settings.jsonMode && type == "post") {
          const depth = settings.replyCount
          const parents = settings.parentCount
          return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=${depth}&parentHeight=${parents}`
        }
        return `https://pdsls.dev/at/${uri}`
      }
      const did = await getDid(account)
      if (!did) return null
      if (type == "starterPacks") return `https://pdsls.dev/at/${did}/app.bsky.graph.starterpack`
      else if (type == "feed-generators") return `https://pdsls.dev/at/${did}/app.bsky.feed.generator`
      else if (type == "list") return `https://pdsls.dev/at/${did}/app.bsky.graph.list`
      else return `https://pdsls.dev/at/${did}`
    },
    whtwnd: async ({ handle, title, rkey, postId }) => {
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
    },
    atBrowser: async ({ handle, rest }) => {
      const did = await getDid(handle)
      return did ? `https://pdsls.dev/at/${did}/${rest || ""}` : null
    },
    clearSky: async ({ handle, type }) => {
      const did = await getDid(handle)
      if (!did) return null
      const typeSuffix =
        type === "history" ? "app.bsky.feed.post" : type === "blocking" ? "app.bsky.graph.block" : ""
      return `https://pdsls.dev/at/${did}/${typeSuffix}`
    },
    blueViewer: async ({ handle, rkey }) => {
      const did = await getDid(handle)
      if (!(did && rkey)) return null
      return `https://pdsls.dev/at/${did}/app.bsky.feed.post/${rkey}`
    },
    skythread: async ({ handle, rkey }) => {
      const did = await getDid(handle)
      if (!(did && rkey)) return null
      return `https://pdsls.dev/at/${did}/app.bsky.feed.post/${rkey}`
    },
    skyview: async ({ url }) => {
      if (match = decodeURIComponent(url).match(patterns.bsky)) {
        console.log(`Passing to bsky handler`)
        return await handlers['bsky'](match.groups)
      }
      return null
    },
    smokeSignal: async ({ handle, rkey }) => {
      const did = await getDid(handle)
      return did
        ? `https://pdsls.dev/at/${did}${rkey
          ? `/events.smokesignal.calendar.event/${rkey}`
          : "/events.smokesignal.app.profile/self"}`
        : null
    },
    camp: async ({ handle, rkey }) => {
      const did = await getDid(handle)
      return did ? `https://pdsls.dev/at/${did}/blue.badge.collection/${rkey || ""}` : null
    },
    blueBadge: async ({ uri }) => {
      uri = decodeURIComponent(uri)
      return `https://pdsls.dev/at/${uri}`
    },
    linkAt: async ({ handle }) => {
      const did = await getDid(handle)
      return did ? `https://pdsls.dev/at/${did}/blue.linkat.board/self` : null
    },
    internect: async ({ did }) => {
      return `https://pdsls.dev/at/${did}`
    },
    pds: async ({ domain }) => {
      if (!settings.pdsFallback) {
        console.warn("PDS fallback matching is set to false. No match found.")
        return null
      }
      return `https://pdsls.dev/${domain}`
    },
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = url.match(regex)
    if (match) {
      console.log(`Match: ${key}`)
      const handler = handlers[key]
      if (handler) {
        return await handler(match.groups)
      }
    }
  }

  console.error("No match found: Invalid website")
  return null
}

// Open a provided url or the current page url, after validation 
async function openNewTab(url) {
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