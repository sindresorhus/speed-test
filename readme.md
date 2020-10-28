# speed-test [![Build Status](https://travis-ci.org/sindresorhus/speed-test.svg?branch=master)](https://travis-ci.org/sindresorhus/speed-test)

> Test your internet connection speed and ping using [speedtest.net](https://www.speedtest.net) from the CLI

<img src="screenshot.gif" width="404">


## Install

Ensure you have [Node.js](https://nodejs.org) version 8+ installed. Then run the following:

```
$ npm install --global speed-test
```


## Usage

```
$ speed-test --help

  Usage
    $ speed-test

  Options
    --json -j     Output the result as JSON
    --bytes -b    Output the result in megabytes per second (MBps)
    --verbose -v  Output more detailed information
```

## Tips

### Batch monitoring

```bash
while true; do sleep 30; node cli.js -v -j; done >> ~/net.log
```

## Links

- [Product Hunt post](https://www.producthunt.com/posts/speed-test-cli)


## Related

- [fast-cli](https://github.com/sindresorhus/fast-cli) - Test your download speed using fast.com


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
