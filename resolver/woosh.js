import { getHandle } from "../utils.js"

export class Woosh {
    static NSID_AUTH = 'link.woosh'
    static TESTS = [{
        uri: 'at://did:plc:id5dikobjnpksmozcdb6uybm/link.woosh.linkPage',
        output: 'https://woosh.link/woosh.link'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Woosh resolver received: `, { did, nsid, rkey })

        if (!did) return settings.alwaysOpen ? `https://woosh.link` : null
        const handle = await getHandle(did)
        if (!handle) return settings.alwaysOpen ? `https://woosh.link` : null
        return `https://woosh.link/${handle}`
    }
}