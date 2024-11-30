# Uzdev

## Installation

You can install the package via npm:

```bash
npm install uzdev
```

## Configuration

Add the following variables to your environment file (.env.development, .env.production, or .env):

```bash
# MySQL module

MYSQL_USERNAME=<your_mysql_username>
MYSQL_HOST=<your_mysql_host>
MYSQL_DATABASE=<your_mysql_database>
MYSQL_PASSWORD=<your_mysql_password>
MYSQL_WAIT=true # defaul
MYSQL_CONNECTION_LIMIT=10 # defaul
MYSQL_QUEUE_LIMIT=0 # defaul
MYSQL_MULTIPLE_STATEMENTS=true # defaul
MYSQL_CONNECT_TIMEOUT=60000 # defaul
MYSQL_DATE_STR=true # defaul

# Function module

JWT_KEY=<your_jwt_key>
JWT_EXPIRES_IN=10d # defaul

# Sender module

EMAIL_LOGIN=<your_email_login>
EMAIL_PASSWORD=<your_email_password>
FROM_EMAIL=<from_email_address>
SMS_ESKIZ_TOKEN=<your_eskiz_first_token>,
SMS_ESKIZ_EMIAL=<your_eskiz_email>,
SMS_ESKIZ_FROM=<your_eskiz_from_code>

# for logs to save on telegram bot
BOT_TOKEN=<bot token>
MAIN_CHAT=<chat id>
APP_NAME=<app name>


# File uploader
UPLOAD_SIZE=5120 #5mb
UPLOAD_ROOT=public/uploads/
UPLOAD_ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png

```

## Example

### MySQL Module

```javascript
const { execute } = require("uzdev/mysql");

(async () => {
    try {
        const result = await execute("select * from fact_users", [], 1);
        console.log(result);
    } catch (error) {
        console.error(error);
    }
})();
```

### Function Module

```javascript
const { enCode, deCode, randomCode } = require("uzdev/function");

(async () => {
    try {
        const encrypted = await enCode({ hello: "salom" });
        console.log(encrypted);
        console.log(deCode(encrypted));
    } catch (error) {
        console.error(error);
    }
})();

// example random code create
randomCode(5); // 37453;
```

### Sender Module

You will need to buy an SMS package from "eskiz.uz" and you will need to create a specific text template "eskiz.uz".

```javascript
const { emailSender, smsSender, botSender } = require("uzdev/sender");

(async () => {
    emailSender("balkibumen@gmail.com", "Test email", "<b> Hello bro <b>", (email, status, message) => {
        if (status == 1) return console.log("SUCCESS", email, message);
        console.log("ERROR", email, message);
    });

    smsSender("995441550", "Webdoc.io platformasi uchun tasdiqlash kodi: 12345", (phone, status, message) => {
        if (status == 1) return console.log("SUCCESS", phone, message);
        console.log("ERROR", phone, message);
    });

    botSender("this is error!");
})();
```

### DevOps

Can create a sequence of commands as desired
For example, to do git push and pull, you don't need to learn webhook or other additional tools.

```json
{
    "push": [
        {
            "name": "add",
            "command": "git add ."
        },
        {
            "name": "commit",
            "command": "git commit -m 'Update from $(whoami) on $(date +\"%Y-%m-%d %T\")'"
        },
        {
            "name": "push",
            "command": "git push"
        }
    ],
    "pull": [
        {
            "name": "pull",
            "command": "git pull"
        },
        {
            "name": "pm2 restart",
            "command": "pm2 restart all"
        }
    ]
}
```

```bash
# command example:
uzdev run push
uzdev run pull
```

### Joi

```javascript
const Joi = require("joi");
const { body, params, query } = require("uzdev/joi");

const YOUR_SCHEMA = Joi.object({
    name: Joi.string().min(5).max(200).required(),
    // more
});

app.put("/companies", body(YOUR_SCHEMA), YOUR_NEXT_ROUTER);
app.put("/companies", params(YOUR_SCHEMA), YOUR_NEXT_ROUTER);
app.put("/companies", query(YOUR_SCHEMA), YOUR_NEXT_ROUTER);
```

## File uploader

```javascript
// const filter =  /* this is for multer fileFilter */
const { fileUploader } = require("uzdev/uploader");

app.post("/user/upload", fileUploader("pdf"), YOUR_NEXT_ROUTER);
// or
app.post("/user/upload", fileUploader("pdf", filter), YOUR_NEXT_ROUTER);
```

## License

This README covers the installation, configuration, and usage of your npm package `uzdev`, including examples for each module. Adjust the placeholders with your actual credentials and customize it further if needed.
