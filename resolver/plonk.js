export class Plonk {
    static NSID_AUTH = 'li.plonk'
    static TESTS = [{
        uri: 'at://did:plc:355lbopbpckczt672hss2ra4/li.plonk.paste/3lkf64noc5k2k',
        output: 'https://plonk.li/u/did:plc:355lbopbpckczt672hss2ra4'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`Plonk resolver received: ` + did, nsid, rkey)
        // best you can do is link to the profile
        if (!did) return settings.alwaysOpen ? "https://plonk.li" : null
        return `https://plonk.li/u/${did}`
    }
}