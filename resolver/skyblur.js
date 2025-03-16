export class Skyblur {
    static NSID_AUTH = 'uk.skyblur'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/uk.skyblur.post/3lkalntftxk2f',
        output: 'https://skyblur.uk/post/did:plc:hx53snho72xoj7zqt5uice4u/3lkalntftxk2f'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Skyblur resolver received: `, { did, nsid, rkey })

        if (did && rkey && nsid === 'uk.skyblur.post') {
            return `https://skyblur.uk/post/${did}/${rkey}`
        }
        return `https://skyblur.uk`
    }
}