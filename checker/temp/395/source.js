// Node.js dasturi
const readline = require("readline");

// O'qish interfeysini yaratish
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Kirish ma'lumotlarini o'qish
rl.question("", (N) => {
    // Tekshirish: agar 1 raqamidan keyin 3 raqami bo'lsa, omadsiz hisoblanadi
    if (N.includes("13")) {
        console.log("omadsiz chipta");
    } else {
        console.log("omadli chipta");
    }
    rl.close(); // O'qish interfeysini yopish
});