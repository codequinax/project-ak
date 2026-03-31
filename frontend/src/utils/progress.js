/**
 * Progress stored per-user in localStorage + synced to backend.
 */

const API = import.meta.env.VITE_API_URL

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("pyq_user")) || null
    } catch {
        return null
    }
}

function isGuest() {
    const user = getUser()
    return !user?.email
}

function getKey() {
    const user = getUser()
    return user?.email ? `pyq_progress_${user.email}` : null
}

function loadProgress() {
    if (isGuest()) return {}

    try {
        return JSON.parse(localStorage.getItem(getKey())) || {}
    } catch {
        return {}
    }
}

function saveProgress(data) {
    const key = getKey()
    if (!key) return

    localStorage.setItem(key, JSON.stringify(data))
}

export function unitKey(year, subject, unit) {
    return `${year}|${subject}|${unit}`
}

/** Send progress to backend */
async function syncProgress(year, subject, unit, reviewed, total) {

    const user = getUser()

    const userId = user?.id || user?._id

    if (!userId) return

    try {

        await fetch(`${API}/api/progress`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                userId: userId,
                year,
                subject,
                unit,
                reviewed,
                total
            })

        })

    } catch (err) {

        console.warn("Progress sync failed:", err)

    }

}

/** Toggle a question as reviewed/un-reviewed */
export function toggleReviewed(year, subject, unit, index, total) {

    if (isGuest()) return false

    const progress = loadProgress()
    const key = unitKey(year, subject, unit)

    if (!progress[key]) {
        progress[key] = { reviewed: [], total }
    }

    const list = progress[key].reviewed
    const pos = list.indexOf(index)

    if (pos === -1) {
        list.push(index)
    } else {
        list.splice(pos, 1)
    }

    progress[key].total = total

    saveProgress(progress)

    // Sync to backend
    syncProgress(year, subject, unit, list, total)

    return list.includes(index)
}

/** Check if a specific question is reviewed */
export function isReviewed(year, subject, unit, index) {

    if (isGuest()) return false

    const progress = loadProgress()
    const key = unitKey(year, subject, unit)

    return progress[key]?.reviewed?.includes(index) ?? false
}

/** Get { reviewed: number, total: number } for a unit */
export function getUnitProgress(year, subject, unit) {

    if (isGuest()) return { reviewed: 0, total: null }

    const progress = loadProgress()
    const key = unitKey(year, subject, unit)
    const entry = progress[key]

    if (!entry) return { reviewed: 0, total: null }

    return { reviewed: entry.reviewed.length, total: entry.total }
}

/** Restore progress from backend after login */
export async function restoreProgressFromServer() {

    const user = getUser()

    const userId = user?.id || user?._id

    if (!userId) return

    try {

        const res = await fetch(`${API}/api/progress/${userId}`)
        const data = await res.json()

        if (!Array.isArray(data)) return

        const progress = {}

        data.forEach(item => {

            const key = unitKey(item.year, item.subject, item.unit)

            progress[key] = {
                reviewed: item.reviewed || [],
                total: item.total || 0
            }

        })

        saveProgress(progress)

    } catch (err) {

        console.warn("Progress restore failed:", err)

    }

}