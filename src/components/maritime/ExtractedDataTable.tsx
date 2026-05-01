import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  Save,
  X,
  Check,
  FileSearch,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ExtractedField } from "@/types/analysis";
import { getFieldStatus, type FieldStatus } from "@/lib/extraction";
import { cn } from "@/lib/utils";

interface Props {
  fields: ExtractedField[];
  onUpdate: (key: string, value: string) => void;
  onConfirm: (key: string) => void;
}

const STATUS_META: Record<
  FieldStatus,
  { label: string; classes: string }
> = {
  confirmed: {
    label: "Confirmed",
    classes: "border-success/30 bg-success/10 text-success",
  },
  edited: {
    label: "Edited",
    classes: "border-secondary/40 bg-secondary/10 text-secondary",
  },
  missing: {
    label: "Missing",
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  low_confidence: {
    label: "Low Confidence",
    classes: "border-warning/30 bg-warning/10 text-warning",
  },
  extracted: {
    label: "Extracted",
    classes: "border-primary/30 bg-primary/10 text-primary",
  },
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.9
      ? "bg-success"
      : value >= 0.75
      ? "bg-primary"
      : value >= 0.5
      ? "bg-warning"
      : "bg-destructive";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="h-1.5 flex-1 rounded-full bg-panel-elevated overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono text-[11px] text-muted-foreground w-9 text-right">
        {pct}%
      </span>
    </div>
  );
}

function EvidencePopover({ field }: { field: ExtractedField }) {
  if (!field.evidenceQuote) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-warning"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            None
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="text-xs">
            <div className="font-semibold text-warning mb-1">
              No source evidence available
            </div>
            <p className="text-muted-foreground">
              This field was inferred without a direct source quote. Treat as
              weaker grounding and verify against the document.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
        >
          <FileSearch className="h-3 w-3 mr-1" />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3 text-success" />
            Source Evidence
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 mono text-[12px] leading-relaxed text-foreground">
            “{field.evidenceQuote}”
          </div>
          <div className="text-[11px] text-muted-foreground">
            Quote was matched against the source document during extraction.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FieldRow({
  field,
  onUpdate,
  onConfirm,
}: {
  field: ExtractedField;
  onUpdate: (key: string, value: string) => void;
  onConfirm: (key: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(field.value);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [editing, field.value]);

  const status = getFieldStatus(field);
  const meta = STATUS_META[status];

  const save = () => {
    onUpdate(field.key, draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(field.value);
    setEditing(false);
  };

  return (
    <TableRow className="group">
      <TableCell className="align-top w-[180px]">
        <div className="text-sm font-medium">{field.label}</div>
        <div className="mono text-[10px] text-muted-foreground mt-0.5">
          {field.key}
        </div>
      </TableCell>
      <TableCell className="align-top">
        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className="h-8 text-sm"
            placeholder="Enter value (empty = missing)"
          />
        ) : (
          <div
            className={cn(
              "text-sm",
              status === "missing" && "italic text-destructive/80"
            )}
          >
            {field.value && field.value.trim() !== ""
              ? field.value
              : "— missing —"}
          </div>
        )}
        {field.userEdited && field.previousValue !== undefined && !editing && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            Was: <span className="line-through">{field.previousValue || "—"}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="align-top w-[140px]">
        <ConfidenceBar value={field.confidence} />
      </TableCell>
      <TableCell className="align-top w-[80px]">
        <EvidencePopover field={field} />
      </TableCell>
      <TableCell className="align-top w-[140px]">
        <Badge
          variant="outline"
          className={cn("text-[11px]", meta.classes)}
        >
          {meta.label}
        </Badge>
      </TableCell>
      <TableCell className="align-top w-[180px] text-right">
        {editing ? (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={cancel} className="h-7 px-2">
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={save}
              className="h-7 px-2 bg-primary text-primary-foreground"
            >
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              className="h-7 px-2 text-xs"
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            {!field.userConfirmed && status !== "missing" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onConfirm(field.key)}
                className="h-7 px-2 text-xs hover:bg-success/10 hover:text-success"
              >
                <Check className="h-3 w-3 mr-1" /> Confirm
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ExtractedDataTable({ fields, onUpdate, onConfirm }: Props) {
  if (!fields.length) {
    return (
      <div className="panel p-8 text-center">
        <FileSearch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <div className="text-sm font-medium">No extracted fields yet</div>
        <div className="text-xs text-muted-foreground mt-1">
          Run the agent workflow to populate schema-bound output.
        </div>
      </div>
    );
  }
  return (
    <div className="panel overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-[11px] uppercase tracking-wider">Field</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider">Value</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider">Confidence</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider">Evidence</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((f) => (
            <FieldRow
              key={f.key}
              field={f}
              onUpdate={onUpdate}
              onConfirm={onConfirm}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
