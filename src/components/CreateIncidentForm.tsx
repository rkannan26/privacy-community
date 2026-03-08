"use client";

import { useState } from "react";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

interface CreateIncidentFormProps {
  onCreated: () => void;
}

export default function CreateIncidentForm({ onCreated }: CreateIncidentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body: Record<string, string> = { title, description, location };
    if (category) body.category = category;
    if (severity) body.severity = severity;

    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create incident");
      setSubmitting(false);
      return;
    }

    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("");
    setSeverity("");
    setSubmitting(false);
    onCreated();
  }

  const inputClasses =
    "mt-1.5 block w-full rounded-lg border border-slate-700 bg-[#0c1120] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

  const labelClasses = "block text-xs font-medium text-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-800 bg-[#0f1628] p-5"
    >
      <h2 className="mb-4 text-sm font-semibold text-slate-200">
        Report an Incident
      </h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of the incident"
            required
            minLength={3}
            maxLength={200}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what happened in detail"
            required
            minLength={10}
            maxLength={2000}
            rows={3}
            className={`${inputClasses} resize-y`}
          />
        </div>

        <div>
          <label className={labelClasses}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Neighborhood or street"
            required
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClasses}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClasses}
            >
              <option value="">Auto-detect</option>
              {Object.values(IncidentCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className={inputClasses}
            >
              <option value="">Auto-detect</option>
              {Object.values(Severity).map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
