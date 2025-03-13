import { getRecord, composeUri } from "../utils.js"

export class Skylights {
    static NSID_AUTH = 'my.skylights'

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`Skylights resolver received: ` + did, nsid, rkey)
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