import { useState, useCallback } from "react";
import { runFullAnalysis } from "../config/gemini";

/**
 * Scan lifecycle states:
 * IDLE → UPLOADING → ANALYZING → RESULT | ERROR
 */
export const SCAN_STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  ANALYZING: "analyzing",
  RESULT: "result",
  ERROR: "error",
};

/**
 * Hook to manage the full scan lifecycle.
 * Tracks state transitions, progress, results, and errors.
 */
export function useScanLifecycle() {
  const [state, setState] = useState(SCAN_STATES.IDLE);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const reset = useCallback(() => {
    setState(SCAN_STATES.IDLE);
    setProgress(0);
    setResult(null);
    setError(null);
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  }, [preview]);

  const startScan = useCallback(
    async (uploadedFile) => {
      try {
        // Set file and preview
        setFile(uploadedFile);
        setPreview(URL.createObjectURL(uploadedFile));
        setError(null);

        // Phase 1: Uploading
        setState(SCAN_STATES.UPLOADING);
        setProgress(0);

        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 30) {
              clearInterval(uploadInterval);
              return 30;
            }
            return prev + 3;
          });
        }, 100);

        // Wait for upload simulation
        await new Promise((resolve) => setTimeout(resolve, 1200));
        clearInterval(uploadInterval);
        setProgress(35);

        // Phase 2: Analyzing
        setState(SCAN_STATES.ANALYZING);

        // Start analysis progress
        const analysisInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(analysisInterval);
              return 90;
            }
            return prev + 2;
          });
        }, 200);

        // Run the actual Gemini analysis
        const analysisResult = await runFullAnalysis(uploadedFile);

        clearInterval(analysisInterval);
        setProgress(100);
        setResult(analysisResult);
        setState(SCAN_STATES.RESULT);
      } catch (err) {
        console.error("Scan failed:", err);
        setError(err.message || "Analysis failed. Please try again.");
        setState(SCAN_STATES.ERROR);
      }
    },
    []
  );

  return {
    state,
    progress,
    result,
    error,
    file,
    preview,
    startScan,
    reset,
    isIdle: state === SCAN_STATES.IDLE,
    isProcessing:
      state === SCAN_STATES.UPLOADING || state === SCAN_STATES.ANALYZING,
    hasResult: state === SCAN_STATES.RESULT,
    hasError: state === SCAN_STATES.ERROR,
  };
}
