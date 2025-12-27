let error = (err, req, res, next) => {
    try {
        return res.redirect(`/?error=Unexpected error, ${err?.message}!`);
    } catch (error) {
        return res.redirect(`/?error=Json parse error!`);
    }
};

let missed = (req, res, next) => {
    res.redirect(`/?error=There is no such router!`);
};

module.exports = { error, missed };