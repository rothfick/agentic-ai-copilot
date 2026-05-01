import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard, cvBullet } from "@/lib/portfolioCopy";

const checklist = [
  "Recruiter walkthrough ready",
  "Demo path complete",
  "Report export ready",
  "Eval harness ready",
  "Architecture docs ready",
];

export function PortfolioReadinessCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyCV = async () => {
    const ok = await copyToClipboard(cvBullet);
    if (ok) {
      setCopied(true);
      toast.success("CV bullet copied");
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-panel-elevated to-panel border-primary/20">
      <CardHeader className="pb-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-1">
          Portfolio Readiness
        </div>
        <CardTitle className="text-base">Ready for recruiter demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-foreground/90">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <Link to="/demo">
              Start Best Demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/reports">Open Latest Report</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/marcura-fit">Read Marcura Fit</Link>
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyCV} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            Copy CV Bullet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
