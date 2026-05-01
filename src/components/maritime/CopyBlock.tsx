import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/portfolioCopy";
import { cn } from "@/lib/utils";

interface CopyBlockProps {
  label: string;
  text: string;
  multiline?: boolean;
  className?: string;
}

export function CopyBlock({ label, text, multiline = true, className }: CopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("Copy failed — please copy manually");
    }
  };

  return (
    <div className={cn("rounded-lg border border-border bg-panel-elevated/60", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <Button size="sm" variant="ghost" onClick={onCopy} className="h-7 gap-1.5 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre
        className={cn(
          "p-4 text-xs leading-relaxed text-foreground/90 font-mono overflow-x-auto",
          multiline ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        )}
      >
        {text}
      </pre>
    </div>
  );
}
