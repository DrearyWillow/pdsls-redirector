import { composeUri, getDid } from '../utils.js'

export class Skyblur {
    static DOMAINS = ['skyblur.uk']

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, rkey } = this.parseURL(url)
        console.log(`Skyblur handler received: ` + prefix, handle, rkey)

        const did = await getDid(handle)
        if (did && rkey && prefix === "post") {
            return composeUri({did, nsid: 'uk.skyblur.post', rkey})
        }
        return null
    }

    static parseURL(url) {
        let [prefix, handle, rkey] = url.pathname.split("/").slice(1)
        return {prefix, handle, rkey}
    }
}