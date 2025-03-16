import { composeUri, getDid, postThreadCheck } from '../utils.js'

export class Pinksky {
    static DOMAINS = ['pinksky.app', 'psky.co']
    static TESTS = [{
        url: 'https://pinksky.app/profile/retr0.id',
        output: 'https://pdsls.dev/at://did:plc:vwzwgnygau7ed7b7wt5ux7y2'
    }, {
        url: 'https://pinksky.app/profile/did:plc:hvakvedv6byxhufjl23mfmsd/app.bsky.feed.like/3lkgimpsjac23',
        output: 'https://pdsls.dev/at://did:plc:hvakvedv6byxhufjl23mfmsd/app.bsky.feed.like/3lkgimpsjac23'
    }, {
        url: 'https://pinksky.app/profile/did:plc:o2dz5dqkt64fdbvnutc4472w/app.bsky.feed.post/3lkghxf26qs22',
        output: 'https://pdsls.dev/at://did:plc:o2dz5dqkt64fdbvnutc4472w/app.bsky.feed.post/3lkghxf26qs22'
    }, {
        url: 'https://psky.co/dreary.dev',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u'
    }, {
        url: 'https://pinksky.app/profile/did:plc:w3sldsifm5pm4sojcqk2u4th/app.bsky.feed.post/3lkgjmnxawc2u?comments=at%3A%2F%2Fdid%3Aplc%3Aw3sldsifm5pm4sojcqk2u4th%2Fapp.bsky.feed.post%2F3lkgjmnxawc2u',
        output: 'https://pdsls.dev/at://did:plc:w3sldsifm5pm4sojcqk2u4th/app.bsky.feed.post/3lkgjmnxawc2u'
    }, {
        url: 'https://pinksky.app/timeline?uri=at%3A%2F%2Fdid%3Aplc%3Aw3sldsifm5pm4sojcqk2u4th%2Fapp.bsky.feed.post%2F3lkbohumxoc2v&src=profile&index=2&handle=megrocks.com&showThreads=did%3Aplc%3Aw3sldsifm5pm4sojcqk2u4th',
        output: 'https://pdsls.dev/at://did:plc:w3sldsifm5pm4sojcqk2u4th/app.bsky.feed.post/3lkbohumxoc2v'
    }]

    static async processURL(url, settings, uriMode) {
        let { prefix, handle, suffix, rkey, uri } = this.parseURL(url)
        console.log(`Pinksky handler received: ` + prefix, handle, suffix, rkey, uri)

        if (uri) {
            uri = decodeURIComponent(uri)
            return postThreadCheck(uri, settings, uriMode) || uri
        }

        const did = await getDid(handle)
        if (!did) return null

        if ((prefix === 'profile') && did && suffix && rkey) {
            return composeUri({ did, nsid: suffix, rkey })
        }
        return `at://${did}`
    }

    static parseURL(url) {
        if (url.hostname === 'psky.co') {
            let [handle] = url.pathname.split('/').slice(1)
            return { handle }
        }
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(1)
        let params = url.searchParams
        let uri = params.get('uri') || params.get('comments')
        handle = params.get('handle') || params.get('showThreads') || handle
        return { prefix, handle, suffix, rkey, uri }
    }
}