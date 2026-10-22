import type { ReactNode } from 'react'

interface AuthSplitLayoutProps {
  children: ReactNode
  imageAlt: string
}

export function AuthSplitLayout({ children, imageAlt }: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen w-full bg-bg-primary grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
      <div className="relative min-h-64 sm:min-h-80 lg:min-h-0 overflow-hidden rounded-2xl bg-bg-secondary">
        <img
          src="/assets/family-financial-planning.jpg"
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <section className="min-w-0 rounded-2xl border border-border bg-white p-6 shadow-lg xl:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
