const { fnGetAllProblems, fnGetProblemById, fnGetTestCases, fnSubmitSolution, fnGetSubmission } = require("./problems.service");
const { fnJudgeSubmission } = require("../compiler/compiler.service");
const { dbQueryOne } = require("../../utils/mysql");

const problemsHome = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await fnGetAllProblems(page, 20);
    const [total_problems, total_languages, total_submissions] = await Promise.all([
      dbQueryOne("SELECT COUNT(*) as total FROM problems WHERE is_global = TRUE"),
      dbQueryOne("SELECT COUNT(*) as total FROM languages WHERE is_active = TRUE"),
      dbQueryOne("SELECT COUNT(*) as total FROM submissions"),
    ]);
    const stats = {
      total_problems: total_problems ? total_problems.total : 0,
      total_languages: total_languages ? total_languages.total : 0,
      total_submissions: total_submissions ? total_submissions.total : 0,
    };
    res.render("pages/home", {
      title: "Home",
      problems: result.problems,
      pagination: result.pagination,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

const problemsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = (req.query.search || req.query.q || "").trim();
    const difficulty = req.query.difficulty || "";
    const filters = { search: search || undefined, difficulty: difficulty || undefined };
    const result = await fnGetAllProblems(page, 20, filters);

    const query_map = {
      search,
      difficulty,
    };

    const query_string = Object.entries(query_map)
      .filter(([_, val]) => val)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join("&");

    res.render("pages/problems", {
      title: "Problems",
      problems: result.problems,
      pagination: result.pagination,
      search,
      difficulty,
      query_string,
    });
  } catch (err) {
    next(err);
  }
};

const problemsView = async (req, res, next) => {
  try {
    const problem = await fnGetProblemById(req.params.id);
    res.render("pages/problem", { title: problem.title, problem });
  } catch (err) {
    next(err);
  }
};

const problemsSubmit = async (req, res, next) => {
  try {
    const { lang_id, code_body } = req.body;
    const result = await fnSubmitSolution(req.session.user.user_id, req.params.id, lang_id, code_body);

    const [test_cases, lang, problem] = await Promise.all([
      fnGetTestCases(req.params.id),
      dbQueryOne("SELECT lang_code FROM languages WHERE lang_id = ?", [lang_id]),
      dbQueryOne("SELECT time_limit FROM problems WHERE problem_id = ?", [req.params.id]),
    ]);

    fnJudgeSubmission(result.submission_id, code_body, lang.lang_code, test_cases, problem.time_limit).catch((err) => console.error("Judge error:", err));

    res.redirect(`/submissions/${result.submission_id}`);
  } catch (err) {
    next(err);
  }
};

const problemsSubmissionView = async (req, res, next) => {
  try {
    const submission = await fnGetSubmission(req.params.id);
    res.render("pages/submission", {
      title: `Submission #${submission.submission_id}`,
      submission,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  problemsHome,
  problemsList,
  problemsView,
  problemsSubmit,
  problemsSubmissionView,
};
