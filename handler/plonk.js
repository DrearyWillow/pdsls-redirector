// static plonk = /^https:\/\/plonk.li\/u\/(?<did>[\w.:%-]+)/
// Plonk: https://plonk.li/u/did:plc:hx53snho72xoj7zqt5uice4u

// import { getDid } from '../utils.js'

export class Plonk {
    static DOMAINS = ['plonk.li']

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)
        console.log(`plonk handler recieved: ` + did)
        return did ? `at://${decodeURIComponent(did)}` : null
    }

    static parseURL(url) {
        let [did] = url.pathname.split("/").slice(2)
        return {did}
    }
}