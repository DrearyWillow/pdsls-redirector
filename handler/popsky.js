import { getDid } from '../utils.js'

export class Popsky {
    static DOMAINS = ['popsky.social']

    static async processURL(url, settings, uriMode) {
        const { prefix, value } = this.parseURL(url)
        console.log(`Popsky handler received: ` + prefix, value)

        switch (prefix) {
            case 'review':
                return decodeURIComponent(value)
            case 'list':
                return decodeURIComponent(value)
            case 'profile':
                const did = await getDid(value)
                return did ? `at://${did}` : null
        }
    }

    static parseURL(url) {
        let [prefix, value] = url.pathname.split("/").slice(1)
        return {prefix, value}
    }
}