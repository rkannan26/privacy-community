import { NextRequest, NextResponse } from "next/server";
import { JsonFileIncidentRepository } from "@/infrastructure/repositories/JsonFileIncidentRepository";
import { UpdateIncidentSchema } from "@/lib/validation";

const repo = new JsonFileIncidentRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = await repo.findById(id);

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json(incident);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = UpdateIncidentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await repo.update(id, parsed.data);

  if (!updated) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
