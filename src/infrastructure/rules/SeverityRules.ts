import { Severity } from "@/domain/incidents/Severity";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";

const HIGH_SEVERITY_KEYWORDS = [
  "stolen", "break-in", "hacked", "compromised", "robbery",
  "forced entry", "identity theft", "taken over", "threat",
  "weapon", "assault", "danger", "emergency",
];

const MEDIUM_SEVERITY_KEYWORDS = [
  "scam", "fraud", "suspicious", "outage", "missing",
  "unauthorized", "fake", "impersonating",
];

const FINANCIAL_KEYWORDS = [
  "money", "payment", "bank", "credit card", "financial",
  "wire transfer", "refund", "charged",
];

const HIGH_SEVERITY_CATEGORIES = new Set([
  IncidentCategory.BURGLARY,
  IncidentCategory.ACCOUNT_COMPROMISE,
]);

const LOW_SEVERITY_CATEGORIES = new Set([
  IncidentCategory.POWER_OUTAGE,
  IncidentCategory.INTERNET_OUTAGE,
  IncidentCategory.PACKAGE_THEFT,
]);

export function scoreSeverity(
  title: string,
  description: string,
  category: IncidentCategory
): Severity {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  for (const keyword of HIGH_SEVERITY_KEYWORDS) {
    if (text.includes(keyword)) score += 3;
  }
  for (const keyword of MEDIUM_SEVERITY_KEYWORDS) {
    if (text.includes(keyword)) score += 1;
  }
  for (const keyword of FINANCIAL_KEYWORDS) {
    if (text.includes(keyword)) score += 2;
  }

  if (HIGH_SEVERITY_CATEGORIES.has(category)) score += 3;
  if (LOW_SEVERITY_CATEGORIES.has(category)) score -= 2;

  if (score >= 8) return Severity.CRITICAL;
  if (score >= 5) return Severity.HIGH;
  if (score >= 2) return Severity.MEDIUM;
  return Severity.LOW;
}
