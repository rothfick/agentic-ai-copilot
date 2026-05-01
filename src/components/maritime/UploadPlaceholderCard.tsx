import { Link } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadPlaceholderCard() {
  return (
    <div className="panel p-6 flex flex-col items-center justify-center text-center border-dashed border-border/80 min-h-[220px]">
      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3">
        <UploadCloud className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold">Start a New Analysis</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">
        Upload a maritime document — Charter Party, Statement of Facts, DA
        estimate, or operational handover. Real upload arrives in Phase 2.
      </p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/samples">Try a Sample Instead</Link>
      </Button>
    </div>
  );
}
