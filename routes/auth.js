const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../models/database");

// ================= REGISTER =================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check empty fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing email
        const existingUser = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Password encrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student account
        db.prepare(`
            INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, 'student')
        `).run(
            name,
            email,
            hashedPassword
        );

        res.json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ================= LOGIN =================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({
            success: true,
            user: req.session.user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ================= CURRENT USER =================

router.get("/me", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    res.json({
        user: req.session.user
    });
});


// ================= LOGOUT =================

router.post("/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true,
            message: "Logged out"
        });

    });
});


module.exports = router;