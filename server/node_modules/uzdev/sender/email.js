const nodemailer = require("nodemailer");
const { EMAIL_LOGIN, EMAIL_PASSWORD, FROM_EMAIL } = process.env;

const emailSender = (to_email, subject, html, callback) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_LOGIN,
                pass: EMAIL_PASSWORD,
            },
        });

        const details = {
            from: FROM_EMAIL || EMAIL_LOGIN,
            to: to_email,
            subject,
            html,
        };

        transporter.sendMail(details, (err, info) => {
            if (err) {
                callback(to_email, 0, err.message);
            } else {
                callback(to_email, 1, `Email sent: ${info.response}`);
            }
        });
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", err.message); // Red color
    }
};

module.exports = {
    emailSender,
};
