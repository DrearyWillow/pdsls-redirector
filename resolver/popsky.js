import { composeUri, decomposeUri, getRecord } from "../utils.js"

export class Popsky {
    static NSID_AUTH = ['app.popsky']

    static async processURI({did, nsid, rkey}) {
        console.log(`Popsky resolver received: ` + did, nsid, rkey)

        const baseUrl = `https://popsky.social`
        if (!did) return settings.alwaysOpen ? baseUrl : null
        const fallback = `${baseUrl}/profile/${did}`
        if (!rkey) return fallback
        
        switch (nsid) {
            case 'app.popsky.review':
                return `${baseUrl}/review/${encodeURIComponent(composeUri({did, nsid, rkey}))}`
            case 'app.popsky.comment':
                return (await this.retrieveUrl({did, nsid, rkey}, "subjectUri")) || fallback
            case 'app.popsky.list':
                return `${baseUrl}/list/${encodeURIComponent(composeUri({did, nsid, rkey}))}`
            case 'app.popsky.listItem':
                return (await this.retrieveUrl({did, nsid, rkey}, "listUri")) || fallback
            case 'app.popsky.like':
                return (await this.retrieveUrl({did, nsid, rkey}, "subjectUri")) || fallback
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