import { z } from "zod";

export const states = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const leadSchema = z.object({
  Nome: z.string().optional(),
  Telefone: z.string().optional(),
  Bairro: z.string().optional(),
  Cidade: z.string().optional(),
  UF: z.string().optional(),
  Website: z.string().optional(),
  "E-mail": z.string().optional(),
  "E-mail2": z.string().optional(),
});

export const scraperResponseSchema = z.object({
  success: z.boolean(),
  requestId: z.string(),
  pesquisa: z.object({
    termo: z.string(),
    cidade: z.string(),
    uf: z.string(),
  }),
  resultado: z.object({
    aba: z.string().optional(),
    totalLeads: z.number(),
    leads: z.array(leadSchema),
  }),
  googleSheet: z.object({
    name: z.string().optional(),
    url: z.string().optional(),
  }).optional(),
});

export const searchSchema = z.object({
  termo: z.string().min(1, "Termo é obrigatório").trim(),
  cidade: z.string().min(1, "Cidade é obrigatória").trim(),
  uf: z.string().length(2, "UF inválida"),
});

export type Lead = z.infer<typeof leadSchema>;
export type ScraperResponse = z.infer<typeof scraperResponseSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

export type SearchStatus = "pending" | "processing" | "completed" | "failed";

export interface SearchRecord {
  id: string;
  user_id: string;
  request_id: string;
  termo: string;
  cidade: string;
  uf: string;
  sheet_name?: string;
  sheet_url?: string;
  status: SearchStatus;
  total_leads: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface LeadRecord {
  id: string;
  search_id: string;
  nome?: string;
  telefone?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  website?: string;
  email?: string;
  email2?: string;
  created_at: string;
}
