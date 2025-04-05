import { getDid } from '../utils.js'

export class Skylight {
    static DOMAINS = ['skylight.social']
    static TESTS = [{
        url: 'https://skylight.social/profile/did:plc:hx53snho72xoj7zqt5uice4u/post/3llx2wxxf322y',
        returned: 'at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.feed.post/3llx2wxxf322y',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.feed.post/3llx2wxxf322y'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)
        console.log(`Skylight handler received: `, { prefix, handle, suffix, rkey })

        const did = await getDid(handle)
        if (!did) return null

        if (rkey) return `at://${did}/app.bsky.feed.post/${rkey}`
        return `at://${did}`
    }

    static parseURL(url) {
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return { prefix, handle, suffix, rkey }
    }
}