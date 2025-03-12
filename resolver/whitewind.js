export class WhiteWind {
    static NSID_AUTH = 'com.whtwnd'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`WhiteWind resolver received: ` + did, nsid, rkey)
        // there is only collection for now, but i do this to stay safe
        if (!did) return settings.alwaysOpen ? `https://whtwnd.com` : null
        if (rkey && nsid === "com.whtwnd.blog.entry") {
            return `https://whtwnd.com/${did}/entries/${rkey}`
        }
        return `https://whtwnd.com/${did}`
    }
}