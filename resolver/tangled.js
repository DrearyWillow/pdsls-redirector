// https://pdsls.dev/at://did:plc:hwevmowznbiukdf6uk5dwrrq

import { validateUriInput, getRecord, getServiceEndpoint } from "../utils.js"

export class Tangled {
    static NSID_AUTH = 'sh.tangled'

    static async processURI({ did, nsid, rkey }) {
        console.log(`Tangled resolver received: ` + did, nsid, rkey)

        let baseUrl = `https://tangled.sh`
        if (!did) return settings.alwaysOpen ? baseUrl : null
        baseUrl += `${did}`

        let service = await getServiceEndpoint(did)
        if (!service) return baseUrl

        let uri
        switch (nsid) {
            case 'sh.tangled.repo':
                return (await this.resolveRepoUri({did, nsid, rkey, service})) || baseUrl
            case 'sh.tangled.repo.issue':
                return (await this.resolveIssueUri({did, nsid, rkey})) || baseUrl
            case 'sh.tangled.repo.issue.comment':
                uri = (await getRecord({did, nsid, rkey, service})).value?.issue
                console.log(uri)
                return (await this.resolveIssueUri({uri})) || baseUrl
            case 'sh.tangled.repo.issue.state':
                uri = (await getRecord({did, nsid, rkey, service})).value?.issue
                return (await this.resolveIssueUri({uri})) || baseUrl
            case 'sh.tangled.repo.pull':
                let record = await getRecord({did, nsid, rkey, service})
                let pullId = record.value?.pullId
                uri = record.value?.targetRepo
                let repoUrl = await this.resolveRepoUri({uri})
                return repoUrl ? `${repoUrl}/pulls/${pullId}` : baseUrl
            case 'sh.tangled.feed.star':
                uri = (await getRecord({did, nsid, rkey, service})).value?.subject
                return (await this.resolveRepoUri({uri})) || baseUrl
            case 'sh.tangled.feed.follow':
                followDid = (await getRecord({did, nsid, rkey, service})).value?.subject
                return followDid ? `https://tangled.sh/${followDid}` : baseUrl
            default:
                return baseUrl
        }
    }

    static async resolveRepoUri(args) {
        let validatedInput = await validateUriInput(args)
        if (!validatedInput) return null
        let {uri, did, nsid, rkey, service} = validatedInput

        let name = (await getRecord({uri, did, nsid, rkey, service})).value?.name
        
        if (name) {
            let url = `https://tangled.sh/${did}/${name}`
            console.log(`Tangled repo url found: ${url}`)
            return url
        } else {
            console.error(`No project name found for rkey '${rkey}' for ${did}`)
            return null
        }
    }

    static async resolveIssueUri(args) {
        let validatedInput = await validateUriInput(args)
        if (!validatedInput) return null
        let {uri, did, nsid, rkey, service} = validatedInput

        let record = await getRecord({did, nsid, rkey, service})
        if (!record || !record.value.issueId || !record.value.repo) return baseUrl
        let repo = record.value.repo
        let issueId = record.value.issueId
        if (!repo) return null
        let repoUrl = await this.resolveRepoUri({uri: repo})

        if (repoUrl) {
            let url = `${repoUrl}/issues/${issueId}`
            console.log(`Tangled issue url found: ${url}`)
            return url
        } else {
            console.error(`No project name found for rkey '${rkey}' for ${did}`)
            return null
        }
    }

}