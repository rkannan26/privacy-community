"use client";

import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

interface IncidentFiltersProps {
  category: string;
  severity: string;
  search: string;
  onCategoryChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export default function IncidentFilters({
  category,
  severity,
  search,
  onCategoryChange,
  onSeverityChange,
  onSearchChange,
}: IncidentFiltersProps) {
  const selectClasses =
    "rounded-lg border border-slate-700 bg-[#0f1628] px-3 py-2 text-sm text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search incidents..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="min-w-[200px] flex-1 rounded-lg border border-slate-700 bg-[#0f1628] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">All Categories</option>
        {Object.values(IncidentCategory).map((cat) => (
          <option key={cat} value={cat}>
            {cat.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <select
        value={severity}
        onChange={(e) => onSeverityChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">All Severities</option>
        {Object.values(Severity).map((sev) => (
          <option key={sev} value={sev}>
            {sev}
          </option>
        ))}
      </select>
    </div>
  );
}
