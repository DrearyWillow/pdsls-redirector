import { getDid } from '../utils.js'

export class LinkAT {
    static DOMAINS = ['linkat.blue']
    static TESTS = [{
        url: 'https://linkat.blue/yukouduki.bsky.social',
        output: 'https://pdsls.dev/at://did:plc:jmnjdqnpy2wexcpqz5earmec/blue.linkat.board/self'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`LinkAt handler recieved: `, { handle })
        const did = await getDid(handle)
        return did ? `at://${did}/blue.linkat.board/self` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(1)
        return { handle }
    }
}