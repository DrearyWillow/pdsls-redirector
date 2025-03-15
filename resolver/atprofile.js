export class ATProfile {
    static NSID_AUTH = 'com.atprofile'
    static TESTS = [{
        uri: 'at://did:plc:jkjaihp54h2aholmwipud5hv/com.atprofile.beta.profile/self',
        output: 'https://atprofile.com/did:plc:jkjaihp54h2aholmwipud5hv'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`ATProfile resolver received: `, { did, nsid, rkey })

        if (!did) return settings.alwaysOpen ? `https://atprofile.com` : null
        return `https://atprofile.com/${did}`
    }
}