let compiler = async (res, code, lang, input, ctime = 5000, cmemory = 10) => {
    const UIDGenerator = require('uid-generator');
    const uidgen = new UIDGenerator();
    let aid = await uidgen.generate();
    const { langType } = require('./lang');
    const { cppCompiler, cppRun } = require('../../compiler/cpp');
    const { javaCompiler, javaRun } = require('../../compiler/java');
    const { monoCompiler, monoRun } = require('../../compiler/mono');
    const python = require('../../compiler/python');
    const go = require('../../compiler/go');
    const js = require('../../compiler/node');
    const fs = require("fs");
    const path = require("path");

    let folder = aid + "c"

    await fs.mkdirSync(path.join(__dirname, `../../compiler/tmp/${folder}`), { recursive: true })
    await fs.writeFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/Main.${await langType(lang)}`), code)
    await fs.writeFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/input.txt`), input)

    let errorCompiler = (data) => {
        return res.json({ "message": "compiler error", data })
    }
    try {
        let checkTest = async (data) => {
            output = fs.readFileSync(path.join(__dirname, `../../compiler/tmp/${folder}/output.txt`), { encoding: "utf8" })
            return res.json({ output, data })
        }
        if (lang == 'text/x-c++src') {
            await cppRun(folder, async (data) => {
                if (data.error) return errorCompiler(data);
                await cppCompiler(folder, ctime, cmemory, checkTest);
            });
        }
        if (lang == 'text/x-python') await python(folder, ctime, cmemory, checkTest);
        if (lang == 'text/x-java') {
            await javaRun(folder, async (data) => {
                if (data.error) return errorCompiler(data);
                await javaCompiler(folder, ctime, cmemory, checkTest);
            });
        }
        if (lang == 'text/x-go') await go(folder, ctime, cmemory, checkTest);
        if (lang == 'text/javascript') await js(folder, ctime, cmemory, checkTest);
        if (lang == 'text/x-csharp') {
            await monoRun(folder, async (data) => {
                if (data.error) return errorCompiler(data);
                await monoCompiler(folder, ctime, cmemory, checkTest);
            });
        }
    } catch (error) {
        return res.json({ "message": "error runtime", error })
    }
}

module.exports = compiler