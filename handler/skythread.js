import { getDid } from '../utils.js'

export class Skythread {
    static DOMAINS = ['blue.mackuba.eu']
    static TESTS = [{
        url: 'https://blue.mackuba.eu/skythread/?author=danabra.mov&post=3l6zrmascbq2c',
        output: 'https://pdsls.dev/at://did:plc:fpruhuo22xkm5o7ttr2ktxdo/app.bsky.feed.post/3l6zrmascbq2c'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`Skythread handler recieved: ` + handle, rkey)
        const did = await getDid(handle)
        if (!(did && rkey)) return null
        return `at://${did}/app.bsky.feed.post/${rkey}`
    }

    static parseURL(url) {
        let params = url.searchParams
        let handle = params.get('author')
        let rkey = params.get('post')
        return { handle, rkey }
    }
}