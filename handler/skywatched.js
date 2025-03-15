import { getDid } from '../utils.js'

export class Skywatched {
    static DOMAINS = ['skywatched.app']
    static TESTS = [{
        url: 'https://skywatched.app/review/at%3A%2F%2Fdid%3Aplc%3Ahsqwcidfez66lwm3gxhfv5in%2Fmy.skylights.rel%2F3lk4ops7mow2b',
        output: 'https://pdsls.dev/at://did:plc:hsqwcidfez66lwm3gxhfv5in/my.skylights.rel/3lk4ops7mow2b'
    }, {
        url: 'https://skywatched.app/user/goose.art',
        output: 'https://pdsls.dev/at://did:plc:hsqwcidfez66lwm3gxhfv5in'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, value } = this.parseURL(url)
        console.log(`Skywatched handler received: ` + prefix, value)

        if (!value) return null
        switch (prefix) {
            case 'review':
                return decodeURIComponent(value)
            case 'user':
                const did = await getDid(value)
                return did ? `at://${did}` : null
            default:
                return null
        }
    }

    static parseURL(url) {
        let [prefix, value] = url.pathname.split("/").slice(1)
        return {prefix, value}
    }
}