import { getDid } from '../utils.js'

export class Skylights {
    static DOMAINS = ['skylights.my']
    static TESTS = [{
        url: 'https://skylights.my/profile/watwa.re',
        output: 'https://pdsls.dev/at://did:plc:c764uyv2vgzswy5gpc4jgknf/my.skylights.rel'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`Skylights handler recieved: `, { handle })
        const did = await getDid(handle)
        return did ? `at://${did}/my.skylights.rel` : null
    }

    static parseURL(url) {
        let handle = url.pathname.split("/")[2]
        return { handle }
    }
}