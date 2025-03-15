export class Bluesky {
    static NSID_AUTH = 'app.bsky'
    static TESTS = [{
        uri: 'at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.post/3lkfs57byqk2k',
        output: 'https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep/post/3lkfs57byqk2k',
    }, {
        uri: 'at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.like/3lkfs5cibmf2s',
        output: 'https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep',
    }, {
        uri: 'at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.starterpack/3kztso5fnic24',
        output: 'https://bsky.app/starter-pack/did:plc:p2cp5gopk7mgjegy6wadk3ep/3kztso5fnic24'
    }, {
        uri: 'at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.graph.list/3kztso4vb7k22',
        output: 'https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep/lists/3kztso4vb7k22'
    }, {
        uri: 'at://did:plc:p2cp5gopk7mgjegy6wadk3ep/app.bsky.feed.generator/swifties.social',
        output: 'https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep/feed/swifties.social'
    }]

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