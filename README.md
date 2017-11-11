# MacD - Ledger Service
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Ledger is a self-contained and scalable web service built for the MacD project, which is a Forex trading platform clone utilizing service-oriented architecture techniques.

# Table of Contents

1. [Features](#features)
1. [Development](#development)
    1. [Install Dependencies](#install-dependencies)
    1. [Usage](#usage)
1. [Requirements](#requirements)
1. [Roadmap](#roadmap)
1. [Contributing](#contributing)
1. [Architecture](#architecture)
    1. [MacD System Diagram](#macd-system-diagram)
    1. [Ledger Dataflow Diagram](#ledger-dataflow-diagram)
1. [License](#license)

## Features

- Polls real time price and volume updates, storing the data in a Postgres database. 
- Computes the OHLC candlesticks data every 5 seconds and publishes to message bus (AWS SQS) in near real time.
- Polls and serves incoming requests for historical candlesticks data at various time intervals (1min, 5min, 1hour, 1day etc) in a given time period.

## Development

### Install Dependencies

```sh
$ npm install
```

### Usage

Run tests:

```sh
$ npm test
```

Start Express Server:
```sh
$ npm start
```

Start Price Poll Worker:
```sh
$ npm run price-poll
```

Start Histical Request Poll Worker:
```sh
$ npm run hist-poll
```

Start OHLC 5-second Interval Worker:
```sh
$ npm run s5bars-worker
```

Start Materialized Views Refresh Worker:
```sh
$ npm run mviews-worker
```

## Requirements

- Node 6.9.x
- Redis 3.2.x
- Postgresql 9.6.x
- Elasticsearch
- Kibana
- AWS SQS
- AWS S3

## Roadmap

View the project roadmap [here](https://docs.google.com/document/d/1TmaTKqzB8GPqUGety81Gz25TjcSp1oa-Xwx2Hf7iLVs/edit)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Architecture

### MacD System Diagram
![MacD System](http://i67.tinypic.com/24git7l.jpg)

### Ledger Dataflow Diagram
![Ledger Dataflow](http://i67.tinypic.com/30v21at.jpg)

## License
MIT © [Kenny Cao](https://github.com/kennyxcao)