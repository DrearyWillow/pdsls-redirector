export class BlueBadge {
    static NSID_AUTH = 'blue.badge'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`blueBadge resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://atproto.camp` : null
        // there is only collection for now, but i do this to stay safe
        if (!rkey || nsid !== "blue.badge.collection") {
            return `https://atproto.camp/${did}`
        }
        return `https://atproto.camp/${did}/${rkey}`
    }
}