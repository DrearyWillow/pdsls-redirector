import { getDid } from '../utils.js'

export class Skychat {
    static DOMAINS = ['skychat.social']
    static TESTS = [{
        url: 'https://skychat.social/#thread/did:plc:veryepic2bagxnblv63a2hac/3l7t55u6srs2x',
        output: 'https://pdsls.dev/at://did:plc:veryepic2bagxnblv63a2hac'
    }, {
        url: 'https://skychat.social/#profile/did:plc:vwzwgnygau7ed7b7wt5ux7y2',
        output: 'https://pdsls.dev/at://did:plc:vwzwgnygau7ed7b7wt5ux7y2'
    }]

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
        let [type, handle, rkey] = url.hash.split("/")
        type = type.slice(1)
        return { type, handle, rkey }
    }
}
