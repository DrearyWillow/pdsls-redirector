import { getDid } from '../utils.js'

export class Bluesky {
    static DOMAINS = ['bsky.app', 'main.bsky.dev', 'langit.pages.dev', 'tokimekibluesky.vercel.app', 'akari.blue']

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)

        console.log(`bluesky handler received: ` + prefix, handle, suffix, rkey)
        const did = await getDid(handle)
        if (!did) return null

        if (prefix === "starter-pack" && rkey) {
            return `at://${did}/app.bsky.graph.starterpack/${rkey}`
        }

        if (!rkey || (prefix === "profile" && rkey === "search")) return `at://${did}`
        if (prefix !== "profile") return null

        switch (suffix) {
        case "post":
            const postUri = `${did}/app.bsky.feed.post/${rkey}`
            if (!uriMode && settings.getPostThread) {
            const depth = settings.replyCount
            const parents = settings.parentCount
            return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${postUri}&depth=${depth}&parentHeight=${parents}`
            }
            return `at://${postUri}`
        case "feed":
            return `at://${did}/app.bsky.feed.generator/${rkey}`
        case "lists":
            return `at://${did}/app.bsky.graph.list/${rkey}`
        default:
            return null
        }
    }

    static parseURL(url) {
        const sliceIndex = url.hostname === 'langit.pages.dev' ? 3 : 1;
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(sliceIndex);
        if (!['post', 'lists', 'feed'].includes(suffix)) {
            rkey = suffix
            suffix = undefined
        } 
        return {prefix, handle, suffix, rkey}
    }
}

