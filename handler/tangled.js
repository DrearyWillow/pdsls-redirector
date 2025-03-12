import { getDid, findRecordMatch, getServiceEndpoint } from '../utils.js'

export class Tangled {
    static DOMAINS = ['tangled.sh']

    static async processURL(url, settings, uriMode) {
        const { handle, projectName, suffix, issueId } = this.parseURL(url)
        console.log(`Tangled handler received: ` + handle, projectName, suffix, issueId)
        const did = await getDid(handle)
        if (!did) return null

        if (projectName) {
            let lexicon = 'sh.tangled.repo'
            let matchObj = { name: projectName }

            let service = await getServiceEndpoint(did)
            if (!service) return `at://${did}/${lexicon}`

            let uri = await findRecordMatch(did, service, lexicon, matchObj)

            return uri || `at://${did}/${lexicon}`
        }

        return `at://${did}`
    }

    static parseURL(url) {
        let [handle, projectName, suffix, issueId] = url.pathname.split("/").slice(1)
        return { handle, projectName, suffix, issueId }
    }
}