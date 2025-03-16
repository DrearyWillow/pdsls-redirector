export class RutHub {
    static NSID_AUTH = 'com.ruthub'
    static TESTS = [{
        uri: 'at://did:plc:vd3bvirbooxanq7rc4myzxym/com.ruthub.entry/17401621912133120',
        output: 'https://ruthub.com/p/did:plc:vd3bvirbooxanq7rc4myzxym/17401621912133120'
    }, {
        uri: 'at://did:plc:vd3bvirbooxanq7rc4myzxym/com.ruthub.kanban/default',
        output: 'https://ruthub.com/kb/did:plc:vd3bvirbooxanq7rc4myzxym'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`RutHub resolver received: `, { did, nsid, rkey })

        let baseUrl = `https://ruthub.com`
        if (!did) return settings.alwaysOpen ? baseUrl : null

        switch (nsid) {
            case 'com.ruthub.entry':
                if (rkey) return `${baseUrl}/p/${did}/${rkey}`
                return `${baseUrl}/blog/${did}`
            case 'com.ruthub.kanban':
                return `${baseUrl}/kb/${did}`
            case 'com.ruthub.kanbans':
                return `${baseUrl}/kb/${did}`
            case 'com.ruthub.item':
                return `${baseUrl}/rut/${did}`
            case 'com.ruthub.track':
                return `${baseUrl}/rut/${did}`
            default:
                return `${baseUrl}/at/${did}`
        }
    }
}