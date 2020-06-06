var express = require("express");
var app = express();
var fetch = require("node-fetch");
var jsdom = require("jsdom");
const { JSDOM } = jsdom;

app.get("/atcoder", async function (req, res) {
  res.status(200);
  res.header({ "Content-Type": "application/json" });
  let result;
  await fetch(`https://atcoder.jp/users/define`)
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      const dom = new JSDOM(text);
      result = {
        rating: dom.window.document.querySelectorAll(".dl-table")[1].children[0]
          .children[1].children[1].children[0].innerHTML,
      };
    });
  res.json(result);
  res.end();
});

app.listen(env.process.PORT || 3000);

console.log("Server is listening");
