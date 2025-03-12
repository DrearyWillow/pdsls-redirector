// static bookhive = /^https:\/\/bookhive\.buzz(?:\/profile\/(?<handle>[\w.:%-]+))/
// BookHive: https://bookhive.buzz/profile/mrjonathanallan.bsky.social

import { getDid } from '../utils.js'

export class BookHive {
    static DOMAINS = ['bookhive.buzz']

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`pastesphere handler recieved: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}/buzz.bookhive.book` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(2)
        return {handle}
    }
}