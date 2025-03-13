export class Skyblur {
    static NSID_AUTH = ['uk.skyblur']

    static async processURI({did, nsid, rkey}) {
        console.log(`Skyblur resolver received: ` + did, nsid, rkey)

        if (did && rkey && nsid === 'uk.skyblur.post') {
            return `https://skyblur.uk/post/${did}/${rkey}`
        }
        return `https://skyblur.uk`
    }
}