import { PDSls } from './pdsls.js'
import { Bluesky } from './bluesky.js';
import { Aglais } from './aglais.js';
import { Ouranos } from './ouranos.js'
import { Klearsky } from './klearsky.js'
import { Skychat } from './skychat.js'
import { SuperCoolClient } from './supercoolclient.js';
import { Pinboards } from './pinboards.js'
import { WhiteWind } from './whitewind.js'
import { Frontpage } from './frontpage.js'
import { Skylights } from './skylights.js'
import { Pinksea } from './pinksea.js'
import { ATBrowser } from './atbrowser.js'
import { ATPTools } from './atptools.js'
import { Clearsky } from './clearsky.js'
import { BlueViewer } from './blueviewer.js'
import { Skythread } from './skythread.js'
import { Skyview } from './skyview.js'
import { SmokeSignal } from './smokesignal.js'
import { ATProtoCamp } from './atprotocamp.js'
import { BlueBadge } from './bluebadge.js'
import { LinkAT } from './linkat.js'
import { Internect } from './internect.js'
import { RecipeExchange } from './recipeexchange.js'
import { Plonk } from './plonk.js'
import { PasteSphere } from './pastesphere.js'
import { BookHive } from './bookhive.js'
import { Flushes } from './flushes.js'
import { Tangled } from './tangled.js';
import { BskyCDN } from './bskycdn.js'
import { XRPC } from './xrpc.js'

const handlers = [
    PDSls,
    Bluesky,
    Aglais,
    Ouranos,
    Klearsky,
    Skychat,
    SuperCoolClient,
    Pinboards,
    WhiteWind,
    Frontpage,
    Skylights,
    Pinksea,
    ATBrowser,
    ATPTools,
    Clearsky,
    BlueViewer,
    Skythread,
    Skyview,
    SmokeSignal,
    ATProtoCamp,
    BlueBadge,
    LinkAT,
    Internect,
    RecipeExchange,
    Plonk,
    PasteSphere,
    BookHive,
    Flushes,
    Tangled,
    BskyCDN,
    XRPC
];

const handlerMap = {};
for (const Handler of handlers) {
    for (const domain of Handler.DOMAINS) {
        handlerMap[domain] = Handler;
    }
}

export { handlerMap, handlers, XRPC as XRPCHandler, PDSls as PDSlsHandler };

