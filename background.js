import { buildMenus, copyATUri, loadSettings, openJetstream, openNewTab, updateKeybindings } from './utils.js'

// Settings
// browser.storage.sync.clear()
// console.log('Storage cleared.')
let settings = await loadSettings()

// Listen for settings changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" changed from`, oldValue, 'to', newValue)
    settings[key] = newValue
  }
  buildMenus(settings)
  updateKeybindings(settings)
})

// Create context menu
buildMenus(settings)

// Extension Icon
browser.browserAction.onClicked.addListener(() => {
  console.log("Entry point: extension icon")
  openNewTab(undefined, settings)
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
      openNewTab(url, settings)
    case "copyATUri":
      copyATUri(url, settings)
    case "Jetstream":
      openJetstream(url, settings)
  }
})

// Keybinding
browser.commands.onCommand.addListener((command) => {
  console.log(`Entry point: ${command} keybinding`)
  if (command === "pdsls-tab") { openNewTab(undefined, settings) }
  if (command === "at-uri-copy") {
    if (settings.copyUriEnabled || defaults.copyUriEnabled) {
      copyATUri(undefined, settings)
    } else {
      console.log(`Copying AT-URI disabled - configure in settings.`)
    }
  }
})
