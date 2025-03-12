export class SmokeSignal {
    static NSID_AUTH = 'events.smokesignal'

    static async processURI({did, nsid, rkey}, settings) {
        onsole.log(`SmokeSignal resolver received: ` + did, nsid, rkey)
        if (!did) return settings.alwaysOpen ? `https://smokesignal.events` : null
        if (!rkey || nsid !== "events.smokesignal.calendar.event") {
        return `https://smokesignal.events/${did}`
        }
        return `https://smokesignal.events/${did}/${rkey}`
        // maybe events.smokesignal.calendar.rsvp should go the subject url
    }
}