# Testing

## Setting up

Tests should be added to each handler and resolver class, defined in the `TESTS` variable as a list.

```js
static TESTS = [{
        url: '', // string
        returned: '', // string, usually an AT-URI
        settings: { key: 'value' } // object, defaults are used unless overwritten
        uriMode: true, // boolean
        output: '' // string
    }, {
        url: '',
        output: ''
    }]
```

The required fields for a full test are `url` and `output`. `returned` is optionally specifiable for handler tests as the value returned by the `processUrl` function prior to post-processing. This will usually be an AT-URI. If specified, it will count towards a failed test if the test value does not match.

## How to run

To run tests, cd into the project directory and run

```shell
node tests.js <mode> <input>
```

There are currently 2 supported mode values. Only the first character of the `mode` argument is used, so you can simply specify `h` or `r`.

1. [H]andler. Searches for handlers matching the subsequent `input`.

2. [R]esolver. Searches for resolvers matching the subsequent `input`.

There are currently 4 supported input values.

1. URL/URI. Will use default settings and perform standard lookup to find a matching handler/resolver. Handler mode will only work with URLs and resolver mode will only work with URIs.
```shell
# run the url through generic handler logic
node tests.js h https://bsky.app/profile/pfrazee.com
# run the uri through generic resolver logic
node tests.js r at://did:plc:ragtjsm2j2vknwkz3zp4oxrd/app.bsky.feed.post/3lkepzju6r22t
```

2. All tests for one handler/resolver. Enter the name of the class you'd like to test. Handler/resolver names and user input are normalized to lowercase, so you don't need to worry about capitalization.
```shell
node tests.js h bluesky # run all tests of the bluesky handler
node tests.js r bluesky # run all tests for the bluesky resolver
```

3. One handler/resolver test. Indicated by an underscore after the handler class name followed by the test number. Test number index starts at 1.
```shell
node tests.js h bluesky_2 # run the second bluesky handler test
node tests.js r bluesky_2 # run the second bluesky resolver test
```

4. All tests for all handlers/resolvers. Enter `all`. Breaks at first failed handler to facilitate review.
```shell
node tests.js h all # run all tests for all handlers
node tests.js r all # rn all tests for all resolvers
```


### Notes

Note: `package.json` is included in the repo purely to enable `tests.js` to work properly, and doesn't serve any purpose for the actual extension.