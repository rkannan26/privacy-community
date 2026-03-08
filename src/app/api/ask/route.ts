import { NextRequest, NextResponse } from "next/server";
import { JsonFileIncidentRepository } from "@/infrastructure/repositories/JsonFileIncidentRepository";
import { getAIProvider } from "@/lib/aiFactory";
import { z } from "zod";

const repo = new JsonFileIncidentRepository();

const AskSchema = z.object({
  question: z.string().min(3).max(500),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = AskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const ai = getAIProvider();
  const incidents = await repo.findAll();
  const result = await ai.answerQuestion(parsed.data.question, incidents);

  return NextResponse.json(result);
}
