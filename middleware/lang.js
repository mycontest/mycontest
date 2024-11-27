const { query } = require('../database/db.fun');

let langType = async (code) => {
   try {
      return (await query("SELECT *FROM lang WHERE code=? ", [code]))[0].type || 'cpp'
   } catch {
      return 'cpp'
   }
}

let langTypeWithName = async (name) => {
   try {
      return (await query("SELECT *FROM lang WHERE name=?", [name]))[0].type || 'cpp'
   } catch {
      return 'cpp'
   }
}

let langName = async (code) => {
   try {
      return (await query("SELECT *FROM lang WHERE code=?", [code]))[0].name || 'Not'
   } catch {
      return 'Not'
   }
}

let langAll = async (n) => {
   if (!n) n = 0;
   try {
      return (await query("SELECT *FROM lang WHERE n=?", [n]))
   } catch {
      return 'cpp'
   }
}

let langIs = async (n, code) => {
   try {
      return (await query("SELECT *FROM lang WHERE n = ? and code = ?", [n, code])).length > 0
   } catch {
      return 1
   }
}

module.exports = { langAll, langName, langType, langTypeWithName, langIs }