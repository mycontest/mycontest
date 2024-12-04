process.stdin.on("data", (data) => {
    const input = data.toString().trim(); // Ensure input is clean
    const n = BigInt(input); // Convert the input string to BigInt
    const result = ((n + 1n) * n) / 2n; // Calculate the sum of the first n natural numbers
    console.log(result.toString()); // Convert BigInt to string for output
});