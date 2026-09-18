require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

// Database
const db = require("./models/database");

// Routes
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();

const PORT = process.env.PORT || 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ===============================
// SESSION
// ===============================

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);


// ===============================
// STATIC FILES
// ===============================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ===============================
// API ROUTES
// ===============================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/notes",
    notesRoutes
);
app.get("/test", (req, res) => {
    res.send("SERVER TEST WORKING");
});

// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.send(
        "College Notes Website is running!"
    );

});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});