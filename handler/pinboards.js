// https://pinboards.jeroba.xyz/profile/did:plc:hx53snho72xoj7zqt5uice4u/board/3linhxrqxtn2s

import { getDid } from '../utils.js'

export class Pinboards {
    static DOMAINS = ['pinboards.jeroba.xyz']

    static async processURL(url, settings, uriMode) {
        const { handle, type, rkey } = this.parseURL(url)
        console.log(`pinboards handler received: ` + handle, type, rkey)
        const did = await getDid(handle)
        if (!did) return null
        if (type === `board` && rkey) {
            return `at://${did}/xyz.jeroba.tags.tag/${rkey}`
        }
        return null
    }

    static parseURL(url) {
        let [handle, type, rkey] = url.pathname.split("/").slice(2)
        return {handle, type, rkey}
    }
}