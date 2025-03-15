# Contributing to ATProto-Redirector

## Adding support for a new site (handler)

1. Start with the templates in `handler/_template.js`, replacing all relevant values, and save it to `handler/<yourhandlername>.js`. Include at least one test example.

```js
import { getDid } from '../utils.js'

export class Bluesky {
    static DOMAINS = ['bsky.app']
    static TESTS = [{
        url: '',
        output: ''
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)
        console.log(`Bluesky handler received: `, { prefix, handle, suffix, rkey })

        // TODO more code here, for example...
        const did = await getDid(handle)
        if (!did) return null
    }

    static parseURL(url) {
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return {prefix, handle, suffix, rkey}
    }
}
```

2. Add an import in [`handler/_handlers.js`](handler/_handlers.js) and add it to to the `handlers` list. Tip: press `Shift+Alt+O` in VSCode to alphabetize imports.

3. Add a line to [`docs/supportedsites.md`](docs/supportedsites.md) with the relevant website, lexicons, and nsid domain authority, if applicable.

## Adding support for a new lexicon (resolver)

1. Start with the template in `resolver/_template.js`, replacing all relevant values, and save it to `resolver/<yourresolvername>.js`. Include at least one test example.

```js
export class Bluesky {
    // assumed to be first 2 or 3 segments of applicable NSID
    // https://atproto.com/specs/nsid
    static NSID_AUTH = 'app.bsky'
    static TESTS = [{
        url: '',
        output: ''
    }]

    static async processURI({did, nsid, rkey}) {
        console.log(`Bluesky resolver received: `, { did, nsid, rkey })

        // TODO: more code here, for example...
        if (!did) return settings.alwaysOpen ? `https://bsky.app` : null
    }
}
```

2. Add an import in [`resolver/_resolvers.js`](resolver/_resolvers.js) and add it to to the `resolvers` list. Tip: press `Shift+Alt+O` in VSCode to alphabetize imports.

3. Add a line to [`docs/supportedsites.md`](docs/supportedsites.md) with the relevant lexicons and resolution url.
