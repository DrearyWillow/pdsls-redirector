import { getDid } from '../utils.js'

export class ATProfile {
    static DOMAINS = ['atprofile.com']
    static TESTS = [{
        url: 'https://atprofile.com/atprofile.com',
        returned: 'at://did:plc:jkjaihp54h2aholmwipud5hv/com.atprofile.beta.profile/self',
        output: 'https://pdsls.dev/at://did:plc:jkjaihp54h2aholmwipud5hv/com.atprofile.beta.profile/self'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`ATProfile handler received: ` + handle)

        const did = await getDid(handle)
        return did ? `at://${did}/com.atprofile.beta.profile/self` : null
    }

    static parseURL(url) {
        let [handle] = url.pathname.split("/").slice(1)
        return {handle}
    }
}