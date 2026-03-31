const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    questionId:   { type: String, required: true },
    questionText: { type: String, default: "" },
    reason:       { type: String, required: true },
    details:      { type: String, default: "" },
    subject:      { type: String, required: true },
    unit:         { type: String, required: true },
    year:         { type: String, required: true },
    reportedBy:   { type: String, default: "anonymous" },  // email
    status:       { type: String, enum: ["pending", "reviewed", "fixed"], default: "pending" },
    createdAt:    { type: Date, default: Date.now },
})

module.exports = mongoose.model("Report", reportSchema)
