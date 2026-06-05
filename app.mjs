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
/*SELECT messages.* FROM messages
         INNER JOIN user ON user.users_id = messages.receiver_id OR user.users_id = messages.sender_id
         WHERE user.first_name = ? AND user.last_name = ?
        ORDER BY messages.sent_at ASC*/
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
        `SELECT *, user.users_id as user_id FROM user
        INNER JOIN planner_user
        ON user.users_id = planner_user.user_id
        WHERE birthdate = ?`
        ,
        [geboorteDatum],
        (err, user) => {
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }

            if (user && geboorteDatum === user.birthdate) {
                console.log(user)
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
                return res.end(JSON.stringify({ token, role, user_id: user.users_id }))
            }
            res.statusCode = 401
            return res.end(JSON.stringify({ message: "ongeldige geboortedatum" }))
        })

}
const post_in_database = (body) => {
    //posten naar db als noa et afmaakt
}
app.get('/inlog', (req, res) => {
    const filePath = path.join(__dirname, 'public', "inlog.html");
    res.sendFile(filePath);
});
app.get('/medewerker', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'medewerker', "medewerker.html");
    res.sendFile(filePath);
});
app.get("/user_info", (req,res) => {
    db.all(
        `SELECT * FROM user`,
        (err,rows) => {
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(rows))
        }
    )
})
//help vo token
const get_gebruiker_token = (token) => {
    return Object.keys(tokens).find(key => tokens[key] === token)
}
//moet nog iot scherm komen
app.get("/berichten", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    db.all(
        `SELECT messages.* FROM messages
         INNER JOIN user ON user.users_id = messages.receiver_id OR user.users_id = messages.sender_id
         WHERE user.birthdate = ?
        ORDER BY messages.sent_at ASC`,
        [geboorteDatum],
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
            console.log("profiel rows:", rows)
            if (err) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.end(JSON.stringify(rows))
        }
    )
})
app.get("/shifts", (req, res) => {
    res.setHeader("Content-Type", "application/json")

    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    db.all(
        `SELECT planner.* FROM planner
         INNER JOIN planner_user ON planner.planner_id = planner_user.planner_id
         INNER JOIN user ON user.users_id = planner_user.user_id
         WHERE user.birthdate = ?
         ORDER BY planner.start_dateTime ASC`,
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
app.get("/availability", (req, res) => {
    res.setHeader("Content-Type", "application/json")
    console.log(req.headers)
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }
    const role = req.headers["role"]
    if(role === "medewerker"){
        db.all(
            `SELECT availability.* FROM availability
             INNER JOIN user ON user.users_id = availability.user_id
             WHERE user.birthdate = ?
             ORDER BY availability.start_dateTime ASC`,
            [geboorteDatum],
            (err, rows) => {
                if (err) {
                    res.statusCode = 500
                    return res.end(JSON.stringify({ message: "database fout" }))
                }
                res.end(JSON.stringify(rows))
            }
        )
    }else{
        db.all(
            `SELECT availability.* FROM availability
             INNER JOIN user ON user.users_id = availability.user_id
             ORDER BY availability.start_dateTime ASC`,
            (err, rows) => {
                if (err) {
                    res.statusCode = 500
                    return res.end(JSON.stringify({ message: "database fout" }))
                }
                res.end(JSON.stringify(rows))
            }
        )
    }

    
})
app.post("/bericht_sturen", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    const { content } = req.body

    if (!content || content.trim() === "") {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "bericht mag niet leeg zijn" }))
    }

    db.get(
        `SELECT users_id FROM user WHERE birthdate = ? `,
        [geboorteDatum],
        (err, user) => {
            if (err || !user) {
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "gebruiker niet gevonden" }))
            }

            // receiver_id = 1 is de baas, pas aan indien nodig
            db.run(
                `INSERT INTO messages(sender_id, receiver_id, content, sent_at, is_read)
                 VALUES(?, 1, ?, datetime('now'), 0)`,
                [user.users_id, content],
                (err) => {
                    if (err) {
                        res.statusCode = 500
                        return res.end(JSON.stringify({ message: "database fout" }))
                    }
                    res.setHeader("Content-Type", "application/json")
                    res.end(JSON.stringify({ message: "bericht verstuurd" }))
                }
            )
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
    const { user_id, gekozen_shifts } = req.body

    if (!user_id || !gekozen_shifts || gekozen_shifts.length === 0) {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "ongeldige data" }))
    }

    const stmt = db.prepare(
        'INSERT INTO availability (user_id, start_dateTime, end_dateTime) VALUES (?, ?, ?)'
    )

    gekozen_shifts.forEach(shift => {
        stmt.run(user_id, shift.start, shift.eind, (err) => {
            if (err) console.error('Insert error:', err)
        })
    })

    stmt.finalize()
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ message: "beschikbaarheid opgeslagen" }))
})
app.post("/profiel_wijziging_opslaan", (req, res) => {
    const { user_id, aangepaste_info } = req.body

    if (!user_id || !aangepaste_info || aangepaste_info.length === 0) {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "ongeldige data" }))
    }

    const kolommen = {
        naam: null, // naam is speciaal, die splitsen we
        email: "email",
        telefoon: "telefoonnummer"
    }

    aangepaste_info.forEach(({ veld, waarde }) => {
        if (veld === "naam") {
            const delen = waarde.split(" ")
            const first_name = delen[0]
            const last_name = delen.slice(1).join(" ")

            db.run(
                `UPDATE user SET first_name = ?, last_name = ? WHERE users_id = ?`,
                [first_name, last_name, user_id],
                (err) => { if (err) console.error('Update error:', err) }
            )
        } else {
            const kolom = kolommen[veld]
            if (!kolom) return

            db.run(
                `UPDATE user SET ${kolom} = ? WHERE users_id = ?`,
                [waarde, user_id],
                (err) => { if (err) console.error('Update error:', err) }
            )
        }
    })

    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ message: "profiel bijgewerkt" }))
})
// Shift accepteren (availability → planner)
app.post("/shifts", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    const {start, einde, rol } = req.body

    if (!user_id || !start || !einde) {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "ongeldige data" }))
    }

    db.run(
        `INSERT INTO planner (start_dateTime, end_dateTime, description) VALUES (?, ?, ?)`,
        [start, einde, rol],
        function (err) {
            if (err) {
                console.error(err)
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ planner_id: this.lastID }))
        }
    )
})
// Nieuw lid toevoegen
app.post("/users", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    const { first_name, last_name, email, telefoonnummer, birthdate } = req.body

    if (!first_name || !last_name || !birthdate) {
        res.statusCode = 400
        return res.end(JSON.stringify({ message: "voornaam, achternaam en geboortedatum zijn verplicht" }))
    }

    db.run(
        `INSERT INTO user (first_name, last_name, email, telefoonnummer, birthdate) VALUES (?, ?, ?, ?, ?)`,
        [first_name, last_name, email ?? null, telefoonnummer ?? null, birthdate],
        function (err) {
            if (err) {
                console.error(err)
                res.statusCode = 500
                return res.end(JSON.stringify({ message: "database fout" }))
            }
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ users_id: this.lastID }))
        }
    )
})
// Alle leden ophalen
app.get("/users", (req, res) => {
    const token = req.headers['authorization']
    const geboorteDatum = get_gebruiker_token(token)

    if (!geboorteDatum) {
        res.statusCode = 401
        return res.end(JSON.stringify({ message: "niet ingelogd" }))
    }

    db.all(
        `SELECT users_id, first_name, last_name, email, telefoonnummer, birthdate FROM user`,
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
app.listen(PORT, () => {
    console.log(`Server op http://localhost:${PORT}`);
});
