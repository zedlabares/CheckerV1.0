// ============================================================
// FileUploader.tsx
// Drop zone component for .001 file upload.
// Supports drag-and-drop and click-to-browse.
// ============================================================

import { useCallback, useState, useRef, DragEvent } from 'react'
import { Upload, FileText } from 'lucide-react'
import { useFileProcessor } from '../hooks/useFileProcessor'
import { useAppStore } from '../hooks/store'

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { processUpload } = useFileProcessor()
  const { isProcessing } = useAppStore()

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processUpload(file)
    },
    [processUpload]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processUpload(file)
      // Reset input so the same file can be re-uploaded if needed
      e.target.value = ''
    },
    [processUpload]
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        aria-label="Upload .001 POS file"
        className={[
          'relative flex flex-col items-center justify-center gap-5',
          'rounded-2xl border-2 border-dashed px-8 py-16',
          'cursor-pointer select-none transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-pass focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900',
          isDragging
            ? 'border-pass bg-navy-700/60 scale-[1.01]'
            : 'border-navy-600 bg-navy-800/40 hover:border-navy-500 hover:bg-navy-700/40',
          isProcessing ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        {/* Icon */}
        <div
          className={[
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200',
            isDragging ? 'bg-pass/20 text-pass' : 'bg-navy-700 text-slate-400',
          ].join(' ')}
        >
          {isProcessing ? (
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-pass border-t-transparent" />
          ) : isDragging ? (
            <FileText className="h-7 w-7" />
          ) : (
            <Upload className="h-7 w-7" />
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {isProcessing ? (
            <>
              <p className="text-base font-semibold text-slate-200">Processing file…</p>
              <p className="mt-1 text-sm text-slate-muted">Parsing and running validation checks</p>
            </>
          ) : isDragging ? (
            <>
              <p className="text-base font-semibold text-pass">Release to upload</p>
              <p className="mt-1 text-sm text-slate-muted">Drop your .001 file here</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-slate-200">
                Drop your{' '}
                <span className="font-mono text-pass">.001</span>{' '}
                file here
              </p>
              <p className="mt-1 text-sm text-slate-muted">
                or{' '}
                <span className="text-slate-300 underline decoration-dotted underline-offset-2">
                  browse to select
                </span>
              </p>
              <p className="mt-3 text-xs text-slate-muted">
                POS remittance files only · file never leaves your device
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".001"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isProcessing}
        aria-hidden="true"
      />
    </div>
  )
}
