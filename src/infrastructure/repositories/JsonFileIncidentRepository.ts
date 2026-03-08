import { Incident } from "@/domain/incidents/Incident";
import { IncidentRepository } from "@/domain/incidents/IncidentRepository";
import fs from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "seed-incidents.json");

export class JsonFileIncidentRepository implements IncidentRepository {
  private async readData(): Promise<Incident[]> {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  }

  private async writeData(incidents: Incident[]): Promise<void> {
    await fs.writeFile(DATA_PATH, JSON.stringify(incidents, null, 2), "utf-8");
  }

  async findAll(): Promise<Incident[]> {
    return this.readData();
  }

  async findById(id: string): Promise<Incident | null> {
    const incidents = await this.readData();
    return incidents.find((i) => i.id === id) ?? null;
  }

  async create(incident: Incident): Promise<Incident> {
    const incidents = await this.readData();
    incidents.push(incident);
    await this.writeData(incidents);
    return incident;
  }

  async update(
    id: string,
    fields: Partial<Incident>
  ): Promise<Incident | null> {
    const incidents = await this.readData();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) return null;
    incidents[index] = { ...incidents[index], ...fields, updatedAt: new Date().toISOString() };
    await this.writeData(incidents);
    return incidents[index];
  }
}
