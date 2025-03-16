import { composeUri, getDid, checkResolvers } from '../utils.js'
import { XRPCResolver } from '../resolver/_resolvers.js'

export class PDSls {
    static DOMAINS = ['pdsls.dev']
    static TESTS = [{
        url: 'https://pdsls.dev/at://did:plc:ia76kvnndjutgedggx2ibrem',
        settings: { pdslsOpensApi: true },
        output: 'https://porcini.us-east.host.bsky.network/xrpc/com.atproto.repo.describeRepo?repo=did:plc:ia76kvnndjutgedggx2ibrem'
    }, {
        url: 'https://pdsls.dev/at://did:plc:ia76kvnndjutgedggx2ibrem/app.bsky.feed.post',
        output: 'https://bsky.app/profile/did:plc:ia76kvnndjutgedggx2ibrem'
    }, {
        url: 'https://pdsls.dev/at://did:plc:ia76kvnndjutgedggx2ibrem/sh.tangled.repo/3lk3eqnvxjv22',
        output: 'https://tangled.sh/did:plc:ia76kvnndjutgedggx2ibrem/atcute'
    }, {
        url: 'https://pdsls.dev/at://did:plc:ia76kvnndjutgedggx2ibrem/com.whtwnd.blog.entry/3lhgp74vrri2c',
        output: 'https://whtwnd.com/did:plc:ia76kvnndjutgedggx2ibrem/3lhgp74vrri2c'
    }]

    static async processURL(url, settings, uriMode) {
        const { pds, handle, nsid, rkey } = this.parseURL(url)
        console.log(`PDSls handler recieved:`, { pds, handle, nsid, rkey })

        if (uriMode) {
            const did = await getDid(handle)
            if (!did) return null
            return composeUri({ did, nsid, rkey })
        }

        if (settings.pdslsOpensApi) {
            if (pds !== "at:") return `https://${pds}/xrpc/com.atproto.sync.listRepos?limit=1000`
            const did = await getDid(handle)
            if (!did) return null
            return await XRPCResolver.processURI({ did, nsid, rkey })
        }

        if (pds !== "at:") return `https://${pds}`
        const did = await getDid(handle)
        if (!did) return null
        return await checkResolvers({ did, nsid, rkey }, settings)
    }

    static parseURL(url) {
        let [pds, handle, nsid, rkey] = url.pathname.split('/').filter(Boolean)
        return { pds, handle, nsid, rkey }
    }
}