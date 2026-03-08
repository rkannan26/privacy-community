import { IncidentCategory } from "./IncidentCategory";
import { Severity } from "./Severity";

export interface Incident {
  id: string;
  title: string;
  description: string;
  calmDescription: string;
  category: IncidentCategory;
  severity: Severity;
  status: "open" | "investigating" | "resolved" | "dismissed";
  location: string;
  reportedAt: string;
  updatedAt: string;
  source: "user" | "system";
  classifiedBy: "ai" | "rules";
  recommendedActions: string[];
}
