
//   static atpTools = /^https:\/\/atp\.tools(?:\/at:\/(?:(?<handle>[\w.:%-]+)(?:\/(?<nsid>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+)?)?)?)?)?(?:[?#].*)?$/
// https://atp.tools/at:/ngerakines.me/blue.badge.collection
import { composeUri, getDid } from '../utils.js'

export class ATPTools {
    static DOMAINS = ['atp.tools']

    static async processURL(url, settings, uriMode) {
        const { handle, nsid, rkey } = this.parseURL(url)
        console.log(`ATPTools handler recieved: ` + handle, nsid, rkey)
        const did = await getDid(decodeURIComponent(handle))
        if (!did) return null
        return composeUri({did, nsid, rkey})
    }

    static parseURL(url) {
        let [handle, nsid, rkey] = url.pathname.split("/").slice(2)
        return {handle, nsid, rkey}
    }
}