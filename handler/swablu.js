import { getDid } from '../utils.js'

export class Swablu {
    static DOMAINS = ['swablu.pages.dev']
    static TESTS = [{
        url: 'https://swablu.pages.dev/#/list/at%3A%2F%2Fdid%3Aplc%3Acoe636ufo6qkscxl62rspep6%2Fapp.bsky.graph.list%2F3lcjxjuzfil2r',
        output: 'https://pdsls.dev/at://did:plc:coe636ufo6qkscxl62rspep6/app.bsky.graph.list/3lcjxjuzfil2r'
    }, {
        url: 'https://swablu.pages.dev/#/post/at%3A%2F%2Fdid%3Aplc%3Abnqkww7bjxaacajzvu5gswdf%2Fapp.bsky.feed.post%2F3lik7if2hos2j',
        output: 'https://pdsls.dev/at://did:plc:bnqkww7bjxaacajzvu5gswdf/app.bsky.feed.post/3lik7if2hos2j'
    }, {
        url: 'https://swablu.pages.dev/#/profile/did%3Aplc%3Abnqkww7bjxaacajzvu5gswdf',
        output: 'https://pdsls.dev/at://did:plc:bnqkww7bjxaacajzvu5gswdf'
    }]

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