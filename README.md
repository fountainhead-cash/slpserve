# bitserve

> Bitdb Microservice

An API Endpoint + Web Query UI for BitDB


# How it works

This project contains:

1. BitDB Microservice API Endpoint: An HTTP API Endpoint to your BitDB
2. BitDB Query Web UI: As seen in [https://bitdb.network/v2/explorer](https://bitdb.network/v2/explorer)

## 1. BitDB Microservice API Endpoint

Make HTTP requests to your bitdb node

![api](public/api.png)

## 2. BitDB Query Web UI

Makes use of the API endpoint to render the query UI

![query](public/bitserve.png)


# Prerequisites

You must have the following installed.

1. Bitcoin Full Node: Any BCH node implementation
2. Bitdb Node: Bitdb is a universal bitcoin database that autonomously synchronizes with Bitcoin https://bitdb.network


# Install

Step 1. Clone this repository

```
git clone https://github.com/21centurymotorcompany/bitserve.git
```

Step 2. Install Dependencies

```
npm install
```

Step 3. Run

```
npm start
```

# Configure

You can configure the service through [bitserve.json](bitserve.json)


Example:

```
{
  "query": {
    "v": 2,
    "q": { "find": {}, "limit": 10 }
  },
  "port": 3000,
  "url": "mongodb://localhost:27017",
  "timeout": 30000,
  "log": false,
}
```

Here's what each attribute represents:

- `query`: The default bitdb query to show up when you navigate to `/explorer` web UI
- `port`: web service port
- `url`: Mongodb URL that hosts BitDB.
- `timeout`: default timeout for all query requests
- `log`: `true` to see request and response logs, `false` to hide logs

# Join the Community

- Twitter: Follow the creator [@_unwriter](https://twitter.com/_unwriter)
- Chat: Join bitdb Telegram channel, ask questions, share your projects, etc. [Open chat](https://t.me/joinchat/HH1DDQ8pZlSlsdNcKgIcxw)
