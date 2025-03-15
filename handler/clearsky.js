import { getDid } from '../utils.js'

export class Clearsky {
    static DOMAINS = ['clearsky.app']
    static TESTS = [{
        url: 'https://clearsky.app/souris.moe/blocking',
        output: 'https://pdsls.dev/at://did:plc:tj7g244gl5v6ai6cm4f4wlqp/app.bsky.graph.block'
    }, {
        url: 'https://clearsky.app/souris.moe/history',
        output: 'https://pdsls.dev/at://did:plc:tj7g244gl5v6ai6cm4f4wlqp/app.bsky.feed.post'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, type } = this.parseURL(url)
        console.log(`clearSky handler recieved: ` + handle, type)
        const did = await getDid(handle)
        if (!did) return null
        const typeSuffix =
            type === "history"
                ? "app.bsky.feed.post"
                : type === "blocking"
                    ? "app.bsky.graph.block"
                    : ""
        return `at://${did}/${typeSuffix}`
    };

    static parseURL(url) {
        let [handle, type] = url.pathname.split("/").slice(1)
        return { handle, type }
    }
}