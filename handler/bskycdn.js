export class BskyCDN {
    static DOMAINS = ['cdn.bsky.app', 'video.bsky.app']
    static TESTS = [{
        url: 'https://cdn.bsky.app/img/avatar/plain/did:plc:hx53snho72xoj7zqt5uice4u/bafkreiblp6bxadz42kevdcqcq3qofzxnoej5nhmwdqwcgjdg26ir2offdi@jpeg',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/blobs'
    }, {
        url: 'https://video.bsky.app/watch/did%3Aplc%3Ahx53snho72xoj7zqt5uice4u/bafkreicf5nvgomy2kh3f6da7fcwghwrecm6ljcp4najy6vy5hvdn7tvec4/thumbnail.jpg',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/blobs'
    }]

    static async processURL(url, settings, uriMode) {
        const { did } = this.parseURL(url)
        console.log(`BskyCDN handler recieved: ` + did)
        return `at://${did}/blobs`
    }

    static parseURL(url) {
        const sliceIndex = url.hostname === 'cdn.bsky.app' ? 4 : 2
        const [did] = decodeURIComponent(url.pathname).split("/").slice(sliceIndex)
        return { did }
    }
}