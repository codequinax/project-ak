const express = require("express")
const Question = require("../models/Question")

const router = express.Router()

/* ---------- GET SUBJECTS ---------- */
router.get("/subjects", async (req, res) => {

    try {

        const data = await Question.aggregate([
            {
                $group: {
                    _id: { year: "$year", subject: "$subject" }
                }
            }
        ])

        const result = {}

        data.forEach(item => {

            const { year, subject } = item._id

            if (!result[year]) {
                result[year] = []
            }

            result[year].push(subject)

        })

        res.json(result)

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Failed to fetch subjects" })

    }

})


/* ---------- GET UNITS ---------- */
router.get("/units", async (req, res) => {

    try {

        const { year, subject } = req.query

        if (!year || !subject) {
            return res.status(400).json({
                error: "year and subject required"
            })
        }

        const units = await Question.distinct("unit", { year, subject })

        res.json(units)

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Failed to fetch units" })

    }

})


/* ---------- GET QUESTIONS ---------- */
router.get("/", async (req, res) => {

    try {

        const { year, subject, unit } = req.query

        if (!year || !subject || !unit) {
            return res.status(400).json({
                error: "year, subject and unit required"
            })
        }

        const questions = await Question.find({ year, subject, unit })
            .sort({ order: 1, createdAt: 1 })
            .lean()

        res.json(questions)

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Failed to fetch questions" })

    }

})

module.exports = router