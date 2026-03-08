import { NextRequest, NextResponse } from "next/server";
import { JsonFileIncidentRepository } from "@/infrastructure/repositories/JsonFileIncidentRepository";
import { CreateIncidentSchema } from "@/lib/validation";
import { Incident } from "@/domain/incidents/Incident";
import { getAIProvider, didLastCallUseAI } from "@/lib/aiFactory";
import { getRecommendedActions } from "@/infrastructure/rules/ActionTemplates";
import { randomUUID } from "crypto";

const repo = new JsonFileIncidentRepository();

export async function GET() {
  const incidents = await repo.findAll();
  return NextResponse.json(incidents);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateIncidentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ai = getAIProvider();

  const classification = await ai.classifyIncident(
    parsed.data.title,
    parsed.data.description
  );

  const usedAI = didLastCallUseAI();

  const { calmDescription } = await ai.rewriteCalm(
    parsed.data.title,
    parsed.data.description
  );

  const category = parsed.data.category ?? classification.category;
  const severity = parsed.data.severity ?? classification.severity;
  const now = new Date().toISOString();

  const incident: Incident = {
    id: randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    calmDescription,
    category,
    severity,
    status: "open",
    location: parsed.data.location,
    reportedAt: now,
    updatedAt: now,
    source: "user",
    classifiedBy: usedAI ? "ai" : "rules",
    recommendedActions: getRecommendedActions(category),
  };

  const created = await repo.create(incident);
  return NextResponse.json(created, { status: 201 });
}
