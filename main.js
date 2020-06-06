var express = require("express");
var app = express();
var fetch = require("node-fetch");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.get("/atcoder", async function (req, res) {
  res.status(200);
  res.header({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  let result;
  await fetch(`https://atcoder.jp/users/${req.query.username}`)
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      const dom = new JSDOM(text);
      result = {
        rating: dom.window.document.querySelectorAll(".dl-table")[1].children[0]
          .children[1].children[1].children[0].innerHTML,
        ratingRank: dom.window.document.querySelectorAll(".dl-table")[1]
          .children[0].children[0].children[1].innerHTML,
        participatedRatedContests: dom.window.document.querySelectorAll(
          ".dl-table"
        )[1].children[0].children[3].children[1].innerHTML,
      };
    });
  res.json(result);
  res.end();
});

app.listen(process.env.PORT || 3000);

console.log("Server is listening");
