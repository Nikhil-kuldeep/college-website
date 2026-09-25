require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

// Database
const db = require("./models/database");

// Routes
const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");

const app = express();

const PORT = process.env.PORT || 3000;

// ===============================
// CORS
// ===============================

// IMPORTANT:
// Vercel par frontend deploy hone ke baad
// yahan Vercel ka URL add karna hai.
//
// Abhi "*" temporary rakha hai
// taaki connection test ho sake.

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


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
        secret: process.env.SESSION_SECRET || "college-notes-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 24,

            // Vercel → Render HTTPS connection
            secure: true,

            // Cross-site requests ke liye
            sameSite: "none"
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


// ===============================
// TEST ROUTE
// ===============================

app.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "SERVER TEST WORKING"
    });

});


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.send(
        "College Notes Website Backend is running!"
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