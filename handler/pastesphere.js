// static pastesphere = /^https:\/\/pastesphere\.link\/user(?:\/(?<handle>[\w.:%-]+))?(?:\/(?<type>[\w.:%-]+))?(?:\/(?<rkey>[\w.:%-]+))?/
// PasteSphere: https://pastesphere.link/user/dreary.dev/snippet/3liv2xijzm22b

import { getDid } from '../utils.js'

export class PasteSphere {
    static DOMAINS = ['pastesphere.link']

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