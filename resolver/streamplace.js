import { getHandle, getRecord } from '../utils.js'

export class Streamplace {
    static NSID_AUTH = 'place.stream'
    static TESTS = [{
        uri: 'at://did:plc:2zmxikig2sj7gqaezl5gntae/place.stream.livestream/3lm3mow2iy22x',
        output: 'https://stream.place/iame.li'
    }, {
        uri: 'at://did:plc:2zmxikig2sj7gqaezl5gntae/place.stream.chat.profile',
        output: 'https://stream.place/iame.li'
    }, {
        uri: 'at://did:plc:2zmxikig2sj7gqaezl5gntae/place.stream.key/3lh66o4ariq2t',
        output: 'https://stream.place/iame.li'
    }, {
        uri: 'at://did:plc:2zmxikig2sj7gqaezl5gntae/place.stream.livestream/3lm3mow2iy22x',
        output: 'https://stream.place/iame.li'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Streamplace resolver received: `, { did, nsid, rkey })

        if (!did) return settings.alwaysOpen ? `https://stream.place` : null
        // unsure if i have to resolveHandle
        let baseUrl = `https://stream.place/${await getHandle(did)}`

        switch (nsid) {
            case 'place.stream.chat.message':
                let streamer = (await getRecord({did, nsid, rkey}))?.value?.streamer
                return streamer ? `https://stream.place/${await getHandle(streamer)}` : baseUrl
            case 'place.stream.livestream':
                // might have to retrieve `url` from record eventually? unsure
                // time in record and time in link don't match so i can't really link anyway
                return baseUrl
            case 'place.stream.key':
                return baseUrl
            case 'place.stream.chat.profile':
                return baseUrl
            default:
                return baseUrl
        }
    }
}