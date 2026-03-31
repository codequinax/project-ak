require("dotenv").config()

const express   = require("express")
const cors      = require("cors")
const connectDB = require("./config/db")

// ── Route handlers ────────────────────────────────────────────────────────────
const authRoutes      = require("./routes/auth")
const questionRoutes  = require("./routes/questions")
const reportRoutes    = require("./routes/reports")
const progressRoutes = require("./routes/progress")

const app  = express()
const PORT = process.env.PORT || 5000

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB()

// ── Global middleware ─────────────────────────────────────────────────────────

// CORS — allow your frontend origin (set CLIENT_URL in .env for production)
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}))

app.use(express.json())

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "AKTU PYQs API is running" })
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes)      // POST /api/auth/google
app.use("/api/questions", questionRoutes)  // GET  /api/questions?year=&subject=&unit=
app.use("/api/reports",   reportRoutes) 
app.use("/api/progress", progressRoutes)   // POST /api/reports

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message)
    res.status(500).json({ error: "Internal server error" })
})

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`   Allowing requests from: ${process.env.CLIENT_URL || "http://localhost:5173"}`)
})
