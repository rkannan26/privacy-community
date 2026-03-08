import { describe, it, expect } from "vitest";
import { CreateIncidentSchema, UpdateIncidentSchema } from "@/lib/validation";
import { classifyByKeywords } from "@/infrastructure/rules/ClassificationRules";
import { scoreSeverity } from "@/infrastructure/rules/SeverityRules";
import { getRecommendedActions } from "@/infrastructure/rules/ActionTemplates";
import { RuleBasedAIProvider } from "@/infrastructure/rules/RuleBasedAIProvider";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";

describe("Happy Path — Incident creation and classification", () => {
  it("validates and classifies a well-formed burglary report", async () => {
    const input = {
      title: "Garage break-in on Cedar Lane",
      description:
        "A homeowner discovered their garage had been broken into overnight. Tools and a bicycle were stolen.",
      location: "Cedar Lane",
    };

    // Validation passes
    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    // Classification produces correct category
    const { category, confidence } = classifyByKeywords(
      input.title,
      input.description
    );
    expect(category).toBe(IncidentCategory.BURGLARY);
    expect(confidence).toBeGreaterThan(0);

    // Severity scoring works
    const severity = scoreSeverity(input.title, input.description, category);
    expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(severity);

    // Recommended actions are returned
    const actions = getRecommendedActions(category);
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0]).toContain("police");
  });

  it("generates a calm rewrite of an alarmist report", async () => {
    const provider = new RuleBasedAIProvider();
    const result = await provider.rewriteCalm(
      "Break-in",
      "OMG!! Someone BROKE INTO my house!!! I'm TERRIFIED!!!"
    );

    // Should strip excessive punctuation and calm alarmist words
    expect(result.calmDescription).not.toContain("!!!");
    expect(result.calmDescription).not.toContain("OMG");
    expect(result.calmDescription).not.toContain("TERRIFIED");
  });

  it("answers a question about incidents using keyword matching", async () => {
    const provider = new RuleBasedAIProvider();
    const mockIncidents = [
      {
        id: "1",
        title: "Phishing email targeting residents",
        description: "Emails impersonating utility company",
        calmDescription: "Emails impersonating utility company",
        category: IncidentCategory.PHISHING,
        severity: "HIGH" as const,
        status: "open" as const,
        location: "Downtown",
        reportedAt: "2025-01-01",
        updatedAt: "2025-01-01",
        source: "user" as const,
        classifiedBy: "rules" as const,
        recommendedActions: [],
      },
    ];

    const result = await provider.answerQuestion("phishing", mockIncidents);
    expect(result.answer).toContain("1");
    expect(result.relevantIncidentIds).toContain("1");
  });
});

describe("Edge Cases — Input validation and error handling", () => {
  it("rejects a title that is too short", () => {
    const input = {
      title: "Hi",
      description: "This is a valid description for testing purposes.",
      location: "Downtown",
    };

    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("rejects a description that is too short", () => {
    const input = {
      title: "Valid title here",
      description: "Short",
      location: "Downtown",
    };

    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("rejects an empty location", () => {
    const input = {
      title: "Valid title here",
      description: "This is a valid description for testing purposes.",
      location: "",
    };

    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid category enum value", () => {
    const input = {
      title: "Valid title here",
      description: "This is a valid description for testing purposes.",
      location: "Downtown",
      category: "INVALID_CATEGORY",
    };

    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid severity enum value", () => {
    const input = {
      title: "Valid title here",
      description: "This is a valid description for testing purposes.",
      location: "Downtown",
      severity: "EXTREME",
    };

    const parsed = CreateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("rejects extra fields via strict update validation", () => {
    const input = {
      status: "resolved",
    };

    // Valid update
    const parsed = UpdateIncidentSchema.safeParse(input);
    expect(parsed.success).toBe(true);

    // Invalid status
    const invalid = UpdateIncidentSchema.safeParse({ status: "deleted" });
    expect(invalid.success).toBe(false);
  });

  it("classifies unknown text as OTHER with low confidence", () => {
    const { category, confidence } = classifyByKeywords(
      "Random title",
      "This is completely unrelated to any safety category whatsoever."
    );

    expect(category).toBe(IncidentCategory.OTHER);
    expect(confidence).toBeLessThanOrEqual(0.3);
  });

  it("handles empty incidents array in Q&A without crashing", async () => {
    const provider = new RuleBasedAIProvider();
    const result = await provider.answerQuestion("any question", []);

    expect(result.answer).toBeTruthy();
    expect(result.relevantIncidentIds).toEqual([]);
  });
});
