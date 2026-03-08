import { IncidentCategory } from "@/domain/incidents/IncidentCategory";

const ACTIONS: Record<IncidentCategory, string[]> = {
  [IncidentCategory.PHISHING]: [
    "Do not click links in suspicious emails",
    "Report the email to your email provider",
    "Verify sender identity through official channels",
  ],
  [IncidentCategory.ONLINE_SCAM]: [
    "File a dispute with your payment provider",
    "Report the seller to the platform",
    "Save all transaction records as evidence",
  ],
  [IncidentCategory.ACCOUNT_COMPROMISE]: [
    "Change passwords on all affected accounts immediately",
    "Enable two-factor authentication",
    "Check for unauthorized transactions or changes",
  ],
  [IncidentCategory.PACKAGE_THEFT]: [
    "Check doorbell camera footage",
    "File a report with local police",
    "Contact the delivery company for a replacement",
  ],
  [IncidentCategory.BURGLARY]: [
    "File a police report immediately",
    "Do not touch anything until police arrive",
    "Check with neighbors for security camera footage",
  ],
  [IncidentCategory.SUSPICIOUS_ACTIVITY]: [
    "Contact local police non-emergency line",
    "Document details such as time, appearance, and vehicle",
    "Alert neighbors through community channels",
  ],
  [IncidentCategory.POWER_OUTAGE]: [
    "Contact the power company to report the outage",
    "Avoid opening refrigerator to preserve food",
    "Use battery-powered lights instead of candles",
  ],
  [IncidentCategory.INTERNET_OUTAGE]: [
    "Contact your ISP to report the outage",
    "Check for outage updates on provider website",
    "Use mobile data as a temporary alternative",
  ],
  [IncidentCategory.FRAUD]: [
    "Do not provide personal or financial information",
    "Report the incident to the FTC",
    "Alert your bank if financial details were shared",
  ],
  [IncidentCategory.OTHER]: [
    "Document all relevant details",
    "Report to local authorities if applicable",
    "Monitor the situation and report updates",
  ],
};

export function getRecommendedActions(category: IncidentCategory): string[] {
  return ACTIONS[category] ?? ACTIONS[IncidentCategory.OTHER];
}
