// ============================================================
// useFileProcessor.ts
// React hook that handles the file-upload → parse → validate
// pipeline and updates the Zustand store accordingly.
// ============================================================

import { useCallback } from 'react'
import { useAppStore } from './store'
import { processFile } from '../lib/validator'

/** Accepted file extension */
const ACCEPTED_EXTENSION = '.001'

export function useFileProcessor() {
  const { setResult, setProcessing, setError, reset } = useAppStore()

  const processUpload = useCallback(async (file: File) => {
    // ── Validate file type ──────────────────────────────────────────────
    if (!file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION)) {
      setError(
        `Invalid file type. Please upload a ".001" POS remittance file. ` +
        `Received: "${file.name}"`
      )
      return
    }

    setProcessing(true)

    try {
      // ── Read file as ArrayBuffer for encoding-safe decode ───────────────
      const buffer = await file.arrayBuffer()

      // ── Run the full validation pipeline (synchronous CPU work) ────────
      // Wrapped in setTimeout to allow the "Processing…" UI to render first
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            const result = processFile(buffer, file.name)
            setResult(result)
            resolve()
          } catch (err) {
            reject(err)
          }
        }, 50)
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(msg)
    }
  }, [setResult, setProcessing, setError])

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  return { processUpload, handleReset }
}
