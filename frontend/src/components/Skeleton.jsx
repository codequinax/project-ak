// Generic shimmer block
function Shimmer({ className }) {
    return (
        <div className={`animate-pulse bg-slate-700 rounded ${className}`} />
    )
}

// Full questions-page skeleton — mirrors the real layout
export function QuestionsSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">

            {/* Sidebar skeleton */}
            <div className="w-36 pr-5 border-r border-slate-700 shrink-0 space-y-4">
                <Shimmer className="h-4 w-16" />
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-3 w-20" />
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <Shimmer key={i} className="h-8 rounded" />
                    ))}
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 space-y-6">

                {/* Timer */}
                <Shimmer className="h-4 w-16 mx-auto" />

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Shimmer className="h-3 w-14" />
                        <Shimmer className="h-3 w-10" />
                    </div>
                    <Shimmer className="h-2 w-full rounded-full" />
                </div>

                {/* Question card */}
                <div className="bg-slate-800 rounded-xl p-8 space-y-4">
                    <Shimmer className="h-4 w-24" />
                    <Shimmer className="h-5 w-full" />
                    <Shimmer className="h-5 w-5/6" />
                    <Shimmer className="h-5 w-4/6" />

                    {/* Tag pills */}
                    <div className="flex gap-2 pt-2">
                        <Shimmer className="h-5 w-12 rounded-full" />
                        <Shimmer className="h-5 w-16 rounded-full" />
                        <Shimmer className="h-5 w-20 rounded-full" />
                    </div>
                </div>

                {/* Solution button */}
                <Shimmer className="h-9 w-36 rounded-lg" />

                {/* Nav buttons */}
                <div className="flex justify-between pt-4">
                    <Shimmer className="h-9 w-28 rounded-lg" />
                    <Shimmer className="h-9 w-28 rounded-lg" />
                </div>

            </div>

        </div>
    )
}

// Default simple skeleton (kept for backward compat)
export default function Skeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-700 rounded w-3/4" />
            <div className="h-4 bg-slate-700 rounded" />
            <div className="h-4 bg-slate-700 rounded w-5/6" />
        </div>
    )
}