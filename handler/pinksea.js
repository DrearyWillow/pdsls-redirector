import { getDid } from '../utils.js'

export class Pinksea {
    static DOMAINS = ['pinksea.art']
    static TESTS = [{
        url: 'https://pinksea.art/did:plc:bj3xr7ytf2mpglcsvcst7ogt/oekaki/3lbaugujgac2n',
        output: 'https://pdsls.dev/at://did:plc:bj3xr7ytf2mpglcsvcst7ogt/com.shinolabs.pinksea.oekaki/3lbaugujgac2n'
    }, {
        url: 'https://pinksea.art/did:plc:y33bag2x6rndakrseukqrtf3/oekaki/3lcfr7x37ckcj#did:plc:y33bag2x6rndakrseukqrtf3-3ldidgfrgak67',
        output: 'https://pdsls.dev/at://did:plc:y33bag2x6rndakrseukqrtf3/com.shinolabs.pinksea.oekaki/3ldidgfrgak67'
    }]

    static async processURL(url, settings, uriMode) {
        let { handle, type, rkey, handle2, rkey2 } = this.parseURL(url)
        console.log(`pinksea handler recieved: ` + handle, type, rkey, handle2, rkey2)
        handle2 = (handle2 === "undefined") ? undefined : handle2;
        rkey2 = (rkey2 === "undefined") ? undefined : rkey2;
        const did = await getDid((handle2 && rkey2) ? handle2 : handle)
        if (!did) return null
        let baseUrl = `at://${did}/com.shinolabs.pinksea.oekaki`
        if (rkey2) {
            return `${baseUrl}/${rkey2}`
        } else if (rkey) {
            return `${baseUrl}/${rkey}`
        }
        return baseUrl
    }

    static parseURL(url) {
        let [handle, type, rkey] = url.pathname.split("/").slice(1)
        let [handle2, rkey2] = url.hash.slice(1).split("-")
        return { handle, type, rkey, handle2, rkey2 }
    }
}