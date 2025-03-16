import { decomposeUri, getRecord, getServiceEndpoint, validateUriInput } from "../utils.js"

export class Tangled {
    static NSID_AUTH = 'sh.tangled'
    static TESTS = [{
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo/3ljtxdvg6bt22',
        output: 'https://tangled.sh/did:plc:hwevmowznbiukdf6uk5dwrrq/hmmm'
    }, {
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo.issue/3ljryyovxgi22',
        output: 'https://tangled.sh/did:plc:hwevmowznbiukdf6uk5dwrrq/another/issues/1'
    }, {
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo.issue.comment/3lk7c6e3drl22',
        output: 'https://tangled.sh/did:plc:wshs7t2adsemcrrd4snkeqli/core/issues/38'
    }, {
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo.issue.state/3lkb2wcdw3g22',
        output: 'https://tangled.sh/did:plc:hwevmowznbiukdf6uk5dwrrq'
    }, {
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo.pull/3lkdophajuy22',
        output: 'https://tangled.sh/did:plc:hwevmowznbiukdf6uk5dwrrq/test/pulls/1'
    }, {
        uri: 'at://did:plc:hwevmowznbiukdf6uk5dwrrq/sh.tangled.repo.pull.comment/3lkdmp3yawm22',
        output: 'https://tangled.sh/did:plc:hwevmowznbiukdf6uk5dwrrq/test/pulls/7'
    }, {
        uri: 'at://did:plc:hx53snho72xoj7zqt5uice4u/sh.tangled.feed.star/3lk6syz7fnb22',
        output: 'https://tangled.sh/did:plc:ia76kvnndjutgedggx2ibrem/aglais'
    }]

    static async processURI({ did, nsid, rkey }) {
        console.log(`Tangled resolver received: `, { did, nsid, rkey })

        let baseUrl = `https://tangled.sh`
        if (!did) return settings.alwaysOpen ? baseUrl : null
        baseUrl += `/${did}`

        let service = await getServiceEndpoint(did)
        if (!service) return baseUrl

        let uri
        switch (nsid) {
            case 'sh.tangled.repo':
                return (await this.resolveRepoUri({ did, nsid, rkey, service })) || baseUrl
            case 'sh.tangled.repo.issue':
                return (await this.resolveIssueUri({ did, nsid, rkey })) || baseUrl
            case 'sh.tangled.repo.issue.comment':
                uri = (await getRecord({ did, nsid, rkey, service })).value?.issue
                console.log(uri)
                return (await this.resolveIssueUri({ uri })) || baseUrl
            case 'sh.tangled.repo.issue.state':
                uri = (await getRecord({ did, nsid, rkey, service })).value?.issue
                return (await this.resolveIssueUri({ uri })) || baseUrl
            case 'sh.tangled.repo.pull':
                return (await this.resolvePullUri({ did, nsid, rkey, service })) || baseUrl
            case 'sh.tangled.repo.pull.comment':
                let record = await getRecord({ did, nsid, rkey, service })
                let pullUri = record.value?.pull
                return (await this.resolvePullUri(decomposeUri(pullUri))) || baseUrl
            case 'sh.tangled.feed.star':
                uri = (await getRecord({ did, nsid, rkey, service })).value?.subject
                return (await this.resolveRepoUri({ uri })) || baseUrl
            case 'sh.tangled.feed.follow':
                followDid = (await getRecord({ did, nsid, rkey, service })).value?.subject
                return followDid ? `https://tangled.sh/${followDid}` : baseUrl
            default:
                return baseUrl
        }
    }

    static async resolvePullUri(args) {
        let record = await getRecord(args)
        let pullId = record.value?.pullId
        let uri = record.value?.targetRepo
        let repoUrl = await this.resolveRepoUri({ uri })
        return repoUrl ? `${repoUrl}/pulls/${pullId}` : null
    }

    static async resolveRepoUri(args) {
        let validatedInput = await validateUriInput(args)
        if (!validatedInput) return null
        let { uri, did, nsid, rkey, service } = validatedInput

        let name = (await getRecord({ uri, did, nsid, rkey, service })).value?.name

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
        let { uri, did, nsid, rkey, service } = validatedInput

        let record = await getRecord({ did, nsid, rkey, service })
        if (!record || !record.value.issueId || !record.value.repo) return null
        let repo = record.value.repo
        let issueId = record.value.issueId
        if (!repo) return null
        let repoUrl = await this.resolveRepoUri({ uri: repo })

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