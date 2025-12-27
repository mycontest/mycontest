const express = require("express")
const { fnCatch } = require("uzdev/function")
const { execute } = require("uzdev/mysql")
const router = express.Router()

router.get(["/", "/about"], fnCatch(async (req, res) => {
      let arr = await execute("SELECT * FROM vw_contest ORDER BY start_date desc LIMIT 100")
      res.render("pages/about", { data: req.data, pageInfo: "main", arr })
}));

router.get("/news", async (req, res) => {
      let arr = await execute("SELECT * FROM news ORDER BY news_id DESC LIMIT 20", []);
      res.render("pages/news", { data: req.data, pageInfo: "news", arr })
});

module.exports = router