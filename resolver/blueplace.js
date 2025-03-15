export class BluePlace {
    static NSID_AUTH = 'blue.place'
    static TESTS = [{
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/blue.place.pixel/gq3daobugezto',
        output: 'https://place.blue'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`BluePlace resolver received: ` + did, nsid, rkey)
        return "https://place.blue"
    }
}