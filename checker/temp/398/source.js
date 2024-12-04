process.stdin.on("data", (data) => {
    const n = BigInt(data.toString().trim());
    console.log((n + 1n) * n / 2n); // Use BigInt for handling large numbers
});
