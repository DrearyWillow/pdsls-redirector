import { Bluesky } from './bluesky.js'
import { Pinboards } from './pinboards.js'
import { WhiteWind } from './whitewind.js'
import { Frontpage } from './frontpage.js'
import { Skylights } from './skylights.js'
import { Pinksea } from './pinksea.js'
import { SmokeSignal } from './smokesignal.js'
import { BlueBadge } from './bluebadge.js'
import { BluePlace } from './blueplace.js'
import { LinkAT } from './linkat.js'
import { RecipeExchange } from './recipeexchange.js'
import { Plonk } from './plonk.js'
import { PasteSphere } from './pastesphere.js'
import { BookHive } from './bookhive.js'
import { Flushes } from './flushes.js'
import { XRPC } from './xrpc.js'
import { Psky } from './psky.js'
import { Popsky } from './popsky.js'
import { Skyblur } from './skyblur.js'
import { RutHub } from './ruthub.js'
import { Woosh } from './woosh.js'
import { Skywatched } from './skywatched.js'
import { ATProfile } from './atprofile.js'
import { Tangled } from './tangled.js'

const resolvers = [
    Bluesky,
    Pinboards,
    WhiteWind,
    Frontpage,
    Skylights,
    Pinksea,
    SmokeSignal,
    BlueBadge,
    BluePlace,
    LinkAT,
    RecipeExchange,
    Plonk,
    PasteSphere,
    BookHive,
    Flushes,
    Skywatched,
    Skyblur,
    Popsky,
    RutHub,
    ATProfile,
    Psky,
    Woosh,
    Tangled,
];

const resolverMap = {};
for (const Resolver of resolvers) {
    resolverMap[Resolver.NSID_AUTH] = Resolver;
}

export { resolverMap, XRPC as XRPCResolver, resolvers };

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
