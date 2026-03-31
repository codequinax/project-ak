const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
    year:      { type: String, required: true },   // "First Year", "Second Year" etc.
    subject:   { type: String, required: true },   // "DBMS", "OS" etc.
    unit:      { type: String, required: true },   // "Unit 1", "Unit 2" etc.
    text:      { type: String, required: true },   // The question text
    solution:  { type: String, default: "" },
    tags:      { type: [String], default: [] },    // ["Important", "5 Marks", "2022"]
    order:     { type: Number, default: 0 },       // for ordering within a unit
    createdAt: { type: Date, default: Date.now },
})

// Fast lookups by year + subject + unit
questionSchema.index({ year: 1, subject: 1, unit: 1 })

module.exports = mongoose.model("Question", questionSchema)
