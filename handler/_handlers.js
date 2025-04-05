import { Aglais } from './aglais.js'
import { ATBrowser } from './atbrowser.js'
import { ATProfile } from './atprofile.js'
import { ATProtoCamp } from './atprotocamp.js'
import { ATPTools } from './atptools.js'
import { BlueBadge } from './bluebadge.js'
import { Bluesky } from './bluesky.js'
import { BlueViewer } from './blueviewer.js'
import { BookHive } from './bookhive.js'
import { BskyCDN } from './bskycdn.js'
import { Clearsky } from './clearsky.js'
import { Flushes } from './flushes.js'
import { Frontpage } from './frontpage.js'
import { Internect } from './internect.js'
import { Klearsky } from './klearsky.js'
import { LinkAT } from './linkat.js'
import { MyB } from './myb.js'
import { Ouranos } from './ouranos.js'
import { PasteSphere } from './pastesphere.js'
import { PDSls } from './pdsls.js'
import { Pinboards } from './pinboards.js'
import { Pinksea } from './pinksea.js'
import { Pinksky } from './pinksky.js'
import { Plonk } from './plonk.js'
import { Popsky } from './popsky.js'
import { RecipeExchange } from './recipeexchange.js'
import { RutHub } from './ruthub.js'
import { Skyblur } from './skyblur.js'
import { Skychat } from './skychat.js'
import { Skylight } from './skylight.js'
import { Skylights } from './skylights.js'
import { Skythread } from './skythread.js'
import { Skyview } from './skyview.js'
import { Skywatched } from './skywatched.js'
import { SmokeSignal } from './smokesignal.js'
import { SuperCoolClient } from './supercoolclient.js'
import { Swablu } from './swablu.js'
import { Tangled } from './tangled.js'
import { WhiteWind } from './whitewind.js'
import { Woosh } from './woosh.js'
import { XRPC } from './xrpc.js'

const handlers = [
    Aglais,
    ATBrowser,
    ATProfile,
    ATProtoCamp,
    ATPTools,
    BlueBadge,
    Bluesky,
    BlueViewer,
    BookHive,
    BskyCDN,
    Clearsky,
    Flushes,
    Frontpage,
    Internect,
    Klearsky,
    LinkAT,
    MyB,
    Ouranos,
    PasteSphere,
    PDSls,
    Pinboards,
    Pinksea,
    Pinksky,
    Plonk,
    Popsky,
    RecipeExchange,
    RutHub,
    Skyblur,
    Skychat,
    Skylight,
    Skylights,
    Skythread,
    Skyview,
    Skywatched,
    SmokeSignal,
    SuperCoolClient,
    Swablu,
    Tangled,
    WhiteWind,
    Woosh,
    XRPC,
]

const handlerMap = {}
for (const Handler of handlers) {
    for (const domain of Handler.DOMAINS) {
        handlerMap[domain] = Handler
    }
}

export { handlerMap, handlers, XRPC as XRPCHandler }

