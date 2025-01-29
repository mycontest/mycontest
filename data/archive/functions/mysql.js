let mysql = async (code, sqlMeCode, config, ctime, cmemory, callback) => {
    const db = require("../app/database/cdb")(config).promise()
    try {

        //   let compare = await db.query('SELECT * FROM (' + sqlMeCode + ') as T UNION SELECT * FROM ( ' + code + ") as B");
        let meAns = await db.query(sqlMeCode.toLowerCase());
        let youAns = await db.query(code.toLowerCase());
        let msg = `{me: ${JSON.stringify(meAns[0]).toString()} , you: ${JSON.stringify(youAns[0]).toString()} }`;

        if (JSON.stringify(meAns[0]) != JSON.stringify(youAns[0]))
            return callback({ err: 1, errMsg: msg })

        return callback({ err: 0, errMsg: msg })

    } catch (e) {
        return callback({ err: 1, errMsg: e })
    }
}

module.exports = mysql


