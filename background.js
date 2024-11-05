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

async function validateUrl(url) {
    if (!url) return "";
    if (
      !url.startsWith("https://bsky.app/") &&
      !url.startsWith("https://main.bsky.dev/") &&
      url.startsWith("https://")
    ) return `/${url.replace("https://", "").replace("/", "")}`;

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

    return `/at/${did}${uri.split("/").length > 1 ? "/" + uri.split("/").slice(1).join("/") : ""}`
}

// Function to open a new tab with the current page URL
async function openNewTab(url) {
  console.log("Reached: openNewTab")
  const ROOT = "https://pdsls.dev"
  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    url = tabs[0]?.url;
  }
  if (!url) return;
  let suffix = await validateUrl(url);
  if (!suffix) return;
  browser.tabs.create({ url: `${ROOT}/${suffix}` });
  
}

browser.browserAction.onClicked.addListener(() => {
  console.log("Reached: extension icon click")
  openNewTab()
})

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("Reached: contextMenuListener")
  if (info.menuItemId != "PDSls") { return true }
  console.log("Reached: contextMenu after itemId")
  const [commandId, type] = info.menuItemId.split('-')
  let url;
  const CONTEXT_ATTRS = {
    "audio": "srcUrl",
    "image": "srcUrl",
    "page": "pageUrl",
    "video": "srcUrl",
  };
  // Media and page
  if (type) {
      console.log("URL type: CONTEXT_ATTRS")
      url = info[CONTEXT_ATTRS[type]]
  } else {
      // Bookmark, link, tab
      console.log("url type is bookmark, link, tab")
      if (info.bookmarkId) {
          const bookmarks = await browser.bookmarks.get(info.bookmarkId)
          if (bookmarks.length > 0) {
              url = bookmarks[0].url
          }
      } else {
          console.log("Defaulting url type to link or page")
          url = info.linkUrl ? info.linkUrl : info.pageUrl
      }
  }
  if (!url) {
      return
  }
  openNewTab(url)
})

// Handle keybinding
browser.commands.onCommand.addListener((command) => {
  console.log("Reached: keybinding")
  if (command === "pdsls-tab") {openNewTab()}
})
