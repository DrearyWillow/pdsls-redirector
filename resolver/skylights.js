import { getRecord, composeUri } from "../utils.js"

export class Skylights {
    static NSID_AUTH = 'my.skylights'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/my.skylights.rel/3lka75lkygc2k',
        output: 'https://skywatched.app/review/at%3A%2F%2Fdid%3Aplc%3Ahx53snho72xoj7zqt5uice4u%2Fmy.skylights.rel%2F3lka75lkygc2k',
    }, {
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/my.skylights.rel/3lc7cyds5al2w',
        output: 'https://skylights.my/profile/did:plc:hx53snho72xoj7zqt5uice4u'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`Skylights resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? `https://skylights.my` : null

        if (nsid === 'my.skylights.rel') {
            let record = await getRecord({ did, nsid, rkey })
            if (record.value?.from === "skywatched") {
                let uri = encodeURIComponent(composeUri({ did, nsid, rkey }))
                return `https://skywatched.app/review/${uri}`
            }
        }

        return `https://skylights.my/profile/${did}`
    }
}