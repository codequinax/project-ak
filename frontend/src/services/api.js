// Base URL — reads from Vite env var in production, falls back to localhost for dev
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export async function getQuestions(year, subject, unit) {
    const params = new URLSearchParams({ year, subject, unit })
    const res    = await fetch(`${BASE_URL}/api/questions?${params}`)
    if (!res.ok) throw new Error(`Failed to fetch questions: ${res.status}`)
    return res.json()
}

export async function googleAuth(accessToken) {
    const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ idToken: accessToken }),
    })

    if (!res.ok) {
        let serverMsg = ""
        try {
            const errBody = await res.json()
            serverMsg = errBody.message || errBody.error || JSON.stringify(errBody)
        } catch {
            serverMsg = await res.text().catch(() => "")
        }
        throw new Error(`[${res.status}] ${serverMsg || "Google authentication failed"}`)
    }

    return res.json()
}

export async function submitReport(payload) {
    const res = await fetch(`${BASE_URL}/api/reports`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Failed to submit report")
    return res.json()
}
