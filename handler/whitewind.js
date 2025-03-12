import { findRecordMatch, getDid, getServiceEndpoint } from '../utils.js'

export class WhiteWind {
    static DOMAINS = ['whtwnd.com']

    static async processURL(url, settings, uriMode) {
        const { handle, title, rkey, postId } = this.parseURL(url)

        console.log(`whtwnd handler recieved: ` + handle, title, rkey)
        const did = await getDid(handle)
        if (!did) return null
    
        if (rkey) {
          return `at://${did}/com.whtwnd.blog.entry/${rkey}`
        }
    
        if (title) {
          const service = await getServiceEndpoint(did)
          if (!service) return `at://${did}/com.whtwnd.blog.entry`
          let uri = await findRecordMatch(did, service, 'com.whtwnd.blog.entry', {'title': decodeURIComponent(title)})
          return uri ? uri : `at://${did}/com.whtwnd.blog.entry`
        }
    
        return `at://${did}/com.whtwnd.blog.entry`
    }

    static parseURL(url) {
        const parts = url.pathname.split("/").slice(1);
        let handle = parts[0] || null;
        let title = null;
        let rkey = null;
    
        if (parts[1] === "entries") {
            title = decodeURIComponent(parts[2] || "");
            rkey = url.searchParams.get("rkey");
        } else if (parts.length >= 2) {
            rkey = parts[1];
        }
    
        return { handle, title, rkey };
    }
}

// static whtwnd = /^https:\/\/whtwnd\.com\/(?<handle>[\w.:%-]+)(?:\/entries\/(?<title>[\w.,':%-]+)(?:\?rkey=(?<rkey>[\w.:%-]+))?|(?:\/(?<postId>[\w.:%-]+)(?:\/[\w.:%-]+)?))?(?:[?#][\w.:%-]+)?$/
// WhiteWind: https://whtwnd.com/hailey.at/entries/Hello%20Atproto
// WhiteWind: https://whtwnd.com/hailey.at/entries/Why%20post%20anywhere%20else%20when%20the%20engagement%20is%20on%20Bluesky%3F?rkey=3laq5rt7era2x
// WhiteWind: https://whtwnd.com/dreary.dev/3lche4zpqex27#user-content-fnref-8
// WhiteWind: https://whtwnd.com/dreary.dev/entries/Reply%20to%20Dave#user-content-fn-1
// WhiteWind: https://whtwnd.com/did:plc:hx53snho72xoj7zqt5uice4u/3lchgdmecam2u/bafyreidhaeiux73iea6vxev5xdpkjgu55ston36gdk43rzpffufc6hd2ui