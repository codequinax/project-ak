const mongoose = require("mongoose")

const ProgressSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    year: String,
    subject: String,
    unit: String,

    reviewed: [Number],
    total: Number

})

module.exports = mongoose.model("Progress", ProgressSchema)