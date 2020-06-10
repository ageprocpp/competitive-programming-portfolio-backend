var express = require("express")
var app = express()
var fetch = require("node-fetch")
var jsdom = require("jsdom")
const { JSDOM } = jsdom

app.use(function(req, res, next){
	console.log(req.originalUrl)
	next()
})

app.get("/atcoder", async function (req, res) {
	console.log(req.originalUrl)
	res.header({
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	})
	let result
	let responseSended = false
	await fetch(`https://atcoder.jp/users/${req.query.username}`)
		.then(response => {
			if (!response.ok)throw new Error("Not Found")
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
		.catch(err => {
			console.error(err)
			res.status(404)
			res.end()
			responseSended = true
		})
	if(responseSended)return
	await fetch(`https://atcoder.jp/users/${req.query.username}/history`)
		.then(response => {
			if (!response.ok)throw new Error("Not Found")
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
		.catch(err => {
			console.error(err)
			res.status(404)
			res.end()
			responseSended = true
		})
	if(responseSended)return
	res.json(result)
	res.end()
})

app.get("/codeforces", async function(req, res){
	res.header({
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	})
	let result
	let responseSended = false
	await fetch(`https://codeforces.com/api/user.info?lang=en&handles=${req.query.username}`)
		.then(response => {
			if(!response.ok)throw new Error("Not Found")
			return response.json()
		})
		.then(responseJson => {
			result = {
				...result,
				rating: responseJson.result[0].rating,
				rank: responseJson.result[0].rank,
				contribution: responseJson.result[0].contribution,
				friendOfCount: responseJson.result[0].friendOfCount
			}
		})
		.catch(err => {
			console.log(err)
			res.status(404)
			res.end()
			responseSended = true
		})
	if(responseSended)return
	res.json(result)
	res.end()
})

app.listen(process.env.PORT || 3000)

console.log("Server is listening")
