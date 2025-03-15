import { getDid } from '../utils.js'

export class SuperCoolClient {
    static DOMAINS = ['supercoolclient.pages.dev']
    static TESTS = [{
        url: 'https://supercoolclient.pages.dev/did:plc:avlpu4l2j5u3johint7tqrmu/post/3lk4qcbspkk2w',
        output: 'https://pdsls.dev/at://did:plc:avlpu4l2j5u3johint7tqrmu/app.bsky.feed.post/3lk4qcbspkk2w'
    }, {
        url: 'https://supercoolclient.pages.dev/did:plc:x7xbzcp7l3vnqdneodcii5u7',
        output: 'https://pdsls.dev/at://did:plc:x7xbzcp7l3vnqdneodcii5u7'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, suffix, rkey } = this.parseURL(url)
        console.log(`SuperCoolClient handler received: ` + handle, suffix, rkey)
        const did = await getDid(handle)
        if (!did) return null
        if (rkey && suffix === 'post') {
            return `at://${did}/app.bsky.feed.post/${rkey}`
        }
        return `at://${did}`
    }

    static parseURL(url) {
        let [handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return {handle, suffix, rkey}
    }
}