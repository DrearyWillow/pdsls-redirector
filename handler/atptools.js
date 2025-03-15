import { composeUri, getDid } from '../utils.js'

export class ATPTools {
    static DOMAINS = ['atp.tools']
    static TESTS = [{
        url: 'https://atp.tools/at:/ngerakines.me/blue.badge.collection',
        returned: 'at://did:plc:cbkjy5n7bk3ax2wplmtjofq2/blue.badge.collection',
        output: 'https://pdsls.dev/at://did:plc:cbkjy5n7bk3ax2wplmtjofq2/blue.badge.collection'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, nsid, rkey } = this.parseURL(url)
        console.log(`ATPTools handler recieved: ` + handle, nsid, rkey)
        const did = await getDid(decodeURIComponent(handle))
        if (!did) return null
        return composeUri({ did, nsid, rkey })
    }

    static parseURL(url) {
        let [handle, nsid, rkey] = url.pathname.split("/").slice(2)
        return { handle, nsid, rkey }
    }
}