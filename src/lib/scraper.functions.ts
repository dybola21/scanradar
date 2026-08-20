import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { searchSchema, scraperResponseSchema } from "./schemas";

export const getIntegrationSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("n8n_settings")
      .select("webhook_url, webhook_secret, integration_name, is_connected")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return {
      webhook_url: data?.webhook_url || "",
      webhook_secret: data?.webhook_secret ? "••••••••••••••••" : "",
      integration_name: data?.integration_name || "n8n integration",
      is_connected: data?.is_connected || false,
    };
  });

export const updateIntegrationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      webhook_url: z.string().url("URL inválida"),
      webhook_secret: z.string().nullable().optional(),
      integration_name: z.string().min(1),
    })
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { webhook_url, webhook_secret, integration_name } = data;

    const updateData: any = {
      webhook_url,
      integration_name,
      updated_at: new Date().toISOString(),
    };

    if (webhook_secret) {
      updateData.webhook_secret = webhook_secret;
    }

    const { error } = await supabase
      .from("n8n_settings")
      .upsert({
        user_id: userId,
        ...updateData,
      });

    if (error) throw error;
    return { success: true };
  });

export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: settings, error: settingsError } = await supabase
      .from("n8n_settings")
      .select("webhook_url, webhook_secret")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings?.webhook_url) {
      return { success: false, error: "Integração não configurada" };
    }

    try {
      const response = await fetch(settings.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": settings.webhook_secret || "",
        },
        body: JSON.stringify({ test: true }),
      });

      if (response.ok) {
        await supabase
          .from("n8n_settings")
          .update({ is_connected: true })
          .eq("user_id", userId);
        return { success: true };
      } else {
        return {
          success: false,
          error: `Falha na conexão: ${response.status}`,
        };
      }
    } catch (err) {
      return { success: false, error: "Erro ao conectar com o n8n" };
    }
  });

export const startSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(searchSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { termo, cidade, uf } = data;

    // Check for ongoing identical searches
    const { data: ongoing } = await supabase
      .from("searches")
      .select("id")
      .eq("user_id", userId)
      .eq("termo", termo)
      .eq("cidade", cidade)
      .eq("uf", uf)
      .in("status", ["pending", "processing"])
      .limit(1);

    if (ongoing && ongoing.length > 0) {
      throw new Error("Uma pesquisa idêntica já está em andamento");
    }

    // Get n8n settings
    const { data: settings, error: settingsError } = await supabase
      .from("n8n_settings")
      .select("webhook_url, webhook_secret")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings?.webhook_url) {
      throw new Error("Integração n8n não configurada");
    }

    const requestId = crypto.randomUUID();

    // Create search record
    const { data: searchRecord, error: searchError } = await supabase
      .from("searches")
      .insert({
        user_id: userId,
        request_id: requestId,
        termo,
        cidade,
        uf,
        status: "processing",
      })
      .select()
      .single();

    if (searchError) throw searchError;

    try {
      // Call n8n
      const response = await fetch(settings.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": settings.webhook_secret || "",
        },
        body: JSON.stringify({ termo, cidade, uf }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        await supabase
          .from("searches")
          .update({ status: "failed", error_message: errorText })
          .eq("id", searchRecord.id);
        return { success: false, error: "n8n retornou erro", searchId: searchRecord.id };
      }

      const result = await response.json();
      const validated = scraperResponseSchema.parse(result);

      // Save leads
      if (validated.resultado.leads.length > 0) {
        const leadsToInsert = validated.resultado.leads.map((l) => ({
          search_id: searchRecord.id,
          nome: l.Nome ?? null,
          telefone: l.Telefone ?? null,
          bairro: l.Bairro ?? null,
          cidade: l.Cidade ?? null,
          uf: l.UF ?? null,
          website: l.Website ?? null,
          email: l["E-mail"] ?? null,
          email2: l["E-mail2"] ?? null,
        }));

        await supabase.from("leads").insert(leadsToInsert);
      }

      // Update search record
      await supabase
        .from("searches")
        .update({
          status: "completed",
          total_leads: validated.resultado.totalLeads,
          sheet_name: validated.googleSheet?.name ?? null,
          sheet_url: validated.googleSheet?.url ?? null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", searchRecord.id);

      return {
        success: true,
        searchId: searchRecord.id,
        leads: validated.resultado.leads,
        totalLeads: validated.resultado.totalLeads,
      };
    } catch (err) {
      console.error("Scraper error:", err);
      await supabase
        .from("searches")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", searchRecord.id);
      return { success: false, error: String(err), searchId: searchRecord.id };
    }
  });

export const getSearchHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const getSearchDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ searchId: z.string() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { searchId } = data;

    const { data: search, error: searchError } = await supabase
      .from("searches")
      .select("*")
      .eq("id", searchId)
      .eq("user_id", userId)
      .single();

    if (searchError) throw searchError;

    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("search_id", searchId);

    if (leadsError) throw leadsError;

    return { search, leads };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: searches } = await supabase
      .from("searches")
      .select("id, total_leads, status, created_at")
      .eq("user_id", userId);

    const totalSearches = searches?.length || 0;
    const totalLeads = searches?.reduce((acc, s) => acc + (s.total_leads || 0), 0) || 0;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const searchesToday = searches?.filter(s => s.created_at >= startOfToday).length || 0;
    const leadsToday = searches?.filter(s => s.created_at >= startOfToday).reduce((acc, s) => acc + (s.total_leads || 0), 0) || 0;

    const searchIds = searches?.map(s => s.id) || [];
    
    if (searchIds.length === 0) {
      return { 
        totalSearches: 0, 
        totalLeads: 0, 
        leadsWithEmail: 0, 
        leadsWithWebsite: 0,
        searchesToday: 0,
        leadsToday: 0
      };
    }

    const { count: emailCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("search_id", searchIds)
      .or("email.neq.'',email.not.is.null");

    const { count: websiteCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .in("search_id", searchIds)
      .or("website.neq.'',website.not.is.null");

    return {
      totalSearches,
      totalLeads,
      leadsWithEmail: emailCount || 0,
      leadsWithWebsite: websiteCount || 0,
      searchesToday,
      leadsToday
    };
  });
