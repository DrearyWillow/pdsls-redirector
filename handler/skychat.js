import { getDid } from '../utils.js'

export class Skychat {
    static DOMAINS = ['skychat.social']

    static async processURL(url, settings, uriMode) {
        const { type, handle, rkey } = this.parseURL(url)
        
        console.log(`skychat handler received: ` + type, handle, rkey)
        const did = await getDid(handle)
        if (!did) return null
        switch (type) {
        case 'feed':
            return `at://${did}/app.bsky.feed.generator/${rkey || ""}`
        case 'list':
            return `at://${did}/app.bsky.graph.list/${rkey || ""}`
        case 'thread':
            if (!rkey) return `at://${did}`
            const postUri = `${did}/app.bsky.feed.post/${rkey}`
            if (!uriMode && settings.getPostThread) {
                const depth = settings.replyCount
                const parents = settings.parentCount
                return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
            }
        default:
            return `at://${did}`
        }
    }

    static parseURL(url) {
        let [type, handle, rkey] = url.pathname.split("/").slice(1)
        type = type.slice(1)
        return {type, handle, rkey}
    }
}
