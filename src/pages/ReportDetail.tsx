import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/maritime/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/maritime/EmptyState";
import { FileText } from "lucide-react";
import { ReportCover } from "@/components/maritime/report/ReportCover";
import { ReportExecutiveSummary } from "@/components/maritime/report/ReportExecutiveSummary";
import { ReportMetadataGrid } from "@/components/maritime/report/ReportMetadataGrid";
import { ReportClassificationSection } from "@/components/maritime/report/ReportClassificationSection";
import { ReportExtractionTable } from "@/components/maritime/report/ReportExtractionTable";
import { ReportMissingFields } from "@/components/maritime/report/ReportMissingFields";
import { ReportRiskRegister } from "@/components/maritime/report/ReportRiskRegister";
import { ReportHandoverSection } from "@/components/maritime/report/ReportHandoverSection";
import { ReportCriticSection } from "@/components/maritime/report/ReportCriticSection";
import { ReportEvalsSection } from "@/components/maritime/report/ReportEvalsSection";
import { ReportHumanReviewTrail } from "@/components/maritime/report/ReportHumanReviewTrail";
import { ReportTechnicalAppendix } from "@/components/maritime/report/ReportTechnicalAppendix";
import { ReportExportActions } from "@/components/maritime/report/ReportExportActions";
import { loadReportForSample } from "@/lib/report";

const ReportDetail = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const report = useMemo(
    () => (sampleId ? loadReportForSample(sampleId) : null),
    [sampleId],
  );

  if (!report) {
    return (
      <AppShell>
        <div className="px-6 md:px-10 py-10 max-w-5xl mx-auto">
          <EmptyState
            icon={FileText}
            title="Report not found"
            description="No report exists for that ID. Browse the report center to open a sample report."
            action={
              <Button asChild>
                <Link to="/reports">Back to Reports</Link>
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 max-w-5xl mx-auto report-root space-y-6">
        <div className="flex items-center justify-between gap-3 no-print">
          <Button asChild variant="outline" size="sm">
            <Link to="/reports">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Reports
            </Link>
          </Button>
          <ReportExportActions report={report} />
        </div>

        <ReportCover report={report} />
        <ReportExecutiveSummary report={report} />
        <ReportMetadataGrid report={report} />
        <ReportClassificationSection report={report} />
        <ReportExtractionTable report={report} />
        <ReportMissingFields report={report} />
        <ReportRiskRegister report={report} />
        <ReportHandoverSection report={report} />
        <ReportCriticSection report={report} />
        <ReportEvalsSection report={report} />
        <ReportHumanReviewTrail report={report} />
        <ReportTechnicalAppendix report={report} />

        <div className="text-[10px] text-muted-foreground italic text-center pt-4 border-t border-border">
          MaritimeOps AI Copilot · Synthetic data only · Generated{" "}
          {new Date(report.meta.generatedAt).toLocaleString()}
        </div>
      </div>
    </AppShell>
  );
};

export default ReportDetail;
