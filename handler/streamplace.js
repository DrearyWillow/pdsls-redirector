import { findRecordMatch, getDid, getServiceEndpoint } from '../utils.js'

export class Streamplace {
    static DOMAINS = ['stream.place']
    static TESTS = [{
        url: 'https://stream.place',
        output: 'https://pdsls.dev'
    }, {
        url: 'https://stream.place/justin.jplt.com?did=did%3Aplc%3Aa5mgfv3la6g7ww2ptxlwafhk&time=2025-03-26T16%3A56%3A23.229Z',
        output: 'https://pdsls.dev/at://did:plc:a5mgfv3la6g7ww2ptxlwafhk/place.stream.livestream/3llcavuf2422v'
    }, {
        url: 'https://stream.place/mamemomonga.bsky.social?did=did%3Aplc%3Anhlqb25lxuqovznalcgbj5qd&time=2025-04-05T04%3A48%3A18.587Z',
        output: 'https://pdsls.dev/at://did:plc:nhlqb25lxuqovznalcgbj5qd/place.stream.livestream/3lm24veduwe24'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, time } = this.parseURL(url)
        console.log(`Streamplace handler received: `, { handle, time })

        const did = await getDid(handle)
        if (!did) return null
        if (!time) return `at://${did}`

        const service = await getServiceEndpoint(did)
        // remove seconds from time and check records 
        let matchObj = { createdAt: time.substring(0, time.lastIndexOf(":")) }
        let uri = await findRecordMatch(did, service, 'place.stream.livestream', matchObj, true)

        return uri || `at://${did}`
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(1)
        let params = url.searchParams
        handle = decodeURIComponent(params.get('did')) || handle
        let time = decodeURIComponent(params.get('time'))
        return { handle, time }
    }
}