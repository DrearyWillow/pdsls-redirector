import { getDid } from '../utils.js'

export class Popsky {
    static DOMAINS = ['popsky.social']
    static TESTS = [{
        url: 'https://popsky.social/review/at:/did:plc:3danwc67lo7obz2fmdg6jxcr/app.popsky.review/3lkey5zlkts2m',
        output: 'https://pdsls.dev/at://did:plc:3danwc67lo7obz2fmdg6jxcr/app.popsky.review/3lkey5zlkts2m'
    }, {
        url: 'https://popsky.social/list/at:/did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.list/3ljrg6ul2j22q',
        output: 'https://pdsls.dev/at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.list/3ljrg6ul2j22q'
    }, {
        url: 'https://popsky.social/profile/cjfulton.bsky.social/reviews',
        output: 'https://pdsls.dev/at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.review'
    }, {
        url: 'https://popsky.social/lists?authorDid=did%3Aplc%3Avqqvvqtd2jazpzref6brt3wn',
        output: 'https://pdsls.dev/at://did:plc:vqqvvqtd2jazpzref6brt3wn'
    }, {
        url: 'https://popsky.social/reviews?authorDid=did%3Aplc%3Avqqvvqtd2jazpzref6brt3wn',
        output: 'https://pdsls.dev/at://did:plc:vqqvvqtd2jazpzref6brt3wn'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, value, authorDid } = this.parseURL(url)
        console.log(`Popsky handler received: `, { prefix, value, authorDid })

        switch (prefix) {
            case 'review':
            case 'list':
                return value.startsWith('at%3A')
                    ? decodeURIComponent(value)
                    : value.replace('at:/', 'at://')
            case 'reviews':
            case 'lists':
                if (!authorDid) return null
                return authorDid.startsWith('did%3A')
                    ? `at://${decodeURIComponent(authorDid)}`
                    : `at://${authorDid}`
            case 'profile':
                const parts = value.split('/')
                const did = await getDid(parts[0])
                const nsid = 
                    parts[1] === 'reviews' ? '/app.popsky.review' :
                    parts[1] === 'lists' ? '/app.popsky.list' : ''
                return did ? `at://${did}${nsid}` : null
            default:
                return null
        }
    }

    static parseURL(url) {
        let [prefix, ...value] = url.pathname.split("/").slice(1)
        value = value.join('/')
        let authorDid = url.searchParams.get('authorDid')
        return { prefix, value, authorDid }
    }
}