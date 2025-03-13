import { handlerMap, XRPCHandler, PDSlsHandler } from './handler/_handlers.js'
import { XRPCResolver } from './resolver/_resolvers.js'
import { decomposeUri } from './utils.js'

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
  if (info.menuItemId !== "PDSls" && info.menuItemId !== "copyATUri" && info.menuItemId !== "Jetstream") return
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

// Attempt to find a matching handler pattern and return processed URL
async function checkHandlers(url, uriMode = false) {
  if (!url) return null
  try {
    url = new URL(url)
  } catch (error) {
    console.error("No match found: Invalid website", error)
    return null
  }
  const Handler = handlerMap[url.hostname]
  if (Handler) {
    console.log(`Match: ${Handler.name}`)
    let result = await Handler.processURL(url, settings, uriMode);
    if (result && result.startsWith("at://")) {
      if (settings.alwaysApi) {
        return (await XRPCResolver.processURI(decomposeUri({result})))
      } else if (!uriMode) {
        return `https://pdsls.dev/${result}`
      }
    }
    return result
  } else if (url.pathname.split('/')[2] === 'xrpc') {
    return await XRPCHandler.processURL(url, settings, uriMode)
  } else if (settings.pdsFallback) {
    console.log("PDS handler received: " + url)
    return settings.alwaysApi
      ? (await XRPCResolver.processURI({pds: url.hostname}))
      : `https://pdsls.dev/${url.hostname}`
  } else {
    console.warn("PDS fallback matching is set to false. No match found.")
    return null
  }
}

// Validate a returned handler pattern
async function validateUrl(url) {
  console.log(`Validate URL received: ${url}`)
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

  let newUrl = await validateUrl(await checkHandlers(url))

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

  let atUri = await checkHandlers(url, uriMode = true)

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

  let atUri = await checkHandlers(url, uriMode = true)

  let newUrl = "https://pdsls.dev/jetstream"
  if (!atUri) {
    console.warn(`Unsupported input. Opening PDSls Jetstream page without parameters.`)
  } else {
    newUrl += `?instance=wss%3A%2F%2Fjetstream1.us-east.bsky.network%2Fsubscribe`
    let { did: did, nsid: nsid, rkey: rkey } = decomposeUri(atUri)
    newUrl += `&dids=${encodeURIComponent(did)}`
    if (nsid) newUrl += `&collections=${encodeURIComponent(nsid)}`
    newUrl += `&allEvents=on`
  }

  await settings.openInNewTab
    ? browser.tabs.create({ url: newUrl })
    : browser.tabs.update({ url: newUrl })
  console.log(`URL opened: ${newUrl}`)
}

