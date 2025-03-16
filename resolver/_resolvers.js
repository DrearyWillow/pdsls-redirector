import { ATProfile } from './atprofile.js'
import { BlueBadge } from './bluebadge.js'
import { BluePlace } from './blueplace.js'
import { Bluesky } from './bluesky.js'
import { BookHive } from './bookhive.js'
import { Flushes } from './flushes.js'
import { Frontpage } from './frontpage.js'
import { LinkAT } from './linkat.js'
import { PasteSphere } from './pastesphere.js'
import { Pinboards } from './pinboards.js'
import { Pinksea } from './pinksea.js'
import { Pinksky } from './pinksky.js'
import { Plonk } from './plonk.js'
import { Popsky } from './popsky.js'
import { Psky } from './psky.js'
import { RecipeExchange } from './recipeexchange.js'
import { RutHub } from './ruthub.js'
import { Skyblur } from './skyblur.js'
import { Skylights } from './skylights.js'
import { Skywatched } from './skywatched.js'
import { SmokeSignal } from './smokesignal.js'
import { Tangled } from './tangled.js'
import { WhiteWind } from './whitewind.js'
import { Woosh } from './woosh.js'
import { XRPC } from './xrpc.js'

const resolvers = [
    ATProfile,
    BlueBadge,
    BluePlace,
    Bluesky,
    BookHive,
    Flushes,
    Frontpage,
    LinkAT,
    PasteSphere,
    Pinboards,
    Pinksea,
    Pinksky,
    Plonk,
    Popsky,
    Psky,
    RecipeExchange,
    RutHub,
    Skyblur,
    Skylights,
    Skywatched,
    SmokeSignal,
    Tangled,
    WhiteWind,
    Woosh,
]

const resolverMap = {}
for (const Resolver of resolvers) {
    resolverMap[Resolver.NSID_AUTH] = Resolver
}

export { resolverMap, resolvers, XRPC as XRPCResolver }

