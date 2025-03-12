import { getServiceEndpoint, getRecord, getHandle, decomposeUri } from '../utils.js'

export class RecipeExchange {
    static NSID_AUTH = 'exchange.recipe'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`RecipeExchange resolver received: ` + did, nsid, rkey)
        if (rkey && (nsid === "exchange.recipe.recipe")) return `https://recipe.exchange/recipes/${rkey}`
        if (rkey && (nsid === "exchange.recipe.collection")) return `https://recipe.exchange/collections/${rkey}`
        if (!did) return settings.alwaysOpen ? `https://recipe.exchange` : null
        if (rkey && (nsid === "exchange.recipe.comment")) {
            const service = await getServiceEndpoint(did)
            if (!service) return settings.alwaysOpen ? `https://recipe.exchange` : null
            const uri = (await getRecord(did, nsid, rkey, service)).value?.recipe?.uri
            if (!uri) {
                if (settings.alwaysOpen) {
                let handle = await getHandle(did)
                return handle ? `https://recipe.exchange/profiles/${handle}` : `https://recipe.exchange`
                }
                return null
            }
            console.log(`Recipe URI: ${uri}`)
            let { did: did2, nsid: nsid2, rkey: rkey2 } = decomposeUri(uri)
            console.log(`URI decomposed:`, did2, nsid2, rkey2)
            if (rkey2 && (nsid2 === "exchange.recipe.recipe")) return `https://recipe.exchange/recipes/${rkey2}`
            if (did2) {
                let handle = await getHandle(did2)
                if (handle) return `https://recipe.exchange/profiles/${handle}`
            }
            return settings.alwaysOpen ? `https://recipe.exchange` : null
        }
        let handle = await getHandle(did)
        if (handle) return `https://recipe.exchange/profiles/${handle}`
        return settings.alwaysOpen ? `https://recipe.exchange` : null
    }
}