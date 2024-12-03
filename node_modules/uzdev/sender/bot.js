let botSender = async (message) => {
    try {
        const msg = `#### NEW LINE ####\nApp name: ${process.env.APP_NAME}\nDetails: ${JSON.stringify(message)}\n\nTime: ${new Date()}`;
        const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${process.env.MAIN_CHAT}&text=${encodeURIComponent(msg)}`;

        const response = await fetch(url, { method: "GET", timeout: 5000 });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", err.message);
    }
};

module.exports = {
    botSender,
};
