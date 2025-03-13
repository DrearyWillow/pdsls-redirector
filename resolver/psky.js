export class Psky {
    static NSID_AUTH = 'social.psky'

    static async processURI({did, nsid, rkey}) {
        console.log(`Psky resolver received: ` + did, nsid, rkey)
        return `https://psky.social`
    }
}