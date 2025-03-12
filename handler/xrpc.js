// static xrpc = /^https:\/\/(?<domain>[^\/]+)\/xrpc\/(?<api>[\w.:%-]+)(?<params>\?.*)?$/
// XRPC: https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=did:plc:hx53snho72xoj7zqt5uice4u&collection=app.bsky.actor.profile&rkey=self

import { getDid } from '../utils.js'

export class XRPC {
    static DOMAINS = ['public.api.bsky.app']

    static async processURL(url, settings, uriMode) {
        let { domain, api, params } = this.parseURL(url)
        console.log(`XRPC handler recieved: ` + domain, api, params)
        params = Object.fromEntries(params)
        const did = await getDid(params.repo || params.did)
        const nsid = params.collection
        const rkey = params.rkey
        if (!did) return (domain && (domain != 'public.api.bsky.app') && !uriMode) ? `https://pdsls.dev/${domain}` : null
        if (api === "com.atproto.sync.listBlobs") return `at://${did}/blobs`
        return ['at:/', did, nsid, rkey].filter(Boolean).join('/')
    }

    static parseURL(url) {
        let domain = url.hostname
        let api = url.pathname.split("/").slice(2)
        let params = url.searchParams
        return {domain, api, params}
    }
}