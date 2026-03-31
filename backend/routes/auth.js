const express             = require("express")
const jwt                 = require("jsonwebtoken")
const { OAuth2Client }    = require("google-auth-library")
const User                = require("../models/User")
const { sendWelcomeMail } = require("../utils/sendMail")

const router = express.Router()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * POST /api/auth/google
 *
 * Body: { idToken: string }
 *
 * Frontend sends the Google ID token after the user signs in with Google.
 * We verify it with Google, upsert the user in MongoDB, then return a JWT.
 */
router.post("/google", async (req, res) => {
    try {
        const { idToken } = req.body

        if (!idToken) {
            return res.status(400).json({ error: "idToken is required" })
        }

        // 1. Verify the Google ID token with Google's servers
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        const {
            sub: googleId,
            email,
            given_name:  firstName,
            family_name: lastName = "",
            picture:     avatar,
        } = payload

        // 2. Find or create the user in MongoDB
        let user   = await User.findOne({ googleId })
        const isNew = !user

        if (!user) {
            // Maybe they existed before Google was added — link by email
            user = await User.findOne({ email })

            if (user) {
                user.googleId = googleId
                user.avatar   = avatar || user.avatar
                await user.save()
            } else {
                // Brand new user
                user = await User.create({ googleId, email, firstName, lastName, avatar })
            }
        }

        // 3. Send welcome email only on very first sign-in
        if (isNew) {
            sendWelcomeMail(email, firstName).catch(e =>
                console.error("Welcome mail failed (non-fatal):", e.message)
            )
        }

        // 4. Sign a JWT valid for 7 days
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
            },
        })

    } catch (err) {
        console.error("Google auth error:", err.message)
        res.status(500).json({ error: "Authentication failed" })
    }
})

module.exports = router
