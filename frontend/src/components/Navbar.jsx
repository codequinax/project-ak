import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { LogIn, Sparkles, LogOut, ChevronDown, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
// import logo from "../assets/quizzer-logo.png"

export default function Navbar() {

    const [menuOpen, setMenuOpen]         = useState(false)
    const [mobileOpen, setMobileOpen]     = useState(false)
    const [scrolled, setScrolled]         = useState(false)
    const navigate  = useNavigate()
    const location  = useLocation()
    const menuRef   = useRef()
    const mobileRef = useRef()
    const { theme, toggleTheme } = useTheme()

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("pyq_user")
        return stored ? JSON.parse(stored) : null
    })

    // Show only the first word of firstName (handles "John Doe" → "John")
    const displayName = (name) => name?.split(" ")[0] || ""

    useEffect(() => {
        const handler = () => {
            const stored = localStorage.getItem("pyq_user")
            setUser(stored ? JSON.parse(stored) : null)
        }
        window.addEventListener("pyq_auth_change", handler)
        return () => window.removeEventListener("pyq_auth_change", handler)
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
            if (mobileRef.current && !mobileRef.current.contains(e.target)) setMobileOpen(false)
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [])

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    const logout = () => {
        const stored = localStorage.getItem("pyq_user")
        if (stored) {
            try {
                const u = JSON.parse(stored)
                if (u?.email) localStorage.removeItem(`pyq_progress_${u.email}`)
            } catch {}
        }
        localStorage.removeItem("pyq_user")
        localStorage.removeItem("pyq_last_year")
        setUser(null)
        setMenuOpen(false)
        setMobileOpen(false)
        window.dispatchEvent(new Event("pyq_auth_change"))
        navigate("/")
    }

    const isHome = location.pathname === "/"

    return (
        <div className="navbar-wrapper fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 pt-3">
            <nav className={`navbar-pill max-w-7xl mx-auto h-14 flex items-center justify-between px-4 sm:px-6 rounded-2xl border transition-all duration-300 ${scrolled ? "navbar-scrolled" : "navbar-top"}`}>

                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                    <img src="/solvvr-logo_withName.png" alt="logo" className="h-8 w-auto object-contain" />
                </Link>

                {/* DESKTOP RIGHT */}
                <div className="hidden sm:flex items-center gap-1">
                    <Link to="/" className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors duration-150 ${isHome ? "nav-active" : "nav-link"}`}>
                        Home
                    </Link>
                    <div className="w-px h-4 nav-divider mx-1.5" />

                    {!user && (
                        <div className="flex items-center gap-1.5">
                            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium nav-link transition-colors duration-150">
                                <LogIn className="w-3.5 h-3.5" />
                                Login
                            </Link>
                            <Link to="/login" className="join-btn flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                Join free
                            </Link>
                        </div>
                    )}

                    {user && (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl nav-user-btn border transition-all duration-150">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                                    {user.firstName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium nav-user-name">{displayName(user.firstName)}</span>
                                <ChevronDown className={`w-3.5 h-3.5 nav-chevron transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 nav-dropdown border rounded-2xl shadow-2xl p-1.5 animate-dropdown">
                                    <div className="px-3 py-2 border-b nav-dropdown-divider mb-1">
                                        <p className="text-xs nav-muted">Signed in as</p>
                                        <p className="text-sm nav-user-email font-medium truncate">{user.email}</p>
                                    </div>
                                    <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors duration-150">
                                        <LogOut className="w-3.5 h-3.5" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button onClick={toggleTheme} className="ml-1.5 w-8 h-8 flex items-center justify-center rounded-xl nav-theme-btn border transition-all duration-200 group" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                        {theme === "dark"
                            ? <Moon className="w-3.5 h-3.5 nav-icon group-hover:text-indigo-400 transition-colors" />
                            : <Sun  className="w-3.5 h-3.5 nav-icon group-hover:text-amber-400 transition-colors" />
                        }
                    </button>
                </div>

                {/* MOBILE RIGHT */}
                <div className="flex sm:hidden items-center gap-1.5">
                    <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center rounded-xl nav-theme-btn border transition-all duration-200">
                        {theme === "dark"
                            ? <Moon className="w-3.5 h-3.5 nav-icon" />
                            : <Sun  className="w-3.5 h-3.5 nav-icon" />
                        }
                    </button>

                    {!user ? (
                        <div className="flex items-center gap-1.5">
                            <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium nav-link transition-colors duration-150">
                                <LogIn className="w-3.5 h-3.5" />
                                Login
                            </Link>
                            <Link to="/login" className="join-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white transition-all duration-200">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                                Join
                            </Link>
                        </div>
                    ) : (
                        <div className="relative" ref={mobileRef}>
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl nav-user-btn border transition-all duration-150">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                                    {user.firstName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium nav-user-name">{displayName(user.firstName)}</span>
                                <ChevronDown className={`w-3.5 h-3.5 nav-chevron transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`} />
                            </button>
                            {mobileOpen && (
                                <div className="absolute right-0 mt-2 w-48 nav-dropdown border rounded-2xl shadow-2xl p-1.5 animate-dropdown">
                                    <div className="px-3 py-2 border-b nav-dropdown-divider mb-1">
                                        <p className="text-xs nav-muted">Signed in as</p>
                                        <p className="text-sm nav-user-email font-medium truncate">{user.email}</p>
                                    </div>
                                    <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors duration-150">
                                        <LogOut className="w-3.5 h-3.5" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </nav>
        </div>
    )
}
