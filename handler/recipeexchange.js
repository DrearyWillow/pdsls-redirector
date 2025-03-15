import { getDid } from '../utils.js'

export class RecipeExchange {
    static DOMAINS = ['recipe.exchange']
    static TESTS = [{
        url: 'https://recipe.exchange/recipes/01JF0B0ANBDG75R8Z5WZJDMMBX',
        returned: null,
        output: 'https://pdsls.dev'
    }, {
        url: 'https://recipe.exchange/profiles/ngerakines.me',
        output: 'https://pdsls.dev/at://did:plc:cbkjy5n7bk3ax2wplmtjofq2'
    }]

    static async processURL(url, settings, uriMode) {
        const { type, value } = this.parseURL(url)
        console.log(`RecipeExchange handler recieved: `, { type, value })
        // you can't look collections or recipes up by did.
        if (value && type === "profiles") {
            const did = await getDid(value)
            if (did) return `at://${did}`
        }
        return null
    }

    static parseURL(url) {
        let [type, value] = url.pathname.split("/").slice(1)
        return { type, value }
    }
}