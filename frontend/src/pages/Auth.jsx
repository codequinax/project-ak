
import { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import { googleAuth } from "../services/api"
import { restoreProgressFromServer } from "../utils/progress"
import { BookOpen, BarChart3, CheckCircle, GraduationCap, ArrowLeft } from "lucide-react"

const perks = [
    { icon: BookOpen,    text: "All unit-wise PYQs with solutions",        sub: "Every subject, every year" },
    { icon: BarChart3,   text: "Track progress per subject & unit",         sub: "Know exactly where you stand" },
    { icon: CheckCircle, text: "Pick up right where you left off",          sub: "Synced across all devices" },
]

// Floating orb background — pure CSS, no images
function OrbBg() {
    return (
        <div className="auth-orbs" aria-hidden="true">
            <div className="auth-orb auth-orb-1" />
            <div className="auth-orb auth-orb-2" />
            <div className="auth-orb auth-orb-3" />
        </div>
    )
}

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
        </svg>
    )
}

export default function Auth() {
    const [searchParams] = useSearchParams()
    const redirectTo     = searchParams.get("redirect") || "/"
    const navigate       = useNavigate()
    const [signingIn, setSigningIn] = useState(false)

    async function handleGoogleSuccess(credentialResponse) {
        try {
            const data = await googleAuth(credentialResponse.credential)
            if (!data || !data.token) { console.error("❌ Invalid response from backend"); setSigningIn(false); return }
            localStorage.setItem("token",    data.token)
            localStorage.setItem("user",     JSON.stringify(data.user))
            localStorage.setItem("pyq_user", JSON.stringify(data.user))
            await restoreProgressFromServer()
            window.dispatchEvent(new Event("pyq_auth_change"))
            navigate(redirectTo)
        } catch (err) {
            console.error("Google login failed:", err)
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            localStorage.removeItem("pyq_user")
            setSigningIn(false)
        }
    }

    return (
        <div className="lr-page auth-redesign min-h-screen flex relative overflow-hidden">

            <OrbBg />

            {/* ── LEFT PANEL ── */}
            <div className="auth-left-panel hidden lg:flex flex-col w-[520px] shrink-0 relative z-10 p-12 gap-8">

                {/* Back link — top, normal flow */}
                <Link to="/" className="auth-back-link flex items-center gap-2 text-sm font-medium w-fit group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to home
                </Link>

                {/* Middle content — grows to fill space */}
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
                    <h2 className="auth-headline text-5xl font-black leading-[1.08] tracking-tight mb-4">
                        Study smarter.<br />
                        <span className="auth-headline-accent">Score higher.</span>
                    </h2>

                    <p className="auth-desc text-sm leading-relaxed mb-8 max-w-sm">
                        One click with Google unlocks every PYQ, solution, and your personal progress tracker.
                    </p>

                    {/* Perks */}
                    <ul className="space-y-4">
                        {perks.map(({ icon: Icon, text, sub }, i) => (
                            <li key={text} className="auth-perk-item flex items-center gap-4 p-3.5 rounded-2xl"
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

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <p className="auth-footer-copy text-xs">© 2026 Solvvr</p>
                </div>

            </div>

            {/* ── VERTICAL DIVIDER ── */}
            <div className="auth-divider-line hidden lg:block w-px self-stretch my-10 shrink-0 relative z-10" />

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center px-5 py-8 relative z-10">

                <div className="w-full max-w-[400px]">

                    {/* Mobile back */}
                    <Link to="/" className="auth-back-link lg:hidden flex items-center gap-2 text-sm font-medium mb-6 w-fit group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to home
                    </Link>

                    {/* Card */}
                    <div className="auth-card relative overflow-hidden rounded-3xl">

                        {/* Top shimmer bar */}
                        <div className="h-[3px] w-full auth-card-bar" />

                        <div className="p-7 sm:p-8">

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

                            {/* Mobile perks — visible only on mobile */}
                            <div className="lg:hidden space-y-2.5 mb-5">
                                {perks.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2.5">
                                        <span className="auth-check-dot w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                                            <Icon className="w-2.5 h-2.5" />
                                        </span>
                                        <span className="auth-perk-text text-xs font-medium">{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="auth-card-divider w-full h-px mb-5" />

                            {/* Headline */}
                            <h1 className="auth-card-headline text-xl font-black mb-1.5">One click to start</h1>
                            <p className="auth-card-desc text-sm mb-5">Sign in with your Google account to continue.</p>

                            {/* Google sign-in button */}
                            <div className="mb-6 relative">
                                {/* Custom styled button — visual only, sits behind */}
                                <div
                                    className="auth-signin-btn relative w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl text-sm font-bold overflow-hidden pointer-events-none select-none"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />
                                    {signingIn ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                            </svg>
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <GoogleIcon />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </div>
                                {/* Real GoogleLogin overlaid on top — full size, opacity-0 so SDK sees it as rendered */}
                                <div className="absolute inset-0 opacity-0" style={{ zIndex: 1 }}>
                                    <GoogleLogin
                                        onSuccess={(cred) => { setSigningIn(true); handleGoogleSuccess(cred) }}
                                        onError={() => { console.log("Google Login Failed"); setSigningIn(false) }}
                                        useOneTap={false}
                                        width="400"
                                    />
                                </div>
                            </div>



                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
