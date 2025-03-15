import { getDid } from '../utils.js'

export class Flushes {
    static DOMAINS = ['flushes.app']
    static TESTS = [{
        url: 'https://flushes.app/profile/aliceweb.xyz',
        output: 'https://pdsls.dev/at://did:plc:by3jhwdqgbtrcc7q4tkkv3cf'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`Flushes handler received: ` + handle)
        // temporary until dame implements DID profile links
        const did = await getDid(handle)
        return did ? `at://${did}` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(2)
        return {handle}
    }
}