
// Skyview: https://skyview.social/?url=https%3A%2F%2Fbsky.app%2Fprofile%2Fpfrazee.com%2Fpost%2F3jhnzcfawac27&viewtype=tree
// static skyview = /https:\/\/skyview\.social\/\?url=(?<url>[^&]+)/

import { Bluesky } from './bluesky.js'

export class Skyview {
    static DOMAINS = ['skyview.social']

    static async processURL(url, settings, uriMode) {
        const { bskyUrl } = this.parseURL(url)
        console.log(`skyview handler recieved: ` + bskyUrl)
        console.log(`Passing to bsky handler`)
        return await Bluesky.processURL(bskyUrl)
    }

    static parseURL(url) {
        let bskyUrl = decodeURIComponent(url.searchParams.get('url'))
        return {bskyUrl}
    }
}