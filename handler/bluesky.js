import { getDid, postThreadCheck } from '../utils.js'

export class Bluesky {
    static DOMAINS = ['bsky.app', 'main.bsky.dev', 'langit.pages.dev', 'tokimekibluesky.vercel.app', 'akari.blue', 'deer.social']
    static TESTS = [{
        url: 'https://bsky.app/profile/danabra.mov',
        output: 'https://pdsls.dev/at://did:plc:fpruhuo22xkm5o7ttr2ktxdo'
    }, {
        url: 'https://bsky.app/profile/pfrazee.com/post/3l6isaepchr2a',
        output: 'https://pdsls.dev/at://did:plc:ragtjsm2j2vknwkz3zp4oxrd/app.bsky.feed.post/3l6isaepchr2a'
    }, {
        url: 'https://main.bsky.dev/profile/samuel.bsky.team/feed/aaaatt5lbsrbq',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator/aaaatt5lbsrbq'
    }, {
        url: 'https://deer.social/starter-pack/samuel.bsky.team/3kztso5fnic24',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.starterpack/3kztso5fnic24'
    }, {
        url: 'https://bsky.app/profile/did:plc:hx53snho72xoj7zqt5uice4u/post/3lbpz2lyeic2g/liked-by',
        output: 'https://pdsls.dev/at://did:plc:hx53snho72xoj7zqt5uice4u/app.bsky.feed.post/3lbpz2lyeic2g'
    }, {
        url: 'https://langit.pages.dev/u/did:plc:hx53snho72xoj7zqt5uice4u/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep/feed/aaaatt5lbsrbq',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator/aaaatt5lbsrbq'
    }, {
        url: 'https://tokimekibluesky.vercel.app/profile/samuel.bsky.team/lists/3kk2cqjppea2v',
        output: 'https://pdsls.dev/at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.list/3kk2cqjppea2v'
    }]

    static async processURL(url, settings, uriMode) {
        const { prefix, handle, suffix, rkey } = this.parseURL(url)

        console.log(`Bluesky handler received: `, { prefix, handle, suffix, rkey })
        const did = await getDid(handle)
        if (!did) return null

        if (prefix === "starter-pack" && rkey) {
            return `at://${did}/app.bsky.graph.starterpack/${rkey}`
        }

        if (!rkey || (prefix === "profile" && rkey === "search")) return `at://${did}`
        if (prefix !== "profile") return null

        switch (suffix) {
            case "post":
                const postUri = `${did}/app.bsky.feed.post/${rkey}`
                const apiLink = postThreadCheck(postUri, settings, uriMode)
                return apiLink || `at://${postUri}`
            case "feed":
                return `at://${did}/app.bsky.feed.generator/${rkey}`
            case "lists":
                return `at://${did}/app.bsky.graph.list/${rkey}`
            default:
                return null
        }
    }

    static parseURL(url) {
        const sliceIndex = url.hostname === 'langit.pages.dev' ? 3 : 1
        let [prefix, handle, suffix, rkey] = url.pathname.split("/").slice(sliceIndex)
        if (!['post', 'lists', 'feed'].includes(suffix)) {
            rkey = suffix
            suffix = undefined
        }
        return { prefix, handle, suffix, rkey }
    }
}

