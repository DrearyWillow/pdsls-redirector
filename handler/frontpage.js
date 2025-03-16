import { getDid } from '../utils.js'

export class Frontpage {
    static DOMAINS = ['frontpage.fyi']
    static TESTS = [{
        url: 'https://frontpage.fyi/post/did:plc:iwpxnj7rzdynjkkr7rxaa5is/3lcb56fba6d2k',
        output: 'https://pdsls.dev/at://did:plc:iwpxnj7rzdynjkkr7rxaa5is/fyi.unravel.frontpage.post/3lcb56fba6d2k'
    }, {
        url: 'https://frontpage.fyi/post/did:plc:ngokl2gnmpbvuvrfckja3g7p/3l7tegzuuim2x/fei.chicory.blue/3l7tusoznm22n',
        output: 'https://pdsls.dev/at://did:plc:xz3euvkhf44iadavovbsmqoo/fyi.unravel.frontpage.comment/3l7tusoznm22n'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, rkey, handle2, rkey2 } = this.parseURL(url)
        console.log(`Frontpage handler recieved: `, { prefix, handle, rkey, handle2, rkey2 })
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
        return { prefix, handle, rkey, handle2, rkey2 }
    }
}