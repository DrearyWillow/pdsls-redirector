import { composeUri, getDid, postThreadCheck } from '../utils.js'

export class MyB {
    static DOMAINS = ['myb.zeu.dev']
    static TESTS = [{
        url: 'https://myb.zeu.dev/p/aoc.bsky.social/3lkep3jemoc2c#selected_post',
        output: 'https://pdsls.dev/at://did:plc:p7gxyfr5vii5ntpwo7f6dhe2/app.bsky.feed.post/3lkep3jemoc2c'
    }, {
        url: 'https://myb.zeu.dev/p/aoc.bsky.social',
        output: 'https://pdsls.dev/at://did:plc:p7gxyfr5vii5ntpwo7f6dhe2'
    }, {
        url: 'https://myb.zeu.dev/?iss=https%3A%2F%2Fbsky.social&state=irWF0wPDsfUb-eHIVBw0qg&code=cod-f41b1cbf3aa4623e72fea7ee9381dc5c8f26571b2f76c51b1de16ebe56cad447',
        output: 'https://pdsls.dev'
    }, {
        url: 'https://myb.zeu.dev/p/paizuri.moe/stats',
        output: 'https://pdsls.dev/at://did:plc:xwhsmuozq3mlsp56dyd7copv'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`MyB handler received: `, { handle, rkey })

        const did = await getDid(handle)
        if (!did) return null

        if (rkey) {
            const uri = composeUri({ did, nsid: 'app.bsky.feed.post', rkey })
            return postThreadCheck(uri, settings, uriMode) || uri
        }

        return `at://${did}`
    }

    static parseURL(url) {
        let [handle, rkey] = url.pathname.split("/").slice(2)
        if (['stats'].includes(rkey)) rkey = undefined
        return { handle, rkey }
    }
}