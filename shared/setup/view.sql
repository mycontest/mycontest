CREATE OR REPLACE VIEW vw_problem_languages AS
SELECT
    pl.id AS problem_language_id,
    pl.problem_id,
    pl.language_id,
    pl.default_code,
    l.name AS language_name,
    l.file_extension,
    l.compile_script,
    l.run_script,
    l.docker_image
FROM
    problem_languages pl
    JOIN languages l ON pl.language_id = l.id;