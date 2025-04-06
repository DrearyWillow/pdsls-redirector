import { composeUri, decomposeUri, findRecordMatch, getRecord, getServiceEndpoint } from '../utils.js'

export class Grayhaze {
    static NSID_AUTH = 'live.grayhaze'
    static TESTS = [{
        uri: 'at://did:web:hugeblank.dev/live.grayhaze.content.stream/3ldwoox2cx22m',
        output: 'https://grayhaze.live/did:web:hugeblank.dev/3ldwoox2cx22m'
    }, {
        uri: 'at://did:web:hugeblank.dev/live.grayhaze.actor.channel/self',
        output: 'https://grayhaze.live/did:web:hugeblank.dev'
    }, {
        uri: 'at://did:web:hugeblank.dev/live.grayhaze.format.hls/3ldwoo3lnr22m',
        output: 'https://grayhaze.live/did:web:hugeblank.dev/3ldwoox2cx22m'
    }, {
        // intentional failure search
        uri: 'at://did:web:hugeblank.dev/live.grayhaze.format.hls/3lds7rcapo22m',
        output: 'https://grayhaze.live/did:web:hugeblank.dev'
    }, {
        uri: 'at://did:web:hugeblank.dev/live.grayhaze.interaction.chat/3ldwrna46ps2m',
        output: 'https://grayhaze.live/did:web:hugeblank.dev/3ldwoox2cx22m'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Grayhaze resolver received: `, { did, nsid, rkey })

        if (!did) return settings.alwaysOpen ? `https://grayhaze.live` : null
        let baseUrl = `https://grayhaze.live/${did}`
        if (!rkey) return baseUrl

        let uri, stream
        switch (nsid) {
            case 'live.grayhaze.actor.channel':
                return baseUrl
            case 'live.grayhaze.content.stream':
                return `${baseUrl}/${rkey}`
            case 'live.grayhaze.format.hls':
                let service = await getServiceEndpoint(did)
                let matchObj = { content: { uri: composeUri({ did, nsid, rkey }) } }
                uri = await findRecordMatch(did, service, 'live.grayhaze.content.stream', matchObj)
                if (!uri) return baseUrl
                stream = decomposeUri(uri)
                return `https://grayhaze.live/${stream.did}/${stream.rkey}`
            case 'live.grayhaze.interaction.chat':
                uri = (await getRecord({ did, nsid, rkey }))?.value?.stream?.uri
                if (!uri) return baseUrl
                stream = decomposeUri(uri)
                return `https://grayhaze.live/${stream.did}/${stream.rkey}`
            default:
                return baseUrl
        }
    }
}