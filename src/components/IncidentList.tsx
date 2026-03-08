"use client";

import { useState } from "react";
import { Incident } from "@/domain/incidents/Incident";

interface IncidentListProps {
  incidents: Incident[];
  highlightedIds?: string[];
}

const SEVERITY_STYLES: Record<string, string> = {
  LOW: "bg-emerald-500/10 text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-red-500/10 text-red-400",
  CRITICAL: "bg-red-600/15 text-red-300 font-semibold",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-400",
  investigating: "bg-purple-500/10 text-purple-400",
  resolved: "bg-emerald-500/10 text-emerald-400",
  dismissed: "bg-slate-500/10 text-slate-400",
};

export default function IncidentList({ incidents, highlightedIds = [] }: IncidentListProps) {
  const [expandedCalm, setExpandedCalm] = useState<Record<string, boolean>>({});

  if (incidents.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-600">
        No incidents match your filters.
      </div>
    );
  }

  function toggleCalm(id: string) {
    setExpandedCalm((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const showCalm = expandedCalm[incident.id] ?? true;
        const hasDifferentCalm =
          incident.calmDescription &&
          incident.calmDescription !== incident.description;
        const isHighlighted = highlightedIds.includes(incident.id);

        return (
          <article
            key={incident.id}
            className={`rounded-xl border p-5 transition-colors ${
              isHighlighted
                ? "border-blue-500/50 bg-blue-500/5"
                : "border-slate-800 bg-[#0f1628] hover:border-slate-700 hover:bg-[#111b30]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-medium text-slate-200">
                {incident.title}
              </h3>
              <div className="flex shrink-0 gap-1.5">
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${SEVERITY_STYLES[incident.severity]}`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_STYLES[incident.status]}`}
                >
                  {incident.status}
                </span>
              </div>
            </div>

            <span className="mt-1 inline-block rounded bg-blue-500/8 px-2 py-0.5 text-[11px] text-blue-400">
              {incident.category.replace(/_/g, " ")}
            </span>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {showCalm ? incident.calmDescription || incident.description : incident.description}
            </p>

            {hasDifferentCalm && (
              <button
                onClick={() => toggleCalm(incident.id)}
                className="mt-1 text-xs text-blue-500 hover:text-blue-400"
              >
                {showCalm ? "View original report" : "View calm version"}
              </button>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>{incident.location}</span>
              <span>{new Date(incident.reportedAt).toLocaleDateString()}</span>
              <span className="ml-auto italic">
                Classified by {incident.classifiedBy === "ai" ? "AI" : "Rule Engine"}
              </span>
            </div>

            {incident.recommendedActions.length > 0 && (
              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  Recommended Actions
                </p>
                <ul className="mt-1.5 space-y-1 pl-4">
                  {incident.recommendedActions.map((action, i) => (
                    <li
                      key={i}
                      className="list-disc text-xs leading-relaxed text-slate-400"
                    >
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
