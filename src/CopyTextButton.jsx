import { useState } from 'react'

export default function CopyTextButton({ text, label = 'results' }) {
  const [status, setStatus] = useState('')
  const hasText = Boolean(text?.trim())

  async function copyText() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(text)
      setStatus('Copied to clipboard.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to copy to clipboard.')
    }
  }

  return (
    <div className="car-reg-copy-action">
      <button
        className="combination-generate-button car-reg-copy-button"
        type="button"
        aria-label={`Copy ${label.toLowerCase()}`}
        disabled={!hasText}
        onClick={copyText}
      >
        {status === 'Copied to clipboard.' ? 'Copied' : status ? 'Copy failed' : 'Copy list'}
      </button>
      {status ? (
        <span
          className={status === 'Copied to clipboard.' ? 'car-reg-copy-success' : 'car-reg-copy-error'}
          role="status"
        >
          {status}
        </span>
      ) : null}
    </div>
  )
}
