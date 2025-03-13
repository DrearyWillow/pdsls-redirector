import { getServiceEndpoint } from "../utils.js"

export class XRPC {
    static async processURI({did, nsid, rkey, service, pds}, settings) {
        console.log(`xrpc resolver received: ` + did, nsid, rkey, service, pds)
        if (pds && pds !== "at") return `https://${pds}/xrpc/com.atproto.sync.listRepos?limit=1000`
        if (!did) return null
        if (!service) {
            service = await getServiceEndpoint(did)
            if (!service) return null
        }
        if (!nsid) {
            return `${service}/xrpc/com.atproto.repo.describeRepo?repo=${did}`
        } else if (nsid === "blobs") {
            return `${service}/xrpc/com.atproto.sync.listBlobs?did=${did}&limit=1000`
        } else if (!rkey) {
            return `${service}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=${nsid}&limit=100`
        } else {
            return `${service}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=${nsid}&rkey=${rkey}`
        }
    }
}