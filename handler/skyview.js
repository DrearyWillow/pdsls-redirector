import { Bluesky } from './bluesky.js'

export class Skyview {
    static DOMAINS = ['skyview.social']
    static TESTS = [{
        url: 'https://skyview.social/?url=https%3A%2F%2Fbsky.app%2Fprofile%2Fpfrazee.com%2Fpost%2F3jhnzcfawac27&viewtype=tree',
        output: 'https://pdsls.dev/at://did:plc:ragtjsm2j2vknwkz3zp4oxrd/app.bsky.feed.post/3jhnzcfawac27'
    }]

    static async processURL(url, settings, uriMode) {
        const { bskyUrl } = this.parseURL(url)
        console.log(`skyview handler recieved: ` + bskyUrl)
        console.log(`Passing to bsky handler`)
        return await Bluesky.processURL(new URL(bskyUrl), settings, uriMode)
    }

    static parseURL(url) {
        let bskyUrl = decodeURIComponent(url.searchParams.get('url'))
        return {bskyUrl}
    }
}