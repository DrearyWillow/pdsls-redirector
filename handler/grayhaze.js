import { getDid } from '../utils.js'

export class Grayhaze {
    static DOMAINS = ['grayhaze.live']
    static TESTS = [{
        url: 'https://grayhaze.live/@hugeblank.dev',
        returned: 'at://did:web:hugeblank.dev/live.grayhaze.actor.channel/self',
        output: 'https://pdsls.dev/at://did:web:hugeblank.dev/live.grayhaze.actor.channel/self'
    }, {
        url: 'https://grayhaze.live/@hugeblank.dev/3ldwn4eeerc2m',
        returned: 'at://did:web:hugeblank.dev/live.grayhaze.content.stream/3ldwn4eeerc2m',
        output: 'https://pdsls.dev/at://did:web:hugeblank.dev/live.grayhaze.content.stream/3ldwn4eeerc2m'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`Grayhaze handler received: `, { handle, rkey })

        const did = await getDid(handle)
        if (!did) return null

        return rkey ? `at://${did}/live.grayhaze.content.stream/${rkey}` : `at://${did}/live.grayhaze.actor.channel/self`
    }

    static parseURL(url) {
        let [handle, rkey] = url.pathname.split("/").slice(1)
        return { handle, rkey }
    }
}