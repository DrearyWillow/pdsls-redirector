export async function getHandle(did) {
    if (!did.startsWith("did:")) return null
    return (await getDidDoc(did))?.alsoKnownAs?.[0]?.replace(/^at:\/\//, "");
}

export async function getDid(handle) {
    if (!handle) {
        console.error(`Error: invalid handle '${handle}'`)
        return null
    }
    if (handle.startsWith("did:")) return handle
    if (handle.startsWith("@")) handle = handle.slice(1)
    try {
        const did = await resolveHandle(handle)
        if (!did) {
            console.error(`Error retrieving DID '${did}'`)
            return null
        }
        return did
    } catch (err) {
        console.error(`Error retrieving DID '${did}':`, err)
        return null
    }
}

export async function resolveHandle(handle) {
    try {
        const res = await fetch(
            `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=` +
            handle,
        )
        return res.json().then((json) => json.did)
    } catch (err) {
        console.error(`Error resolving handle '${handle}':`, err)
        return null
    }
}

export async function getDidDoc(did) {
    let res
    try {
        if (did.startsWith("did:web:")) {
            console.log("Fetching did:web did doc")
            res = await fetch(`https://${did.slice(8)}/.well-known/did.json`)
        } else {
            console.log("Fetching did:plc did doc")
            res = await fetch(`https://plc.directory/${did}`)
        }

        if (!res.ok) {
            console.error(`Failed to fetch did doc for '${did}'. Status: ${res.status}`)
            return null
        }

        return await res.json()
    } catch (err) {
        console.error("Error fetching did doc:", err)
        return null
    }
}

export async function getServiceEndpoint(did) {
    try {
        let didDoc = await getDidDoc(did)
        if (didDoc && didDoc.service) {
            for (let service of didDoc.service) {
                if (service.type === 'AtprotoPersonalDataServer') {
                    let endpoint = service.serviceEndpoint
                    console.log(`Endpoint found: ${endpoint}`)
                    return endpoint
                }
            }
        }
        console.error("No service endpoint found.")
        return null
    } catch (err) {
        console.error("Error fetching service endpoint:", err)
        return null
    }
}

export async function getRecord(did, nsid, rkey, service) {
    if (!service) {
        service = await getServiceEndpoint(did)
        if (!service) return null
    }

    try {
        const params = new URLSearchParams({
            repo: did,
            collection: nsid,
            rkey: rkey
        })

        const response = await fetch(`${service}/xrpc/com.atproto.repo.getRecord?${params.toString()}`, {
            method: 'GET'
        })
        return response.json()
    }
    catch {
        console.error("Error getting record:", err)
        return null
    }
}

export async function listRecords(did, service, nsid, limit, cursor) {
    try {
        const params = new URLSearchParams({
            repo: did,
            collection: nsid,
            limit: limit,
            cursor: cursor,
        })

        const response = await fetch(`${service}/xrpc/com.atproto.repo.listRecords?${params.toString()}`, {
            method: 'GET'
        })
        return response.json()
    }
    catch {
        console.error("Error listing records:", err)
        return null
    }
}

export async function getWhiteWindUri(did, service, title) {
    const nsid = "com.whtwnd.blog.entry"
    const limit = 100
    let cursor = undefined
    const decodedTitle = decodeURIComponent(title)

    while (true) {
        const data = await listRecords(did, service, nsid, limit, cursor)
        if (!data) break
        const records = data.records

        if (records && records.length > 0) {
            for (let record of records) {
                if (record.value && record.value.title === decodedTitle) {
                    return record.uri
                }
            }
        } else {
            break
        }

        cursor = data.cursor
        if (!cursor) {
            break
        }
    }
    console.error(`No WhiteWind blog URI found for title '${decodedTitle}'`)
    return null
}

export function decomposeUri(uri) {
    const [did = undefined, nsid = undefined, rkey = undefined] = uri.replace("at://", "").split("/")
    return { did, nsid, rkey }
}