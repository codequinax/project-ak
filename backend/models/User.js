const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    googleId:  { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true },
    lastName:  { type: String, default: "" },
    email:     { type: String, required: true, unique: true, lowercase: true },
    avatar:    { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("User", userSchema)
