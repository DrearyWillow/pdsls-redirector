import { composeUri, getDid } from '../utils.js'
import { checkResolvers, XRPCResolver } from '../resolver/_resolvers.js'

export class PDSls {
    static DOMAINS = ['pdsls.dev']

    static async processURL(url, settings, uriMode) {
        const { pds, handle, nsid, rkey } = this.parseURL(url)
        console.log(`PDSls handler recieved:`, pds, handle, nsid, rkey)

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

// static pdsls = /^https:\/\/pdsls\.dev\/(?<pds>[\w.%-]+)(?:\:\/)?(?:\/(?<handle>[\w.:%-]+))?(?:\/(?<nsid>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?(?:\/)?(?:[?#].*)?$/
