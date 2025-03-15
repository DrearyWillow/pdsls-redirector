import { composeUri, getDid } from '../utils.js'

export class Skyblur {
    static DOMAINS = ['skyblur.uk']
    static TESTS = [{
        url: 'https://skyblur.uk/post/did:plc:hx53snho72xoj7zqt5uice4u/3lkalntftxk2f',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/uk.skyblur.post/3lkalntftxk2f'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, rkey } = this.parseURL(url)
        console.log(`Skyblur handler received: `, { prefix, handle, rkey })

        const did = await getDid(handle)
        if (did && rkey && prefix === "post") {
            return composeUri({ did, nsid: 'uk.skyblur.post', rkey })
        }
        return null
    }

    static parseURL(url) {
        let [prefix, handle, rkey] = url.pathname.split("/").slice(1)
        return { prefix, handle, rkey }
    }
}