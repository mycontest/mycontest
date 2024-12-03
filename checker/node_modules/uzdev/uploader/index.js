const multer = require("multer");
const randomstring = require("randomstring");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOAD_ROOT);
    },
    filename: (req, file, cb) => {
        let fileName = randomstring.generate(40) + path.extname(file.originalname);
        req.file_name = fileName;
        cb(null, fileName);
    },
});

const fileFilter = (req, file, cb) => {
    try {
        let allowedMimeTypes = process.env.UPLOAD_ALLOWED_MIME_TYPES?.split(",");
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } catch (err) {
        cb(err);
    }
};

const fileUploader = (fieldName, filter = null) => {
    let upload = multer({
        storage: storage,
        limits: { fileSize: parseInt(process.env.UPLOAD_SIZE) * 1024 },
        fileFilter: filter || fileFilter,
    });

    return (req, res, next) => {
        try {
            upload.single(fieldName)(req, res, function (err) {
                if (err instanceof multer.MulterError) {
                    return next(new Error(JSON.stringify({ message: err.message, code: "multer" })));
                } else if (err) {
                    return next(err);
                }

                if (!req.file) {
                    return next(new Error(JSON.stringify({ message: "Please upload the correct file type", code: "multer" })));
                }

                next();
            });
        } catch (err) {
            next(err);
        }
    };
};

module.exports = { fileUploader };
