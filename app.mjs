//gwn de imports + dirname
import fs from "fs"
import path from "path"
import http from "http"
import sqlite3 from "sqlite3"
import crypto from "crypto" //alleen nodig als we hashen
import { error } from "console" //das ier vanzelf gekomen en kheb schrik om da wegtedoen
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
const login = (geboorteDatum, res) => {
    db.get(
        `SELECT * FROM user
         INNER JOIN planner_user
         ON user.users_id = planner_user.user_id
         WHERE birthdate = ?
         `,
        [geboorteDatum],
        (err, user) => {
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
        
    if (user && geboorteDatum === user.birthdate) {
        console.log(geboorteDatum)
        console.log(user.birthdate)
        // token maken of hergebruiken
        let token = tokens[geboorteDatum]
        if (token === undefined) {
            tokens[geboorteDatum] = crypto.randomBytes(8).toString("hex")
            token = tokens[geboorteDatum]
        }
        console.log(user.role)
        const role = user.role
        res.statusCode = 200
        res.setHeader("Content-Type", "application/json")
        return res.end(JSON.stringify({ token , role}))
    }
    })

}
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
const getUsernameFromAuthHeader = (req) => {
    const header = req.headers["authorization"]
    if (!header) return null

    // verwacht: "Bearer abc123"
    const [scheme, token] = header.split(" ")
    if (scheme !== "Bearer" || !token) return null

    // token → username (zoeken in tokens object)
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
            const { geboorteDatum } = data
            if (!geboorteDatum) {
                res.statusCode = 400
                return res.end(JSON.stringify({ message: "geboortedatum is verplicht" }))
            }
            login(geboorteDatum, res)
        })

    } else if (req.method === "GET" && req.url === "/leidinggevende"){
const filePath = path.join(__dirname, "public", "leidinggevende", "beheerder.html")
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500
                return res.end("Error loading page")
            }
            res.setHeader("Content-Type", "text/html")
            res.end(data)
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