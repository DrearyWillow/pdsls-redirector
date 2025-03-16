export class Pinksky {
    static NSID_AUTH = 'social.pinksky'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/social.pinksky.app.preference/3linihst3u722',
        output: 'https://pinksky.app/profile/did:plc:hx53snho72xoj7zqt5uice4u'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Bluesky resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? `https://pinksky.app` : null
        return `https://pinksky.app/profile/${did}`
    }
}