"use client";

import { useState, useEffect, useCallback } from "react";
import { Incident } from "@/domain/incidents/Incident";
import CreateIncidentForm from "@/components/CreateIncidentForm";
import IncidentList from "@/components/IncidentList";
import IncidentFilters from "@/components/IncidentFilters";
import AskPanel from "@/components/AskPanel";

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/incidents");
    const data = await res.json();
    setIncidents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const filtered = incidents.filter((incident) => {
    if (categoryFilter && incident.category !== categoryFilter) return false;
    if (severityFilter && incident.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        incident.title.toLowerCase().includes(q) ||
        incident.description.toLowerCase().includes(q) ||
        incident.location.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#090d15]">
      <header className="border-b border-slate-800 bg-[#0c1120]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-100">
            Community Guardian
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Privacy-First Safety Digest
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <CreateIncidentForm onCreated={fetchIncidents} />
          </aside>

          <main>
            <AskPanel onHighlight={setHighlightedIds} />

            <IncidentFilters
              category={categoryFilter}
              severity={severityFilter}
              search={searchQuery}
              onCategoryChange={setCategoryFilter}
              onSeverityChange={setSeverityFilter}
              onSearchChange={setSearchQuery}
            />

            <p className="mb-4 text-xs text-slate-500">
              {loading
                ? "Loading..."
                : `Showing ${filtered.length} of ${incidents.length} incidents`}
            </p>

            {!loading && (
              <IncidentList
                incidents={filtered}
                highlightedIds={highlightedIds}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
