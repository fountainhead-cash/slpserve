# bitserve

> Bitdb Microservice

An API Endpoint + Web Query UI for BitDB


# How it works

This project contains:

1. BitDB Microservice API Endpoint: An HTTP API Endpoint to your BitDB
2. BitDB Query Web UI: As seen in [https://bitdb.fountainhead.cash/explorer](https://bitdb.fountainhead.cash/explorer)

## 1. BitDB Microservice API Endpoint

Make HTTP requests to your bitdb node

![api](public/api.png)

## 2. BitDB Query Web UI

Makes use of the API endpoint to render the query UI

![query](public/bitserve.png)


# Prerequisites

You must have the following installed.

1. Bitcoin Full Node: Any BCH node implementation
2. Bitdb Node: Bitdb is a universal bitcoin database that autonomously synchronizes with Bitcoin https://github.com/fountainhead-cash/bitd


# Install

Step 1. Clone this repository

```
git clone https://github.com/fountainhead-cash/bitserve.git
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

You can configure the service with .env, just copy .env.example to .env and edit it to match your system.

# Join the Community

- Chat: Join fountainhead.cash Telegram channel, ask questions, share your projects, etc. [Open chat](http://t.me/fountainheadcash)
