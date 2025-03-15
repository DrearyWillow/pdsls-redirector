export class Bluesky {
    static NSID_AUTH = 'app.bsky'
    static TESTS = [{
        url: '',
        output: ''
    }]

    static async processURI({did, nsid, rkey}) {
        console.log(`Bluesky resolver received: ` + did, nsid, rkey)

        // TODO: more code here, for example...
        if (!did) return settings.alwaysOpen ? `https://bsky.app` : null
    }
}