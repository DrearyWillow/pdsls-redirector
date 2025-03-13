export class ATProfile {
    static NSID_AUTH = ['com.atprofile']

    static async processURI({did, nsid, rkey}) {
        console.log(`ATProfile resolver received: ` + did, nsid, rkey)

        if (!did) return settings.alwaysOpen ? `https://atprofile.com` : null
        return `https://atprofile.com/${did}`
    }
}