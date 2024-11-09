let settings = {};
async function loadSettings() {
  try {
    // Remember to update this if you add more settings
    const data = await browser.storage.sync.get();
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
    console.log(`Storage key "${key}" changed from`, oldValue, 'to', newValue);
    settings[key] = newValue;
  }
});

// Create context menu
browser.contextMenus.create({
    id: "PDSls",
    title: "PDSls",
    // contexts: ["page"]
    contexts: ["all"]
});


const getDid = async (handle) => {
  if (handle.startsWith("did:")) return handle;
  try {
    did = await resolveHandle(handle);
  } catch (err) {
    return "";
  }
  return did
}

const resolveHandle = async (handle) => {
  const res = await fetch(
    `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=` +
      handle,
  );
  return res.json().then((json) => json.did);
};

const getWhiteWindServiceEndpoint = async () => {
  if ("WORKAROUND") {
    return `https://b481a144-23e5-4fa9-83ae-e448d3593655.whtwnd.com`
  }
  const res = await fetch(
    `https://whtwnd.com/.well-known/did.json`
  );
  return res.json().then((json) => json.service[0].serviceEndpoint)
}

const getWhiteWindUri = async (did, title) => {
  let se = await getWhiteWindServiceEndpoint()
  const res = await fetch(
    `${se}/xrpc/com.whtwnd.blog.getEntryMetadataByName?author=${did}&entryTitle=${title}`
  );
  return res.json().then((json) => json.entryUri)
}

// Validate and format URL
async function validateUrl(url) {
    if (!url) return "";

    // PDS
    if (
      !url.startsWith("https://bsky.app/") &&
      !url.startsWith("https://main.bsky.dev/") &&
      !url.startsWith("https://whtwnd.com/") &&
      url.startsWith("https://")
    ) return `/${url.replace("https://", "").replace("/", "")}`;

    let uri
    if (url.startsWith("https://whtwnd.com/")) {
      uri = url.replace("https://whtwnd.com/", "")
      if (uri.includes("/entries/")) {
        uri = uri.replace("/entries/", "/com.whtwnd.blog.entry/");
        [handle = "", lexicon = "", title = ""] = uri.split("/");
      } else {
        [handle = "", title = ""] = uri.split("/");
        lexicon = `com.whtwnd.blog.entry`
      }
      
      let did = await getDid(handle)
      
      if (!title) return `https://pdsls.dev/at/${did}`
      // if title is rkey
      if (!title.includes("%20")) return `https://pdsls.dev/at/${did}/${lexicon}/${title}`;
      // uri = (await getWhiteWindUri(did, title)).replace("at://", "")
      // hard return whtwnd entry collection for now, because their api is mean :(
      return `https://pdsls.dev/at/${did}/${lexicon}`

    } else {
      uri = url
        .replace("https://bsky.app/profile/", "")
        .replace("https://main.bsky.dev/profile/", "")
        .replace("/post/", "/app.bsky.feed.post/")
      let parts = uri.split("/")
      let did = await getDid(parts[0])

      if (!did) return ""

      uri = `${did}${parts.length > 1 ? "/" + parts.slice(1).join("/") : ""}`
      if ((parts[1] === "app.bsky.feed.post") && settings.jsonMode) {
        // TODO: depth and parent-height settings
        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=0&parent-height=0`
      }
    }

    return `https://pdsls.dev/at/${uri}`
}

// Function to open a new tab with the current page URL
async function openNewTab(url) {
  console.log("Reached: openNewTab")

  if (!url) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    url = tabs[0]?.url;
  }
  if (!url) { console.log("Error: No URL"); return; }

  let newUrl = await validateUrl(url);
  if (!newUrl) {
    if (settings.alwaysOpen) {
      newUrl = `https://pdsls.dev`;
    } else return;
  }
  if (settings.openInNewTab) {
    await browser.tabs.create({ url: newUrl });
  } else {
    await browser.tabs.update({ url: newUrl });
  }
     
  console.log(`URL opened: ${newUrl}`);
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
