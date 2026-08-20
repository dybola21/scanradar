import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export const Route = {
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const apikey = request.headers.get("apikey");

        if (!apikey) {
          return new Response(
            JSON.stringify({ error: "Missing apikey header" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        const supabaseUrl = process.env["VITE_SUPABASE_URL"];
        if (!supabaseUrl) {
          return new Response(
            JSON.stringify({ error: "Server configuration error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        const supabase = createClient(supabaseUrl, apikey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        const { error } = await supabase
          .from("searches")
          .update({
            status: "failed",
            error_message: "Timeout: Processo excedeu o tempo limite",
          })
          .eq("status", "processing")
          .lt(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          );

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
};
