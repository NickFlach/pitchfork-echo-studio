import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { buildCorsHeaders } from "../_shared/cors.ts"

interface MaskedCredential {
  provider: string;
  hasApiKey: boolean;
  lastUpdated?: string;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Public endpoint: returns only boolean flags indicating which AI providers
    // are configured. No secrets or PII are disclosed, so auth is not required.

    if (req.method === 'GET') {
      // Return masked credentials showing which providers are configured
      const maskedCredentials: MaskedCredential[] = [
        {
          provider: 'lovable',
          hasApiKey: !!Deno.env.get('LOVABLE_API_KEY'),
          lastUpdated: new Date().toISOString()
        },
        {
          provider: 'openai',
          hasApiKey: !!Deno.env.get('OPENAI_API_KEY'),
          lastUpdated: new Date().toISOString()
        },
        {
          provider: 'anthropic',
          hasApiKey: !!Deno.env.get('ANTHROPIC_API_KEY'),
          lastUpdated: new Date().toISOString()
        },
        {
          provider: 'gemini',
          hasApiKey: !!Deno.env.get('GEMINI_API_KEY'),
          lastUpdated: new Date().toISOString()
        },
        {
          provider: 'xai',
          hasApiKey: !!Deno.env.get('XAI_API_KEY'),
          lastUpdated: new Date().toISOString()
        }
      ]

      return new Response(
        JSON.stringify(maskedCredentials),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
