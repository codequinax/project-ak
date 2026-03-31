const express  = require("express")
const Report   = require("../models/Report")
const { sendReportNotification } = require("../utils/sendMail")

const router = express.Router()

/**
 * POST /api/reports
 *
 * Body: {
 *   questionId, questionText, reason, details,
 *   subject, unit, year, reportedBy
 * }
 *
 * Saves the report to MongoDB and emails the admin.
 */
router.post("/", async (req, res) => {
    try {
        const {
            questionId,
            questionText = "",
            reason,
            details      = "",
            subject,
            unit,
            year,
            reportedBy   = "anonymous",
        } = req.body

        // Basic validation
        if (!questionId || !reason || !subject || !unit || !year) {
            return res.status(400).json({
                error: "questionId, reason, subject, unit, and year are required",
            })
        }

        // Save to MongoDB
        const report = await Report.create({
            questionId,
            questionText,
            reason,
            details,
            subject,
            unit,
            year,
            reportedBy,
        })

        // Fire-and-forget admin email (non-fatal)
        sendReportNotification(report).catch(e =>
            console.error("Report notification email failed (non-fatal):", e.message)
        )

        res.status(201).json({ success: true, reportId: report._id })

    } catch (err) {
        console.error("POST /api/reports error:", err.message)
        res.status(500).json({ error: "Failed to submit report" })
    }
})

/**
 * GET /api/reports  (admin use — list all pending reports)
 */
router.get("/", async (req, res) => {
    try {
        const { status = "pending" } = req.query

        const reports = await Report.find({ status })
            .sort({ createdAt: -1 })
            .lean()

        res.json(reports)

    } catch (err) {
        console.error("GET /api/reports error:", err.message)
        res.status(500).json({ error: "Failed to fetch reports" })
    }
})

/**
 * PATCH /api/reports/:id  (admin use — update report status)
 *
 * Body: { status: "reviewed" | "fixed" }
 */
router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body

        if (!["pending", "reviewed", "fixed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" })
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!report) return res.status(404).json({ error: "Report not found" })

        res.json(report)

    } catch (err) {
        console.error("PATCH /api/reports error:", err.message)
        res.status(500).json({ error: "Failed to update report" })
    }
})

module.exports = router
