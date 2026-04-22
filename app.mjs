//gwn de imports + dirname
import fs from "fs"
import path from "path"
import http from "http"
import sqlite3 from "sqlite3"
import crypto from "crypto" //alleen nodig als we hashen
import { error } from "console" //das ier vanzelf gekomen en kheb schrik om da wegtedoen
import express from "express"
const __dirname = import.meta.dirname
//tokens opslaan, vo nu ist goe da we het zo doen, vinden wel andere manier later
const tokens = {}
//express goe zettn
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
//db opzetten
const db = new sqlite3.Database("testdb.db", (err) => {
    if (err) {
        console.error("Database error:", err)
        return
    }
    console.log("db connected")
})
//functies
//login functie die hashed, want zo en de wachtwoordinsen opgeslaan
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
                return res.end(JSON.stringify({ token, role }))
            }
        })

}
//server aanmaken
/*
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
})*/

//server doen luisteren op port
app.post("/login", (req, res) => {
    res.setHeader("Content-Type", "application/json")
        const { geboorteDatum } = req.body
        if (!geboorteDatum) {
            res.statusCode = 400
            return res.end(JSON.stringify({ message: "geboortedatum is verplicht" }))
        }
        login(geboorteDatum, res)
    
})

app.listen(PORT, () => {
    console.log(`Server op http://localhost:${PORT}`);
});