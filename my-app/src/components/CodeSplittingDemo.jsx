import { lazy, Suspense, useState } from 'react'

const AdvancedTipsModal = lazy(() => import('./lazy/AdvancedTipsModal.jsx'))

export default function CodeSplittingDemo() {
  const [open, setOpen] = useState(false)

  return (
    <section
      className="tw:mb-8 tw:p-4 tw:rounded-lg tw:border tw:border-dashed tw:border-amber-500 tw:bg-amber-50/90"
      aria-label="Code splitting demo"
    >
      <h2 className="tw:text-xs tw:font-semibold tw:text-amber-900 tw:uppercase tw:tracking-wider tw:mb-2">
        Demo: React.lazy + import()
      </h2>
      <p className="tw:text-sm tw:text-amber-950/80 tw:mb-3 tw:leading-relaxed">
        <strong className="tw:font-medium">FeatureProducts</strong> stays a static import (entry). The modal below uses{' '}
        <code className="tw:px-1 tw:py-0.5 tw:bg-amber-100 tw:rounded tw:text-xs">lazy(() =&gt; import(...))</code>{' '}
        + <code className="tw:px-1 tw:bg-amber-100 tw:rounded tw:text-xs">Suspense</code>. Open DevTools →{' '}
        <strong>Network</strong> → filter JS, click the button, and watch for a new{' '}
        <code className="tw:px-1 tw:bg-amber-100 tw:rounded tw:text-xs">chunk-</code> file.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tw:inline-flex tw:items-center tw:justify-center tw:rounded-lg tw:border-2 tw:border-amber-700 tw:bg-white tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-amber-900 hover:tw:bg-amber-100 tw:transition-colors"
      >
        Open modal (lazy chunk)
      </button>

      {open ? (
        <Suspense
          fallback={
            <div
              className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/40"
              aria-busy="true"
              aria-live="polite"
            >
              <span className="tw:rounded-lg tw:bg-white tw:px-4 tw:py-3 tw:text-sm tw:text-gray-700 tw:shadow-lg">
                Loading chunk…
              </span>
            </div>
          }
        >
          <AdvancedTipsModal onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </section>
  )
}
