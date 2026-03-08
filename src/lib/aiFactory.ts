import { AIProvider } from "@/infrastructure/ai/AIProvider";
import { RuleBasedAIProvider } from "@/infrastructure/rules/RuleBasedAIProvider";
import { AnthropicAIProvider } from "@/infrastructure/ai/AnthropicAIProvider";
import { Incident } from "@/domain/incidents/Incident";
import {
  AnswerResult,
  CalmRewriteResult,
  ClassificationResult,
  DigestResult,
  SimilarityMatch,
} from "@/infrastructure/ai/AIProvider";

class ResilientAIProvider implements AIProvider {
  private primary: AIProvider;
  private fallback: RuleBasedAIProvider;
  public lastCallUsedPrimary = false;

  constructor(primary: AIProvider, fallback: RuleBasedAIProvider) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async classifyIncident(title: string, description: string): Promise<ClassificationResult> {
    try {
      const result = await this.primary.classifyIncident(title, description);
      this.lastCallUsedPrimary = true;
      return result;
    } catch (err) {
      console.warn("AI provider failed for classifyIncident, falling back to rules:", (err as Error).message);
      this.lastCallUsedPrimary = false;
      return this.fallback.classifyIncident(title, description);
    }
  }

  async rewriteCalm(title: string, description: string): Promise<CalmRewriteResult> {
    try {
      return await this.primary.rewriteCalm(title, description);
    } catch (err) {
      console.warn("AI provider failed for rewriteCalm, falling back to rules:", (err as Error).message);
      return this.fallback.rewriteCalm(title, description);
    }
  }

  async answerQuestion(question: string, incidents: Incident[]): Promise<AnswerResult> {
    try {
      return await this.primary.answerQuestion(question, incidents);
    } catch (err) {
      console.warn("AI provider failed for answerQuestion, falling back to rules:", (err as Error).message);
      return this.fallback.answerQuestion(question, incidents);
    }
  }

  async generateDigest(incidents: Incident[]): Promise<DigestResult> {
    try {
      return await this.primary.generateDigest(incidents);
    } catch (err) {
      console.warn("AI provider failed for generateDigest, falling back to rules:", (err as Error).message);
      return this.fallback.generateDigest(incidents);
    }
  }

  async findSimilar(incident: Incident, candidates: Incident[]): Promise<SimilarityMatch[]> {
    try {
      return await this.primary.findSimilar(incident, candidates);
    } catch (err) {
      console.warn("AI provider failed for findSimilar, falling back to rules:", (err as Error).message);
      return this.fallback.findSimilar(incident, candidates);
    }
  }
}

let cachedProvider: ResilientAIProvider | RuleBasedAIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const provider = process.env.AI_PROVIDER ?? "rules";
  const fallback = new RuleBasedAIProvider();

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    cachedProvider = new ResilientAIProvider(new AnthropicAIProvider(), fallback);
  } else {
    cachedProvider = fallback;
  }

  return cachedProvider;
}

export function didLastCallUseAI(): boolean {
  if (cachedProvider instanceof ResilientAIProvider) {
    return cachedProvider.lastCallUsedPrimary;
  }
  return false;
}
