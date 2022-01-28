const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use(express.static(path.join(__dirname, "../build")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/ping", function (req, res) {
  return res.send("pong");
});

app.use(function (req, res, next) {
  var whitelist = ["localhost:8080", "localhost:3000", "anydomain.com"];
  var host = req.get("host");

  whitelist.forEach(function (val, key) {
    if (host.indexOf(val) > -1) {
      res.setHeader("Access-Control-Allow-Origin", host);
    }
  });

  next();
});

app.get("/", function (req, res) {
  res.json({ messaage: "hello" });
});

app.post("/api/state/cache", (req, res, nxt) => {
  res.status(204).json({ data: req.body });
  res.end();
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../build", "index.html"));
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server up and running on", process.env.PORT || 8080);
});
