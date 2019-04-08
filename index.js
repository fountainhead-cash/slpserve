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
  "log": process.env.slpserve_log ? process.env.slpserve_log == 'true' : true
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
app.enable("trust proxy")
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 60, // 60 requests per windowMs
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
app.get(/^\/q\/(.+)/, cors(), limiter, async function(req, res) {
  var encoded = req.params[0];
  let r = JSON.parse(new Buffer(encoded, "base64").toString());
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
  res.redirect('/explorer2')
});
app.get(/^\/explorer2\/(.+)/, function(req, res) {
  res.render('explorer2', { code: decode(req.params[0]) })
});
app.get('/explorer2', function (req, res) {
  res.render('explorer2', { code: JSON.stringify(config.query, null, 2) })
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
