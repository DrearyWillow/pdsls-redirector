export class PasteSphere {
    static NSID_AUTH = 'link.pastesphere'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/link.pastesphere.snippet/3liv2xijzm22b',
        output: 'https://pastesphere.link/user/did:plc:hx53snho72xoj7zqt5uice4u/snippet/3liv2xijzm22b'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`PasteSphere resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? "https://pastesphere.link" : null
        if (rkey && (nsid === "link.pastesphere.snippet")) {
            return `https://pastesphere.link/user/${did}/snippet/${rkey}`
        }
        return `https://pastesphere.link/user/${did}`
    }
}