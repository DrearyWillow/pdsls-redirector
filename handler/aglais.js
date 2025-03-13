import { getDid } from '../utils.js'

export class Aglais {
    static DOMAINS = ['aglais.pages.dev']

    static async processURL(url, settings, uriMode) {
        const { handle, seg2, seg3 } = this.parseURL(url)

        console.log(`aglais handler received: ` + handle, seg2, seg3)
        const did = await getDid(handle)
        if (!did) return null

        if (['curation-lists','moderation-lists'].includes(seg2)) {
            return seg3 ? `at://${did}/app.bsky.graph.list/${seg3}` : `at://${did}`
        }

        const rkey = seg2 || null
        if (!rkey) return `at://${did}`
        const postUri = `${did}/app.bsky.feed.post/${rkey}`

        if (!uriMode && settings.getPostThread) {
            const depth = settings.replyCount
            const parents = settings.parentCount
            return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
        }
        
        return `at://${postUri}`
    }

    static parseURL(url) {
        let [handle, seg2, seg3] = url.pathname.split("/").slice(1)
        return {handle, seg2, seg3}
    }
}
