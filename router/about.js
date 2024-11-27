const express = require("express")
const router = express.Router()

router.get(["/", "/about"], async (req, res) => {
      console.log(req.data)
      // let v_contest = await execute("SELECT * FROM v_contest ORDER BY start asc")
      res.render("pages/about", { data: req.data, pageInfo: "main", v_contest: [] })
})

router.get("/news", async (req, res) => {
      res.render("pages/news", { data: req.data, pageInfo: "news" })
})

module.exports = router