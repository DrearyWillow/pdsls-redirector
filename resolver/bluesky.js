export class Bluesky {
    static NSID_AUTH = 'app.bsky'

    static async processURI({did, nsid, rkey}, settings) {
        console.log(`Bluesky resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://bsky.app` : null
        if (!rkey) return `https://bsky.app/profile/${did}`
        switch (nsid) {
        case "app.bsky.feed.post":
            return `https://bsky.app/profile/${did}/post/${rkey}`
        case "app.bsky.feed.generator":
            return `https://bsky.app/profile/${did}/feed/${rkey}`
        case "app.bsky.graph.list":
            return `https://bsky.app/profile/${did}/lists/${rkey}`
        case "app.bsky.graph.starterpack":
            return `https://bsky.app/starter-pack/${did}/${rkey}`
        // case "app.bsky.actor.profile":
        //   return `https://bsky.app/profile/${did}`
        default:
            return `https://bsky.app/profile/${did}`
        }
    }
}