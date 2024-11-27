const express = require("express")
const { fnCatch } = require("uzdev/function")
const { execute } = require("uzdev/mysql")
const router = express.Router()

router.get(["/", "/about"], fnCatch(async (req, res) => {
      let arr = await execute("SELECT * FROM vw_contest ORDER BY start_date asc")
      res.render("pages/about", { data: req.data, pageInfo: "main", arr })
}));

router.get("/news", async (req, res) => {
      res.render("pages/news", { data: req.data, pageInfo: "news" })
});

module.exports = router