/**
 * This module is bundled as its own chunk (code splitting).
 * It loads only when the user opens the modal — check the Network tab: `chunk-*.js` appears after click.
 */
export default function AdvancedTipsModal({ onClose }) {
  return (
    <div
      className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/50 tw:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lazy-modal-title"
    >
      <div className="tw:bg-white tw:rounded-xl tw:p-6 tw:max-w-md tw:w-full tw:shadow-xl tw:border tw:border-gray-200">
        <h3
          id="lazy-modal-title"
          className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-2"
        >
          Modal from lazy chunk
        </h3>
        <p className="tw:text-sm tw:text-gray-600 tw:mb-3 tw:leading-relaxed">
          This component lives in{' '}
          <code className="tw:px-1 tw:py-0.5 tw:bg-gray-100 tw:rounded tw:text-xs">
            lazy/AdvancedTipsModal.jsx
          </code>
          . Vite emits a separate <code className="tw:px-1 tw:bg-gray-100 tw:rounded tw:text-xs">chunk-*.js</code>{' '}
          — it is requested only after you click &quot;Open modal (lazy chunk)&quot;.
        </p>
        <ul className="tw:text-sm tw:text-gray-600 tw:list-disc tw:pl-5 tw:mb-4 tw:space-y-1">
          <li>Before opening: this chunk is not requested.</li>
          <li>After opening: a new JS request appears in Network.</li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="tw:w-full tw:rounded-lg tw:bg-gray-900 tw:text-white tw:py-2.5 tw:text-sm tw:font-medium hover:tw:bg-gray-800 tw:transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
