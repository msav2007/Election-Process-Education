function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#E5E7EB] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm md:p-8">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="mt-4 h-10 w-72" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-3xl" />
        <SkeletonBlock className="mt-2 h-4 w-full max-w-2xl" />
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-4 h-8 w-32" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-4/5" />
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="mt-3 h-8 w-64" />
          <SkeletonBlock className="mt-6 h-32 w-full" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <SkeletonBlock className="h-28 w-full" />
            <SkeletonBlock className="h-28 w-full" />
          </div>
        </section>
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="mt-3 h-8 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonBlock className="h-12 w-56" />
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-28 w-4/5" />
        <SkeletonBlock className="mt-4 h-24 w-full" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
      </section>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-3 h-8 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-2xl" />
      </section>
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="mt-3 h-8 w-48" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <SkeletonBlock className="h-5 w-4/5" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((__, optionIndex) => (
                  <SkeletonBlock key={optionIndex} className="h-14 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
