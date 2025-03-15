export class SmokeSignal {
    static NSID_AUTH = 'events.smokesignal'
    static TESTS = [{
        uri: 'at://did:plc:tgfzv5irks5acnmk75j4elky/events.smokesignal.calendar.event/3lakhzmdz3j23',
        output: 'https://smokesignal.events/did:plc:tgfzv5irks5acnmk75j4elky/3lakhzmdz3j23'
    }]

    static async processURI({ did, nsid, rkey }, settings) {
        console.log(`SmokeSignal resolver received: `, { did, nsid, rkey })
        if (!did) return settings.alwaysOpen ? `https://smokesignal.events` : null
        if (!rkey || nsid !== "events.smokesignal.calendar.event") {
            return `https://smokesignal.events/${did}`
        }
        return `https://smokesignal.events/${did}/${rkey}`
        // maybe events.smokesignal.calendar.rsvp should go the subject url
    }
}