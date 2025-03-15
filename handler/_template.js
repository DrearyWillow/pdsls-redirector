import { getDid } from '../utils.js'

export class Bluesky {
    static DOMAINS = ['']
    static TESTS = [{
        url: '',
        returned: '',
        output: ''
    }, {
        url: '',
        returned: '',
        output: ''
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)
        console.log(`Bluesky handler received: ` + prefix, handle, suffix, rkey)

        // TODO more code here, for example...
        const did = await getDid(handle)
        if (!did) return null
    }

    static parseURL(url) {
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(1)
        return { prefix, handle, suffix, rkey }
    }
}