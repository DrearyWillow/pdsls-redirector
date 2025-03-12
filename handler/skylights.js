import { getDid } from '../utils.js'

export class Skylights {
    static DOMAINS = ['skylights.my']

    static async processURL(url, settings, uriMode) {
        const { handle } = this.parseURL(url)
        console.log(`skylights handler recieved: ` + handle)
        const did = await getDid(handle)
        return did ? `at://${did}/my.skylights.rel` : null
    }

    static parseURL(url) {
        let handle = url.pathname.split("/")[2]
        return {handle}
    }
}

// static skylights = /^https:\/\/skylights\.my\/profile\/(?<handle>[\w.:%-]+)(?:[?#].*)?$/
// https://skylights.my/profile/watwa.re