// static internect = /^https:\/\/internect\.info\/did\/(?<did>[\w.:%-]+)(?:[?#].*)?$/
// Internect: https://internect.info/did/did:plc:znmktqkgqhm2twxcbqiszvx4

export class Internect {
    static DOMAINS = ['internect.info']

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