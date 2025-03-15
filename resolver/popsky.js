import { composeUri, decomposeUri, getRecord } from "../utils.js"

export class Popsky {
    static NSID_AUTH = 'app.popsky'
    static TESTS = [{
        uri: 'at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.review/3lkaaaehouk2y',
        output: 'https://popsky.social/review/at%3A%2F%2Fdid%3Aplc%3Avqqvvqtd2jazpzref6brt3wn%2Fapp.popsky.review%2F3lkaaaehouk2y'
    }, {
        uri: 'at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.listItem/3lkd2gxnfrs2m',
        output: 'https://popsky.social/list/at%3A%2F%2Fdid%3Aplc%3Avqqvvqtd2jazpzref6brt3wn%2Fapp.popsky.list%2F3ljrg7jyh4s2q'
    }, {
        uri: 'at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.list/3ljtjowevxc2q',
        output: 'https://popsky.social/list/at%3A%2F%2Fdid%3Aplc%3Avqqvvqtd2jazpzref6brt3wn%2Fapp.popsky.list%2F3ljtjowevxc2q'
    }, {
        uri: 'at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.like/3lkeyssgokk2m',
        output: 'https://popsky.social/review/at%3A%2F%2Fdid%3Aplc%3A3danwc67lo7obz2fmdg6jxcr%2Fapp.popsky.review%2F3lkey5zlkts2m'
    }, {
        uri: 'at://did:plc:vqqvvqtd2jazpzref6brt3wn/app.popsky.comment/3ljkslxhse22u',
        output: 'https://popsky.social/review/at%3A%2F%2Fdid%3Aplc%3Aofrbh253gwicbkc5nktqepol%2Fapp.popsky.review%2F3ljk2wnjpo22u'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Popsky resolver received: ` + did, nsid, rkey)

        const baseUrl = `https://popsky.social`
        if (!did) return settings.alwaysOpen ? baseUrl : null
        const fallback = `${baseUrl}/profile/${did}`
        if (!rkey) return fallback

        switch (nsid) {
            case 'app.popsky.review':
                return `${baseUrl}/review/${encodeURIComponent(composeUri({ did, nsid, rkey }))}`
            case 'app.popsky.comment':
                return (await this.retrieveUrl({ did, nsid, rkey }, "subjectUri")) || fallback
            case 'app.popsky.list':
                return `${baseUrl}/list/${encodeURIComponent(composeUri({ did, nsid, rkey }))}`
            case 'app.popsky.listItem':
                return (await this.retrieveUrl({ did, nsid, rkey }, "listUri")) || fallback
            case 'app.popsky.like':
                return (await this.retrieveUrl({ did, nsid, rkey }, "subjectUri")) || fallback
            default:
                return fallback
        }
    }

    static async retrieveUrl(args, key) {
        let uri = (await getRecord(args)).value?.[key]
        if (!uri) return null
        let type = uri.split('/')[3].split('.')[2]
        if (!type) return null
        return `https://popsky.social/${type}/${encodeURIComponent(uri)}`
    }
}