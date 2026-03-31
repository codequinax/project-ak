import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { GraduationCap, BookOpen, BarChart3, CheckCircle } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
import { googleAuth } from "../services/api"
import { restoreProgressFromServer } from "../utils/progress"

const perks = [
    { icon: BookOpen, text: "Access all unit-wise PYQs" },
    { icon: BarChart3, text: "Track progress per subject & unit" },
    { icon: CheckCircle, text: "Pick up right where you left off" },
]

export default function Auth() {

    const [searchParams] = useSearchParams()
    const redirectTo = searchParams.get("redirect") || "/"
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [sdkReady, setSdkReady] = useState(false)

    // ✅ Ensure Google SDK is loaded ONCE
    useEffect(() => {
        if (window.google && window.google.accounts) {
            setSdkReady(true)
        } else {
            const interval = setInterval(() => {
                if (window.google && window.google.accounts) {
                    setSdkReady(true)
                    clearInterval(interval)
                }
            }, 300)

            return () => clearInterval(interval)
        }
    }, [])

    async function handleGoogleSuccess(credentialResponse) {
        try {
            setLoading(true)

            const data = await googleAuth(credentialResponse.credential)

            if (!data || !data.token) {
                console.error("❌ Invalid response from backend")
                setLoading(false)
                return
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))
            localStorage.setItem("pyq_user", JSON.stringify(data.user))

            await restoreProgressFromServer()

            window.dispatchEvent(new Event("pyq_auth_change"))

            navigate(redirectTo)

        } catch (err) {
            console.error("Google login failed:", err)
            localStorage.clear()
            setLoading(false)
        }
    }

    return (
        <div className="lr-page min-h-screen flex -mt-[72px]">

            {/* LEFT PANEL */}
            <div className="lr-left hidden lg:flex flex-col justify-between w-[480px] border-r p-14">

                <Link to="/" className="text-sm">
                    ← Back to home
                </Link>

                <div>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className="text-sm font-semibold">AKTU PYQs</span>
                    </div>

                    <h2 className="text-4xl font-black mb-4">
                        Study smarter.<br />
                        <span className="text-indigo-400">Score higher.</span>
                    </h2>

                    <p className="text-sm mb-10">
                        Sign in with Google to unlock all PYQs and track your progress.
                    </p>

                    <ul className="space-y-3">
                        {perks.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex gap-2">
                                <Icon className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs">© 2026 Solvvr · Free forever</p>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center px-5 py-10">

                <div className="w-full max-w-[360px]">

                    <Link to="/" className="lg:hidden text-sm mb-6 block">
                        ← Home
                    </Link>

                    <div className="rounded-2xl shadow-2xl overflow-hidden">

                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600" />

                        <div className="p-8">

                            <h1 className="text-2xl font-black mb-4">
                                Continue with Google
                            </h1>

                            {/* ✅ FIXED GOOGLE BUTTON */}
                            <div className="flex justify-center mt-6">
                                {sdkReady ? (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => {
                                            console.log("Google Login Failed")
                                            setLoading(false)
                                        }}
                                        useOneTap={false}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-400">Loading Google...</p>
                                )}
                            </div>

                            {loading && (
                                <p className="text-center text-xs mt-3">
                                    Signing in...
                                </p>
                            )}

                            <p className="text-center text-xs mt-5">
                                No password needed · Always free
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}
