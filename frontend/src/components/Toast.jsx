import { useState, useCallback, useEffect, useRef } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

// ── singleton event bus ──────────────────────────────────────────────────────
const listeners = new Set()
export function fireToast(toast) {
    listeners.forEach(fn => fn(toast))
}

// ── hook (use anywhere) ──────────────────────────────────────────────────────
export function useToast() {
    const toast = useCallback((message, type = "info", duration = 3500) => {
        fireToast({ message, type, duration, id: Date.now() + Math.random() })
    }, [])

    return {
        success: (msg, dur) => toast(msg, "success", dur),
        error:   (msg, dur) => toast(msg, "error",   dur),
        info:    (msg, dur) => toast(msg, "info",    dur),
    }
}

// ── single toast item ────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
    const [visible, setVisible] = useState(false)
    const [leaving, setLeaving] = useState(false)

    useEffect(() => {
        // mount → slide in
        requestAnimationFrame(() => setVisible(true))

        const hideTimer = setTimeout(() => {
            setLeaving(true)
            setTimeout(() => onRemove(toast.id), 350)
        }, toast.duration)

        return () => clearTimeout(hideTimer)
    }, [])

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
        error:   <XCircle    className="w-5 h-5 text-red-400    shrink-0" />,
        info:    <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />,
    }

    const borders = {
        success: "border-l-emerald-500",
        error:   "border-l-red-500",
        info:    "border-l-indigo-500",
    }

    const translate = (!visible || leaving) ? "translate-x-[110%] opacity-0" : "translate-x-0 opacity-100"

    return (
        <div
            className={`flex items-start gap-3 bg-slate-800 border border-slate-700 border-l-4 ${borders[toast.type]}
                        rounded-xl px-4 py-3 shadow-2xl min-w-[260px] max-w-sm
                        transition-all duration-350 ease-out ${translate}`}
        >
            {icons[toast.type]}
            <p className="text-sm text-slate-100 flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={() => { setLeaving(true); setTimeout(() => onRemove(toast.id), 350) }}
                className="text-slate-500 hover:text-slate-300 transition mt-0.5"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

// ── container (mount once in App.jsx or main.jsx) ───────────────────────────
export function ToastContainer() {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const handler = (toast) => setToasts(prev => [...prev, toast])
        listeners.add(handler)
        return () => listeners.delete(handler)
    }, [])

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onRemove={remove} />
                </div>
            ))}
        </div>
    )
}
