import { composeUri, findRecordMatch, getDid, getServiceEndpoint } from '../utils.js'

export class WhiteWind {
    static DOMAINS = ['whtwnd.com']
    static TESTS = [{
        url: 'https://whtwnd.com/hailey.at/entries/Hello%20Atproto',
        output: 'https://pdsls.dev/at://did:plc:oisofpd7lj26yvgiivf3lxsi/com.whtwnd.blog.entry/3kpqdnwwbbs2i'
    }, {
        url: 'https://whtwnd.com/hailey.at/entries/Why%20post%20anywhere%20else%20when%20the%20engagement%20is%20on%20Bluesky%3F?rkey=3laq5rt7era2x',
        output: 'https://pdsls.dev/at://did:plc:oisofpd7lj26yvgiivf3lxsi/com.whtwnd.blog.entry/3laq5rt7era2x'
    }, {
        url: 'https://whtwnd.com/dreary.dev/3lche4zpqex27#user-content-fnref-8',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/com.whtwnd.blog.entry/3lche4zpqex27'
    }, {
        url: 'https://whtwnd.com/dreary.dev/entries/Reply%20to%20Dave#user-content-fn-1',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/com.whtwnd.blog.entry/3lchf56bwlt24'
    }, {
        url: 'https://whtwnd.com/did:plc:hx53snho72xoj7zqt5uice4u/3lchgdmecam2u/bafyreidhaeiux73iea6vxev5xdpkjgu55ston36gdk43rzpffufc6hd2ui',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/com.whtwnd.blog.entry/3lchgdmecam2u'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, title, rkey } = this.parseURL(url)

        console.log(`whtwnd handler recieved: ` + handle, title, rkey)
        const did = await getDid(handle)
        if (!did) return null
        const nsid = 'com.whtwnd.blog.entry'

        if (rkey) {
            return composeUri({ did, nsid, rkey })
        }

        if (title) {
            const service = await getServiceEndpoint(did)
            if (!service) return composeUri({ did, nsid })
            let uri = await findRecordMatch(did, service, nsid, { 'title': decodeURIComponent(title) })
            return uri ? uri : composeUri({ did, nsid })
        }

        return composeUri({ did, nsid })
    }

    static parseURL(url) {
        const parts = url.pathname.split("/").slice(1)
        let handle = parts[0] || null
        let title = null
        let rkey = null

        if (parts[1] === "entries") {
            title = decodeURIComponent(parts[2] || "")
            rkey = url.searchParams.get("rkey")
        } else if (parts.length >= 2) {
            rkey = parts[1]
        }

        return { handle, title, rkey }
    }
}