
import { getDid } from '../utils.js'

export class Ouranos {
    static DOMAINS = ['useouranos.app']
    static TESTS = [{
        url: 'https://useouranos.app/dashboard/user/bitchy.mom/post/3lcbdn5fegs2n',
        output: 'https://pdsls.dev/at://did:web:witchy.mom/app.bsky.feed.post/3lcbdn5fegs2n'
    }, {
        url: 'https://useouranos.app/dashboard/feeds/oio4hkxaop4ao4wz2pp3f4cr?uri=at%3A%2F%2Fdid%3Aplc%3Aoio4hkxaop4ao4wz2pp3f4cr%2Fapp.bsky.feed.generator%2Flinux',
        output: 'https://pdsls.dev/at://at://did:plc:oio4hkxaop4ao4wz2pp3f4cr/app.bsky.feed.generator/linux'
    }]

    static async processURL(url, settings, uriMode) {
        let { handle, rkey, uri } = this.parseURL(url)

        console.log(`ouranos handler received: ` + handle, rkey, uri)
        if (uri) {
            uri = decodeURIComponent(uri)
            return `at://${uri}`
        }
        const did = await getDid(handle)
        if (!did) return null
        return rkey ? `at://${did}/app.bsky.feed.post/${rkey}` : `at://${did}`
    }

    static parseURL(url) {
        let parts = url.pathname.split("/").slice(3)
        let handle = parts[0]
        let rkey = parts[2]
        let uri = url.searchParams.get('uri')
        return { handle, rkey, uri }
    }
}
