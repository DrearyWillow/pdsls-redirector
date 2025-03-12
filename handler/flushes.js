import { getDid } from '../utils.js'

export class Flushes {
    static DOMAINS = ['flushes.app']

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`Flushes handler received: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(2)
        return {handle}
    }
}

// https://flushes.app/profile/aliceweb.xyz