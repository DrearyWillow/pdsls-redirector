export class Internect {
    static DOMAINS = ['internect.info']
    static TESTS = [{
        url: 'https://internect.info/did/did:plc:znmktqkgqhm2twxcbqiszvx4',
        output: 'https://pdsls.dev/at://did:plc:znmktqkgqhm2twxcbqiszvx4'
    }]

    static async processURL(url, settings, uriMode) {
        const { did } = this.parseURL(url)
        console.log(`internect handler recieved: ` + did)
        return `at://${did}`
    }

    static parseURL(url) {
        let [did] = url.pathname.split("/").slice(2)
        return {did}
    }
}