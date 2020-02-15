require('dotenv').config()
const express = require('express')
const slpqueryd = require('fountainhead-core').slpqueryd
const PQueue = require('p-queue')
const ip = require('ip')
const app = express()
const rateLimit = require("express-rate-limit")
const cors = require("cors")

const config = {
  "query": {
    "v": 3,
    "q": { "find": {}, "limit": 10 }
  },
  "name": process.env.db_name ? process.env.db_name : "slpdb",
  "url": process.env.db_url ? process.env.db_url : "mongodb://localhost:27017",
  "port": Number.parseInt(process.env.slpserve_port ? process.env.slpserve_port : 3000),
  "timeout": Number.parseInt(process.env.slpserve_timeout ? process.env.slpserve_timeout : 30000),
  "log": process.env.slpserve_log ? process.env.slpserve_log == 'true' : true,
  "max_request": process.env.max_request ? Number.parseInt(process.env.max_request) : 500,
};

const concurrency = ((config.concurrency && config.concurrency.aggregate) ? config.concurrency.aggregate : 3)
const queue = new PQueue({concurrency: concurrency})

var db

app.set('view engine', 'ejs')
app.use(express.static('public'))

// create rate limiter for API endpoint,ß bypass whitelisted IPs
var whitelist = []
if (process.env.whitelist) {
  whitelist = process.env.whitelist.split(',')
}
app.use(cors())
app.use(express.json({
  limit: config.max_request
}))
app.enable("trust proxy")
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: config.max_request,
  handler: function(req, res, /*next*/) {
    res.format({
      json: function() {
        res.status(500).json({
          error: "Too many requests. Limits are 60 requests per minute."
        })
      }
    })
  },
  skip: function (req, /*res*/) {
    if (whitelist.includes(req.ip)) {
      return true
    }
    return false
  }
})

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send(JSON.stringify({
      error: "Invalid JSON"
    }))
  }

  if (err.hasOwnProperty('message') && err.message === 'request entity too large') {
    return res.status(400).send(JSON.stringify({
      error: "Request body too large"
    }))
  }
  console.error(err);
  res.status(500).send();
});


const handle_query = async (decoded, res) => {
  let r = decoded
  if (r.q && r.q.aggregate) {
    // add to aggregate queue
    console.log("# Aggregate query. Adding to queue", queue.size)
    queue.add(async function() {
      // regular read
      let result = await db.read(r)
      if (config.log) {
        console.log("query = ", r)
        console.log("response = ", result)
      }
      console.log("Done", queue.size-1)
      res.json(result)
    })
  } else {
    // regular read
    let result = await db.read(r)
    if (config.log) {
      console.log("query = ", r)
      console.log("response = ", result)
    }
    res.json(result)
  }
};

app.post('/q', cors(), limiter, async function(req, res) {
  const encoded = req.body
  await handle_query(encoded, res)
});
app.get(/^\/q\/(.+)/, cors(), limiter, async function(req, res) {
  const encoded = req.params[0];
  const decoded = JSON.parse(new Buffer(encoded, "base64").toString());
  await handle_query(decoded, res)
})

const decode = (encoded) => {
  let decoded = Buffer.from(encoded, 'base64').toString()
  try {
    let unpretty = JSON.stringify(JSON.parse(decoded));

    if (decoded == unpretty) {
      decoded = JSON.stringify(JSON.parse(decoded), null, 2);
    }
  } catch (e) {}
  return decoded;
};
app.get(/^\/explorer\/(.+)/, function(req, res) {
  res.render('explorer', { code: decode(req.params[0]) })
});
app.get('/explorer', function (req, res) {
  res.render('explorer', { code: JSON.stringify(config.query, null, 2) })
});
app.get('/', function(req, res) {
  res.redirect('/explorer')
});
app.get(/^\/explorer2\/(.+)/, function(req, res) {
  res.redirect('/explorer')
});
app.get('/explorer2', function (req, res) {
  res.redirect('/explorer')
});
app.get(/^\/explorer-tabular\/(.+)/, function(req, res) {
  res.render('explorer-tabular', { code: decode(req.params[0]) })
});
app.get('/explorer-tabular', function (req, res) {
  res.render('explorer-tabular', { code: JSON.stringify(config.query, null, 2) })
});
app.get('/', function(req, res) {
  res.redirect('/explorer')
});
var run = async function() {
  db = await slpqueryd.init({
    url: (config.url ? config.url : process.env.url),
    timeout: config.timeout,
    name: config.name
  })
  app.listen(config.port, () => {
    console.log("######################################################################################");
    console.log("#")
    console.log("#  SLPSERVE: SLP Microservice")
    console.log("#  Serving SLP through HTTP...")
    console.log("#")
    console.log(`#  Explorer: ${ip.address()}:${config.port}/explorer`);
    console.log(`#  API Endpoint: ${ip.address()}:${config.port}/q`);
    console.log("#")
    console.log("#  Learn more at https://docs.fountainhead.cash")
    console.log("#")
    console.log("######################################################################################");
  })
}
run()
