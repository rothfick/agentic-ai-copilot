import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Printer,
  Download,
  ClipboardCopy,
  Sparkles,
} from "lucide-react";
import {
  copyExecutiveSummary,
  copyPortfolioBullet,
  downloadJsonReport,
  type MaritimeReport,
} from "@/lib/report";

export function ReportExportActions({ report }: { report: MaritimeReport }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <Button onClick={() => window.print()} variant="outline" size="sm">
        <Printer className="mr-1 h-4 w-4" /> Print / Save as PDF
      </Button>
      <Button
        onClick={() => {
          downloadJsonReport(report);
          toast({ title: "JSON report downloaded" });
        }}
        variant="outline"
        size="sm"
      >
        <Download className="mr-1 h-4 w-4" /> Download JSON
      </Button>
      <Button
        onClick={async () => {
          const ok = await copyExecutiveSummary(report);
          toast({
            title: ok ? "Executive summary copied" : "Copy failed",
            variant: ok ? "default" : "destructive",
          });
        }}
        variant="outline"
        size="sm"
      >
        <ClipboardCopy className="mr-1 h-4 w-4" /> Copy Executive Summary
      </Button>
      <Button
        onClick={async () => {
          const ok = await copyPortfolioBullet();
          toast({
            title: ok ? "Portfolio bullet copied" : "Copy failed",
            variant: ok ? "default" : "destructive",
          });
        }}
        size="sm"
        className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
      >
        <Sparkles className="mr-1 h-4 w-4" /> Copy Portfolio Bullet
      </Button>
    </div>
  );
}
