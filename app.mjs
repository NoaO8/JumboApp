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
            } else {
                res.statusCode = 401
                return res.end(JSON.stringify({ message: "ongeldige geboortedatum" }))
            }
        })

}

app.post("/login", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    const { geboorteDatum } = req.body
    if (!geboorteDatum) {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "geboortedatum is verplicht" }))
    }
    login(geboorteDatum, res)

})
app.post("/beschikbaarheid_opslaan", (req, res) => {
    console.log(req.body)
})

app.listen(PORT, () => {
    console.log(`Server op http://localhost:${PORT}`);
});