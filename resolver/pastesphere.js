export class PasteSphere {
    static NSID_AUTH =  'link.pastesphere'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`PasteSphere resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? "https://pastesphere.link" : null
        if (rkey && (nsid === "link.pastesphere.snippet")) {
        return `https://pastesphere.link/user/${did}/snippet/${rkey}`
        }
        return `https://pastesphere.link/user/${did}`
    }
}