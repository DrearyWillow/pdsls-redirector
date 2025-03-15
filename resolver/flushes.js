import { getHandle } from "../utils.js"

export class Flushes {
    static NSID_AUTH =  'im.flushing'
    static TESTS = [{
        uri: 'at://did:plc:gq4fo3u6tqzzdkjlwzpb23tj/im.flushing.right.now/3lk7h3dg2ws2d',
        output: 'https://flushes.app/profile/dame.is'
    }]

    static async processURI({did, nsid, rkey}) {
        console.log(` resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://flushes.app` : null
        let handle = await getHandle(did) // temporary until dame supports did
        return `https://flushes.app/profile/${handle}`
    }
}