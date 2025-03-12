import { getHandle } from "../utils.js"

export class Flushes {
    static NSID_AUTH =  'im.flushing'

    static async processURI({did, nsid, rkey}) {
        console.log(` resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://flushes.app` : null
        let handle = await getHandle(did) // temporary until dame supports did
        return `https://flushes.app/profile/${handle}`
    }
}