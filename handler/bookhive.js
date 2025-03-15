import { getDid } from '../utils.js'

export class BookHive {
    static DOMAINS = ['bookhive.buzz']
    static TESTS = [{
        url: 'https://bookhive.buzz/profile/mrjonathanallan.bsky.social',
        output: 'https://pdsls.dev/at://did:plc:2q4isspb57roeejgvsgcfzf2/buzz.bookhive.book'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`pastesphere handler recieved: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}/buzz.bookhive.book` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(2)
        return { handle }
    }
}