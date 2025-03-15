export class WhiteWind {
    static NSID_AUTH = 'com.whtwnd'
    static TESTS = [{
        uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi/com.whtwnd.blog.entry/3laq5rt7era2x',
        output: 'https://whtwnd.com/did:plc:oisofpd7lj26yvgiivf3lxsi/3laq5rt7era2x'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`WhiteWind resolver received: `, { did, nsid, rkey })
        // there is only collection for now, but i do this to stay safe
        if (!did) return settings.alwaysOpen ? `https://whtwnd.com` : null
        if (rkey && nsid === "com.whtwnd.blog.entry") {
            return `https://whtwnd.com/${did}/${rkey}`
        }
        return `https://whtwnd.com/${did}`
    }
}