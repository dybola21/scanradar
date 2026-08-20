import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

export const Route = createFileRoute('/api/public/hooks/scheduled-task')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('apikey')
        const token = authHeader

        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Missing apikey header' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          )
        }

        const supabase = createClient(
          process.env['VITE_SUPABASE_URL']!,
          token,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )

        // Cleanup failed searches older than 24h
        const { error } = await supabase
          .from('searches')
          .update({ status: 'failed', error_message: 'Timeout: Processo excedeu o tempo limite' })
          .eq('status', 'processing')
          .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          console.error('Cleanup error:', error)
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }
})
