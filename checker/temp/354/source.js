const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

const [a, b] = data.split(' ').map(item => parseInt(item));
fs.writeFileSync('output.txt', `${a+b}`, 'utf8');