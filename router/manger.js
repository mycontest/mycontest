const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")

let sort = (arr) => {
    let ans = []
    let i = 0;
    while (true) {
        let x = arr.indexOf(`input${i}.txt`)
        let y = arr.indexOf(`output${i}.txt`)
        if (x >= 0 && y >= 0) {
            arr.splice(x, 1);
            y = arr.indexOf(`output${i}.txt`)
            arr.splice(y, 1);
            ans.push(`input${i}.txt`)
            ans.push(`output${i}.txt`)
            i++;
        }
        else {
            break;
        }
    }

    ans = ans.concat(arr);
    return ans;
}

app.use("/", async (req, res) => {

    if (req.query.prev)
        req.session.folder = req.session.basicpath

    if (req.query.delete) {
        try { fs.unlinkSync(req.session.folder + "/" + req.query.delete) }
        catch { console.log("error") }
        try { fs.rmdirSync(req.session.folder + "/" + req.query.delete) }
        catch { console.log("error") }
    }

    if (req.body.newfolder) {
        try { fs.mkdirSync(req.session.folder + "/" + req.body.newfolder) }
        catch { console.log("error") }
    }


    if (req.query.folder && req.query.folder.indexOf('.') != -1)
        return res.sendFile(req.session.folder + "/" + req.query.folder);
    else
        if (req.query.out) {
            req.session.folder = 0
            return res.redirect("/admin")
        }
        else
            if (req.files) {
                let fileinp = req.files.fileinp;
                if (fileinp.length > 0) {
                    for (var i = 0; i < fileinp.length; i++)
                        await fileinp[i].mv(path.join(req.session.folder, fileinp[i].name), async (err) => {
                            if (err) console.log("error")
                        });
                } else {
                    await fileinp.mv(path.join(req.session.folder, fileinp.name), async (err) => {
                        if (err) console.log("error")
                    });
                }


                let arr = []
                try { arr = sort(await fs.readdirSync(req.session.folder)); }
                catch {
                    req.session.folder = '';
                    return res.redirect("/admin/manger")
                }
                return res.render("admin/folder", { arr, name: req.session.name })

            }
            else {
                if (req.query.folder)
                    req.session.folder = req.session.folder + "/" + req.query.folder
                let arr = []
                try { arr = sort(await fs.readdirSync(req.session.folder)); }
                catch {
                    req.session.folder = '';
                    return res.redirect("/admin/manger")
                }
                return res.render("admin/folder", { arr, name: req.session.name })
            }
})




module.exports = app