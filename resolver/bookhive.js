export class BookHive {
    static NSID_AUTH =  'buzz.bookhive'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`BookHive resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? "https://bookhive.buzz" : null
        return `https://bookhive.buzz/profile/${did}`
    }
}