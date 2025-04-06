import { handlerMap, XRPCHandler } from './handler/_handlers.js'
import { resolverMap, XRPCResolver } from './resolver/_resolvers.js'

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
            console.log(`Fetching did:web did doc for: ${did}`)
            res = await fetch(`https://${did.slice(8)}/.well-known/did.json`)
        } else {
            console.log(`Fetching did:plc did doc for: ${did}`)
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

export async function getRecord(args) {
    let validatedInput = await validateUriInput(args)
    if (!validatedInput) return null
    let { uri, did, nsid, rkey, service } = validatedInput

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

// loop over ALL records of a certain NSID for a repo. be mindful of performance.
// used in contexts where the url only has a record name and not an rkey
export async function findRecordMatch(did, service, nsid, matchObj, stringContains = false) {
    const limit = 100
    let cursor = undefined

    while (true) {
        const data = await listRecords(did, service, nsid, limit, cursor)
        if (!data) break

        const records = data.records

        if (records && records.length > 0) {
            for (let record of records) {
                if (record['value'] && isMatch(record['value'], matchObj, stringContains)) {
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

    console.error(`No '${nsid}' URI found matching ${JSON.stringify(matchObj)}`)
    return null
}

export async function validateUriInput({ uri, did, nsid, rkey, service }) {
    console.log(`Received unvalidated URI input: ` + uri, did, nsid, rkey, service)
    if (!uri && (!did || !nsid || !rkey)) {
        console.error("Either `uri` or (`did`, `nsid`, `rkey`) must be provided.")
        return null
    }

    if (uri) {
        ({ did, nsid, rkey } = decomposeUri(uri))
    }

    if (!service) {
        service = await getServiceEndpoint(did)
        if (!service) return null
    }

    console.log(`Returning validated URI input: ` + uri, did, nsid, rkey, service)
    return { uri: uri, did: did, nsid: nsid, rkey: rkey, service: service }
}

export function isMatch(recordValue, matchObj, stringContains) {
    return Object.entries(matchObj).every(([key, value]) => {
        const recordSubValue = recordValue[key]
        if (typeof value === 'object' && value !== null) {
            return isMatch(recordSubValue, value) // recursive match
        }
        if (stringContains && typeof recordSubValue === "string") {
            return recordSubValue.includes(value)
        } else {
            return recordSubValue === value
        }
    })
}

export function decomposeUri(uri) {
    const [did = undefined, nsid = undefined, rkey = undefined] = uri.replace("at://", "").split("/")
    return { did, nsid, rkey }
}

export function composeUri({ did, nsid, rkey }) {
    if (did) {
        if (nsid) {
            if (rkey) {
                return `at://${did}/${nsid}/${rkey}`
            }
            return `at://${did}/${nsid}`
        }
        return `at://${did}`
    }
    return null
}

export function postThreadCheck(uri, settings, uriMode) {
    if (!uriMode && settings.getPostThread) {
        const depth = settings.replyCount
        const parents = settings.parentCount
        return `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://${uri}&depth=${depth}&parentHeight=${parents}`
    }
    return null
}

// EXTENSION UTILS //

export async function buildMenus(settings = {}) {
    await browser.contextMenus.removeAll()
    await browser.contextMenus.create({
        id: "PDSls",
        title: "PDSls",
        contexts: ["page", "selection", "bookmark", "link"]
    })
    if (settings.copyUriEnabled) {
        await browser.contextMenus.create({
            id: "copyATUri",
            title: "Copy AT-URI",
            contexts: ["page", "selection", "bookmark", "link"]
        })
    }
    if (settings.jetstreamEnabled) {
        await browser.contextMenus.create({
            id: "Jetstream",
            title: "Jetstream",
            contexts: ["page", "selection", "bookmark", "link"]
        })
    }
}

export function updateKeybindings(settings = {}) {
    const defaults = loadDefaultSettings()
    const keybinding = settings.keybinding || defaults.keybinding
    console.log(`Keybinding for "pdsls-tab" is now`, keybinding)
    browser.commands.update({
        name: "pdsls-tab",
        shortcut: keybinding
    })
    const copyUriKeybind = (settings.copyUriEnabled || defaults.copyUriEnabled)
        ? (settings.copyUriKeybind || defaults.copyUriKeybind)
        : ""
    console.log(`Keybinding for "at-uri-copy" is now`, copyUriKeybind)
    browser.commands.update({
        name: "at-uri-copy",
        shortcut: copyUriKeybind
    })
}

export async function loadDefaultSettings() {
    return {
        alwaysOpen: true,
        openInNewTab: true,
        pdsFallback: true,
        pdslsOpensApi: false,
        alwaysApi: false,
        getPostThread: false,
        keybinding: "Ctrl+Shift+1",
        copyUriEnabled: false,
        copyUriKeybind: "Ctrl+Shift+2",
        jetstreamEnabled: false,
        replyCount: 0,
        parentCount: 0
    }
}

// Construct and return the settings array
export async function loadSettings(silent = false) {
    let settings = {}
    const defaults = await loadDefaultSettings()
    try {
        let data = {}
        if (typeof browser != 'undefined') {
            data = await browser.storage.sync.get()
            console.log('Data retrieved from storage:', data)
            settings = { ...defaults, ...data }
            if (!silent) console.log('Loaded settings:', settings)
            updateKeybindings(settings)
        } else {
            settings = { ...defaults, ...data }
        }
        return settings
    } catch (error) {
        console.error('Error retrieving settings:', error)
        return {}
    }
}

// CORE FUNCTIONS //

// Attempt to find a matching resolver nsid domain authority and return processed URI
export async function checkResolvers(args, settings) {
    console.log(`Checking applicable resolvers with: `, args)

    if (!args.did) return settings.alwaysOpen ? `https://pdsls.dev` : null
    if (!args.nsid) {
        console.log(`No lexicon specified. Defaulting to Bluesky profile for DID.`)
        return `https://bsky.app/profile/${args.did}`
    }

    const nsidSeg2 = args.nsid.split('.').slice(0, 2).join('.')
    const nsidSeg3 = args.nsid.split('.').slice(0, 3).join('.')
    const Resolver = resolverMap[nsidSeg2] || resolverMap[nsidSeg3]

    if (Resolver) {
        return (await Resolver.processURI(args, settings)) || (settings.alwaysOpen ? `https://pdsls.dev` : null)
    }

    console.error(`No matching resolver found: Invalid lexicon '${args.nsid}'`)
    return settings.alwaysOpen ? `https://pdsls.dev` : null
}

// Attempt to find a matching handler pattern and return processed URL
export async function checkHandlers(url, settings, uriMode = false) {
    if (!url) return null
    try {
        url = new URL(url)
    } catch (error) {
        console.error("No match found: Invalid website", error)
        return null
    }
    const Handler = handlerMap[url.hostname]
    if (Handler) {
        console.log(`Match: ${Handler.name}`)
        let result = await Handler.processURL(url, settings, uriMode);
        if (result && result.startsWith("at://")) {
            if (settings.alwaysApi) {
                return (await XRPCResolver.processURI(decomposeUri({ result })))
            } else if (!uriMode) {
                return `https://pdsls.dev/${result}`
            }
        }
        return result
    } else if (url.pathname.split('/')[1] === 'xrpc') {
        let result = await XRPCHandler.processURL(url, settings, uriMode)
        if (result && result.startsWith("at://") && !uriMode) {
            return `https://pdsls.dev/${result}`
        }
        return result
    } else if (settings.pdsFallback) {
        console.log("PDS handler received: " + url)
        return settings.alwaysApi
            ? (await XRPCResolver.processURI({ pds: url.hostname }))
            : `https://pdsls.dev/${url.hostname}`
    } else {
        console.warn("PDS fallback matching is set to false. No match found.")
        return null
    }
}

// Validate a returned handler pattern
export async function validateUrl(url, settings) {
    console.log(`Validate URL received: ${url}`)
    if (!url) {
        if (!settings.alwaysOpen) {
            console.warn(`Unsupported input. Not redirecting due to user preferences.`)
        } else {
            console.log(`Unsupported input. Defaulting to pdsls.dev`)
            url = `https://pdsls.dev`
        }
    }
    return url
}

// Open a provided URL or the current page URL, after processing
export async function openNewTab(url, settings) {
    if (!url) {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        url = tabs[0]?.url
    }
    if (!url) { console.error("Error: No URL"); return }

    let newUrl = await validateUrl(await checkHandlers(url, settings), settings)

    console.log(`openNewTab settings object: `, settings)
    if (newUrl) {
        await settings.openInNewTab
            ? browser.tabs.create({ url: newUrl })
            : browser.tabs.update({ url: newUrl })
        console.log(`URL opened: ${newUrl}`)
    }
}

// Copy the AT-URI corresponding to a provided URL
export async function copyATUri(url, settings) {
    if (!url) {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        url = tabs[0]?.url
    }
    if (!url) { console.error("Error: No URL"); return }

    let atUri = await checkHandlers(url, settings, true)

    if (atUri) {
        console.log(`Copying AT-URI to clipboard: ${atUri}`)
    } else {
        console.warn(`Unsupported input. Writing pdsls.dev to clipboard.`)
        atUri = "https://pdsls.dev"
    }

    try {
        await navigator.clipboard.writeText(atUri);
    } catch (err) {
        console.error("Clipboard write failed: ", err);
    }
}

// Open the PDSls Jetstream link for the relevant DID and collection
export async function openJetstream(url, settings) {
    if (!url) {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true })
        url = tabs[0]?.url
    }
    if (!url) { console.error("Error: No URL"); return }

    let atUri = await checkHandlers(url, settings, true)

    let newUrl = "https://pdsls.dev/jetstream"
    if (!atUri) {
        console.warn(`Unsupported input. Opening PDSls Jetstream page without parameters.`)
    } else {
        newUrl += `?instance=wss%3A%2F%2Fjetstream1.us-east.bsky.network%2Fsubscribe`
        let { did: did, nsid: nsid, rkey: rkey } = decomposeUri(atUri)
        newUrl += `&dids=${encodeURIComponent(did)}`
        if (nsid) newUrl += `&collections=${encodeURIComponent(nsid)}`
        newUrl += `&allEvents=on`
    }

    await settings.openInNewTab
        ? browser.tabs.create({ url: newUrl })
        : browser.tabs.update({ url: newUrl })
    console.log(`URL opened: ${newUrl}`)
}
