//gwn de imports + dirname
import fs from "fs"
import path from "path"
import http from "http"
import sqlite3 from "sqlite3"
const __dirname = import.meta.dirname
//db opzetten
const db = new sqlite3.Database("dbJumboPlanner.sqbpro", (err) => {
    if (err) {
        console.error("Database error:", err)
        return
    }
    console.log("db connected")
})
//server aanmaken
const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/beheerder") {
        const filePath = path.join(__dirname, "public", "leidinggevende", "beheerder.html")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "text/html")
            res.end(data)
        })
    } else if (req.method === "GET" && req.url === "/medewerker") {
        const filePath = path.join(__dirname, "public", "medewerker", "medewerker.html")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "text/html")
            res.end(data)
        })
    }else if (req.method === "GET" && req.url === "/medewerker_script.js") {
        const filePath = path.join(__dirname, "public", "medewerker", "medewerker_script.js")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "application/javascript")
            res.end(data)
        }) 
    }else if (req.method === "GET" && req.url === "/inlog") {
        const filePath = path.join(__dirname, "public", "inlog.html")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "text/html")
            res.end(data)
        }) 
    }else if (req.method === "GET" && req.url === "/inlog_script.js") {
        const filePath = path.join(__dirname, "public", "inlog_script.js")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "application/javascript")
            res.end(data)
        }) 
    }else {
        res.statusCode = 404
        res.setHeader("Content-Type", "text/plain")
        res.end("Not found")
    }
})
//server doen luisteren op port
const port = 3000
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})