gmail = (to, subject, message) => {
    const nodemailer = require("nodemailer")

    let smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "otkir8311@gmail.com",
            pass: "a7054827"
        }
    });

    let mailOptions = {
        from: "admin@mycontest.uz",
        to: to,
        subject: subject + " " + new Date(),
        text: message
    }

    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Ok good send sms")
        }
    });

}


module.exports = gmail 