const { dbQueryMany } = require('../../utils');
module.exports = { fnGetAllContests: async () => [], fnGetContestById: async (id) => ({ contest_id: id, title: 'Contest', problems: [], status: 'active', start_time: new Date(), end_time: new Date() }), fnGetContestLeaderboard: async (id) => [] };
