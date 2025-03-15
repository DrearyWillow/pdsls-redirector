import { getDid } from '../utils.js'

export class ATProtoCamp {
    static DOMAINS = ['atproto.camp']
    static TESTS = [{
        url: 'https://atproto.camp/did:plc:5ugrbulluc7sqlj6owblmvcf/3ljzflfou5224',
        returned: 'at://did:plc:5ugrbulluc7sqlj6owblmvcf/blue.badge.collection/3ljzflfou5224',
        output: 'https://pdsls.dev/at://did:plc:5ugrbulluc7sqlj6owblmvcf/blue.badge.collection/3ljzflfou5224'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`camp handler recieved: ` + handle, rkey)
        const did = await getDid(handle)
        return did ? `at://${did}/blue.badge.collection/${rkey || ""}` : null
    }

    static parseURL(url) {
        let [handle, rkey] = url.pathname.split("/").slice(1)
        return { handle, rkey }
    }
}