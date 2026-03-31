const express = require("express")
const Progress = require("../models/Progress")

const router = express.Router()

// SAVE PROGRESS
router.post("/", async (req, res) => {

    try {

        const { userId, year, subject, unit, reviewed, total } = req.body

        const progress = await Progress.findOneAndUpdate(

            { userId, year, subject, unit },

            { reviewed, total },

            { upsert: true, new: true }

        )

        res.json(progress)

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Failed to save progress" })

    }

})


// GET USER PROGRESS
router.get("/:userId", async (req, res) => {

    try {

        const data = await Progress.find({ userId: req.params.userId })

        res.json(data)

    } catch (err) {

        res.status(500).json({ error: "Failed to fetch progress" })

    }

})

module.exports = router