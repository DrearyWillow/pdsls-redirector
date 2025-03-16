import { getRecord } from "../utils.js"

export class BookHive {
    static NSID_AUTH = 'buzz.bookhive'
    static TESTS = [{
        uri: 'at://did:plc:7qitycu5fq3ijt6vkprpfhfo/buzz.bookhive.book/3ljzug6alc22q',
        output: 'https://bookhive.buzz/books/bk_vJqvnlVDObZ8WI8IDikG'
    }, {
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/buzz.bookhive.buzz/3lkggokbnts2h',
        output: 'https://bookhive.buzz/books/bk_3bUlK3bFMgFFuJXP4wd3'
    }, {
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/buzz.bookhive.buzz',
        output: 'https://bookhive.buzz/profile/did:plc:hx53snho72xoj7zqt5uice4u'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`BookHive resolver received: `, { did, nsid, rkey })
        let baseUrl = 'https://bookhive.buzz'
        if (!did) return settings.alwaysOpen ? baseUrl : null
        baseUrl += `/profile/${did}`
        let record, hiveId
        if (nsid === 'buzz.bookhive.book' && rkey) {
            return this.retrieveBookLink({ did, nsid, rkey }) || baseUrl
        } else if (nsid === 'buzz.bookhive.buzz') {
            record = await getRecord({ did, nsid, rkey })
            let bookUri = record?.value?.book?.uri
            if (!bookUri) return baseUrl
            return this.retrieveBookLink({ uri: bookUri }) || baseUrl
        }
        return baseUrl
    }

    static async retrieveBookLink(args) {
        let record = await getRecord(args)
        let hiveId = record.value?.hiveId
        return hiveId ? `https://bookhive.buzz/books/${hiveId}` : null
    }
}