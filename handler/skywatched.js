import { getDid } from '../utils.js'

export class Skywatched {
    static DOMAINS = ['skywatched.app']

    static async processURL(url, settings, uriMode) {
        const { prefix, value } = this.parseURL(url)
        console.log(`Skywatched handler received: ` + prefix, value)

        if (!value) return null
        switch (prefix) {
            case 'review':
                return decodeURIComponent(value)
            case 'user':
                const did = await getDid(value)
                return did ? `at://${did}` : null
            default:
                return null
        }
    }

    static parseURL(url) {
        let [prefix, value] = url.pathname.split("/").slice(1)
        return {prefix, value}
    }
}