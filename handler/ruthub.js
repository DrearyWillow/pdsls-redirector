import { getDid } from '../utils.js'

export class RutHub {
    static DOMAINS = ['ruthub.com']

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
        return {prefix, handle, rkey}
    }
}

// https://ruthub.com/kb/ruthub.com