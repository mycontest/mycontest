process.stdin.on("data", (data) => {
    const n = BigInt(data.toString());
    console.log( ((1n + a) * a) / 2n ); 
});