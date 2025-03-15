import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import { checkHandlers, validateUrl, loadDefaultSettings, checkResolvers, decomposeUri } from './utils.js'

function log(text) { console.log(`\x1b[1;38;5;5m${text}\x1b[0m`) }
function log2(text) { console.log(`\x1b[1;38;5;10m${text}\x1b[0m`) }
function warn(text) { console.warn(`\x1b[1;38;5;11m${text}\x1b[0m`) }
function error2(text) { console.error(`\x1b[1;38;5;1m${text}\x1b[0m`) }
function error(text) { console.error(`\x1b[1;38;5;9m${text}\x1b[0m`) }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HANDLER_DIR = path.join(__dirname, "handler");
const RESOLVER_DIR = path.join(__dirname, "resolver")

async function loadClasses(mode) {
    const classes = {};
    const DIR = (mode === 'HANDLER') ? HANDLER_DIR : RESOLVER_DIR
    const files = fs.readdirSync(DIR).filter(file => file.endsWith(".js"));
    for (const file of files) {
        const module = await import(`${DIR}/${file}`)
        const Class = Object.values(module)[0] // assume only one class for now
        classes[Class.name.toLowerCase()] = Class
    }
    return classes;
}

// async function runResolver(mode, userInput) {
//     const resolvers = await loadClasses(mode)
//     let resolverKey, testNum
//     if (userInput.toLowerCase() === "all") {
//         resolverTestAll(handlers)
//         return
//     } else if (userInput.startsWith('at://')) {
//         let uri = userInput
//         let settings = await loadDefaultSettings()
//         let output = await checkResolvers(uri, settings)
//         log(`Output: ${output}`)
//         return
//     } else if (userInput.includes('_')) {
//         [resolverKey, testNum] = userInput.split('_')
//         testNum = Number(testNum)
//         resolverKey = resolverKey.toLowerCase()
//     } else {
//         resolverKey = userInput.toLowerCase()
//     }

//     let resolverClass
//     if (testNum && handlers[handlerKey]) {
//         HandlerClass = handlers[handlerKey];
//         console.log()
//         log2(`Running handler test ${testNum} for ${HandlerClass.name}`);
//         handlerTestSingle(HandlerClass, testNum)
//     } else if (handlers[handlerKey]) {
//         HandlerClass = handlers[handlerKey];
//         console.log()
//         log2(`Running all handler tests for ${HandlerClass.name}`);
//         handlerTestLoop(HandlerClass);
//     } else {
//         error(`No matching handler class found for '${userInput}'`);
//     }
// }

async function runTests(mode, userInput) {
    const classes = await loadClasses(mode)
    let classKey, testNum
    if (userInput.toLowerCase() === "all") {
        return testAll(mode, classes)
        // return (mode === 'HANDLER')
        //     ? handlerTestAll(classes)
        //     : resolverTestAll(classes)
    } else if ((mode === 'HANDLER') && userInput.startsWith('https://')) {
        let url = userInput
        let settings = await loadDefaultSettings()
        let uriMode = false
        let output = await checkHandlers(new URL(url), settings, uriMode)
        if (!uriMode) output = await validateUrl(output, settings)
        log(`Output: ${output}`)
        return
    } else if ((mode === 'RESOLVER') && userInput.startsWith('at://')) {
        let uri = userInput
        let settings = await loadDefaultSettings()
        let output = await checkResolvers(decomposeUri(uri), settings)
        log(`Output: ${output}`)
        return
    } else if (userInput.includes('_')) {
        [classKey, testNum] = userInput.split('_')
        testNum = Number(testNum)
        classKey = classKey.toLowerCase()
    } else {
        classKey = userInput.toLowerCase()
    }

    let Class
    if (testNum && classes[classKey]) {
        Class = classes[classKey]
        console.log()
        log2(`Running ${mode.toLowerCase()} test ${testNum} for ${Class.name}`)
        return testSingle(mode, Class, testNum)
    } else if (classes[classKey]) {
        Class = classes[classKey]
        console.log()
        log2(`Running all ${mode.toLowerCase()} tests for ${Class.name}`);
        return testClassLoop(mode, Class)
    } else {
        error(`No matching ${mode.toLowerCase()} class found for '${userInput}'`);
    }
}

// async function runHandler(mode, userInput) {
//     const handlers = await loadClasses(mode);
//     let handlerKey, testNum
//     if (userInput.toLowerCase() === "all") {
//         handlerTestAll(handlers)
//         return
//     } else if (userInput.startsWith('https://')) {
//         let url = userInput
//         let settings = await loadDefaultSettings()
//         let uriMode = false
//         let output = await checkHandlers(new URL(url), settings, uriMode)
//         if (!uriMode) output = await validateUrl(output, settings)
//         log(`Output: ${output}`)
//         return
//     } else if (userInput.includes('_')) {
//         [handlerKey, testNum] = userInput.split('_')
//         testNum = Number(testNum)
//         handlerKey = handlerKey.toLowerCase()
//     } else {
//         handlerKey = userInput.toLowerCase()
//     }

//     let HandlerClass
//     if (testNum && handlers[handlerKey]) {
//         HandlerClass = handlers[handlerKey];
//         console.log()
//         log2(`Running handler test ${testNum} for ${HandlerClass.name}`);
//         handlerTestSingle(HandlerClass, testNum)
//     } else if (handlers[handlerKey]) {
//         HandlerClass = handlers[handlerKey];
//         console.log()
//         log2(`Running all handler tests for ${HandlerClass.name}`);
//         handlerTestLoop(HandlerClass);
//     } else {
//         error(`No matching handler class found for '${userInput}'`);
//     }
// }

async function testOneResolver(Resolver, test, index) {
    let success = true
    let testName = `${Resolver.name}_${index + 1}`
    console.log()
    log(`Starting ${testName}`)

    let uri = test.uri
    let settings = { ...(await loadDefaultSettings()), ...(test.settings || {}) }

    if (!uri) {
        error(`Mandatory field 'uri' is missing in ${testName}`)
        return "earlyBreak"
    }

    let output
    // special carve-out because we can't look up by NSID
    if (Resolver.name === "XRPC") {
        output = await Resolver.processURI(decomposeUri(test.uri))
    } else {
        output = await checkResolvers(decomposeUri(uri), settings)
    }

    log(`${testName} output: ${output}`)
    if (output === test.output) {
        log(`${testName} output match.`)
    } else {
        warn(`${testName} failed: expected '${test.output}'`)
        success = false
    }
    return success
}

async function testOneHandler(Handler, test, index) {
    let success = true
    let testName = `${Handler.name}_${index + 1}`
    console.log()
    log(`Starting ${testName}`)

    let url = test.url
    let settings = { ...(await loadDefaultSettings()), ...(test.settings || {}) }
    let uriMode = test.uriMode || false

    if (!url) {
        error(`Mandatory field 'url' is missing in ${testName}`)
        return "earlyBreak"
    }
    // console.log(`${testName} inputs:`, {url, settings, uriMode})

    // could add optional intermediary result by testing the handler manually
    if (test.returned) {
        log(`Handler 'returned' value defined for test. Validating...`)
        let returned = await Handler.processURL((new URL(url)), settings, uriMode)
        log(`${testName} handler returned: ${returned}`)
        if (returned === test.returned) {
            log(`Handler returned value matches.`)
        } else {
            warn(`Handler returned value does not match: expected '${test.returned}'`)
            success = false
        }
    }

    let output = await checkHandlers(new URL(url), settings, uriMode)

    if (!uriMode) output = (await validateUrl(output, settings))

    log(`${testName} output: ${output}`)
    if (output === test.output) {
        log(`${testName} output match.`)
    } else {
        warn(`${testName} failed: expected '${test.output}'`)
        success = false
    }
    return success
}

async function testSingle(mode, Class, testNum) {
    if (!Class.TESTS) {
        error(`No tests defined in ${Class.name}.`)
        return
    }
    if ((testNum > Class.TESTS.length) || testNum < 1) {
        error(`Index out of range: ${Class.name} does not have a test ${testNum}`)
        return
    }
    const testIndex = testNum - 1
    return (mode === 'HANDLER')
        ? testOneHandler(Class, Class.TESTS[testIndex], testIndex)
        : testOneResolver(Class, Class.TESTS[testIndex], testIndex)
}

async function testClassLoop(mode, Class) {
    let failCount = 0
    let earlyBreak = false

    if (!Class.TESTS) {
        error(`No tests defined in ${Class.name}.`)
        return false
    }

    for (let [index, test] of Class.TESTS.entries()) {
        let success = (mode === 'HANDLER')
            ? await testOneHandler(Class, test, index)
            : await testOneResolver(Class, test, index)
        if (success === "earlyBreak") { earlyBreak = true; break }
        if (!success) failCount += 1
    }

    console.log()
    if (earlyBreak) return false
    if (!earlyBreak) {
        let msg = `${Class.name}: ${Class.TESTS.length - failCount}/${Class.TESTS.length} tests successful.\n`
        if (failCount) {
            error2(msg)
            return false
        } else {
            log2(msg)
            return true
        }
    }
}

async function testAll(mode, classes) {
    let completed = 0
    let Class
    for (Class of Object.values(classes)) {
        let success = await testClassLoop(mode, Class)
        if (!success) break
        completed += 1
    }
    let msg = `${completed}/${Object.keys(classes).length} tests finished sucessfully.`
    if (completed < classes.length) {
        error2(msg)
        error2(`Broke on ${Class.name}`)
    } else { 
        log2(msg)
    }
    console.log()
}

async function initializeTests() {
    let mode = process.argv[2]
        ? process.argv[2]
        : await new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            rl.question("Enter mode (Handler or Resolver): ", answer => {
                rl.close()
                resolve(answer)
            })
        })
    
    mode = mode.trim().toUpperCase().startsWith("R") ? "RESOLVER" : "HANDLER";
    
    // mode = mode.slice(0, 1).toUpperCase()
    // if (mode === 'R') {
    //     mode = 'RESOLVER'
    // } else if (mode === 'H') {
    //     mode = 'HANDLER'
    // } else {
    //     error('Invalid mode specified. Please choose [R]esolver or [H]andler')
    //     return
    // }
    
    const userInput = process.argv[3]
        ? process.argv[3]
        : await new Promise(resolve => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            rl.question(`Enter ${mode.toLowerCase()} name: `, answer => {
                rl.close()
                resolve(answer)
            })
        })
    
    runTests(mode, userInput)
    // if (mode === 'RESOLVER') {
    //     runResolver(mode, userInput)
    // } else if (mode === 'HANDLER') {
    //     runHandler(mode, userInput)
    // }
}

await initializeTests()