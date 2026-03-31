const express  = require("express")
const jwt      = require("jsonwebtoken")
const { OAuth2Client } = require("google-auth-library")
const User     = require("../models/User")
const { sendWelcomeMail } = require("../utils/sendMail")

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Frontend sends the Google ID token after signInWithPopup / signInWithRedirect
// We verify it, upsert the user in MongoDB, issue a JWT back.
router.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body
        if (!idToken) return res.status(400).json({ error: "idToken required" })

        // 1. Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payload = ticket.getPayload()
        const { sub: googleId, email, given_name: firstName, family_name: lastName = "", picture: avatar } = payload

        // 2. Find or create user
        let user = await User.findOne({ googleId })
        const isNew = !user

        if (!user) {
            // Also check by email in case they registered another way before
            user = await User.findOne({ email })
            if (user) {
                // Link their Google ID to the existing account
                user.googleId = googleId
                user.avatar   = avatar || user.avatar
                await user.save()
            } else {
                // Brand new user
                user = await User.create({ googleId, email, firstName, lastName, avatar })
            }
        }

        // 3. Send welcome email only on first ever sign-in
        if (isNew) {
            try { await sendWelcomeMail(email, firstName) } catch (e) {
                console.error("Welcome mail failed (non-fatal):", e.message)
            }
        }

        // 4. Issue JWT  (expires in 7 days)
        const token = jwt.sign(
            { id: user._id, email: user.email, firstName: user.firstName },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({
            token,
            user: {
                id:        user._id,
                firstName: user.firstName,
                lastName:  user.lastName,
                email:     user.email,
                avatar:    user.avatar,
            }
        })

    } catch (err) {
        console.error("Google auth error:", err.message)
        res.status(500).json({ error: "Authentication failed" })
    }
})

module.exports = router
