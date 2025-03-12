// static recipeExchange = /^https:\/\/recipe\.exchange(?:\/(?<type>[\w.:%-]+))(?:\/(?<value>[\w.:%-]+))?$/
// Recipe Exchange: https://recipe.exchange/recipes/01JF0B0ANBDG75R8Z5WZJDMMBX

import { getDid } from '../utils.js'

export class RecipeExchange {
    static DOMAINS = ['recipe.exchange']

    static async processURL(url, settings, uriMode) {
        const { type, value } = this.parseURL(url)
        console.log(`RecipeExchange handler recieved: ` + type, value)
        // you can't look collections or recipes up by did.
        if (value && type === "profiles") {
            const did = await getDid(value)
            if (did) return `at://${did}`
        }
        return null
    }

    static parseURL(url) {
        let [type, value] = url.pathname.split("/").slice(1)
        return {type, value}
    }
}