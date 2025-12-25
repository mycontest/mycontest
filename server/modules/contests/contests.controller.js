const { fnGetAllContests, fnGetContestById, fnGetContestLeaderboard } = require('./contests.service');
const contestsList = async (req, res) => { const contests = await fnGetAllContests(); res.render('pages/contests', { title: 'Contests', contests }); };
const contestsView = async (req, res) => { const contest = await fnGetContestById(req.params.id); const leaderboard = await fnGetContestLeaderboard(req.params.id); res.render('pages/contest', { title: contest.title, contest, leaderboard }); };
module.exports = { contestsList, contestsView };
