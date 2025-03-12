// static smokeSignal = /^https:\/\/smokesignal\.events\/(?<handle>[\w.:%-]+)(?:\/(?<rkey>[\w.:%-]+))?(?:[?#].*)?$/
// Smoke Signal: https://smokesignal.events/did:plc:iztv76aq7fbpxmyjwqv5vrhz?tab=history&
// Smoke Signal: https://smokesignal.events/did:plc:tgfzv5irks5acnmk75j4elky/3lakhzmdz3j23


import { getDid } from '../utils.js'

export class SmokeSignal {
    static DOMAINS = ['smokesignal.events']

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
        return {handle, rkey}
    }
}