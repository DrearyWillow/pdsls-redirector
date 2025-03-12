export class Plonk {
    static NSID_AUTH =  'li.plonk'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`Plonk resolver received: ` + did, nsid, rkey)
        // best you can do is link to the profile
        if (!did) return settings.alwaysOpen ? "https://plonk.li" : null
        return `https://plonk.li/u/${did}`
    }
}