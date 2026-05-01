import { useCallback, useEffect, useRef, useState } from "react";
import type { SampleDocument } from "@/data/samples";
import type {
  AnalysisRun,
  CriticIssueStatus,
  DocumentType,
  HumanFeedback,
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

  // ---------- Phase 5 — Handover ----------

  const updateHandoverContent = useCallback((markdown: string) => {
    setRun((prev) => {
      if (!prev?.handover) return prev;
      return {
        ...prev,
        handover: {
          ...prev.handover,
          editedMarkdown: markdown,
          userEdited: true,
          editedAt: new Date().toISOString(),
          approved: false,
          approvedAt: undefined,
        },
      };
    });
  }, []);

  const cancelHandoverEdit = useCallback(() => {
    setRun((prev) => {
      if (!prev?.handover) return prev;
      const { editedMarkdown, ...rest } = prev.handover;
      return { ...prev, handover: { ...rest } };
    });
  }, []);

  const approveHandover = useCallback(() => {
    setRun((prev) => {
      if (!prev?.handover) return prev;
      const at = new Date().toISOString();
      const feedback: HumanFeedback = {
        id: `fb_handover_${Date.now().toString(36)}`,
        section: "handover",
        decision: "accept",
        at,
      };
      const otherFeedback = prev.feedback.filter(
        (f) => f.section !== "handover",
      );
      return {
        ...prev,
        handover: {
          ...prev.handover,
          approved: true,
          approvedAt: at,
        },
        feedback: [...otherFeedback, feedback],
      };
    });
  }, []);

  const toggleHandoverAction = useCallback((actionId: string) => {
    setRun((prev) => {
      if (!prev?.handover) return prev;
      const current = prev.handover.completedActionIds ?? [];
      const next = current.includes(actionId)
        ? current.filter((id) => id !== actionId)
        : [...current, actionId];
      return {
        ...prev,
        handover: { ...prev.handover, completedActionIds: next },
      };
    });
  }, []);

  // ---------- Phase 5 — Critic ----------

  const setCriticIssueStatus = useCallback(
    (issueId: string, status: CriticIssueStatus) => {
      setRun((prev) => {
        if (!prev?.critic) return prev;
        return {
          ...prev,
          critic: {
            ...prev.critic,
            issues: prev.critic.issues.map((i) =>
              i.id === issueId
                ? { ...i, status, reviewedAt: new Date().toISOString() }
                : i,
            ),
          },
        };
      });
    },
    [],
  );

  const setCriticIssueComment = useCallback(
    (issueId: string, comment: string) => {
      setRun((prev) => {
        if (!prev?.critic) return prev;
        return {
          ...prev,
          critic: {
            ...prev.critic,
            issues: prev.critic.issues.map((i) =>
              i.id === issueId
                ? {
                    ...i,
                    comment: comment.length > 0 ? comment : undefined,
                    reviewedAt: new Date().toISOString(),
                  }
                : i,
            ),
          },
        };
      });
    },
    [],
  );

  return {
    run,
    start,
    reset,
    updateField,
    confirmField,
    setClassificationOverride,
    setRiskStatus,
    setRiskComment,
    updateHandoverContent,
    cancelHandoverEdit,
    approveHandover,
    toggleHandoverAction,
    setCriticIssueStatus,
    setCriticIssueComment,
  };
}
