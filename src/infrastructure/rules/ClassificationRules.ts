import { IncidentCategory } from "@/domain/incidents/IncidentCategory";

const KEYWORD_MAP: Record<string, IncidentCategory> = {
  phishing: IncidentCategory.PHISHING,
  "phish": IncidentCategory.PHISHING,
  "suspicious email": IncidentCategory.PHISHING,
  "fake email": IncidentCategory.PHISHING,
  "credential": IncidentCategory.PHISHING,
  "click link": IncidentCategory.PHISHING,

  scam: IncidentCategory.ONLINE_SCAM,
  "online scam": IncidentCategory.ONLINE_SCAM,
  "fake listing": IncidentCategory.ONLINE_SCAM,
  "marketplace fraud": IncidentCategory.ONLINE_SCAM,
  "never received": IncidentCategory.ONLINE_SCAM,

  "account compromise": IncidentCategory.ACCOUNT_COMPROMISE,
  "account hack": IncidentCategory.ACCOUNT_COMPROMISE,
  "taken over": IncidentCategory.ACCOUNT_COMPROMISE,
  "unauthorized access": IncidentCategory.ACCOUNT_COMPROMISE,
  "password stolen": IncidentCategory.ACCOUNT_COMPROMISE,
  hacked: IncidentCategory.ACCOUNT_COMPROMISE,

  "package theft": IncidentCategory.PACKAGE_THEFT,
  "package stolen": IncidentCategory.PACKAGE_THEFT,
  "stole my package": IncidentCategory.PACKAGE_THEFT,
  "stolen package": IncidentCategory.PACKAGE_THEFT,
  "porch pirate": IncidentCategory.PACKAGE_THEFT,
  "missing package": IncidentCategory.PACKAGE_THEFT,
  "delivery stolen": IncidentCategory.PACKAGE_THEFT,
  "stolen from my porch": IncidentCategory.PACKAGE_THEFT,
  "stolen from the porch": IncidentCategory.PACKAGE_THEFT,
  "package from the porch": IncidentCategory.PACKAGE_THEFT,

  burglary: IncidentCategory.BURGLARY,
  "break-in": IncidentCategory.BURGLARY,
  "broken into": IncidentCategory.BURGLARY,
  robbery: IncidentCategory.BURGLARY,
  "forced entry": IncidentCategory.BURGLARY,
  theft: IncidentCategory.BURGLARY,

  suspicious: IncidentCategory.SUSPICIOUS_ACTIVITY,
  loitering: IncidentCategory.SUSPICIOUS_ACTIVITY,
  "unfamiliar person": IncidentCategory.SUSPICIOUS_ACTIVITY,
  "strange behavior": IncidentCategory.SUSPICIOUS_ACTIVITY,
  "unusual activity": IncidentCategory.SUSPICIOUS_ACTIVITY,

  "power outage": IncidentCategory.POWER_OUTAGE,
  "power out": IncidentCategory.POWER_OUTAGE,
  blackout: IncidentCategory.POWER_OUTAGE,
  "no electricity": IncidentCategory.POWER_OUTAGE,

  "internet outage": IncidentCategory.INTERNET_OUTAGE,
  "internet down": IncidentCategory.INTERNET_OUTAGE,
  "wifi down": IncidentCategory.INTERNET_OUTAGE,
  "no internet": IncidentCategory.INTERNET_OUTAGE,
  "network outage": IncidentCategory.INTERNET_OUTAGE,

  fraud: IncidentCategory.FRAUD,
  "identity theft": IncidentCategory.FRAUD,
  "fake charity": IncidentCategory.FRAUD,
  "financial fraud": IncidentCategory.FRAUD,
  "wire fraud": IncidentCategory.FRAUD,
};

export function classifyByKeywords(
  title: string,
  description: string
): { category: IncidentCategory; confidence: number } {
  const text = `${title} ${description}`.toLowerCase();
  const scores = new Map<IncidentCategory, number>();

  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (text.includes(keyword)) {
      scores.set(category, (scores.get(category) ?? 0) + 1);
    }
  }

  if (scores.size === 0) {
    return { category: IncidentCategory.OTHER, confidence: 0 };
  }

  let bestCategory = IncidentCategory.OTHER;
  let bestScore = 0;
  for (const [category, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const confidence = Math.min(bestScore / 3, 1);
  return { category: bestCategory, confidence };
}
