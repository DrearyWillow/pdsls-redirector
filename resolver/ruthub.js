export class RutHub {
    static NSID_AUTH = 'com.ruthub'

    static async processURI({did, nsid, rkey}) {
        console.log(`RutHub resolver received: ` + did, nsid, rkey)

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