import { getDid } from '../utils.js'

export class Aglais {
    static DOMAINS = ['aglais.pages.dev']
    static TESTS = [{
        url: 'https://aglais.pages.dev/did:plc:hx53snho72xoj7zqt5uice4u/moderation-lists/3ldc5ohwfsu2n',
        returned: 'at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.graph.list/3ldc5ohwfsu2n',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.graph.list/3ldc5ohwfsu2n'
    }, {
        url: 'https://aglais.pages.dev/did:plc:by3jhwdqgbtrcc7q4tkkv3cf/3lj2cbts4522j',
        returned: 'at://did:plc:by3jhwdqgbtrcc7q4tkkv3cf/app.bsky.feed.post/3lj2cbts4522j',
        output: 'https://pdsls.dev/at://did:plc:by3jhwdqgbtrcc7q4tkkv3cf/app.bsky.feed.post/3lj2cbts4522j'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, seg2, seg3 } = this.parseURL(url)

        console.log(`aglais handler received: ` + handle, seg2, seg3)
        const did = await getDid(handle)
        if (!did) return null

        if (['curation-lists', 'moderation-lists'].includes(seg2)) {
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
        return { handle, seg2, seg3 }
    }
}
