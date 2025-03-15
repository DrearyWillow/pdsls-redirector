// no functional purpose, just for testing
// review pds fallback code in checkHandlers in utils.js
export class PDS {
    static TESTS = [{
        url: 'https://hollowfoot.us-west.host.bsky.network/',
        output: 'https://pdsls.dev/hollowfoot.us-west.host.bsky.network'
    }, {
        url: 'https://pds.dev.retr0.id/',
        output: 'https://pdsls.dev/pds.dev.retr0.id'
    }]
}