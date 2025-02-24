The Firefox version of [PDSls Redirector](https://github.com/DrearyWillow/pdsls-redirector-chrome)

### Entry points:
* Right click context menus (page, links, and bookmarks)
* Clicking the extension icon
* Configurable keybinding (defaults to Ctrl+Shift+1)

### Supports:
* [Bluesky](https://bsky.app/) (profiles, posts, starter packs, lists, and feeds)
* [Aglais](https://aglais.pages.dev)
* [TOKIMEKI](https://tokimekibluesky.vercel.app)
* [Langit](https://langit.pages.dev)
* [Klearsky](https://klearsky.pages.dev)
* [SkyChat](https://skychat.social)
* [Pinboards](https://pinboards.jeroba.xyz)
* [WhiteWind](https://whtwnd.com/)
* [FrontPage](https://frontpage.fyi)
* [Skylights](https://skylights.my)
* [Pinksea](https://pinksea.art)
* [AT Browser](https://atproto-browser.vercel.app/)
* [@tools](https://atp.tools)
* [ClearSky](https://clearsky.app)
* [BlueViewer](https://blueviewer.pages.dev/)
* [Skythread](https://blue.mackuba.eu/skythread/)
* [Skyview](https://skyview.social/)
* [Smoke Signal](https://docs.smokesignal.events/)
* [AtProto Camp](https://atproto.camp/)
* [Blue Badge](https://badge.blue/)
* [Link AT](https://linkat.blue/?lng=en)
* [Internect](https://internect.info/)
* [Recipe Exchange](https://recipe.exchange)
* [Plonk](https://plonk.li)
* [PasteSphere](https://pastesphere.link)
* [BookHive](https://bookhive.buzz)
* [Bsky CDN](https://cdn.bsky.app)
* [Bsky Video CDN](https://video.bsky.app)
* [Raw API URLs](https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=did:plc:hx53snho72xoj7zqt5uice4u&collection=app.bsky.actor.profile&rkey=self)
* [PDSls](https://pdsls.dev/) (opens the API response directly)
* If the above fail, attempt to load the link as a PDS

### Configure settings in about:addons
* Always open PDSls, even if no valid URL found
* If no URL pattern matched, fallback to PDS matching
* Open new tab or redirect the current page
* Open raw API response when activated on PDSls pages
* Ignore PDSls (open API responses directly)
* Enable Jetstream context menu option
  * Filters to relevant collection if available
* Directly open getPostThread JSON for Bluesky posts
  * Reply count and parent height configurable, up to 1000
* Override keybinding
* Enable copy AT-URI inputs (keybinding and context menu)

### Performance
Sometimes the extension has to make API calls (for instance, resolving a handle to a DID). These requests can take variable lengths of time to yield responses. This can lead to delays in redirection.