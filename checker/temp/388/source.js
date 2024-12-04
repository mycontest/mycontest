process.stdin.on("data", (data) => {
    const [a, b] = data.toString().trim().split(" ").map(Number);
    process.stdout.write((b - a + 1).toString());
});
