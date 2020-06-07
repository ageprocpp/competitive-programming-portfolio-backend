var express = require("express")
var app = express()
var fetch = require("node-fetch")
var jsdom = require("jsdom")
const { JSDOM } = jsdom

app.get("/atcoder", async function (req, res) {
    res.header({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    })
    let result
    let responseSended = false
    await fetch(`https://atcoder.jp/users/${req.query.username}`)
        .then(response => {
            if (!response.ok) {
                res.status(404)
                res.end()
                responseSended = true
            }
            return response.text()
        })
        .then(text => {
            if (
                text.match(/This user has not competed in a rated contest yet./)
            ) {
                result = {
                    rating: 0,
                    ratingRank: "",
                    participatedRatedContests: 0,
                }
            } else {
                const dom = new JSDOM(text)
                result = {
                    ...result,
                    rating: dom.window.document.querySelectorAll(".dl-table")[1]
                        .children[0].children[1].children[1].children[0]
                        .innerHTML,
                    ratingRank: dom.window.document.querySelectorAll(
                        ".dl-table"
                    )[1].children[0].children[0].children[1].innerHTML,
                    participatedRatedContests: dom.window.document.querySelectorAll(
                        ".dl-table"
                    )[1].children[0].children[3].children[1].innerHTML,
                }
            }
        })
        .catch(err => console.error(err))
    await fetch(`https://atcoder.jp/users/${req.query.username}/history`)
        .then(response => {
            if (!response.ok) {
                res.status(404)
                res.end()
                responseSended = true
            }
            return response.text()
        })
        .then(text => {
            if (text.match(/This user has not competed yet./)) {
                result = {
                    ...result,
                    participatedContests: 0,
                }
            } else {
                const dom = new JSDOM(text)
                result = {
                    ...result,
                    participatedContests:
                        dom.window.document.querySelectorAll(".text-center")
                            .length - 7,
                }
            }
        })
        .catch(err => console.error(err))
    if (!responseSended) {
        res.json(result)
        res.end()
    }
})

app.listen(process.env.PORT || 3000)

console.log("Server is listening")
