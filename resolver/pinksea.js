import { getServiceEndpoint, getRecord, decomposeUri } from '../utils.js'

export class Pinksea {
    static NSID_AUTH = 'com.shinolabs'
    static TESTS = [{
        uri: 'at://did:plc:bj3xr7ytf2mpglcsvcst7ogt/com.shinolabs.pinksea.oekaki/3lbaugujgac2n',
        output: 'https://pinksea.art/did:plc:bj3xr7ytf2mpglcsvcst7ogt/oekaki/3lbaugujgac2n'
    }]

    static async processURI({did, nsid, rkey, parentDid, parentRkey}, settings) {
        console.log(`Pinksea resolver received: ` + did, nsid, rkey, parentDid, parentRkey)
        if (!did) return settings.alwaysOpen ? `https://pinksea.art` : null
        if (!rkey || nsid !== "com.shinolabs.pinksea.oekaki") {
        return `https://pinksea.art/${did}`
        } else if (parentDid && parentRkey) {
        return `https://pinksea.art/${did}/oekaki/${rkey}#${parentDid}-${parentRkey}`
        }

        const service = await getServiceEndpoint(did)
        if (!service) return settings.alwaysOpen ? `https://pinksea.art` : null

        const uri = (await getRecord({did, nsid, rkey, service})).value?.inResponseTo?.uri
        if (!uri) return `https://pinksea.art/${did}/oekaki/${rkey}`

        let parentNsid // i hate that i have to define this.
        ({ did: parentDid, nsid: parentNsid, rkey: parentRkey } = decomposeUri(uri))

        return `https://pinksea.art/${parentDid}/oekaki/${parentRkey}#${did}-${rkey}`
    }
}