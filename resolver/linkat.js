export class LinkAT {
    static NSID_AUTH = 'blue.linkat'
    static TESTS = [{
        uri: 'at://did:plc:4gow62pk3vqpuwiwaslcwisa/blue.linkat.board/self',
        output: 'https://linkat.blue/did:plc:4gow62pk3vqpuwiwaslcwisa'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`LinkAt resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? `https://linkat.blue` : null
        return `https://linkat.blue/${did}`
    }
}