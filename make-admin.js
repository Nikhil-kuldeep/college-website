const readline = require("readline");
const db = require("./models/database");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter existing user's email: ", (email) => {

    const user = db.prepare(
        "SELECT * FROM users WHERE email = ?"
    ).get(email);

    if (!user) {
        console.log("\nUser not found.");
        rl.close();
        return;
    }

    db.prepare(
        "UPDATE users SET role = 'admin' WHERE email = ?"
    ).run(email);

    console.log("\nExisting account is now ADMIN.");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role: admin");

    rl.close();
});