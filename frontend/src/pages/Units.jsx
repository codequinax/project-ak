import Navbar from "../components/Navbar"
import { useParams, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { getUnitProgress } from "../utils/progress"
import { getQuestions } from "../services/api"
import {
    ArrowLeft, BookOpen, Star, RefreshCw, Clock3, ChevronDown,
    Calculator, Atom, FlaskConical, Zap, CircuitBoard, Code2, Leaf, Cog, Users,
    Database, Monitor, GitBranch, Globe, BarChart3, Cpu, Cloud,
    Rocket, Bot, BrainCircuit, ShieldCheck
} from "lucide-react"

const units = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]

const subjectIcons = {
    // First Year
    "Math-1": Calculator, "Physics": Atom, "Chemistry": FlaskConical, "Electrical": Zap,
    "Electronics": CircuitBoard, "PPS": Code2, "EVS": Leaf, "Mechanical": Cog,
    "Soft skills": Users,
    // Second Year+
    "Maths": Calculator, "DBMS": Database, "OS": Monitor, "DSA": GitBranch, "CN": Globe,
    "DAA": BarChart3, "Compiler": Cpu, "Web Tech": Code2, "Cloud": Cloud,
    "Project": Rocket, "AI": Bot, "ML": BrainCircuit, "Security": ShieldCheck,
}

// ── Category cards config ─────────────────────────────────────────────────────
const categories = [
    {
        id:        "practice",
        icon:      BookOpen,
        label:     "Practice Questions",
        desc:      "All 5 units — work through every PYQ at your own pace",
        iconColor: "text-indigo-400",
        iconBg:    "bg-indigo-500/10 border-indigo-500/20",
        accent:    "indigo",
        badge:     "Units 1–5",
        badgeColor:"bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
        glow:      "hover:shadow-indigo-500/10",
    },
    {
        id:        "important",
        icon:      Star,
        label:     "Important Questions",
        desc:      "High-weightage questions most likely to appear in exams",
        iconColor: "text-amber-400",
        iconBg:    "bg-amber-500/10 border-amber-500/20",
        accent:    "amber",
        badge:     "Most Popular",
        badgeColor:"bg-amber-500/15 text-amber-400 border-amber-500/25",
        glow:      "hover:shadow-amber-500/10",
    },
    {
        id:        "repeated",
        icon:      RefreshCw,
        label:     "Repeated Questions",
        desc:      "Questions that appeared in 2+ exam years — never skip these",
        iconColor: "text-sky-400",
        iconBg:    "bg-sky-500/10 border-sky-500/20",
        accent:    "sky",
        badge:     "High Chance",
        badgeColor:"bg-sky-500/15 text-sky-400 border-sky-500/25",
        glow:      "hover:shadow-sky-500/10",
    },
    {
        id:        "recent",
        icon:      Clock3,
        label:     "Recently Added",
        desc:      "Fresh questions from the latest AKTU exam papers",
        iconColor: "text-emerald-400",
        iconBg:    "bg-emerald-500/10 border-emerald-500/20",
        accent:    "emerald",
        badge:     "New",
        badgeColor:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        glow:      "hover:shadow-emerald-500/10",
    },
]

// ── Unit card ─────────────────────────────────────────────────────────────────
function UnitCard({ year, subject, unit, onClick }) {
    const progress    = getUnitProgress(year, subject, unit)
    const reviewed    = progress.reviewed ?? 0
    const total       = progress.total    ?? null
    const hasProgress = total !== null
    const pct         = hasProgress ? Math.round((reviewed / total) * 100) : 0

    return (
        <div
            onClick={onClick}
            className="unit-card bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 cursor-pointer flex flex-col gap-4 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-200"
        >
            <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-indigo-400 leading-none">
                    {unit.split(" ")[1]}
                </span>
                {hasProgress && pct === 100 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Done ✓
                    </span>
                )}
                {hasProgress && pct > 0 && pct < 100 && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                        In Progress
                    </span>
                )}
            </div>

            <div>
                <p className="text-slate-100 font-semibold">{unit}</p>
                <p className="text-slate-500 text-xs mt-0.5">Practice Questions</p>
            </div>

            {hasProgress ? (
                <div className="mt-auto space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{reviewed} / {total} reviewed</span>
                        <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700/60 rounded-full h-1">
                        <div
                            className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>
            ) : (
                <p className="mt-auto text-xs text-slate-600">Not started</p>
            )}
        </div>
    )
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, active, onClick }) {
    const Icon = cat.icon
    return (
        <div
            onClick={onClick}
            className={`group relative bg-slate-800/50 border rounded-2xl p-6 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${cat.glow}
                ${active
                ? "border-indigo-500/50 bg-slate-800/80 shadow-lg shadow-indigo-500/10"
                : "border-slate-700/60 hover:border-slate-600/80"
            }`}
        >
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${cat.iconBg}`}>
                    <Icon className={`w-5 h-5 ${cat.iconColor}`} />
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cat.badgeColor}`}>
                    {cat.badge}
                </span>
            </div>

            <div>
                <h3 className="font-bold text-slate-100 text-base mb-1">{cat.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
            </div>

            {/* Bottom indicator — shows on active */}
            {cat.id === "practice" && (
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 ${active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}`}>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${active ? "rotate-180" : ""}`} />
                    {active ? "Hide units" : "Select unit"}
                </div>
            )}
        </div>
    )
}

// ── Guest info card (shown inline under category cards) ──────────────────────
function GuestInfoCard({ category, subject, year }) {
    const navigate = useNavigate()
    const catMeta = {
        important: { label: "Important Questions", color: "amber",   icon: Star },
        repeated:  { label: "Repeated Questions",  color: "sky",     icon: RefreshCw },
        recent:    { label: "Recently Added",       color: "emerald", icon: Clock3 },
    }
    const meta = catMeta[category]
    const colorMap = {
        amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",  text: "text-amber-400",   btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",   badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
        sky:     { bg: "bg-sky-500/10",     border: "border-sky-500/25",    text: "text-sky-400",     btn: "bg-sky-500 hover:bg-sky-600 shadow-sky-500/30",         badge: "bg-sky-500/15 text-sky-400 border-sky-500/25" },
        emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25",text: "text-emerald-400", btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
    }
    const c = colorMap[meta.color]

    return (
        <div className="guest-info-card mt-2 rounded-2xl border overflow-hidden animate-units-in">
            {/* top accent bar */}
            <div className={`h-0.5 w-full guest-info-bar-${meta.color}`} />
            <div className="px-6 py-7 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Left: icon + text */}
                <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
                        <meta.icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="guest-info-heading text-base font-black leading-tight">{meta.label}</p>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${c.badge}`}>
                                Members only
                            </span>
                        </div>
                        <p className="guest-info-sub text-sm leading-relaxed">
                            Only <span className="font-semibold guest-info-highlight">Practice Questions</span> are available without an account.
                            Sign in free to unlock curated question sets, solutions, and track your progress.
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                            {["All PYQs with solutions", "Progress tracking", "Synced across devices"].map(t => (
                                <span key={t} className="flex items-center gap-1.5 text-xs guest-info-perk">
                                    <span className={`w-1 h-1 rounded-full ${c.text.replace("text-","bg-")}`} />
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Right: CTA */}
                <button
                    onClick={() => {
                        const redirect = `/units/${encodeURIComponent(year)}/${encodeURIComponent(subject)}`
                        navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
                    }}
                    className={`shrink-0 flex items-center gap-2 ${c.btn} text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5 active:scale-95`}
                >
                    Sign in free →
                </button>
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Units() {

    const { year, subject } = useParams()
    const navigate          = useNavigate()
    const SubjectIcon       = subjectIcons[subject] || BookOpen
    const [activeCard, setActiveCard] = useState(null)
    const unitsRef = useRef(null)

    // Scroll to top on mount
    useEffect(() => { window.scrollTo(0, 0) }, [])

    // Get current user (for guest gate)
    const getUser = () => { try { return JSON.parse(localStorage.getItem("pyq_user")) } catch { return null } }
    const [user, setUser] = useState(getUser)
    const [guestInfoCategory, setGuestInfoCategory] = useState(null) // which category shows the inline info card

    useEffect(() => {
        const handler = () => setUser(getUser())
        window.addEventListener("pyq_auth_change", handler)
        return () => window.removeEventListener("pyq_auth_change", handler)
    }, [])

    // Map category id → tag filter value (must match tags in DB exactly)
    const filterMap = {
        "important": "Important",
        "repeated":  "Repeat",
        "recent":    "Recent",
    }

    // Track which tags actually have data in DB
    const [availableTags, setAvailableTags] = useState({
        important: null,  // null = checking, true = has data, false = no data
        repeated:  null,
        recent:    null,
    })

    // On mount, fetch all units and check which tags have questions
    useEffect(() => {
        const allUnits = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"]
        Promise.all(allUnits.map(u => getQuestions(year, subject, u)))
            .then(results => {
                const all = results.flat()
                // Collect all unique tags found across all questions
                const allTags = [...new Set(all.flatMap(q => q.tags || []))]
                console.log("Tags found in DB for", subject, ":", allTags)
                setAvailableTags({
                    important: all.some(q => q.tags?.includes("Important")),
                    repeated:  all.some(q => q.tags?.includes("Repeat")),
                    recent:    all.some(q => q.tags?.includes("Recent")),
                })
            })
            .catch(() => {
                setAvailableTags({ important: false, repeated: false, recent: false })
            })
    }, [year, subject])

    function handleCategoryClick(id) {
        if (id === "practice") {
            const next = activeCard === "practice" ? null : "practice"
            setActiveCard(next)
            setGuestInfoCategory(null)
            if (next === "practice") {
                setTimeout(() => unitsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
            }
        } else if (filterMap[id]) {
            if (!user) {
                // Toggle inline info card instead of modal
                setGuestInfoCategory(guestInfoCategory === id ? null : id)
                setActiveCard(null)
                return
            }
            if (availableTags[id] !== false) {
                navigate(`/questions/${encodeURIComponent(year)}/${encodeURIComponent(subject)}/All Units?filter=${filterMap[id]}`)
            } else {
                setActiveCard(id === activeCard ? null : id)
                setGuestInfoCategory(null)
            }
        } else {
            setActiveCard(id === activeCard ? null : id)
            setGuestInfoCategory(null)
        }
    }

    return (
        <div className="bg-[#0b0f1a] min-h-screen relative overflow-x-hidden">

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

            <div className="relative z-10 max-w-5xl mx-auto py-10 sm:py-14 px-4 md:px-6">

                {/* Back */}
                <button
                    onClick={() => navigate(`/?year=${encodeURIComponent(year)}`)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-150 mb-8 sm:mb-10 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
                    Back to {year}
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <SubjectIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100 leading-tight">{subject}</h1>
                        <p className="text-slate-500 text-sm mt-1">{year} &nbsp;·&nbsp; 5 units</p>
                    </div>
                </div>

                {/* Section label */}
                <div className="mb-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Explore</p>
                    <h2 className="text-lg font-black text-slate-200 mt-0.5">Choose how you want to study</h2>
                </div>

                {/* ── 4 Category cards — Practice first ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {categories.map(cat => (
                        <CategoryCard
                            key={cat.id}
                            cat={cat}
                            active={activeCard === cat.id || guestInfoCategory === cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                        />
                    ))}
                </div>

                {/* ── Guest info card — shown inline when guest clicks a locked category ── */}
                {guestInfoCategory && (
                    <GuestInfoCard
                        category={guestInfoCategory}
                        subject={subject}
                        year={year}
                    />
                )}

                {/* ── Unit grid — expands when Practice is active ── */}
                {activeCard === "practice" && (
                    <div
                        ref={unitsRef}
                        className="mt-2 animate-units-in"
                    >
                        {/* Subtle divider + label */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px flex-1 bg-slate-800" />
                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Select a unit</span>
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            {units.map(unit => (
                                <UnitCard
                                    key={unit}
                                    year={year}
                                    subject={subject}
                                    unit={unit}
                                    onClick={() => navigate(`/questions/${encodeURIComponent(year)}/${encodeURIComponent(subject)}/${encodeURIComponent(unit)}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Coming soon placeholder for other categories */}
                {activeCard && activeCard !== "practice" && (
                    <div className="mt-2 flex flex-col items-center justify-center py-14 border border-slate-800 rounded-2xl text-center">
                        <p className="text-slate-400 font-semibold mb-1">Coming soon</p>
                        <p className="text-slate-600 text-sm">This category is being curated. Check back soon!</p>
                    </div>
                )}

            </div>

        </div>
    )
}
