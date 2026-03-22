//gwn de imports + dirname
import fs from "fs"
import path from "path"
import http from "http"
import sqlite3 from "sqlite3"
import crypto from "crypto"
import { error } from "console" //das ier vanzelf en kheb schrik om da wegtedoen
const __dirname = import.meta.dirname
//tokens opslaan, vo nu ist goe da we het zo doen, vinden wel andere manier later
const tokens = {}
//db opzetten
const db = new sqlite3.Database("testdb.db", (err) => {
    if (err) {
        console.error("Database error:", err)
        return
    }
    console.log("db connected")
})
//functies
//login functie die hashed, want zo en de wachtwoorden opgeslaan
const login = (username, password, res) => {
    console.log(username)
    const username_split = username.split(" ")
    const first_name = username_split[0]
    const last_name = username_split[1]
    console.log(username_split)
    db.get("SELECT * FROM users WHERE first_name = ? AND last_name = ?", [first_name, last_name], (err, user) => {
        console.log(user)
        if (err) {
            res.statusCode = 500
            return res.end(JSON.stringify({ message: "database fout", err: err.message }))
        }

        const incomingHash = crypto.createHash("sha256").update(password).digest("hex")

        if (user && incomingHash === user.wachtwoord) {
            let token = tokens[username]
            if (token === undefined) {
                tokens[username] = crypto.randomBytes(8).toString("hex")
                token = tokens[username]
            }
            res.statusCode = 200
            res.setHeader("Content-Type", "application/json")
            return res.end(JSON.stringify({ token }))
        } else {
            res.statusCode = 401
            res.setHeader("Content-Type", "application/json")
            return res.end(JSON.stringify({ message: "username of password fout" }))
        }
    }
    )
}
//json lezer om herhaling te vermijden, cb is gwn een callback
const readJsonBody = (req, res, cb) => {
    let body = ""
    req.on("data", chunk => body += chunk)
    req.on("end", () => {
        try {
            const data = JSON.parse(body || "{}")
            cb(null, data)
        } catch {
            res.statusCode = 400
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: "Invalid JSON" }))
        }
    })
}
//token checken, komt van een demo met meneer A. Kindt
const getUsernameFromAuthHeader = (req) => {
    const header = req.headers["authorization"]
    if (!header) return null

    const [scheme, token] = header.split(" ")
    if (scheme !== "Bearer" || !token) return null

    for (const username of Object.keys(tokens)) {
        if (tokens[username] === token) return username
    }
    return null
}
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
    } else if (req.method === "GET" && req.url === "/medewerker_script.js") {
        const filePath = path.join(__dirname, "public", "medewerker", "medewerker_script.js")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "application/javascript")
            res.end(data)
        })
    } else if (req.method === "GET" && req.url === "/inlog") {
        const filePath = path.join(__dirname, "public", "inlog.html")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "text/html")
            res.end(data)
        })
    } else if (req.method === "GET" && req.url === "/inlog_script.js") {
        const filePath = path.join(__dirname, "public", "inlog_script.js")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "application/javascript")
            res.end(data)
        })
    } else if (req.method === "POST" && req.url === "/login") {
        res.setHeader("Content-Type", "application/json")
        return readJsonBody(req, res, (err, data) => {
            const { username, password } = data
            if (!username || !password) {
                res.statusCode = 400
                return res.end(JSON.stringify({ message: "username en password verplicht" }))
            }
            login(username, password, res)
        })
    } else {
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