export class LinkAT {
    static NSID_AUTH = 'blue.linkat'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`LinkAt resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://linkat.blue` : null
        return `https://linkat.blue/${did}`
    }
}