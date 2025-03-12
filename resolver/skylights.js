export class Skylights {
    static NSID_AUTH = 'my.skylights'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`Skylights resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://skylights.my` : null
        // there is currently no skylights record page, only the profile
        return `https://skylights.my/profile/${did}`
    }
}