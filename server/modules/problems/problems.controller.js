/**
 * Problems Controller
 */

const {
    fnGetAllProblems,
    fnGetProblemById,
    fnGetTestCases,
    fnSubmitSolution,
    fnGetSubmission
} = require('./problems.service');

const { fnJudgeSubmission } = require('../compiler/compiler.service');
const { dbQueryOne } = require('../../utils/db');

const problemsHome = async (req, res) => {
    const problems = await fnGetAllProblems();
    res.render('pages/home', { title: 'Home', problems });
};

const problemsList = async (req, res) => {
    const problems = await fnGetAllProblems();
    res.render('pages/problems', { title: 'Problems', problems });
};

const problemsView = async (req, res) => {
    const problem = await fnGetProblemById(req.params.id);
    res.render('pages/problem', { title: problem.title, problem });
};

const problemsSubmit = async (req, res) => {
    const { lang_id, code_body } = req.body;
    const result = await fnSubmitSolution(
        req.session.user.user_id,
        req.params.id,
        lang_id,
        code_body
    );

    // Fetch test cases, language info, and problem info in parallel
    const [test_cases, lang, problem] = await Promise.all([
        fnGetTestCases(req.params.id),
        dbQueryOne('SELECT lang_code FROM languages WHERE lang_id = ?', [lang_id]),
        dbQueryOne('SELECT time_limit FROM problems WHERE problem_id = ?', [req.params.id])
    ]);

    // Judge asynchronously (don't wait)
    fnJudgeSubmission(
        result.submission_id,
        code_body,
        lang.lang_code,
        test_cases,
        problem.time_limit
    ).catch(err => console.error('Judge error:', err));

    res.redirect(`/submissions/${result.submission_id}`);
};

const problemsSubmissionView = async (req, res) => {
    const submission = await fnGetSubmission(req.params.id);
    res.render('pages/submission', {
        title: `Submission #${submission.submission_id}`,
        submission
    });
};

module.exports = {
    problemsHome,
    problemsList,
    problemsView,
    problemsSubmit,
    problemsSubmissionView
};
