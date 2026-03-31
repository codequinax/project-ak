// Base URL — reads from Vite env var in production, falls back to localhost for dev
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

/**
 * Fetch questions from the backend for a specific year / subject / unit.
 * Called by Questions.jsx
 *
 * @param {string} year    - e.g. "Second Year"
 * @param {string} subject - e.g. "DBMS"
 * @param {string} unit    - e.g. "Unit 1"
 */
export async function getQuestions(year, subject, unit) {
    const params = new URLSearchParams({ year, subject, unit })
    const res    = await fetch(`${BASE_URL}/api/questions?${params}`)

    if (!res.ok) {
        throw new Error(`Failed to fetch questions: ${res.status}`)
    }

    return res.json()
}

/**
 * Authenticate with the backend using a Google ID token.
 * Called after Firebase / Google signInWithPopup.
 *
 * @param {string} idToken - Google ID token from Firebase Auth
 * @returns {{ token: string, user: object }}
 */
export async function googleAuth(idToken) {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ idToken }),
    })

    if (!res.ok) {
        throw new Error("Google authentication failed")
    }

    return res.json()
}

/**
 * Submit a question report.
 * Called by the ReportModal in Questions.jsx
 *
 * @param {object} payload - { questionId, questionText, reason, details, subject, unit, year, reportedBy }
 */
export async function submitReport(payload) {
    const res = await fetch(`${BASE_URL}/api/reports`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
    })

    if (!res.ok) {
        throw new Error("Failed to submit report")
    }

    return res.json()
}