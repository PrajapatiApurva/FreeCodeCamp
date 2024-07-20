require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const dns = require("dns");
const urlParser = require("url");
const app = express();

let dbUrl = process.env.MONGO_URI;
let dbName = process.env.DB_NAME;
let collectionName = process.env.COLLECTION_NAME;

const client = new MongoClient(dbUrl);
const db = client.db(dbName);
const collection = db.collection(collectionName);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;
  const dnsLookup = dns.lookup(
    urlParser.parse(url).hostname,
    async (error, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
      } else {
        const urlCount = await collection.countDocuments();
        const urlDoc = {
          original_url: url,
          short_url: urlCount,
        };
        await collection.insertOne(urlDoc);
        res.json({
          original_url: url,
          short_url: urlCount,
        });
      }
    }
  );
});

app.get("/api/shorturl/:url",async (req, res) => {
  const requestedUrl = req.params.url;

  const result = await collection.findOne({short_url: +requestedUrl});
  
  res.redirect(result.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port http://localhost:${port}`);
});
