const { execute } = require('uzdev/mysql');

exports.testing = async (task_id, lang, attempt_id, code, ctime, cmemory) => {
   let errorRuntime = async (data) => {
      console.log(`Error message #8: ${JSON.stringify(data)}`)
      errorWrite(data);
      await execute("UPDATE attempts SET event='Runtime error',event_num=2 WHERE id=?", [attempt_id])
   }

   let errorCompiler = async (data) => {
      console.log(`Error message #7: ${JSON.stringify(data)}`)
      errorWrite(data);
      await execute("UPDATE attempts SET event='Compiler error', event_num=2 WHERE id=?", [attempt_id])
   }

   let errorWrite = async (err) => {
      try {
         const fs = require("fs");
         const path = require("path");
         let folder = attempt_id + "v"
         fs.mkdirSync(path.join(__dirname, `../compiler/tmp/${folder}`), { recursive: true })
         fs.writeFileSync(path.join(__dirname, `../compiler/tmp/${folder}`, 'err.txt'), JSON.stringify(err).toString());
      } catch (err) {
         console.log(`Error message #6: ${err.message}`)
      }
   }

   try {
      const { langType } = require('../server/controllers/lang');
      const { cppCompiler, cppRun } = require('../functions/cpp');
      const { javaCompiler, javaRun } = require('../functions/java');
      const { monoCompiler, monoRun } = require('../functions/mono');
      const python = require('../functions/python');
      const go = require('../functions/go');
      const js = require('../functions/node');
      const sql = require('../functions/mysql');

      const fs = require("fs");
      const path = require("path");
      const end = (await execute("SELECT * FROM vw_tasks WHERE task_id = ?", [task_id], 1)).all_test

      let folder = attempt_id + "v"
      fs.mkdirSync(path.join(__dirname, `../compiler/tmp/${folder}`), { recursive: true })
      fs.writeFileSync(path.join(__dirname, `../compiler/tmp/${folder}/Main.${await langType(lang)}`), code)

      let checkTest = async (data, i) => {
         try {
            let ocur = fs.readFileSync(path.join(__dirname, `../testcase/${task_id}/output${i}.txt`), { encoding: "utf8" })
            let oout = fs.readFileSync(path.join(__dirname, `../compiler/tmp/${folder}/output.txt`), { encoding: "utf8" })
            if (data.error) errorWrite(data);
            if (data.error) return await execute("UPDATE attempts SET event=?, time=InlineMaxFun(time,?), memory=InlineMaxFun(memory,?), event_num=2 WHERE id=?", [data.message, data.time, data.memory, attempt_id])
            if (await trimdata(ocur) != await trimdata(oout))
               return await execute("UPDATE attempts SET event=?, time=InlineMaxFun(time,?), memory=InlineMaxFun(memory,?), event_num=2 WHERE id=?", ["Wrong answer #" + (i + 1), data.time, data.memory, attempt_id])
            await execute("UPDATE attempts SET event=?, time=InlineMaxFun(time,?), memory=InlineMaxFun(memory,?), event_num=0 WHERE id=?", ["Test #" + (i + 1), data.time, data.memory, attempt_id])
            return await runNumTest(i + 1);
         } catch (err) {
            console.log(`Error message #1: ${err.message}`)
            return errorRuntime();
         }
      }

      let checkTestSQL = async (data, i) => {
         errorWrite(data.errMsg);
         if (data.err) return await execute("UPDATE attempts SET event=?, time=10, memory=10, event_num=2 WHERE id=?", ["Wrong answer test", attempt_id])
         return await execute("UPDATE attempts SET event=?, time=10, memory=10, event_num=1 WHERE id=?", ["Accepted test", attempt_id])
      }

      let runNumTest = async (i) => {
         try {
            if (i == end)
               return await execute("UPDATE attempts SET event=?,event_num=1 WHERE id=?", ["Accepted", attempt_id])

            try {
               if (lang != 'text/x-mysql') {
                  fs.copyFileSync(path.join(__dirname, `../testcase/${task_id}/input${i}.txt`), path.join(__dirname, `../compiler/tmp/${folder}/input.txt`))
               }
            } catch (err) {
               console.log(`Error message #2: ${err.message}`)
            }

            if (lang == 'text/x-mysql') {
               let config = require(path.join(__dirname, `../testcase/${task_id}/configdb.json`))
               let sqlMeCode = fs.readFileSync(path.join(__dirname, `../testcase/${task_id}/sqlMeCode.txt`), { encoding: "utf8" })
               await sql(code, sqlMeCode, config, ctime, cmemory, (data) => {
                  checkTestSQL(data, i)
               });
            }

            if (lang == 'text/x-c++src') {
               if (i == 0) {
                  await cppRun(folder, async (data) => {
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

         } catch (err) {
            console.log(`Error message #3: ${err.message}`)
            return errorRuntime("Case Error")
         }
      }

      await runNumTest(0);

   } catch (err) {
      console.log(`Error message #4: ${err.message}`)
      return errorRuntime("Error all run");
   }

   let trimdata = async (s) => {
      try {
         while (s.length > 0 && (s[s.length - 1] == '\n' || s[s.length - 1] == '\r' || s[s.length - 1] == ' ')) {
            s = s.substring(0, s.length - 1);
         }
         return s.replace(/\r/g, "");;
      } catch (err) {
         console.log(`Error message #5: ${err.message}`)
         return errorRuntime("Error trim run");
      }
   }
} 