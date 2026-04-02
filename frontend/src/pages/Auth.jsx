import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import { googleAuth } from "../services/api"
import { restoreProgressFromServer } from "../utils/progress"
import { BookOpen, BarChart3, CheckCircle, GraduationCap, ArrowLeft, Shield, Zap } from "lucide-react"

const perks = [
    { icon: BookOpen,    text: "All unit-wise PYQs with solutions",   sub: "Every subject, every year" },
    { icon: BarChart3,   text: "Track progress per subject & unit",    sub: "Know exactly where you stand" },
    { icon: CheckCircle, text: "Pick up right where you left off",     sub: "Synced across all devices" },
]

const trustPoints = [
    { icon: Shield, label: "Secure sign-in" },
    { icon: Zap,    label: "Instant access"  },
]

function OrbBg() {
    return (
        <div className="auth-orbs" aria-hidden="true">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />
        </div>
    )
}

export default function Auth() {
    const [searchParams] = useSearchParams()
    const redirectTo     = searchParams.get("redirect") || "/"
    const navigate       = useNavigate()
    const [signingIn, setSigningIn] = useState(false)
    const [error, setError]         = useState(null)

    async function handleGoogleSuccess(credentialResponse) {
        setSigningIn(true)
        setError(null)
        try {
            const data = await googleAuth(credentialResponse.credential)
            if (!data || !data.token) {
                setError("Login failed")
                setSigningIn(false)
                return
            }
            localStorage.setItem("token",    data.token)
            localStorage.setItem("user",     JSON.stringify(data.user))
            localStorage.setItem("pyq_user", JSON.stringify(data.user))
            await restoreProgressFromServer()
            window.dispatchEvent(new Event("pyq_auth_change"))
            navigate(redirectTo)
        } catch (err) {
            console.error("Google login failed:", err)
            setError("Login failed")
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("pyq_user")
            setSigningIn(false)
        }
    }

    function handleGoogleError() {
        setError("Login failed")
        setSigningIn(false)
    }

    return (
        <div className="lr-page auth-redesign min-h-screen flex relative overflow-hidden">

            <OrbBg />

            {/* ── LEFT PANEL (desktop only) ── */}
            <div className="auth-left-panel hidden lg:flex flex-col w-[500px] xl:w-[540px] shrink-0 relative z-10 p-10 xl:p-12 gap-8">

                <Link to="/" className="auth-back-link flex items-center gap-2 text-sm font-medium w-fit group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to home
                </Link>

                <div className="flex-1 flex flex-col justify-center">

                    {/* Brand chip */}
                    <div className="auth-brand-chip flex items-center gap-3 mb-8 w-fit px-4 py-2.5 rounded-2xl">
                        <div className="auth-brand-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-widest uppercase auth-brand-label">Solvvr</p>
                            <p className="text-[10px] auth-brand-sub">AKTU PYQs Platform</p>
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="auth-headline text-4xl xl:text-5xl font-black leading-[1.08] tracking-tight mb-4">
                        Study smarter.<br />
                        <span className="auth-headline-accent">Score higher.</span>
                    </h2>

                    <p className="auth-desc text-sm leading-relaxed mb-8 max-w-sm">
                        One click with Google unlocks every PYQ, solution, and your personal progress tracker.
                    </p>

                    {/* Perks */}
                    <ul className="space-y-3">
                        {perks.map(({ icon: Icon, text, sub }, i) => (
                            <li key={text}
                                className="auth-perk-item flex items-center gap-4 p-3.5 rounded-2xl"
                                style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="auth-perk-icon w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="auth-perk-text text-sm font-semibold leading-tight">{text}</p>
                                    <p className="auth-perk-sub text-xs mt-0.5">{sub}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="auth-footer-copy text-xs">© 2026 Solvvr</p>
            </div>

            {/* ── VERTICAL DIVIDER ── */}
            <div className="auth-divider-line hidden lg:block w-px self-stretch my-10 shrink-0 relative z-10" />

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative z-10 min-w-0">

                <div className="w-full max-w-[420px]">

                    {/* Mobile back link */}
                    <Link to="/" className="auth-back-link lg:hidden flex items-center gap-2 text-sm font-medium mb-6 w-fit group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to home
                    </Link>

                    {/* ── CARD ── */}
                    <div className="auth-card relative overflow-hidden rounded-3xl">

                        {/* Animated top bar */}
                        <div className="h-[3px] w-full auth-card-bar" />

                        <div className="p-6 sm:p-8">

                            {/* Card header */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="auth-card-icon-wrap w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-5 h-5 auth-card-icon-color" />
                                </div>
                                <div>
                                    <p className="auth-card-title text-base font-black leading-tight">Welcome to Solvvr</p>
                                    <p className="auth-card-sub text-xs mt-0.5">Sign in to unlock everything</p>
                                </div>
                            </div>

                            {/* Mobile perks — compact, only on small screens */}
                            <div className="lg:hidden space-y-2 mb-5">
                                {perks.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2.5">
                                        <span className="auth-check-dot w-5 h-5 rounded-lg flex items-center justify-center shrink-0">
                                            <Icon className="w-2.5 h-2.5" />
                                        </span>
                                        <span className="auth-perk-text text-xs font-medium">{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="auth-card-divider w-full h-px mb-5" />

                            {/* Headline */}
                            <h1 className="auth-card-headline text-xl font-black mb-1">One click to start</h1>
                            <p className="auth-card-desc text-sm mb-5 leading-relaxed">
                                Sign in with your Google account to access all PYQs and track your progress.
                            </p>

                            {/* Raw Google button — centered, untouched */}
                            <div className={`flex justify-center mb-3 transition-opacity duration-200 ${signingIn ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    useOneTap={false}
                                    size="large"
                                    shape="rectangular"
                                    logo_alignment="left"
                                    width="300"
                                />
                            </div>

                            {/* Loading state */}
                            {signingIn && (
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <svg className="animate-spin w-4 h-4 auth-spinner" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                    <span className="auth-card-desc text-xs">Signing you in…</span>
                                </div>
                            )}

                            {/* Error state */}
                            {error && !signingIn && (
                                <p className="auth-error-text text-xs text-center mb-3">Login failed</p>
                            )}

                            {/* Trust pills */}
                            <div className="flex items-center justify-center flex-wrap gap-4">
                                {trustPoints.map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <Icon className="auth-trust-icon w-3 h-3 shrink-0" />
                                        <span className="auth-trust-text text-[10px]">{label}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
