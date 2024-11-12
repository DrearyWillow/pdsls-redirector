Basically ready if you use Manifest V2 on Firefox. I haven't tested Chrome at all.

### Entry points:
* Right click context menus (page, selections, and bookmarks)
* Clicking the extension icon
* Configurable keybinding (defaults to Ctrl+Alt+1)

### Supports:
* [Bluesky](https://bsky.app/) (profiles, posts, starter packs, lists, and feeds)
* [White Wind](https://whtwnd.com/)
* [AT Browser](https://atproto-browser.vercel.app/)
* [ClearSky](https://clearsky.app)
* [Smoke Signal](https://docs.smokesignal.events/)
* [Atproto Camp](https://atproto.camp/)
* [Blue Badge](https://badge.blue/)
* [Link AT](https://linkat.blue/?lng=en)
* [Internect](https://internect.info/)
* If the above fail, it tries to load the link as a PDS

### Configure settings in about:addons >> Preferences
* Always open PDSls, even if no valid URL found
* Open new tab or redirect the current page
* Directly open getPostThread JSON for Blusky Posts
  * Reply count and parent height configurable, up to 1000
* Override keybinding

### TODO:
* oops i broke context menus for links. is "selection" not good enough?
* manifest v3
* white wind title lookup
