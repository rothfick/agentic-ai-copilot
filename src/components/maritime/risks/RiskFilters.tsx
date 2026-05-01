import { ArrowUpDown, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  DEFAULT_FILTERS,
  SEVERITY_LABEL,
  SEVERITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  type RiskFiltersState,
  type RiskSortKey,
} from "@/lib/risks";

export function RiskFilters({
  filters,
  onChange,
  sort,
  onSortChange,
  totalRisks,
  visibleRisks,
}: {
  filters: RiskFiltersState;
  onChange: (next: RiskFiltersState) => void;
  sort: RiskSortKey;
  onSortChange: (s: RiskSortKey) => void;
  totalRisks: number;
  visibleRisks: number;
}) {
  const isFiltered =
    filters.severity !== "all" ||
    filters.category !== "all" ||
    filters.status !== "all";

  return (
    <div className="panel p-3 flex flex-wrap items-center gap-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mr-1">
        Filter
      </div>

      <Select
        value={filters.severity}
        onValueChange={(v) =>
          onChange({ ...filters, severity: v as RiskFiltersState["severity"] })
        }
      >
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All severities</SelectItem>
          {SEVERITY_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {SEVERITY_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(v) =>
          onChange({ ...filters, category: v as RiskFiltersState["category"] })
        }
      >
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {CATEGORY_ORDER.map((c) => (
            <SelectItem key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(v) =>
          onChange({ ...filters, status: v as RiskFiltersState["status"] })
        }
      >
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mx-1 h-6 w-px bg-border" />

      <div className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
        <ArrowUpDown className="h-3 w-3" /> Sort
      </div>
      <Select value={sort} onValueChange={(v) => onSortChange(v as RiskSortKey)}>
        <SelectTrigger className="h-8 w-[160px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="severity">Severity (desc)</SelectItem>
          <SelectItem value="confidence">Confidence (high → low)</SelectItem>
          <SelectItem value="category">Category</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Showing <span className="text-foreground mono">{visibleRisks}</span> of{" "}
          <span className="text-foreground mono">{totalRisks}</span>
        </span>
        {isFiltered && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <FilterX className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
