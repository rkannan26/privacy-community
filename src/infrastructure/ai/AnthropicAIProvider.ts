import Anthropic from "@anthropic-ai/sdk";
import { Incident } from "@/domain/incidents/Incident";
import {
  AIProvider,
  AnswerResult,
  CalmRewriteResult,
  ClassificationResult,
  DigestResult,
  SimilarityMatch,
} from "@/infrastructure/ai/AIProvider";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

const CATEGORIES = Object.values(IncidentCategory);
const SEVERITIES = Object.values(Severity);

export class AnthropicAIProvider implements AIProvider {
  private client: Anthropic;
  private model = "claude-sonnet-4-20250514";

  constructor() {
    this.client = new Anthropic();
  }

  private async ask(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = response.content[0];
    if (block.type === "text") return block.text;
    return "";
  }

  async classifyIncident(
    title: string,
    description: string
  ): Promise<ClassificationResult> {
    const systemPrompt = `You are a safety incident classifier. Respond with ONLY valid JSON, no markdown.
Valid categories: ${CATEGORIES.join(", ")}
Valid severities: ${SEVERITIES.join(", ")}
JSON format: {"category":"...","severity":"...","confidence":0.0-1.0}`;

    const raw = await this.ask(systemPrompt, `Title: ${title}\nDescription: ${description}`);

    try {
      const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        category: CATEGORIES.includes(parsed.category) ? parsed.category : IncidentCategory.OTHER,
        severity: SEVERITIES.includes(parsed.severity) ? parsed.severity : Severity.MEDIUM,
        confidence: Math.min(Math.max(parsed.confidence ?? 0.5, 0), 1),
      };
    } catch {
      return { category: IncidentCategory.OTHER, severity: Severity.MEDIUM, confidence: 0 };
    }
  }

  async rewriteCalm(
    title: string,
    description: string
  ): Promise<CalmRewriteResult> {
    const systemPrompt = `You are a community safety communicator. Rewrite the following incident report in a calm, factual, and reassuring tone. Remove alarmist language, excessive punctuation, and all-caps. Keep all factual details. Respond with ONLY the rewritten description, no preamble or quotes.`;

    const calmDescription = await this.ask(
      systemPrompt,
      `Title: ${title}\nOriginal report: ${description}`
    );

    return { calmDescription: calmDescription.trim() };
  }

  async answerQuestion(
    question: string,
    incidents: Incident[]
  ): Promise<AnswerResult> {
    const incidentSummaries = incidents
      .slice(0, 20)
      .map(
        (i) =>
          `[${i.id}] ${i.title} | ${i.category} | ${i.severity} | ${i.status} | ${i.location} | ${i.reportedAt}`
      )
      .join("\n");

    const systemPrompt = `You are a community safety assistant. Answer the user's question based ONLY on the incident data provided. Be calm, factual, and helpful. At the end of your answer, list the IDs of relevant incidents in this exact format on its own line: RELEVANT_IDS: id1,id2,id3`;

    const raw = await this.ask(
      systemPrompt,
      `Incidents:\n${incidentSummaries}\n\nQuestion: ${question}`
    );

    const idMatch = raw.match(/RELEVANT_IDS:\s*(.+)/);
    const relevantIncidentIds = idMatch
      ? idMatch[1].split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    const answer = raw.replace(/RELEVANT_IDS:.+/, "").trim();

    return { answer, relevantIncidentIds };
  }

  async generateDigest(incidents: Incident[]): Promise<DigestResult> {
    const incidentSummaries = incidents
      .map((i) => `${i.title} (${i.category}, ${i.severity}, ${i.location})`)
      .join("\n");

    const systemPrompt = `You are a community safety digest writer. Analyze the incidents and provide a calm, reassuring safety digest. Respond with ONLY valid JSON, no markdown fences: {"summary":"...","patterns":["..."],"recommendations":["..."]}`;

    const raw = await this.ask(systemPrompt, incidentSummaries);

    try {
      const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return { summary: raw, patterns: [], recommendations: [] };
    }
  }

  async findSimilar(
    incident: Incident,
    candidates: Incident[]
  ): Promise<SimilarityMatch[]> {
    const candidateSummaries = candidates
      .filter((c) => c.id !== incident.id)
      .slice(0, 15)
      .map((c) => `[${c.id}] ${c.title}: ${c.description.slice(0, 100)}`)
      .join("\n");

    const systemPrompt = `You are an incident similarity detector. Given a target incident and a list of candidates, identify the most similar ones. Respond with ONLY valid JSON, no markdown fences: [{"id":"...","similarity":0.0-1.0}]`;

    const raw = await this.ask(
      systemPrompt,
      `Target: ${incident.title}: ${incident.description}\n\nCandidates:\n${candidateSummaries}`
    );

    try {
      const cleaned = raw.replace(/```json\n?|```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned) as Array<{ id: string; similarity: number }>;
      return parsed
        .map((p) => ({
          incident: candidates.find((c) => c.id === p.id)!,
          similarity: p.similarity,
        }))
        .filter((m) => m.incident);
    } catch {
      return [];
    }
  }
}
