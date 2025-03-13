import { getDid } from '../utils.js'

export class Woosh {
    static DOMAINS = ['woosh.link']

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`Woosh handler received: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}` : null
    }

    static parseURL(url) {
        let [ handle ] = url.pathname.split("/").slice(1)
        return { handle }
    }
}