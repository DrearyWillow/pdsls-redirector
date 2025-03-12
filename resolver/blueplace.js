export class BluePlace {
    static NSID_AUTH = 'blue.place'

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`BluePlace resolver received: ` + did, nsid, rkey)
        return "https://place.blue"
    }
}