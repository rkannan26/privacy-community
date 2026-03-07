import { Incident } from "@/domain/incidents/Incident";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

const sampleIncidents: Incident[] = [
  {
    id: "1",
    title: "Suspicious phishing email targeting residents",
    description:
      "Multiple residents reported receiving emails impersonating the local utility company asking for account credentials.",
    category: IncidentCategory.PHISHING,
    severity: Severity.HIGH,
    status: "open",
    location: "Downtown",
    reportedAt: "2025-03-06T10:30:00Z",
    updatedAt: "2025-03-06T10:30:00Z",
    source: "user",
    classifiedBy: "rules",
    recommendedActions: [
      "Do not click links in suspicious emails",
      "Report to local authorities",
    ],
  },
  {
    id: "2",
    title: "Package stolen from front porch",
    description:
      "A resident on Maple Street reported a package was taken from their porch around 2pm.",
    category: IncidentCategory.PACKAGE_THEFT,
    severity: Severity.LOW,
    status: "investigating",
    location: "Maple Street",
    reportedAt: "2025-03-05T14:00:00Z",
    updatedAt: "2025-03-05T16:00:00Z",
    source: "user",
    classifiedBy: "rules",
    recommendedActions: [
      "Check doorbell camera footage",
      "File a report with local police",
    ],
  },
  {
    id: "3",
    title: "Neighborhood-wide internet outage",
    description:
      "Internet service has been down for the entire Oak Park area since this morning.",
    category: IncidentCategory.INTERNET_OUTAGE,
    severity: Severity.MEDIUM,
    status: "open",
    location: "Oak Park",
    reportedAt: "2025-03-07T08:00:00Z",
    updatedAt: "2025-03-07T08:00:00Z",
    source: "user",
    classifiedBy: "rules",
    recommendedActions: [
      "Contact your ISP",
      "Check for outage updates on provider website",
    ],
  },
];

export default function Home() {
  return (
    <main>
      <h1>Community Guardian</h1>
      <p>Privacy-First Safety Digest</p>
      <ul>
        {sampleIncidents.map((incident) => (
          <li key={incident.id}>
            <strong>{incident.title}</strong> — {incident.category} |{" "}
            {incident.severity} | {incident.status}
            <br />
            <em>{incident.location}</em> — {incident.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
