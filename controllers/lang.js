const { execute } = require("uzdev/mysql")

let langType = async (code) => {
   try {
      return (await execute("SELECT * FROM lang WHERE code = ?", [code]))[0].type || 'cpp'
   } catch {
      return 'cpp'
   }
}

let langTypeWithName = async (name) => {
   try {
      return (await execute("SELECT * FROM lang WHERE name = ?", [name]))[0].type || 'cpp'
   } catch {
      return 'cpp'
   }
}

let langName = async (code) => {
   try {
      return (await execute("SELECT *FROM lang WHERE code = ?", [code]))[0].name || '-'
   } catch {
      return '-'
   }
}

let langAll = async (n) => {
   try {
      return (await execute("SELECT * FROM lang WHERE n = ?", [n]))
   } catch {
      return [{ name: 'cpp' }]
   }
}

let langIs = async (n, code) => {
   try {
      return (await execute("SELECT *FROM lang WHERE n = ? and code = ?", [n, code])).length > 0
   } catch {
      return 0
   }
}

module.exports = { langAll, langName, langType, langTypeWithName, langIs }