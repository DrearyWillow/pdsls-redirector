import { getDid } from '../utils.js'

export class SuperCoolClient {
    static DOMAINS = ['supercoolclient.pages.dev']

    static async processURL(url, settings, uriMode) {
        const { handle, suffix, rkey } = this.parseURL(url)
        console.log(`SuperCoolClient handler received: ` + handle, suffix, rkey)
        const did = await getDid(handle)
        if (!did) return null
        if (rkey && suffix === 'post') {
            return `at://${did}/app.bsky.feed.post/${rkey}`
        }
        return `at://${did}`
    }

    static parseURL(url) {
        let [handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return {handle, suffix, rkey}
    }
}