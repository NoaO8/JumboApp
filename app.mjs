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
app.get('/inlog', (req, res) => {
  const filePath = path.join(__dirname, 'public', "inlog.html");
  res.sendFile(filePath);
}); 
app.get('/medewerker', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'medewerker', "medewerker.html");
  res.sendFile(filePath);
});
//help vo token
const get_gebruiker_token = (token) => {
    return Object.keys(tokens).find(key => tokens[key] === token)
}
//moet nog iot scherm komen
app.get("/berichten", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)
    console.log(tokens)  

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    db.all(
        `SELECT messages.* FROM messages
         INNER JOIN user ON user.users_id = messages.receiver_id`,
        [],
        (err, rows) => {
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(rows))
        }
    )
})
app.get("/profiel", (req, res) => {
    res.setHeader("Content-Type", "application/json")

    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)
    console.log(tokens)  

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    db.all(
        `SELECT * FROM user
         WHERE birthdate = ?
         `,
        [geboorteDatum],
        (err, rows) => {
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.end(JSON.stringify(rows))
        }
    )
})
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
app.post("/profiel_wijziging_opslaan", (req, res) => {
    //database vullen me de info
     
})
app.listen(PORT, () => {
    console.log(`Server op http://localhost:${PORT}`);
});
