const jwt = require("jsonwebtoken")

/**
 * Middleware: verify JWT sent in Authorization header.
 * Attaches decoded payload to req.user on success.
 * Usage: router.get("/protected", protect, handler)
 */
function protect(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded   // { id, email, firstName, iat, exp }
        next()
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" })
    }
}

module.exports = protect
