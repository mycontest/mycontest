let error = (err, req, res, next) => {
    try {
        return res.redirect(`/?err=Unexpected error, ${err?.message}!`);
    } catch (error) {
        return res.redirect(`/?err=Json parse error!`);
    }
};

let missed = (req, res, next) => {
    res.redirect(`/?err=There is no such router!`);
};

module.exports = { error, missed };