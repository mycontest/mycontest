const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('', input => {
    const [a, b] = input.split(' ').map(Number);
    console.log(a + b); 
});
