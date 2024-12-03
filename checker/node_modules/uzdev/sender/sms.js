const fs = require("fs");
const path = require("path");

const { SMS_ESKIZ_FROM, SMS_ESKIZ_TOKEN, SMS_ESKIZ_EMIAL } = process.env;

const smsToken = async () => {
    try {
        const res = await fetch("http://notify.eskiz.uz/api/auth/login", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                email: SMS_ESKIZ_EMIAL,
                password: SMS_ESKIZ_TOKEN,
            }),
        });

        if (!res.ok) {
            throw new Error(`Message: ${res.status}, Details: ${await res.text()}, ErrorCode: CronJobs`);
        }

        const { token } = (await res.json()).data;

        fs.writeFileSync(path.join(__dirname, "./eskiz_token.txt"), token, { encoding: "utf-8" });
    } catch (err) {
        console.error("\x1b[31m%s\x1b[0m", err.message);
    }
};

const smsSender = async (
    phone,
    text,
    callback = () => {
        console.log("not found callback!");
    },
    step = 0
) => {
    try {
        if (!text || !phone) {
            return callback(phone, 0, "sms text or phone number is wrong!");
        }

        let token;
        try {
            token = fs.readFileSync(path.join(__dirname, "./eskiz_token.txt"), { encoding: "utf-8" });
        } catch (err) {
            console.error("\x1b[31m%s\x1b[0m", err.message);
        }

        const res = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
            },
            body: new URLSearchParams({
                mobile_phone: `998${phone}`,
                message: text,
                from: SMS_ESKIZ_FROM,
            }),
        });

        if (res.status === 401 && step === 0) {
            await smsToken();
            return await smsSender(phone, text, callback, 1);
        }

        if (!res.ok) {
            return callback(phone, 0, `Error status code: ${res.status}`);
        }
        return callback(phone, 1, "Ok");
    } catch (err) {
        return callback(phone, 0, err.message);
    }
};

module.exports = { smsSender };
