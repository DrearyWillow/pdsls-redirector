export class BlueBadge {
    static NSID_AUTH = 'blue.badge'
    static TESTS = [{
        uri: 'at://did:plc:7xfdxduygw3j6t5x7nququwy/blue.badge.collection/3lkez7zyspv2k',
        output: 'https://atproto.camp/did:plc:7xfdxduygw3j6t5x7nququwy/3lkez7zyspv2k'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`BlueBadge resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? `https://atproto.camp` : null
        // one collection for now, but just to be safe
        if (!rkey || nsid !== "blue.badge.collection") {
            return `https://atproto.camp/${did}`
        }
        return `https://atproto.camp/${did}/${rkey}`
    }
}