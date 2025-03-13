import { getServiceEndpoint, getRecord, decomposeUri } from '../utils.js'

export class Frontpage {
    static NSID_AUTH = 'fyi.unravel'

    static async processURI({did, nsid, rkey, parentDid, parentRkey}, settings) {
        console.log(`Frontpage resolver received: ` + did, nsid, rkey, parentDid, parentRkey)
        if (!did) return settings.alwaysOpen ? `https://frontpage.fyi` : null
        if (!rkey) return `https://frontpage.fyi/profile/${did}`
        switch (nsid) {
        case "fyi.unravel.frontpage.post":
            return `https://frontpage.fyi/post/${did}/${rkey}`
        case "fyi.unravel.frontpage.comment":
            if (parentDid && parentRkey) {
            return `https://frontpage.fyi/post/${parentDid}/${parentRkey}/${did}/${rkey}`
            }
            const service = await getServiceEndpoint(did)
            if (!service) return settings.alwaysOpen ? `https://frontpage.fyi` : null
    
            const uri = (await getRecord({did, nsid, rkey, service})).value?.post?.uri
            if (!uri) return `https://frontpage.fyi/profile/${did}`

            let parentNsid
            ({ did: parentDid, nsid: parentNsid, rkey: parentRkey } = decomposeUri(uri))
            return `https://frontpage.fyi/post/${parentDid}/${parentRkey}/${did}/${rkey}`
        default:
            return `https://frontpage.fyi/profile/${did}`
        }
    }
}