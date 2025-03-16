The Firefox version of [PDSls Redirector](https://github.com/DrearyWillow/pdsls-redirector-chrome)

### Entry points:
* Right click context menus (page, links, and bookmarks)
* Clicking the extension icon
* Configurable keybinding (defaults to Ctrl+Shift+1)

### Supports:
See [supported sites and lexicons](docs/supportedsites.md)

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