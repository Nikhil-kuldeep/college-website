const bcrypt = require("bcryptjs");
const readline = require("readline");
const db = require("./models/database");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function createAdmin() {

    console.log("\n=== Create Admin Account ===\n");

    const name = await askQuestion("Admin Name: ");
    const email = await askQuestion("Admin Email: ");
    const password = await askQuestion("Admin Password: ");

    if (!name || !email || !password) {
        console.log("\nAll fields are required.");
        rl.close();
        return;
    }

    if (password.length < 6) {
        console.log("\nPassword must be at least 6 characters.");
        rl.close();
        return;
    }

    const existingUser = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (existingUser) {
        console.log("\nThis email is already registered.");
        rl.close();
        return;
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    db.prepare(`
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, 'admin')
    `).run(
        name,
        email,
        hashedPassword
    );

    console.log("\nAdmin account created successfully!");
    console.log("Role: admin");

    rl.close();
}

createAdmin();