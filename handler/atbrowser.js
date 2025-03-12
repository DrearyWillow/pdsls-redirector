
//     static atBrowser = /^https:\/\/(?:atproto-browser\.vercel\.app|at\.syu\.is)\/at\/(?<handle>[\w.:%-]+)(?:\/(?<rest>[^?]*))?(?:[?#].*)?$/
//     AT Browser: https://atproto-browser.vercel.app/at/did:plc:2xau7wbgdq4phuou2ypwuen7/app.bsky.feed.like/3kyutnrmg3s2r
import { getDid } from '../utils.js'

export class ATBrowser {
    static DOMAINS = ['atproto-browser.vercel.app', 'at.syu.is']

    static async processURL(url, settings, uriMode) {
        const { handle, rest } = this.parseURL(url)
        console.log(`ATBrowser handler recieved: ` + handle, rest)
        const did = await getDid(handle)
        return did ? `at://${did}/${rest || ""}` : null
    }

    static parseURL(url) {
        const parts = url.pathname.split("/").slice(2);
        const handle = parts[0]
        const rest = parts.slice(1).join("/") || null;
        return { handle, rest };
    }
    
}