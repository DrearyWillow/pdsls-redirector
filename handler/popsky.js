import { getDid } from '../utils.js'

export class Popsky {
    static DOMAINS = ['popsky.social']
    static TESTS = [{
        url: 'https://popsky.social/review/at%3A%2F%2Fdid%3Aplc%3A3danwc67lo7obz2fmdg6jxcr%2Fapp.popsky.review%2F3lkey5zlkts2m',
        output: 'https://pdsls.dev/at://did:plc:3danwc67lo7obz2fmdg6jxcr/app.popsky.review/3lkey5zlkts2m'
    }, {
        url: 'https://popsky.social/list/at%3A%2F%2Fdid%3Aplc%3Avqqvvqtd2jazpzref6brt3wn%2Fapp.popsky.list%2F3ljrg6ul2j22q',
        output: 'https://pdsls.dev/at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.list/3ljrg6ul2j22q'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, value } = this.parseURL(url)
        console.log(`Popsky handler received: `, { prefix, value })

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
        return { prefix, value }
    }
}