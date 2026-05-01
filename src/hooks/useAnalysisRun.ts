import { useCallback, useEffect, useRef, useState } from "react";
import type { SampleDocument } from "@/data/samples";
import type { AnalysisRun } from "@/types/analysis";
import {
  createInitialRun,
  runSimulatedAnalysis,
} from "@/lib/analysisSimulator";

export function useAnalysisRun(document: SampleDocument | undefined) {
  const [run, setRun] = useState<AnalysisRun | null>(null);
  const cancelledRef = useRef(false);

  // Reset whenever the document changes.
  useEffect(() => {
    cancelledRef.current = true;
    if (document) {
      setRun(createInitialRun(document));
    } else {
      setRun(null);
    }
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, [document?.id]);

  const start = useCallback(async () => {
    if (!document) return;
    cancelledRef.current = false;
    const initial = createInitialRun(document);
    setRun(initial);
    await runSimulatedAnalysis(document, initial, {
      onUpdate: (next) => setRun({ ...next }),
      isCancelled: () => cancelledRef.current,
    });
  }, [document]);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    if (document) setRun(createInitialRun(document));
    // Clear flag on next tick so a subsequent start works.
    setTimeout(() => {
      cancelledRef.current = false;
    }, 0);
  }, [document]);

  return { run, start, reset };
}
