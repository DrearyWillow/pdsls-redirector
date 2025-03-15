export class BookHive {
    static NSID_AUTH =  'buzz.bookhive'
    static TESTS = [{
        uri: 'at://did:plc:7qitycu5fq3ijt6vkprpfhfo/buzz.bookhive.book/3ljzug6alc22q',
        output: 'https://bookhive.buzz/profile/did:plc:7qitycu5fq3ijt6vkprpfhfo'
    }]

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`BookHive resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? "https://bookhive.buzz" : null
        return `https://bookhive.buzz/profile/${did}`
    }
}