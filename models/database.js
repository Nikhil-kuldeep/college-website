const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "..", "database.db");

const db = new Database(dbPath);

// USERS TABLE
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

// NOTES TABLE
db.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        filename TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


// ===============================
// CREATE / UPDATE ADMIN ACCOUNT
// ===============================

function setupAdmin() {

    const adminName = process.env.ADMIN_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Agar Render environment variables nahi hain,
    // to admin setup skip kar do.
    if (!adminName || !adminEmail || !adminPassword) {
        console.log("Admin environment variables not found. Skipping admin setup.");
        return;
    }

    try {

        const hashedPassword = bcrypt.hashSync(
            adminPassword,
            10
        );

        const existingUser = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(adminEmail);

        if (existingUser) {

            // Existing account ko admin bana do
            db.prepare(`
                UPDATE users
                SET
                    name = ?,
                    password = ?,
                    role = 'admin'
                WHERE email = ?
            `).run(
                adminName,
                hashedPassword,
                adminEmail
            );

            console.log("Admin account updated successfully!");

        } else {

            // New admin account create karo
            db.prepare(`
                INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, 'admin')
            `).run(
                adminName,
                adminEmail,
                hashedPassword
            );

            console.log("Admin account created successfully!");
        }

    } catch (error) {

        console.error(
            "Admin setup error:",
            error
        );
    }
}

setupAdmin();

console.log("SQLite database connected successfully!");

module.exports = db;