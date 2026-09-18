const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../models/database");

const {
    isAuthenticated,
    isAdmin
} = require("../middleware/auth");


// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

console.log("===== NOTES.JS LOADED =====");


// =====================================================
// TEST ROUTE
// =====================================================

router.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Notes route is working correctly!"
    });

});


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
    __dirname,
    "..",
    "uploads"
);


// Create uploads folder if it does not exist

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {
        recursive: true
    });

}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDir);

    },


    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);

    }

});


// =====================================================
// PDF FILTER
// =====================================================

const upload = multer({

    storage: storage,

    fileFilter: function (req, file, cb) {

        if (file.mimetype === "application/pdf") {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF files are allowed"
                )
            );

        }

    }

});


// =====================================================
// GET ALL NOTES
// STUDENT + ADMIN
// =====================================================

router.get(
    "/",
    isAuthenticated,
    (req, res) => {

        try {

            const notes = db.prepare(`
                SELECT
                    id,
                    title,
                    subject,
                    description,
                    filename,
                    created_at
                FROM notes
                ORDER BY created_at DESC
            `).all();


            res.json(notes);

        } catch (error) {

            console.error(
                "Error loading notes:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to load notes"

            });

        }

    }
);


// =====================================================
// ADMIN UPLOAD NOTE
// =====================================================

router.post(
    "/upload",
    isAdmin,
    upload.single("pdf"),

    (req, res) => {

        try {

            // -----------------------------------------
            // Check PDF
            // -----------------------------------------

            if (!req.file) {

                return res.status(400).json({

                    message:
                        "Please select a PDF"

                });

            }


            // -----------------------------------------
            // Get form data
            // -----------------------------------------

            const {
                title,
                subject,
                description
            } = req.body;


            // -----------------------------------------
            // Check required fields
            // -----------------------------------------

            if (!title || !subject) {

                // Delete uploaded PDF

                if (
                    req.file &&
                    fs.existsSync(req.file.path)
                ) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res.status(400).json({

                    message:
                        "Title and subject are required"

                });

            }


            // -----------------------------------------
            // Save note in database
            // -----------------------------------------

            db.prepare(`
                INSERT INTO notes
                (
                    title,
                    subject,
                    description,
                    filename
                )
                VALUES (?, ?, ?, ?)
            `).run(

                title,

                subject,

                description || "",

                req.file.filename

            );


            // -----------------------------------------
            // Success
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Note uploaded successfully"

            });

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            // -----------------------------------------
            // Delete PDF if database fails
            // -----------------------------------------

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({

                message:
                    "Upload failed"

            });

        }

    }
);


// =====================================================
// DOWNLOAD PDF
// STUDENT + ADMIN
// =====================================================

router.get(
    "/download/:id",
    isAuthenticated,

    (req, res) => {

        try {

            // -----------------------------------------
            // Find note
            // -----------------------------------------

            const note = db.prepare(
                "SELECT * FROM notes WHERE id = ?"
            ).get(req.params.id);


            // -----------------------------------------
            // Note not found
            // -----------------------------------------

            if (!note) {

                return res.status(404).send(
                    "Note not found"
                );

            }


            // -----------------------------------------
            // PDF path
            // -----------------------------------------

            const filePath = path.join(
                uploadDir,
                note.filename
            );


            // -----------------------------------------
            // PDF not found
            // -----------------------------------------

            if (!fs.existsSync(filePath)) {

                return res.status(404).send(
                    "PDF file not found"
                );

            }


            // -----------------------------------------
            // Download PDF
            // -----------------------------------------

            res.download(
                filePath,
                note.filename
            );

        } catch (error) {

            console.error(
                "Download error:",
                error
            );


            res.status(500).send(
                "Download failed"
            );

        }

    }
);


// =====================================================
// ADMIN DELETE NOTE
// =====================================================

router.delete(
    "/:id",
    isAdmin,

    (req, res) => {

        try {

            // -----------------------------------------
            // Find note
            // -----------------------------------------

            const note = db.prepare(
                "SELECT * FROM notes WHERE id = ?"
            ).get(req.params.id);


            // -----------------------------------------
            // Note not found
            // -----------------------------------------

            if (!note) {

                return res.status(404).json({

                    message:
                        "Note not found"

                });

            }


            // -----------------------------------------
            // PDF path
            // -----------------------------------------

            const filePath = path.join(
                uploadDir,
                note.filename
            );


            // -----------------------------------------
            // Delete PDF
            // -----------------------------------------

            if (fs.existsSync(filePath)) {

                fs.unlinkSync(
                    filePath
                );

            }


            // -----------------------------------------
            // Delete database record
            // -----------------------------------------

            db.prepare(
                "DELETE FROM notes WHERE id = ?"
            ).run(req.params.id);


            // -----------------------------------------
            // Success
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Note deleted successfully"

            });

        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            res.status(500).json({

                message:
                    "Delete failed"

            });

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;