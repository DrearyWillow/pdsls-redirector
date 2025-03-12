import { getDid } from '../utils.js'

export class BlueViewer {
    static DOMAINS = ['blueviewer.pages.dev']

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`blueViewer handler recieved: ` + handle, rkey)
        const did = await getDid(handle)
        if (!(did && rkey)) return null
        return `at://${did}/app.bsky.feed.post/${rkey}`
    }

    static parseURL(url) {
        let params = url.searchParams
        let handle = params.get('actor')
        let rkey = params.get('rkey')
        return {handle, rkey}
    }
}

// Blueviewer: https://blueviewer.pages.dev/view?actor=soap.kawaii.social&rkey=3l5slo3bria2o
//   static blueViewer = /^https:\/\/blueviewer\.pages\.dev\/view\?actor=(?<handle>[\w.:%-]+)&rkey=(?<rkey>[\w.:%-]+)$/