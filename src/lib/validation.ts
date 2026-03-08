import { z } from "zod";
import { IncidentCategory } from "@/domain/incidents/IncidentCategory";
import { Severity } from "@/domain/incidents/Severity";

export const CreateIncidentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  location: z.string().min(1).max(200),
  category: z.nativeEnum(IncidentCategory).optional(),
  severity: z.nativeEnum(Severity).optional(),
});

export const UpdateIncidentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: z.nativeEnum(IncidentCategory).optional(),
  severity: z.nativeEnum(Severity).optional(),
  status: z.enum(["open", "investigating", "resolved", "dismissed"]).optional(),
  location: z.string().min(1).max(200).optional(),
});

export type CreateIncidentInput = z.infer<typeof CreateIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof UpdateIncidentSchema>;
