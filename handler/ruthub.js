import { getDid } from '../utils.js'

export class RutHub {
    static DOMAINS = ['ruthub.com']
    static TESTS = [{
        url: 'https://ruthub.com/kb/ruthub.com',
        output: 'https://pdsls.dev/at://did:plc:vd3bvirbooxanq7rc4myzxym/com.ruthub.kanban/default'
    }, {
        url: 'https://ruthub.com/p/did:plc:vd3bvirbooxanq7rc4myzxym/17401621912133120',
        output: 'https://pdsls.dev/at://did:plc:vd3bvirbooxanq7rc4myzxym'
    }, {
        url: 'https://ruthub.com/rut/did:plc:vd3bvirbooxanq7rc4myzxym',
        output: 'https://pdsls.dev/at://did:plc:vd3bvirbooxanq7rc4myzxym'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, rkey } = this.parseURL(url)
        console.log(`RutHub handler received: ` + prefix, handle, rkey)

        const did = await getDid(handle)
        if (!did) return null

        switch (prefix) {
            case 'p' && rkey:
                return `at://${did}/com.ruthub.entry/${rkey}`
            case 'blog':
                return `at://${did}/com.ruthub.entry`
            case 'kb':
                return `at://${did}/com.ruthub.kanban/default`
            case 'at':
                return `at://${did}`
            case 'rut':
                return `at://${did}`
            default:
                return `at://${did}`
        }
    }

    static parseURL(url) {
        let [prefix, handle, rkey] = url.pathname.split("/").slice(1)
        return { prefix, handle, rkey }
    }
}