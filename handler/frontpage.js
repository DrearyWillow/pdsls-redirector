// static frontpage = /^https:\/\/frontpage\.fyi\/(?<prefix>profile|post)\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:\/(?<handle2>[\w.:%-]+))?(?:\/(?<rkey2>[\w.:%-]+))?(?:[?#].*)?$/
// FrontPage: https://frontpage.fyi/post/did:plc:iwpxnj7rzdynjkkr7rxaa5is/3lcb56fba6d2k
// FrontPage: https://frontpage.fyi/post/did:plc:ngokl2gnmpbvuvrfckja3g7p/3l7tegzuuim2x/fei.chicory.blue/3l7tusoznm22n

import { getDid } from '../utils.js'

export class Frontpage {
    static DOMAINS = ['frontpage.fyi']

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, rkey, handle2, rkey2 } = this.parseURL(url)
        console.log(`frontpage handler recieved: ` + prefix, handle, rkey, handle2, rkey2)
        let did
        switch (prefix) {
        case 'post':
            if (handle2 && rkey2) {
                const did2 = await getDid(handle2)
                if (did2) return `at://${did2}/fyi.unravel.frontpage.comment/${rkey2}`
            }
            did = await getDid(handle)
            if (!did) return null
            return rkey ? `at://${did}/fyi.unravel.frontpage.post/${rkey}` : null
        case 'profile':
            did = await getDid(handle)
            if (!did) return null
            return `at://${did}/fyi.unravel.frontpage.post`
        default:
            return null
        }
    }

    static parseURL(url) {
        let [prefix, handle, rkey, handle2, rkey2] = url.pathname.split("/").slice(1)
        return {prefix, handle, rkey, handle2, rkey2}
    }
}