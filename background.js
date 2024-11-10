
// settings
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

// create context menu
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

// const regex = /^(https:\/\/(?:bsky\.app|main\.bsky\.dev|whtwnd\.com))(\/profile\/([^\/]+))?(\/post\/([^\/]+))?/;

// const match = url.match(regex);
// if (!match) {
//   return ""; // No match found
// }

// const baseUrl = match[1]; // The full domain part (e.g., "https://bsky.app")
// const profilePart = match[2]; // "/profile/handle" if it exists
// const handle = match[3]; // The handle captured from the URL, e.g., "user_handle"
// const postPart = match[4]; // "/post/post_id" if it exists
// const postId = match[5]; // The post ID captured from the URL, e.g., "post123"



// validate and format URL
async function validateUrl(url) {
  if (!url) return "";

  const bsky = /^https:\/\/(?:bsky\.app|main\.bsky\.dev)\/profile\/(?<handle>[^\/]+)(?:\/post\/(?<rkey>[^\/]+))?/;
  const whtwnd = /^https:\/\/whtwnd\.com\/(?<handle>[^\/]+)\/(?:entries\/(?<title>[^?]+)(?:\?rkey=(?<rkey>[^\/]+))?|(?<postId>[^\/]+))$/;
  const atBrowser = /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[^\/]+)\/(?<rest>.+)/
  const smokeSignal = /^https:\/\/smokesignal.events(?<handle>[^\/]+)/ // WIP
  const camp = /^https:\/\/atproto.camp\/@(?<handle>[^\/]+)$/;
  const blueBadge = /^https:\/\/badge\.blue\/verify\?uri=at:\/\/(?<uri>.+)/
  const linkAt = /^https:\/\/linkat\.blue\/(?<handle>[^\/]+)$/;
  const internect = /^https:\/\/internect\.info\/did\/(?<did>[^\/]+)$/;
  //TODO: smoke signal, starterpacks, lists, feeds
  //TODO: neodb
  const pds = /^https:\/\/.+/

  let match;
  let uri;

  if ((match = url.match(bsky))) {
    const { handle, rkey } = match.groups;
    let did = await getDid(handle)
    if (!did) return ""
    if (rkey) {
      uri = `${did}/app.bsky.feed.post/${rkey}`
      if (settings.jsonMode) {
        // TODO: depth and parent-height settings
        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=0&parentHeight=0`
      }
    } else uri = did

  } else if ((match = url.match(whtwnd))) {
    const { handle, title, rkey, postId } = match.groups;
    let lexicon = `com.whtwnd.blog.entry`
    let did = await getDid(handle)
    if (!did) return ""
    if (!title && !postId && !rkey) {
      // return `https://pdsls.dev/at/${did}`
      uri = did
    } else if (rkey || postId) {
      uri = `${did}/${lexicon}/${rkey || postId}`
    // } else if (title) {
    //   uri = (await getWhiteWindUri(did, title)).replace("at://", "")
    } else {
      uri = `${did}/${lexicon}`
    }

  } else if ((match = url.match(atBrowser))) {
    const { handle, rest } = match.groups
    did = getDid(handle);
    if (!did) return ""
    uri = `${did}/${rest}`

  } else if ((match = url.match(linkAt))) {
    const { handle } = match.groups;
    did = getDid(handle);
    if (!did) return "";
    uri = `${did}/blue.linkat.board/self`

  } else if ((match = url.match(camp))) {
    const { handle } = match.groups;
    let did = await getDid(handle)
    if (!did) return ""
    uri = `${did}/blue.badge.collection`

  } else if ((match == url.match(blueBadge))) {
    const { temp } = match.groups;
    uri = temp;

  } else if ((match == url.match(internect))) {
    const { did } = match.groups;
    uri = did

  } else if ((url.match(pds))) {
    uri = `${url.replace("https://", "").replace("/", "")}`;

  } else return ""

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
