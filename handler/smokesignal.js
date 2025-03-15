import { getDid } from '../utils.js'

export class SmokeSignal {
    static DOMAINS = ['smokesignal.events']
    static TESTS = [{
        url: 'https://smokesignal.events/did:plc:iztv76aq7fbpxmyjwqv5vrhz?tab=history&',
        output: 'https://pdsls.dev/at://did:plc:iztv76aq7fbpxmyjwqv5vrhz/events.smokesignal.app.profile/self'
    }, {
        url: 'https://smokesignal.events/did:plc:tgfzv5irks5acnmk75j4elky/3lakhzmdz3j23',
        output: 'https://pdsls.dev/at://did:plc:tgfzv5irks5acnmk75j4elky/events.smokesignal.calendar.event/3lakhzmdz3j23'
    }]

    static async processURL(url, settings, uriMode) {
        const { handle, rkey } = this.parseURL(url)
        console.log(`SmokeSignal handler recieved: ` + handle, rkey)
        const did = await getDid(handle)
        return did
            ? `at://${did}${rkey
                ? `/events.smokesignal.calendar.event/${rkey}`
                : "/events.smokesignal.app.profile/self"}`
            : null
    }

    static parseURL(url) {
        let [handle, rkey] = url.pathname.split("/").slice(1)
        return { handle, rkey }
    }
}