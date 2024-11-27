let testing = async (task_id, lang, aid, code, codetask, ctime, cmemory) => {

   const { query } = require('../database/db.fun');

   let errorRuntime = async (data) => {
      console.log(data)
      errorWrite(data);
      await query("UPDATE attempts SET event='Runtime error',eventnum=2 WHERE id=?", [aid])
   }

   let errorCompiler = async (data) => {
      errorWrite(data);
      await query("UPDATE attempts SET event='Compiler error',eventnum=2 WHERE id=?", [aid])
   }

   let errorWrite = async (err) => {
      try {
         const fs = require("fs");
         const path = require("path");
         let folder = aid + "v"
         await fs.mkdirSync(path.join(__dirname, `../../compiler/tmp/${folder}`), { recursive: true })
         await fs.writeFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/err.txt`), JSON.stringify(err).toString());
      } catch {
         console.log("Hi error i have ")
      }

   }

   try {
      const { langType } = require('./lang');
      const { cppCompiler, cppRun } = require('../../compiler/cpp');
      const { javaCompiler, javaRun } = require('../../compiler/java');
      const { monoCompiler, monoRun } = require('../../compiler/mono');
      const python = require('../../compiler/python');
      const go = require('../../compiler/go');
      const js = require('../../compiler/node');
      const sql = require('../../compiler/mysql');

      const fs = require("fs");
      const path = require("path");
      const end = (await query("SELECT * FROM v_tasks WHERE id=?", [task_id]))[0].all_test

      let folder = aid + "v"
      await fs.mkdirSync(path.join(__dirname, `../../compiler/tmp/${folder}`), { recursive: true })
      await fs.writeFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/Main.${await langType(lang)}`), code)

      console.log(folder)

      let checkTest = async (data, i) => {
         try {
            let ocur = fs.readFileSync(path.join(__dirname, `../../testcase/${codetask}/output${i}.txt`), { encoding: "utf8" })
            let oout = fs.readFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/output.txt`), { encoding: "utf8" })
            if (data.error) errorWrite(data);
            if (data.error)
               return await query("UPDATE attempts SET event=?,time=InlineMaxFun(time,?),memory=InlineMaxFun(memory,?),eventnum=2 WHERE id=?", [data.message, data.time, data.memory, aid])
            if (await trimdata(ocur) != await trimdata(oout))
               return await query("UPDATE attempts SET event=?,time=InlineMaxFun(time,?),memory=InlineMaxFun(memory,?),eventnum=2 WHERE id=?", ["Wrong answer #" + (i + 1), data.time, data.memory, aid])
            await query("UPDATE attempts SET event=?,time=InlineMaxFun(time,?),memory=InlineMaxFun(memory,?),eventnum=0 WHERE id=?", ["Test #" + (i + 1), data.time, data.memory, aid])
            return await runNumTest(i + 1);
         } catch {
            console.log("Error check run")
            return errorRuntime();
         }
      }

      let checkTestSQL = async (data, i) => {
         errorWrite(data.errMsg);
         if (data.err)
            return await query("UPDATE attempts SET event=?,time=10,memory=10,eventnum=2 WHERE id=?", ["Wrong answer test", aid])
         return await query("UPDATE attempts SET event=?,time=10,memory=10,eventnum=1 WHERE id=?", ["Accepted test", aid])
      }

      let runNumTest = async (i) => {
         try {
            if (i == end)
               return await query("UPDATE attempts SET event=?,eventnum=1 WHERE id=?", ["Accepted", aid])

            console.log(lang)

            try {
               if (lang != 'text/x-mysql')
                  await fs.copyFileSync(path.join(__dirname, `../../testcase/${codetask}/input${i}.txt`),
                     path.join(__dirname, `../../compiler/tmp/${folder}/input.txt`))
            } catch {
               console.log("File not found!")
            }

            if (lang == 'text/x-mysql') {
               let config = require(path.join(__dirname, `../../testcase/${codetask}/configdb.json`))
               let sqlMeCode = fs.readFileSync(path.join(__dirname, `../../testcase/${codetask}/sqlMeCode.txt`), { encoding: "utf8" })
               await sql(code, sqlMeCode, config, ctime, cmemory, (data) => {
                  checkTestSQL(data, i)
               });
            }

            if (lang == 'text/x-c++src') {
               if (i == 0) {
                  await cppRun(folder, async (data) => {
                     //console.log(data)
                     if (data.error) return errorCompiler(data);
                     await cppCompiler(folder, ctime, cmemory, (data) => {
                        checkTest(data, i)
                     });
                  });
               }
               else {
                  await cppCompiler(folder, ctime, cmemory, (data) => {
                     checkTest(data, i)
                  });
               }
            }

            if (lang == 'text/x-python') await python(folder, ctime, cmemory, (data) => {
               checkTest(data, i)
            });

            if (lang == 'text/x-java') {
               if (i == 0) {
                  await javaRun(folder, async (data) => {
                     // console.log(data)
                     if (data.error) return errorCompiler(data);
                     await javaCompiler(folder, ctime, cmemory, (data) => {
                        checkTest(data, i)
                     });
                  });
               }
               else {
                  await javaCompiler(folder, ctime, cmemory, (data) => {
                     checkTest(data, i)
                  });
               }
            }

            if (lang == 'text/x-go') await go(folder, ctime, cmemory, (data) => {
               checkTest(data, i)
            });

            if (lang == 'text/javascript') await js(folder, ctime, cmemory, (data) => {
               checkTest(data, i)
            });

            if (lang == 'text/x-csharp') {
               if (i == 0) {
                  await monoRun(folder, async (data) => {
                     // console.log(data)
                     if (data.error) return errorCompiler(data);
                     await monoCompiler(folder, ctime, cmemory, (data) => {
                        checkTest(data, i)
                     });
                  });
               } else {
                  await monoCompiler(folder, ctime, cmemory, (data) => {
                     checkTest(data, i)
                  });
               }
            }

         } catch (e) {
            console.log(e)
            return errorRuntime("Case Error")
         }
      }

      await runNumTest(0);

   } catch (e) {
      return errorRuntime("Error all run");
   }

   let trimdata = async (s) => {
      try {
         while (s.length > 0 && (s[s.length - 1] == '\n' || s[s.length - 1] == '\r' || s[s.length - 1] == ' ')) {
            s = s.substring(0, s.length - 1);
         }
         return s.replace(/\r/g, "");;
      } catch {
         return errorRuntime("Error trim run");
      }
   }
}

module.exports = testing