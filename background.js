let settings = {};
async function loadSettings() {
  try {
    // Remember to update this if you add more settings
    const data = await browser.storage.sync.get(['alwaysOpen', 'openInNewTab', 'jsonMode', 'keybinding']);
    console.log('Current settings:', data);
    settings = data || {}
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return null;
  }
}
loadSettings();
browser.storage.onChanged.addListener((changes, area) => {
  if (area != 'sync') return
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (['alwaysOpen', 'openInNewTab', 'jsonMode', 'keybinding'].includes(key)) {
      console.log(`Storage key "${key}" changed from`, oldValue, 'to', newValue);
      settings[key] = newValue;
    }
  }
});

// Create context menu
browser.contextMenus.create({
    id: "PDSls",
    title: "PDSls",
    // contexts: ["page"]
    contexts: ["all"]
});

const resolveHandle = async (handle) => {
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=` +
      handle,
  );
  return res.json().then((json) => json.did);
};

// getPostThread
// const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${uri}/app.bsky.feed.post/${rkey}&depth=0&parent-height=0`

// Validate and format URL
async function validateUrl(url) {
    if (!url) return "";

    // PDS
    if (
      !url.startsWith("https://bsky.app/") &&
      !url.startsWith("https://main.bsky.dev/") &&
      url.startsWith("https://")
    ) return `/${url.replace("https://", "").replace("/", "")}`;

    // URI
    const uri = url
      .replace("at://", "")
      .replace("https://bsky.app/profile/", "")
      .replace("https://main.bsky.dev/profile/", "")
      .replace("/post/", "/app.bsky.feed.post/");
    let did = "";
    try {
      if (uri.startsWith("did:")) did = uri.split("/")[0];
      else did = await resolveHandle(uri.split("/")[0]);
      if (!did) return "";
    } catch (err) {
      return "";
    }

    return `at/${did}${uri.split("/").length > 1 ? "/" + uri.split("/").slice(1).join("/") : ""}`
}

// Function to open a new tab with the current page URL
async function openNewTab(url) {
  console.log("Reached: openNewTab")
  const ROOT = "https://pdsls.dev"

  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    url = tabs[0]?.url;
  }
  if (!url) { console.log("Error: No URL"); return; }

  let suffix = await validateUrl(url);
  if (!suffix && !settings.alwaysOpen) return;
  if (settings.openInNewTab) {
    await browser.tabs.create({ url: `${ROOT}/${suffix || ""}` });
  } else {
    await browser.tabs.update({ url: `${ROOT}/${suffix || ""}` });
  }
     
  console.log(`URL opened: ${ROOT}/${suffix || ""}`);
}

// Extension Icon
browser.browserAction.onClicked.addListener(() => {
  console.log("Reached: extension icon click")
  openNewTab()
})

// Context Menu
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Reached: contextMenuListener")
  if (info.menuItemId != "PDSls") { return true }
  console.log("Reached: contextMenu after itemId")
  const [commandId, type] = info.menuItemId.split('-')
  let url;
  if (info.bookmarkId) {
    console.log("url type is bookmark")
    const bookmarks = await browser.bookmarks.get(info.bookmarkId)
    if (bookmarks.length > 0) {
        url = bookmarks[0].url
    }
  } else {
      console.log("url type is link or page")
      url = info.linkUrl ? info.linkUrl : info.pageUrl
  }
  if (!url) {
      return
  }
  openNewTab(url)
})

// Keybinding
browser.commands.onCommand.addListener((command) => {
  console.log("Reached: keybinding")
  if (command === "pdsls-tab") {openNewTab()}
})
