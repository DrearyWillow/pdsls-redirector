// static camp = /^https:\/\/atproto\.camp\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
// https://atproto.camp/did:plc:5ugrbulluc7sqlj6owblmvcf/3ljzflfou5224

import { getDid } from '../utils.js'

export class ATProtoCamp {
    static DOMAINS = ['atproto.camp']

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`camp handler recieved: ` + handle, rkey)
        const did = await getDid(handle)
        return did ? `at://${did}/blue.badge.collection/${rkey || ""}` : null
    }

    static parseURL(url) {
        let [handle, rkey] = url.pathname.split("/").slice(1)
        return {handle, rkey}
    }
}