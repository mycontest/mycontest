const { fnWrap } = require('../../utils');
const { fnGetAllContests, fnGetContestById, fnGetContestLeaderboard } = require('./contests.service');

const contestsList = fnWrap(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const result = await fnGetAllContests(page, 20);
    res.render('pages/contests', {
        title: 'Contests',
        contests: result.contests,
        pagination: result.pagination
    });
});

const contestsView = fnWrap(async (req, res) => {
    const contest = await fnGetContestById(req.params.id);
    const leaderboard = await fnGetContestLeaderboard(req.params.id);
    res.render('pages/contest', { title: contest.title, contest, leaderboard });
});

module.exports = {
    contestsList,
    contestsView
};
