import { Incident } from "@/domain/incidents/Incident";
import {
  AIProvider,
  AnswerResult,
  CalmRewriteResult,
  ClassificationResult,
  DigestResult,
  SimilarityMatch,
} from "@/infrastructure/ai/AIProvider";
import { classifyByKeywords } from "./ClassificationRules";
import { scoreSeverity } from "./SeverityRules";
import { getRecommendedActions } from "./ActionTemplates";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";

export class RuleBasedAIProvider implements AIProvider {
  async classifyIncident(
    title: string,
    description: string
  ): Promise<ClassificationResult> {
    const { category, confidence } = classifyByKeywords(title, description);
    const severity = scoreSeverity(title, description, category);
    return { category, severity, confidence };
  }

  async rewriteCalm(
    _title: string,
    description: string
  ): Promise<CalmRewriteResult> {
    let calm = description;

    calm = calm.replace(/!{2,}/g, ".");
    calm = calm.replace(/!(\s|$)/g, ".$1");
    calm = calm.replace(/\?{2,}/g, "?");
    calm = calm.replace(/\.{3,}/g, ".");

    calm = calm.replace(
      /\b[A-Z]{3,}\b/g,
      (match) => match.charAt(0) + match.slice(1).toLowerCase()
    );

    const alarmistWords: Record<string, string> = {
      "OMG": "Note:",
      "omg": "Note:",
      "SO SCARY": "concerning",
      "TERRIFYING": "concerning",
      "terrifying": "concerning",
      "HORRIBLE": "unfortunate",
      "horrible": "unfortunate",
      "CRAZY": "notable",
      "crazy": "notable",
      "INSANE": "notable",
      "insane": "notable",
      "freaking out": "concerned",
      "panicking": "on alert",
      "scared to death": "cautious",
      "absolutely terrified": "concerned",
    };

    for (const [alarmist, replacement] of Object.entries(alarmistWords)) {
      calm = calm.replace(new RegExp(alarmist, "gi"), replacement);
    }

    calm = calm.replace(/\s{2,}/g, " ").trim();

    if (!calm.endsWith(".") && !calm.endsWith("?")) {
      calm += ".";
    }

    return { calmDescription: calm };
  }

  async answerQuestion(
    question: string,
    incidents: Incident[]
  ): Promise<AnswerResult> {
    const q = question.toLowerCase();
    const words = q.split(/\s+/).filter((w) => w.length > 2);

    const scored = incidents.map((incident) => {
      const text =
        `${incident.title} ${incident.description} ${incident.location} ${incident.category}`.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (text.includes(word)) score++;
      }
      return { incident, score };
    });

    const relevant = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (relevant.length === 0) {
      return {
        answer:
          "No incidents were found matching your question. Try different keywords or browse the incident list.",
        relevantIncidentIds: [],
      };
    }

    const locationMatch = incidents.find((i) =>
      q.includes(i.location.toLowerCase())
    );
    const categoryMatch = Object.values(IncidentCategory).find((cat) =>
      q.includes(cat.toLowerCase().replace(/_/g, " "))
    );

    let answer = `Found ${relevant.length} relevant incident${relevant.length > 1 ? "s" : ""}.`;

    if (locationMatch) {
      const locationIncidents = relevant.filter(
        (r) => r.incident.location === locationMatch.location
      );
      answer += ` ${locationIncidents.length} in ${locationMatch.location}.`;
    }

    if (categoryMatch) {
      const catIncidents = relevant.filter(
        (r) => r.incident.category === categoryMatch
      );
      answer += ` ${catIncidents.length} classified as ${categoryMatch.replace(/_/g, " ")}.`;
    }

    const topIncident = relevant[0].incident;
    answer += ` Most relevant: "${topIncident.title}" (${topIncident.severity} severity, ${topIncident.status}).`;

    return {
      answer,
      relevantIncidentIds: relevant.map((r) => r.incident.id),
    };
  }

  async generateDigest(incidents: Incident[]): Promise<DigestResult> {
    const categoryCounts = new Map<IncidentCategory, number>();
    for (const incident of incidents) {
      categoryCounts.set(
        incident.category,
        (categoryCounts.get(incident.category) ?? 0) + 1
      );
    }

    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const highSeverity = incidents.filter(
      (i) => i.severity === "HIGH" || i.severity === "CRITICAL"
    );

    const summary = `${incidents.length} incidents reported. ${highSeverity.length} require immediate attention. Most common: ${topCategories.map(([cat, count]) => `${cat} (${count})`).join(", ")}.`;

    const patterns = topCategories.map(
      ([cat, count]) =>
        `${cat} accounts for ${Math.round((count / incidents.length) * 100)}% of incidents`
    );

    const recommendationSet = new Set<string>();
    for (const [cat] of topCategories) {
      for (const action of getRecommendedActions(cat)) {
        recommendationSet.add(action);
      }
    }

    return {
      summary,
      patterns,
      recommendations: [...recommendationSet].slice(0, 5),
    };
  }

  async findSimilar(
    incident: Incident,
    candidates: Incident[]
  ): Promise<SimilarityMatch[]> {
    const targetWords = this.tokenize(
      `${incident.title} ${incident.description}`
    );

    return candidates
      .filter((c) => c.id !== incident.id)
      .map((candidate) => {
        const candidateWords = this.tokenize(
          `${candidate.title} ${candidate.description}`
        );
        const similarity = this.jaccardSimilarity(targetWords, candidateWords);
        return { incident: candidate, similarity };
      })
      .filter((match) => match.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private tokenize(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2)
    );
  }

  private jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }
}
