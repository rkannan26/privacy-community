import { Incident } from "./Incident";

export interface IncidentRepository {
  findAll(): Promise<Incident[]>;
  findById(id: string): Promise<Incident | null>;
  create(incident: Incident): Promise<Incident>;
  update(id: string, fields: Partial<Incident>): Promise<Incident | null>;
}
