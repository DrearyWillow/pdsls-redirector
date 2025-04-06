import { composeUri, getDid } from '../utils.js'

export class Anartia {
    static DOMAINS = ['anartia.kelinci.net']
    static TESTS = [{
        url: 'https://anartia.kelinci.net/did:plc:wqi7ali44r4msvx4smrwevf6/3lm3cmnlfcc2a#main',
        output: 'https://pdsls.dev/at://did:plc:wqi7ali44r4msvx4smrwevf6/app.bsky.feed.post/3lm3cmnlfcc2a'
    }, {
        url: 'https://anartia.kelinci.net/did:plc:v4gep2wp3i6uhwfzxjov4wnv/media',
        output: 'https://pdsls.dev/at://did:plc:v4gep2wp3i6uhwfzxjov4wnv'
    }, {
        url: 'https://anartia.kelinci.net/did:plc:fyk5upov4dznnhaqqato7jvr/packs/3lehxiwnhuq2k',
        output: 'https://pdsls.dev/at://did:plc:fyk5upov4dznnhaqqato7jvr/app.bsky.graph.starterpack/3lehxiwnhuq2k'
    }, {
        url: 'https://anartia.kelinci.net/did:plc:h6as5sk7tfqvvnqvfrlnnwqn/lists/3jwshrf3fe52o/members',
        output: 'https://pdsls.dev/at://did:plc:h6as5sk7tfqvvnqvfrlnnwqn/app.bsky.graph.list/3jwshrf3fe52o'
    }, {
        url: 'https://anartia.kelinci.net/did:plc:oaljkuxegjzn57ukh4ey3av4/feeds/aaakfz4vtxdtk',
        output: 'https://pdsls.dev/at://did:plc:oaljkuxegjzn57ukh4ey3av4/app.bsky.feed.generator/aaakfz4vtxdtk'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, suffix, rkey } = this.parseURL(url)
        console.log(`Anartia handler received: `, { handle, suffix, rkey })

        const did = await getDid(handle)
        if (!did) return null

        switch (suffix) {
            case 'packs':
                return composeUri({ did, nsid: 'app.bsky.graph.starterpack', rkey })
            case 'lists':
                return composeUri({ did, nsid: 'app.bsky.graph.list', rkey })
            case 'feeds':
                return composeUri({ did, nsid: 'app.bsky.feed.generator', rkey })
        }

        return (suffix && suffix !== 'media' && suffix !== 'with_replies')
            ? composeUri({ did, nsid: 'app.bsky.feed.post', rkey: suffix })
            : `at://${did}`
    }

    static parseURL(url) {
        let [handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return { handle, suffix, rkey }
    }
}