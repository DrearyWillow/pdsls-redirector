import { getDid } from '../utils.js'

export class Klearsky {
    static DOMAINS = ['klearsky.pages.dev']
    static TESTS = [{
        url: 'https://klearsky.pages.dev/#/home/list-feeds?list=at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.graph.list/3kivqnnhzcr27',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.graph.list/3kivqnnhzcr27'
    }, {
        url: 'https://klearsky.pages.dev/#/profile/?account=did:plc:royd35ewfe6x2lsa66fhr5xp',
        output: 'https://pdsls.dev/at://did:plc:royd35ewfe6x2lsa66fhr5xp'
    }, {
        url: 'https://klearsky.pages.dev/#/post?uri=at%3A%2F%2Fdid:plc:royd35ewfe6x2lsa66fhr5xp/app.bsky.feed.post/3lb6ngrfaoc2q',
        output: 'https://pdsls.dev/at://did:plc:royd35ewfe6x2lsa66fhr5xp/app.bsky.feed.post/3lb6ngrfaoc2q'
    }, {
        url: 'https://klearsky.pages.dev/#/profile/list?account=popmox.net',
        output: 'https://pdsls.dev/at://did:plc:royd35ewfe6x2lsa66fhr5xp/app.bsky.graph.list'
    }, {
        url: 'https://klearsky.pages.dev/#/profile/feed-generators?account=did:plc:p2cp5gopk7mgjegy6wadk3ep',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator'
    }, {
        url: 'https://klearsky.pages.dev/#/home/starter-pack?uri=at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.starterpack/3kztso5fnic24',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.starterpack/3kztso5fnic24'
    }, {
        url: 'https://klearsky.pages.dev/#/home/feeds?feed=at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator/aaaatt5lbsrbq&displayName=Numbers+station',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator/aaaatt5lbsrbq'
    }]

    static async processURL(url, settings, uriMode) {
        let { type, uri, account } = this.parseURL(url)

        console.log(`klearsky handler received: ` + type, uri, account)
        if (uri) {
            uri = decodeURIComponent(uri)
            if (!uriMode && settings.getPostThread && type === "post") {
                const depth = settings.replyCount
                const parents = settings.parentCount
                return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${uri}&depth=${depth}&parentHeight=${parents}`
            }
            return uri
        }
        const did = await getDid(account)
        if (!did) return null
        if (type === "starterPacks") return `at://${did}/app.bsky.graph.starterpack`
        else if (type === "feed-generators") return `at://${did}/app.bsky.feed.generator`
        else if (type === "list") return `at://${did}/app.bsky.graph.list`
        else return `at://${did}`
    }

    static parseURL(url) {
        const parts = url.hash.split("?")[0].split("/")
        const type = parts.length > 0 ? parts[parts.length - 1] : "";

        const searchParams = new URLSearchParams(url.hash.split("?")[1] || "");

        const uri = searchParams.get("uri") || searchParams.get("list") || searchParams.get("feed")
        const account = searchParams.get("account");

        return { type, uri, account };
    }
}