const { execute } = require("uzdev/mysql");

exports.langType = async (code) => {
   try {
      return (await execute("SELECT * FROM lang WHERE code = ?", [code], 1)).file_type;
   } catch (err) {
      return "cpp";
   }
};

exports.langName = async (code) => {
   try {
      return (await execute("SELECT *FROM lang WHERE code = ?", [code], 1)).name || "-";
   } catch (err) {
      return "-";
   }
};

exports.langAll = async (type) => {
   try {
      return await execute("SELECT * FROM lang WHERE contest_type = ?", [type]);
   } catch (err) {
      return "cpp";
   }
};

exports.langIs = async (type, code) => {
   try {
      return (await execute("SELECT * FROM lang WHERE contest_type = ? and code = ?", [type, code])).length > 0;
   } catch (err) {
      return 0;
   }
};
