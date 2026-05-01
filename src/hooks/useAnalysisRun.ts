import { useCallback, useEffect, useRef, useState } from "react";
import type { SampleDocument } from "@/data/samples";
import type {
  AnalysisRun,
  DocumentType,
  RiskReviewStatus,
} from "@/types/analysis";
import {
  createInitialRun,
  runSimulatedAnalysis,
} from "@/lib/analysisSimulator";
import {
  confirmExtractionField,
  updateExtractionField,
} from "@/lib/extraction";

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
    setTimeout(() => {
      cancelledRef.current = false;
    }, 0);
  }, [document]);

  const updateField = useCallback((fieldKey: string, newValue: string) => {
    setRun((prev) => (prev ? updateExtractionField(prev, fieldKey, newValue) : prev));
  }, []);

  const confirmField = useCallback((fieldKey: string) => {
    setRun((prev) => (prev ? confirmExtractionField(prev, fieldKey) : prev));
  }, []);

  const setClassificationOverride = useCallback((type: DocumentType | null) => {
    setRun((prev) => {
      if (!prev) return prev;
      if (!type) {
        const { classificationOverride, ...rest } = prev;
        return { ...rest } as AnalysisRun;
      }
      return {
        ...prev,
        classificationOverride: { type, at: new Date().toISOString() },
      };
    });
  }, []);

  const setRiskStatus = useCallback(
    (riskId: string, status: RiskReviewStatus) => {
      setRun((prev) => {
        if (!prev?.risks) return prev;
        return {
          ...prev,
          risks: prev.risks.map((r) =>
            r.id === riskId
              ? { ...r, status, reviewedAt: new Date().toISOString() }
              : r,
          ),
        };
      });
    },
    [],
  );

  const setRiskComment = useCallback((riskId: string, comment: string) => {
    setRun((prev) => {
      if (!prev?.risks) return prev;
      return {
        ...prev,
        risks: prev.risks.map((r) =>
          r.id === riskId
            ? {
                ...r,
                reviewerComment: comment.length > 0 ? comment : undefined,
                reviewedAt: new Date().toISOString(),
              }
            : r,
        ),
      };
    });
  }, []);

  return {
    run,
    start,
    reset,
    updateField,
    confirmField,
    setClassificationOverride,
    setRiskStatus,
    setRiskComment,
  };
}
