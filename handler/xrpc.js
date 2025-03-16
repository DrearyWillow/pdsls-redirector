import { composeUri, getDid } from '../utils.js'

export class XRPC {
    static DOMAINS = ['public.api.bsky.app']
    static TESTS = [{
        url: 'https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=did:plc:hx53snho72xoj7zqt5uice4u&collection=app.bsky.actor.profile&rkey=self',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.actor.profile/self'
    }, {
        url: 'https://woodtuft.us-west.host.bsky.network/xrpc/com.atproto.sync.listRepos?limit=1000',
        output: 'https://pdsls.dev/woodtuft.us-west.host.bsky.network'
    }, {
        url: 'https://hollowfoot.us-west.host.bsky.network/xrpc/com.atproto.repo.listRecords?repo=did:plc:watlxw5urzxprk2tziey3ocl&collection=app.bsky.feed.like&limit=100',
        output: 'https://pdsls.dev/at://did:plc:watlxw5urzxprk2tziey3ocl/app.bsky.feed.like'
    }, {
        url: 'https://hollowfoot.us-west.host.bsky.network/xrpc/com.atproto.sync.listBlobs?did=did:plc:watlxw5urzxprk2tziey3ocl&limit=1000',
        output: 'https://pdsls.dev/at://did:plc:watlxw5urzxprk2tziey3ocl/blobs'
    }]

    static async processURL(url, settings, uriMode) {
        let { domain, api, params } = this.parseURL(url)
        console.log(`XRPC handler recieved: `, { domain, api, params })
        params = Object.fromEntries(params)
        const did = await getDid(params.repo || params.did)
        const nsid = params.collection
        const rkey = params.rkey
        if (!did) return (domain && (domain != 'public.api.bsky.app') && !uriMode) ? `https://pdsls.dev/${domain}` : null
        console.log(api)
        if (api === "com.atproto.sync.listBlobs") return `at://${did}/blobs`
        return composeUri({ did, nsid, rkey })
    }

    static parseURL(url) {
        let domain = url.hostname
        let [api] = url.pathname.split("/").slice(2)
        let params = url.searchParams
        return { domain, api, params }
    }
}