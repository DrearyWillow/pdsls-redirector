
import { getDid } from '../utils.js'

export class Ouranos {
    static DOMAINS = ['useouranos.app']

    static async processURL(url, settings, uriMode) {
        const { handle, rkey, uri } = this.parseURL(url)

        console.log(`ouranos handler received: ` + handle, rkey, uri)
        if (uri) {
            uri = decodeURIComponent(uri)
            return `at://${uri}`
        }
        const did = await getDid(handle)
        if (!did) return null
        return rkey ? `at://${did}/app.bsky.feed.post/${rkey}` : `at://${did}`
    }

    static parseURL(url) {
        let parts = url.pathname.split("/").slice(3)
        let handle = parts[0]
        let rkey = parts[2]
        let uri = url.query
        return {handle, rkey, uri}
    }
}
