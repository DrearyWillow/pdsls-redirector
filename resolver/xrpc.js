import { getServiceEndpoint } from "../utils.js"

export class XRPC {
    // no defined NSID domain authority
    static TESTS = [{
        uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi',
        output: 'https://pds.haileyok.com/xrpc/com.atproto.repo.describeRepo?repo=did:plc:oisofpd7lj26yvgiivf3lxsi'
    }, {
        uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi/blobs',
        output: 'https://pds.haileyok.com/xrpc/com.atproto.sync.listBlobs?did=did:plc:oisofpd7lj26yvgiivf3lxsi&limit=1000'
    }, {
        uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi/app.bsky.feed.threadgate',
        output: 'https://pds.haileyok.com/xrpc/com.atproto.repo.listRecords?repo=did:plc:oisofpd7lj26yvgiivf3lxsi&collection=app.bsky.feed.threadgate&limit=100'
    }, {
        uri: 'at://did:plc:oisofpd7lj26yvgiivf3lxsi/app.bsky.graph.follow/3ljhao2uhxk2w',
        output: 'https://pds.haileyok.com/xrpc/com.atproto.repo.getRecord?repo=did:plc:oisofpd7lj26yvgiivf3lxsi&collection=app.bsky.graph.follow&rkey=3ljhao2uhxk2w'
    }]
    
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