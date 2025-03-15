export class Plonk {
    static DOMAINS = ['plonk.li']
    static TESTS = [{
        url: 'https://plonk.li/u/did:plc:hx53snho72xoj7zqt5uice4u',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u'
    }, {
        url: 'https://plonk.li/p/1b',
        returned: null,
        output: 'https://pdsls.dev'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, did } = this.parseURL(url)
        console.log(`Plonk handler recieved: `, { prefix, did })
        return (did && prefix === 'u') ? `at://${decodeURIComponent(did)}` : null
    }

    static parseURL(url) {
        let [prefix, did] = url.pathname.split("/").slice(1)
        return { prefix, did }
    }
}