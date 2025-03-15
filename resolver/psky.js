export class Psky {
    static NSID_AUTH = 'social.psky'
    static TESTS = [{
        uri: 'at://did:plc:b3pn34agqqchkaf75v7h43dk/social.psky.chat.message',
        output: 'https://psky.social'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Psky resolver received: `, { did, nsid, rkey })
        return `https://psky.social`
    }
}