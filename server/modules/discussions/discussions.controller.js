const { fnWrap } = require("../../utils");

const discussionsGet = fnWrap(async (req, res) => {
  res.render("error", {
    title: "Coming Soon",
    message: "Discussions feature coming soon",
    error: {},
  });
});

module.exports = {
  discussionsGet,
};
