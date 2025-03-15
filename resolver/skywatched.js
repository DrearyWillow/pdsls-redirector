import { getHandle } from "../utils.js"

export class Skywatched {
    static NSID_AUTH = 'app.skywatched'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/app.skywatched.settings/self',
        output: 'https://skywatched.app/user/dreary.dev'
    }]

    static async processURI({did, nsid, rkey}) {
        console.log(`Bluesky resolver received: ` + did, nsid, rkey)

        if (!did) return settings.alwaysOpen ? `https://skywatched.app` : null
        const handle = await getHandle(did)
        if (!handle) return settings.alwaysOpen ? `https://skywatched.app` : null
        return `https://skywatched.app/user/${handle}`
    }
}