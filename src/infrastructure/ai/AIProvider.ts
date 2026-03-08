import { Incident } from "@/domain/incidents/Incident";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

export interface ClassificationResult {
  category: IncidentCategory;
  severity: Severity;
  confidence: number;
}

export interface CalmRewriteResult {
  calmDescription: string;
}

export interface AnswerResult {
  answer: string;
  relevantIncidentIds: string[];
}

export interface DigestResult {
  summary: string;
  patterns: string[];
  recommendations: string[];
}

export interface SimilarityMatch {
  incident: Incident;
  similarity: number;
}

export interface AIProvider {
  classifyIncident(
    title: string,
    description: string
  ): Promise<ClassificationResult>;

  rewriteCalm(
    title: string,
    description: string
  ): Promise<CalmRewriteResult>;

  answerQuestion(
    question: string,
    incidents: Incident[]
  ): Promise<AnswerResult>;

  generateDigest(incidents: Incident[]): Promise<DigestResult>;

  findSimilar(
    incident: Incident,
    candidates: Incident[]
  ): Promise<SimilarityMatch[]>;
}
