
// static linkAt = /^https:\/\/linkat\.blue\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
// LinkAt: https://linkat.blue/yukouduki.bsky.social

import { getDid } from '../utils.js'

export class LinkAT {
    static DOMAINS = ['linkat.blue']

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`linkAt handler recieved: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}/blue.linkat.board/self` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(1)
        return {handle}
    }
}