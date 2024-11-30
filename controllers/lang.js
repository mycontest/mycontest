const { execute } = require("uzdev/mysql");

exports.langType = async (code) => {
   try {
      return (await execute("SELECT * FROM lang WHERE code = ?", [code], 1)).file_type;
   } catch (err) {
      return "cpp";
   }
};