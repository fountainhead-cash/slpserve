# slpserve

> SLPDB Microservice

An API Endpoint + Web Query UI for SLPDB


# How it works

This project contains:

1. SLPDB Microservice API Endpoint: An HTTP API Endpoint to your SLPDB
2. SLPDB Query Web UI: As seen in [https://slpdb.fountainhead.cash/explorer](https://slpdb.fountainhead.cash/explorer)

## 1. SLPDB Microservice API Endpoint

Make HTTP requests to your SLPDB node

![api](public/api.png)

## 2. SLPDB Query Web UI

Makes use of the API endpoint to render the query UI

![query](public/slpserve.png)


# Prerequisites

You must have the following installed.

1. Bitcoin Full Node: Any BCH node implementation
2. SLPDB Node: SLPDB is a universal SLP database that autonomously synchronizes with Bitcoin https://github.com/simpleledger/SLPDB


# Install

Step 1. Clone this repository

```
git clone https://github.com/fountainhead-cash/slpserve.git
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
