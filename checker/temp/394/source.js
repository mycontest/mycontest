process.stdin.on("data", (data) => {
    const a = parseInt(data.toString().trim(), 10);

    if (a % 4 === 0) {
        console.log(a / 2);
    } else {
        console.log(-1);
    }
});
