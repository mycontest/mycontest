const { botSender } = require("./bot");
const { emailSender } = require("./email");
const { smsSender } = require("./sms");

module.exports = {
    emailSender,
    smsSender,
    botSender,
};