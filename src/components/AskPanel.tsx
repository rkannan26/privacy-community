"use client";

import { useState } from "react";

interface AskPanelProps {
  onHighlight: (ids: string[]) => void;
}

export default function AskPanel({ onHighlight }: AskPanelProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setAnswer(data.answer);
    onHighlight(data.relevantIncidentIds || []);
    setLoading(false);
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-[#0f1628] p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">
        Ask about Safety
      </h2>
      <form onSubmit={handleAsk} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Were there any break-ins near Elm Street?"
          className="flex-1 rounded-lg border border-slate-700 bg-[#0c1120] px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {answer && (
        <div className="mt-4 rounded-lg border border-slate-700 bg-[#0c1120] p-4">
          <p className="text-sm leading-relaxed text-slate-300">{answer}</p>
        </div>
      )}
    </div>
  );
}
