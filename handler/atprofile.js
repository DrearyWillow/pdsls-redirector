import { getDid } from '../utils.js'

export class ATProfile {
    static DOMAINS = ['atprofile.com']

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