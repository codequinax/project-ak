import Navbar from "../components/Navbar"
import MathRenderer from "../components/MathRenderer"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { getQuestions, submitReport } from "../services/api"
import { toggleReviewed, isReviewed } from "../utils/progress"
import { useToast } from "../components/Toast"
import { QuestionsSkeleton } from "../components/Skeleton"
import { Zap, CheckCircle, Circle, Flag, Lock, X } from "lucide-react"

// ── Guest action button — shows shake + popover instead of hiding ─────────────
function GuestActionButton({ icon: Icon, label, className, popoverText = "Login to use this" }) {
    const [shaking, setShaking]   = useState(false)
    const [showPop, setShowPop]   = useState(false)
    const [popPos, setPopPos]     = useState({ top: 0, left: 0 })
    const btnRef   = useRef(null)
    const timerRef = useRef(null)

    function handleClick() {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPopPos({
                top:  rect.top + window.scrollY - 8,
                left: rect.left + rect.width / 2,
            })
        }
        setShaking(true)
        setShowPop(true)
        clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            setShaking(false)
            setShowPop(false)
        }, 2200)
    }

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleClick}
                className={`flex items-center gap-2 transition-all duration-200 ${className} ${shaking ? "animate-shake" : ""}`}
            >
                <Icon className="w-4 h-4" />
                {label}
            </button>
            {showPop && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{ top: popPos.top, left: popPos.left, transform: "translate(-50%, -100%)" }}
                >
                    <div className="guest-popover-bubble text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl animate-pop-in mb-1.5">
                        <Lock className="w-3 h-3 shrink-0" />{popoverText}
                    </div>
                    <div className="guest-popover-arrow w-2 h-2 rotate-45 mx-auto -mt-1" />
                </div>
            )}
        </>
    )
}

// ── Google G icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
        </svg>
    )
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
const tagColors = {
    "Important": "bg-amber-500/20 text-amber-300 border-amber-500/30",
    "5 Marks":   "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    "2 Marks":   "bg-sky-500/20    text-sky-300    border-sky-500/30",
    "10 Marks":  "bg-purple-500/20 text-purple-300 border-purple-500/30",
}

function TagPill({ tag }) {
    const isYear = /^\d{4}$/.test(tag)
    const cls = isYear
        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        : (tagColors[tag] || "bg-slate-700 text-slate-300 border-slate-600")
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cls}`}>
            {tag}
        </span>
    )
}

function TopicPill({ topic }) {
    return (
        <span className="topic-pill text-xs font-medium px-2.5 py-0.5 rounded-full border">
            {topic}
        </span>
    )
}

// ── Slide directions ──────────────────────────────────────────────────────────
const SLIDE = {
    enterRight: "translate-x-full opacity-0",
    enterLeft:  "-translate-x-full opacity-0",
    center:     "translate-x-0 opacity-100",
    exitLeft:   "-translate-x-full opacity-0",
    exitRight:  "translate-x-full opacity-0",
}

// ── Report reasons ────────────────────────────────────────────────────────────
const REPORT_REASONS = [
    "Wrong / incorrect answer",
    "Question text is unclear",
    "Duplicate question",
    "Missing or broken solution",
    "Other",
]

// ── Report Modal ──────────────────────────────────────────────────────────────
function ReportModal({ question, questionIndex, subject, unit, year, user, onClose, toast }) {
    const [selectedReason, setSelectedReason] = useState("")
    const [details, setDetails]               = useState("")
    const [submitting, setSubmitting]         = useState(false)
    const [submitted, setSubmitted]           = useState(false)

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onClose])

    async function handleSubmit() {
        if (!selectedReason) {
            toast.info("Please select a reason first.")
            return
        }
        setSubmitting(true)
        try {
            await submitReport({
                questionId:   question?._id || question?.id || `idx-${questionIndex}`,
                questionText: question?.text || question?.question || question?.title || "",
                reason:       selectedReason,
                details:      details.trim(),
                subject,
                unit,
                year,
                reportedBy:   user?.email || "anonymous",
            })
            setSubmitted(true)
        } catch (err) {
            console.error("Report failed:", err)
            toast.info("Couldn't submit report. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="absolute inset-0 report-backdrop" />
            <div className="relative z-10 w-full max-w-[400px] report-card rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                <div className="flex items-center justify-between px-5 pt-5 pb-4 report-header-border">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                            <Flag className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold report-text-primary leading-tight">Report this question</p>
                            <p className="text-xs report-text-muted mt-0.5">We'll review and fix it ASAP</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="report-close-btn p-1.5 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {submitted ? (
                    <div className="px-5 py-8 text-center">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="report-text-primary font-bold mb-1">Report submitted!</p>
                        <p className="report-text-muted text-sm leading-relaxed mb-6">
                            Thanks for helping us improve.<br />We'll look into this question shortly.
                        </p>
                        <button onClick={onClose} className="w-full py-2.5 rounded-xl report-btn-cancel text-sm font-medium transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="px-5 py-5">
                        <div className="mb-5 px-3.5 py-3 rounded-xl report-question-box">
                            <p className="text-[10px] font-semibold uppercase tracking-wider report-text-muted mb-1.5">Question {questionIndex + 1}</p>
                            <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                                <MathRenderer
                                    content={
                                        question?.text ||
                                        question?.question ||
                                        question?.title || ""
                                    }
                                />
                            </p>
                        </div>
                        <p className="text-xs font-semibold report-text-muted uppercase tracking-wider mb-2.5">What's the issue?</p>
                        <div className="flex flex-col gap-2 mb-4">
                            {REPORT_REASONS.map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 select-none
                                        ${selectedReason === reason
                                        ? "bg-red-500/10 border-red-500/40 text-red-500"
                                        : "report-reason-idle"
                                    }`}
                                >
                                    <input type="radio" name="report-reason" value={reason} checked={selectedReason === reason} onChange={() => setSelectedReason(reason)} className="accent-red-500 shrink-0" />
                                    <span className="text-sm">{reason}</span>
                                </label>
                            ))}
                        </div>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Any extra details? (optional)"
                            maxLength={500}
                            rows={3}
                            className="w-full report-textarea rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none transition-colors mb-4"
                        />
                        <div className="flex gap-2.5">
                            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl report-btn-cancel text-sm font-medium transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !selectedReason}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : "Submit Report"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Auth Gate Modal ───────────────────────────────────────────────────────────
function AuthGateModal({ subject, unit, year }) {
    const navigate = useNavigate()
    const handleGoogleSignIn = () => {
        const redirect = `/questions/${encodeURIComponent(year)}/${encodeURIComponent(subject)}/${encodeURIComponent(unit)}`
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
            <div className="absolute inset-0 lr-modal-backdrop" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[480px] h-[480px] rounded-full bg-indigo-500/8 blur-[80px]" />
            </div>
            <div className="relative z-10 w-full max-w-[380px]">
                <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-br from-indigo-500/30 via-sky-400/15 to-purple-500/15 blur-[2px]" />
                <div className="relative rounded-[20px] overflow-hidden lr-modal-card">
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />
                    <div className="p-7 sm:p-8">
                        <div className="flex justify-center mb-5">
                            <div className="relative">
                                <div className="absolute -inset-3 rounded-2xl bg-indigo-500/8 blur-md" />
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                                    <Lock className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="absolute -inset-1 rounded-2xl border border-indigo-400/25 animate-ping" style={{ animationDuration: "2s" }} />
                            </div>
                        </div>
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-400 tracking-wide">
                                {subject} · {unit}
                            </span>
                        </div>
                        <div className="text-center mb-6">
                            <h2 className="lr-heading text-xl font-black leading-tight mb-2">Unlock questions</h2>
                            <p className="lr-sub text-sm leading-relaxed">
                                Sign in free to access all PYQs,<br />solutions and track your progress.
                            </p>
                        </div>
                        <div className="lr-mobile-card rounded-xl p-4 mb-6 space-y-2.5 border">
                            {[
                                "All unit-wise PYQs with solutions",
                                "Progress tracking per subject",
                                "Pick up right where you left off",
                            ].map((text) => (
                                <div key={text} className="flex items-center gap-2.5">
                                    <span className="text-indigo-400 text-[10px] shrink-0">✦</span>
                                    <span className="text-sm lr-perk-text">{text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full h-px lr-divider mb-5" />
                        <button
                            onClick={handleGoogleSignIn}
                            className="lr-google-btn w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                        >
                            Login / Sign up
                        </button>
                        <p className="text-center lr-footer-text text-xs mt-4 leading-relaxed">
                            No password needed · Always free.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Questions() {

    const { year, subject, unit } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const filterTag = searchParams.get("filter")  // e.g. "Important"
    const toast = useToast()

    const getUser = () => { try { return JSON.parse(localStorage.getItem("pyq_user")) } catch { return null } }
    const [user, setUser] = useState(getUser)
    const isGuest = !user

    // Scroll to top on mount
    useEffect(() => { window.scrollTo(0, 0) }, [])

    useEffect(() => {
        const handler = () => setUser(getUser())
        window.addEventListener("pyq_auth_change", handler)
        return () => window.removeEventListener("pyq_auth_change", handler)
    }, [])

    const [questions, setQuestions]             = useState([])
    const [loading, setLoading]                 = useState(true)
    const [currentIndex, setCurrentIndex]       = useState(0)
    const [showSolution, setShowSolution]       = useState(false)
    const [time, setTime]                       = useState(0)
    const [reviewed, setReviewed]               = useState(false)
    const [completedSet, setCompletedSet]       = useState(new Set())
    const [showReportModal, setShowReportModal] = useState(false)

    const [slideClass, setSlideClass] = useState(SLIDE.center)
    const animating = useRef(false)

    // Category tags — questions with these tags are excluded from Practice
    const CATEGORY_TAGS = ["Important", "Repeat", "Recent"]

    // Fetch questions — if unit is "All Units" fetch all 5 units then filter by tag
    useEffect(() => {
        setLoading(true)
        const allUnits = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
        const unitList = unit === "All Units" ? allUnits : [unit]

        Promise.all(unitList.map(u => getQuestions(year, subject, u)))
            .then(results => {
                let all = results.flat()
                if (filterTag) {
                    // Category view — show ONLY questions with this tag
                    all = all.filter(q => q.tags && q.tags.includes(filterTag))
                } else {
                    // Practice view — exclude questions that belong to any category
                    all = all.filter(q => !q.tags || !q.tags.some(t => CATEGORY_TAGS.includes(t)))
                }
                setQuestions(all)
            })
            .catch(() => setQuestions([]))
            .finally(() => setLoading(false))
    }, [year, subject, unit, filterTag])

    // Timer — logged-in users only
    useEffect(() => {
        if (isGuest) return
        setTime(0)
        const timer = setInterval(() => setTime(t => t + 1), 1000)
        return () => clearInterval(timer)
    }, [currentIndex, isGuest])

    useEffect(() => {
        if (questions.length === 0) return
        const set = new Set()
        questions.forEach((_, i) => { if (isReviewed(year, subject, unit, i)) set.add(i) })
        setCompletedSet(set)
    }, [questions.length])

    useEffect(() => {
        if (questions.length === 0) return
        setReviewed(isReviewed(year, subject, unit, currentIndex))
    }, [currentIndex, questions.length])

    // Keyboard nav — disabled for guests & when report modal is open
    useEffect(() => {
        if (isGuest) return
        function handleKey(e) {
            if (showReportModal) return
            if (e.key === "ArrowRight") goTo(currentIndex + 1, "next")
            if (e.key === "ArrowLeft")  goTo(currentIndex - 1, "prev")
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [currentIndex, questions.length, isGuest, showReportModal])

    function goTo(index, direction) {
        if (index < 0 || index >= questions.length) return
        if (animating.current) return
        animating.current = true
        setShowSolution(false)
        setSlideClass(direction === "next" ? SLIDE.exitLeft : SLIDE.exitRight)
        setTimeout(() => {
            setCurrentIndex(index)
            setSlideClass(direction === "next" ? SLIDE.enterRight : SLIDE.enterLeft)
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setSlideClass(SLIDE.center)
                animating.current = false
            }))
        }, 250)
    }

    // Free preview: guests can see first 3 questions in Practice mode only
    const FREE_PREVIEW_COUNT = 3
    // Guest is blocked if: they're a guest AND (it's a category filter OR they've passed the free preview)
    const guestBlocked = isGuest && (!!filterTag || currentIndex >= FREE_PREVIEW_COUNT)

    // While loading or no questions yet — show skeleton behind the auth gate for guests
    if (loading || questions.length === 0) {
        const showGateNow = isGuest && !!filterTag  // immediate gate for category sections
        return (
            <div className="bg-[#0b0f1a] min-h-screen relative">
                <Navbar />
                <div className={showGateNow ? "pointer-events-none select-none" : ""}>
                    <QuestionsSkeleton />
                </div>
                {showGateNow && <AuthGateModal subject={subject} unit={unit} year={year} />}
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100
    const yearMap  = { "1st Year": "First Year", "2nd Year": "Second Year", "3rd Year": "Third Year", "4th Year": "Fourth Year" }
    const formattedYear = yearMap[year] || year

    return (
        <div className="bg-[#0b0f1a] min-h-screen relative overflow-x-hidden overflow-y-auto">

            {/* ── STAR BACKGROUND ──────────────────────────────────────── */}
            <div className="cs-bg" aria-hidden="true">
                {[
                    [7,9],[14,23],[22,6],[31,41],[38,15],[44,72],[51,33],[58,8],[65,55],[73,19],
                    [80,38],[87,67],[93,12],[4,51],[11,78],[19,44],[27,29],[35,62],[42,86],[49,17],
                    [56,49],[63,74],[71,31],[78,57],[85,22],[91,83],[3,36],[16,68],[24,14],[33,88],
                    [40,53],[47,27],[54,79],[61,42],[68,11],[75,65],[82,48],[89,34],[96,71],[8,92],
                    [20,37],[29,61],[37,82],[45,24],[52,58],[59,91],[67,45],[74,77],[81,18],[88,53],
                ].map(([x, y], i) => (
                    <span key={i} className={`cs-star cs-star-${i % 5}`} style={{
                        left: `${x}%`, top: `${y}%`,
                        animationDelay:    `${((i * 1.37) % 12).toFixed(1)}s`,
                        animationDuration: `${8 + (i % 7) * 1.8}s`,
                    }} />
                ))}
            </div>

            <Navbar />

            <div className="relative z-10">

                {/* Page content — blurred/locked for blocked guests */}
                <div
                    className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 transition-all duration-500 ${
                        guestBlocked ? "pointer-events-none select-none" : ""
                    }`}
                    aria-hidden={guestBlocked}
                >
                    {/* Sidebar */}
                    <div className="w-full md:w-36 md:pr-5 md:border-r md:border-slate-800/80 shrink-0">
                        <button
                            onClick={() => navigate(`/units/${encodeURIComponent(year)}/${encodeURIComponent(subject)}`)}
                            className="text-indigo-400 hover:text-indigo-300 mb-3 md:mb-5 text-sm flex items-center gap-1 transition-colors"
                        >
                            ← Back
                        </button>
                        <h2 className="text-sm font-bold text-slate-100 leading-snug">{subject}</h2>
                        <p className="text-slate-600 text-xs mt-0.5 mb-1">{filterTag ? `${filterTag} Questions` : unit}</p>
                        <p className="text-slate-600 text-xs mb-3 md:mb-5">{formattedYear}</p>
                        <div className="flex flex-row flex-wrap md:grid md:grid-cols-3 gap-1.5 sm:gap-2">
                            {questions.map((q, index) => {
                                const isCompleted = completedSet.has(index)
                                const isCurrent   = index === currentIndex
                                return (
                                    <button
                                        key={q._id || q.id || index}
                                        onClick={() => goTo(index, index > currentIndex ? "next" : "prev")}
                                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all duration-150
                                            ${isCurrent
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                            : isCompleted
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 overflow-hidden">

                        {/* Timer */}
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="flex items-center gap-0 rounded-[14px] border border-slate-700/60 bg-slate-800/70 overflow-hidden">
                                <div className="flex items-center gap-px px-4 py-2.5">
                                    <Zap className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                                    {time >= 3600 && (
                                        <>
                    <span className="font-mono text-[17px] font-medium text-slate-100 tracking-wide min-w-[26px] text-center tabular-nums">
                        {String(Math.floor(time / 3600)).padStart(2, '0')}
                    </span>
                                            <span className="font-mono text-[17px] text-slate-600 px-px animate-pulse">:</span>
                                        </>
                                    )}
                                    <span className="font-mono text-[17px] font-medium text-slate-100 tracking-wide min-w-[26px] text-center tabular-nums">
                {String(Math.floor((time % 3600) / 60)).padStart(2, '0')}
            </span>
                                    <span className="font-mono text-[17px] text-slate-600 px-px animate-pulse">:</span>
                                    <span className="font-mono text-[17px] font-medium text-slate-100 tracking-wide min-w-[26px] text-center tabular-nums">
                {String(time % 60).padStart(2, '0')}
            </span>
                                </div>
                                <div className="flex items-center pr-3">
                                    <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Free preview banner — shown to guests in practice mode */}
                        {isGuest && !filterTag && currentIndex < FREE_PREVIEW_COUNT && (
                            <div className="free-preview-card mb-5 sm:mb-7 relative overflow-hidden rounded-2xl">
                                {/* animated gradient top bar */}
                                <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-sky-400 to-violet-500" />
                                {/* glow blobs */}
                                <div className="fp-glow-1 absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl pointer-events-none" />
                                <div className="fp-glow-2 absolute -bottom-6 -left-6 w-32 h-32 rounded-full blur-2xl pointer-events-none" />
                                <div className="relative px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Left — icon + text */}
                                    <div className="flex items-center gap-3.5">
                                        <div className="relative shrink-0">
                                            <div className="fp-icon-glow absolute inset-0 rounded-xl blur-md animate-pulse" />
                                            <div className="fp-icon-box relative w-10 h-10 rounded-xl flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-indigo-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="fp-title text-sm font-black leading-tight">Free Preview</p>
                                                <span className="fp-badge inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                                                    {currentIndex + 1} of {FREE_PREVIEW_COUNT}
                                                </span>
                                            </div>
                                            <p className="fp-subtitle text-xs leading-snug">
                                                {FREE_PREVIEW_COUNT - currentIndex - 1 > 0
                                                    ? `${FREE_PREVIEW_COUNT - currentIndex - 1} free question${FREE_PREVIEW_COUNT - currentIndex - 1 > 1 ? "s" : ""} left · Sign in to unlock all`
                                                    : "Last free question · Sign in to continue"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    {/* Right — CTA button */}
                                    <button
                                        onClick={() => {
                                            const redirect = `/questions/${encodeURIComponent(year)}/${encodeURIComponent(subject)}/${encodeURIComponent(unit)}`
                                            navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
                                        }}
                                        className="shrink-0 group relative overflow-hidden flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            Unlock all free
                                            <span className="group-hover:translate-x-0.5 transition-transform duration-150">→</span>
                                        </span>
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex justify-between text-xs text-slate-600 mb-2">
                                <span>Progress</span>
                                <span className="text-slate-400">{currentIndex + 1} / {questions.length}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question card */}
                        <div className={`bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 sm:p-8 shadow-xl transition-all duration-250 ease-in-out ${slideClass}`}>
                            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                                Question {currentIndex + 1}
                            </p>
                            <p className={`text-base sm:text-lg text-slate-100 leading-relaxed font-medium ${guestBlocked ? "blur-[2px] select-none" : ""}`}>
                                <MathRenderer
                                    content={
                                        currentQuestion.text ||
                                        currentQuestion.question ||
                                        currentQuestion.title ||
                                        "No question text found"
                                    }
                                />
                            </p>
                            {/* Tags only inside card (marks, year, importance) */}
                            {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                                    {currentQuestion.tags.map(tag => <TagPill key={tag} tag={tag} />)}
                                </div>
                            )}
                        </div>

                        {/* Topic pills — outside card so they don't mix with question text */}
                        {currentQuestion.topics && currentQuestion.topics.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
                                <span className="text-xs text-slate-600 font-medium uppercase tracking-wider">Topics:</span>
                                {currentQuestion.topics.map(topic => <TopicPill key={topic} topic={topic} />)}
                            </div>
                        )}

                        {/* Mark as completed — shown always, guest gets shake popover */}
                        <div className="mt-4 sm:mt-5">
                            {isGuest ? (
                                <GuestActionButton
                                    icon={Circle}
                                    label="Mark as Completed"
                                    popoverText="Login to track your progress"
                                    className="px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 text-sm font-medium opacity-60 cursor-not-allowed"
                                />
                            ) : (
                                <button
                                    onClick={() => {
                                        const wasReviewed = isReviewed(year, subject, unit, currentIndex)
                                        toggleReviewed(year, subject, unit, currentIndex, questions.length)
                                        setReviewed(!wasReviewed)
                                        setCompletedSet(prev => {
                                            const next = new Set(prev)
                                            wasReviewed ? next.delete(currentIndex) : next.add(currentIndex)
                                            return next
                                        })
                                        toast[wasReviewed ? "info" : "success"](wasReviewed ? "Marked as incomplete." : "Question marked as completed!")
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200
                                    ${reviewed
                                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                                        : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                                    }`}
                                >
                                    {reviewed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                    {reviewed ? "Completed" : "Mark as Completed"}
                                </button>
                            )}
                        </div>

                        {/* Solution */}
                        <div className="mt-4 sm:mt-5">
                            <button
                                onClick={() => setShowSolution(!showSolution)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25"
                            >
                                {showSolution ? "Hide Solution" : "Show Solution"}
                            </button>
                            {showSolution && (
                                <div className={`mt-4 bg-slate-800/60 border border-slate-700/60 p-4 sm:p-6 rounded-2xl text-slate-300 text-sm leading-relaxed ${guestBlocked ? "blur-[2px] select-none" : ""}`}>
                                    <MathRenderer content={currentQuestion.solution} />
                                </div>
                            )}
                        </div>

                        {/* Report button — shown always, guest gets shake popover */}
                        <div className="flex justify-end mt-3">
                            {isGuest ? (
                                <GuestActionButton
                                    icon={Flag}
                                    label="Report"
                                    popoverText="Login to report a question"
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium opacity-60 cursor-not-allowed"
                                />
                            ) : (
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-all duration-150"
                                >
                                    <Flag className="w-3.5 h-3.5" />
                                    Report
                                </button>
                            )}
                        </div>

                        {/* Nav buttons */}
                        <div className="flex justify-between mt-8 sm:mt-10">
                            <button
                                onClick={() => goTo(currentIndex - 1, "prev")}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/60 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition-all duration-150"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => goTo(currentIndex + 1, "next")}
                                disabled={currentIndex === questions.length - 1}
                                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200"
                            >
                                Next →
                            </button>
                        </div>

                    </div>
                </div>

                {/* Auth gate — shown when guest is blocked */}
                {guestBlocked && <AuthGateModal subject={subject} unit={unit} year={year} />}

            </div>

            {/* Report Modal — outside blurred wrapper so it always renders sharp */}
            {showReportModal && (
                <ReportModal
                    question={currentQuestion}
                    questionIndex={currentIndex}
                    subject={subject}
                    unit={unit}
                    year={year}
                    user={user}
                    onClose={() => setShowReportModal(false)}
                    toast={toast}
                />
            )}

        </div>
    )
}