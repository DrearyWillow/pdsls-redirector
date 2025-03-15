import { getDid } from '../utils.js'

export class PasteSphere {
    static DOMAINS = ['pastesphere.link']
    static TESTS = [{
        url: 'https://pastesphere.link/user/dreary.dev/snippet/3liv2xijzm22b',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/link.pastesphere.snippet/3liv2xijzm22b'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, type, rkey } = this.parseURL(url)
        console.log(`pastesphere handler recieved: ` + handle, type, rkey)
        const did = await getDid(handle)
        return did ? `at://${did}/link.pastesphere.snippet/${rkey || ""}` : null
    }

    static parseURL(url) {
        let [handle, type, rkey] = url.pathname.split("/").slice(2)
        return {handle, type, rkey}
    }
}