const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question("", input1 => {
    readline.question("", input2 => {
        const a = parseInt(input1);
        const b = parseInt(input2);
        process.stdout.write((b - a + 1).toString());
        readline.close();
    });
});
