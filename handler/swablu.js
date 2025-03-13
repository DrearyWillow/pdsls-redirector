import { getDid } from '../utils.js'

export class Swablu {
    static DOMAINS = ['swablu.pages.dev']

    static async processURL(url, settings, uriMode) {
        let { type, uri } = this.parseURL(url)
        
        console.log(`Swablu handler received: ` + type, uri )
        if (!uri) return null
        uri = decodeURIComponent(uri)

        if (type != 'profile') {
            if (!uriMode && settings.getPostThread && type === "post") {
                const depth = settings.replyCount
                const parents = settings.parentCount
                return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${uri}&depth=${depth}&parentHeight=${parents}`
            }
            return uri
        }

        const did = await getDid(uri)
        return did ? `at://${did}` : null
    }

    static parseURL(url) {
        const parts = url.hash.split("?")[0].split("/")
        const type = parts[1]
        const uri = parts[2]
        return { type, uri };
    }
}